"""Reads the source entities, runs the rules, tells the entities to redraw.

There is no update interval on purpose. Every input either changes as a state
change -- which we subscribe to -- or on the clock at a known hour: midnight,
when the child is a day older, and 11:00 and 15:00, the edges of the midday
sun window.
"""

from __future__ import annotations

import logging
import math
from collections.abc import Callable
from datetime import date, datetime

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    ROOM_RANGES,
    ROOM_SOURCE_RANGE,
)
from .recommendation import (
    MIDDAY_END_HOUR,
    MIDDAY_START_HOUR,
    ROOM_SITUATIONS,
    Recommendation,
    Situation,
    UvAdvice,
    recommend,
    uv_advice,
)

_LOGGER = logging.getLogger(__name__)

UNUSABLE_STATES = {"unavailable", "unknown", ""}

SOURCE_APPARENT = "apparent"
SOURCE_MEASURED = "measured"
SOURCE_MANUAL = "manual_range"
# Neither "apparent" nor "measured" is true: no reading was taken this pass,
# so neither field would be honest. Used only by outdoor_temperature_source
# -- room's source depends solely on config, never on whether the read
# succeeded, so it never needs it.
SOURCE_UNKNOWN = "unknown"


def _as_finite_float(value: object) -> float | None:
    """A state or attribute as a number, or None if it is not usable as one.

    Non-finite values are rejected as firmly as unparseable ones. ``float()``
    happily accepts NaN and the string "nan", and NaN then loses every
    comparison in the rule set: ``bucket_index(nan)`` falls through all seven
    bounds and returns the coldest band, so a single bad reading would dress
    a child for below freezing in July. Failing towards overheating is the
    direction that matters.
    """
    if value is None:
        return None
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def months_between(birth_date: date, today: date) -> int:
    """Whole months lived. Rules band on 4 and 12, so days do not matter."""
    months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
    if today.day < birth_date.day:
        months -= 1
    return max(0, months)


class TinybreezeCoordinator:
    """One child's live view of the world."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.name: str = entry.data[CONF_NAME]

        self._listeners: list[Callable[[], None]] = []
        self._unsubscribe: list[Callable[[], None]] = []

        self._recommendations: dict[Situation, Recommendation] = {}
        self._uv: UvAdvice | None = None
        self._uv_index: float | None = None

        # Outdoor and room temperature come from independent sources and must
        # be tracked independently: whichever field ran last would otherwise
        # clobber the other, mislabeling every sensor that reads it.
        self.outdoor_temperature_source: str = SOURCE_UNKNOWN
        self.room_temperature_source: str = SOURCE_MEASURED

        # State of the weather entity, for the clothing sensors' attributes.
        # None rather than a stale last-good value once it is unreadable.
        self.weather_condition: str | None = None

        # Availability is per source domain, not coordinator-wide. Sleep and
        # home read only the room; the other four read only the weather. A
        # single flag made a weather outage take the sleeping child's
        # recommendation down with it -- and with a fixed room range, which
        # cannot fail at all, that outage was purely imaginary.
        #
        # Kept separate from the missing_* entity ids on purpose: those are
        # descriptions for the card and may legitimately be None (nothing
        # configured), but availability must never be inferred from that.
        self._outdoor_available: bool = False
        self._room_available: bool = False
        self._missing_outdoor_entity: str | None = None
        self._missing_room_entity: str | None = None
        self._uv_unavailable: bool = False

    # -- lifecycle ---------------------------------------------------------

    async def async_start(self) -> None:
        tracked = [entity for entity in self._source_entities() if entity]
        if tracked:
            self._unsubscribe.append(
                async_track_state_change_event(self.hass, tracked, self._handle_state_change)
            )
        # Three fixed points, because three things change on the clock alone:
        # at midnight the child is a day older, at 11:00 the midday window
        # opens and at 15:00 it closes. Without the last two, the midday
        # warning appeared and disappeared only when a source entity happened
        # to change state -- close enough to right with a chatty weather
        # entity to hide the bug, and far enough off to be wrong.
        self._unsubscribe.append(
            async_track_time_change(
                self.hass,
                self._handle_time_change,
                hour=[0, MIDDAY_START_HOUR, MIDDAY_END_HOUR],
                minute=0,
                second=0,
            )
        )
        self.async_recompute()

    @callback
    def async_stop(self) -> None:
        while self._unsubscribe:
            self._unsubscribe.pop()()

    @callback
    def async_add_listener(self, update_callback: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(update_callback)

        def _remove() -> None:
            if update_callback in self._listeners:
                self._listeners.remove(update_callback)

        return _remove

    # -- inputs ------------------------------------------------------------

    def _source_entities(self) -> list[str | None]:
        options = self.entry.options
        return [
            options.get(CONF_WEATHER_ENTITY),
            options.get(CONF_UV_ENTITY),
            options.get(CONF_ROOM_ENTITY),
        ]

    @property
    def age_months(self) -> int:
        birth_date = dt_util.parse_date(self.entry.data[CONF_BIRTH_DATE])
        if birth_date is None:
            return 0
        return months_between(birth_date, dt_util.now().date())

    @property
    def outdoor_available(self) -> bool:
        """Whether the weather entity yielded a usable temperature."""
        return self._outdoor_available

    @property
    def room_available(self) -> bool:
        """Whether the room source yielded a usable temperature.

        A fixed range always does, which is the whole point of offering one.
        """
        return self._room_available

    def available_for(self, situation: Situation) -> bool:
        """Whether the source *this* situation reads is currently usable."""
        if situation in ROOM_SITUATIONS:
            return self._room_available
        return self._outdoor_available

    @property
    def missing_outdoor_entity(self) -> str | None:
        """Which entity to name when the outdoor half is unavailable."""
        return self._missing_outdoor_entity

    @property
    def missing_room_entity(self) -> str | None:
        """Which entity to name when the room half is unavailable."""
        return self._missing_room_entity

    @property
    def uv_unavailable(self) -> bool:
        """A UV source is configured but could not be read this pass.

        Distinct from "no UV source configured", which is a choice rather
        than an outage and must not be reported as one.
        """
        return self._uv_unavailable

    @property
    def uv_index(self) -> float | None:
        return self._uv_index

    def recommendation(self, situation: Situation) -> Recommendation | None:
        return self._recommendations.get(situation)

    def uv(self) -> UvAdvice | None:
        return self._uv

    # -- computation -------------------------------------------------------

    @callback
    def _handle_state_change(self, event: Event[EventStateChangedData]) -> None:
        self.async_recompute()

    @callback
    def _handle_time_change(self, now: datetime) -> None:
        self.async_recompute()

    def _read_number(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return None
        return _as_finite_float(state.state)

    def _read_outdoor(self) -> tuple[float | None, str | None]:
        """Apparent temperature if the weather entity offers one, else plain.

        Every value goes through the same guard the room and UV readings use.
        A weather entity is free to publish ``apparent_temperature:
        "unknown"``, and a bare ``float()`` on that raised ValueError out of
        ``async_setup_entry`` -- no entities at all for the child -- or, once
        set up, out of the state-change callback, which silently froze every
        recommendation at its last value.

        Assigns ``outdoor_temperature_source`` on every path out, including
        the failure ones -- otherwise a weather entity that later becomes
        unavailable would keep reporting the provenance of its last good
        reading instead of admitting it no longer knows.
        """
        entity_id = self.entry.options.get(CONF_WEATHER_ENTITY)
        if not entity_id:
            self.outdoor_temperature_source = SOURCE_UNKNOWN
            return None, None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            self.outdoor_temperature_source = SOURCE_UNKNOWN
            return None, None

        apparent = _as_finite_float(state.attributes.get("apparent_temperature"))
        if apparent is not None:
            self.outdoor_temperature_source = SOURCE_APPARENT
            return apparent, state.state

        # Falls through rather than giving up: an unreadable apparent
        # temperature is no reason to discard a perfectly good measured one.
        temperature = _as_finite_float(state.attributes.get("temperature"))
        self.outdoor_temperature_source = SOURCE_UNKNOWN if temperature is None else SOURCE_MEASURED
        return temperature, state.state

    def _read_room(self) -> float | None:
        options = self.entry.options
        if options.get(CONF_ROOM_SOURCE) == ROOM_SOURCE_RANGE:
            self.room_temperature_source = SOURCE_MANUAL
            return ROOM_RANGES.get(options.get(CONF_ROOM_RANGE, ""))
        self.room_temperature_source = SOURCE_MEASURED
        return self._read_number(options.get(CONF_ROOM_ENTITY))

    @callback
    def async_recompute(self) -> None:
        """Rebuild every recommendation and notify the entities."""
        options = self.entry.options
        outdoor, condition = self._read_outdoor()
        room = self._read_room()
        uv_index = self._read_number(options.get(CONF_UV_ENTITY))

        # Availability is keyed off the resolved values, not off whether an
        # entity id happens to be configured: a room source of "entity" with
        # no room_entity ever chosen resolves room to None just the same as
        # a configured-but-unavailable sensor, and both must leave that half
        # unavailable rather than pass None into recommend().
        self._outdoor_available = outdoor is not None
        self._room_available = room is not None
        self._missing_outdoor_entity = (
            None if outdoor is not None else options.get(CONF_WEATHER_ENTITY)
        )
        self._missing_room_entity = None if room is not None else options.get(CONF_ROOM_ENTITY)
        self.weather_condition = condition

        hour = dt_util.now().hour
        age = self.age_months

        # Each situation is computed only if the source it reads is there.
        # The two halves are independent, so an outage in one leaves the
        # other's recommendations current rather than clearing them.
        self._recommendations = {
            situation: recommend(
                situation=situation,
                outdoor_temperature=outdoor,
                room_temperature=room,
                age_months=age,
                weather_condition=condition or "",
                uv_index=uv_index,
                hour=hour,
            )
            for situation in Situation
            if self.available_for(situation)
        }

        self._uv_index = uv_index
        self._uv = None if uv_index is None else uv_advice(uv_index, age, hour)
        # A configured UV source that cannot be read is an outage worth
        # showing: without this the UV block is simply skipped and the card
        # renders an ordinary recommendation with no sun protection and
        # nothing to say why.
        self._uv_unavailable = bool(options.get(CONF_UV_ENTITY)) and uv_index is None
        self._notify()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            try:
                listener()
            except Exception:  # one bad sensor must not block the rest
                _LOGGER.exception("Tinybreeze listener raised during update")
