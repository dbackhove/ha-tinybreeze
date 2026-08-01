"""Reads the source entities, runs the rules, tells the entities to redraw.

There is no update interval on purpose. Every input either changes as a state
change -- which we subscribe to -- or once a day at midnight, when the child
gets older and the midday window resets.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import date

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
from .recommendation import Recommendation, Situation, UvAdvice, recommend, uv_advice

_LOGGER = logging.getLogger(__name__)

UNUSABLE_STATES = {"unavailable", "unknown", ""}

SOURCE_APPARENT = "apparent"
SOURCE_MEASURED = "measured"
SOURCE_MANUAL = "manual_range"


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
        self.outdoor_temperature_source: str = SOURCE_MEASURED
        self.room_temperature_source: str = SOURCE_MEASURED

        # Separate from missing_entity on purpose: missing_entity is only a
        # description for the card and may legitimately be None (nothing
        # configured), but availability must never be inferred from that.
        self._unavailable: bool = True
        self.missing_entity: str | None = None

    # -- lifecycle ---------------------------------------------------------

    async def async_start(self) -> None:
        tracked = [entity for entity in self._source_entities() if entity]
        if tracked:
            self._unsubscribe.append(
                async_track_state_change_event(self.hass, tracked, self._handle_state_change)
            )
        # The child ages and the midday window resets; nothing else needs a clock.
        self._unsubscribe.append(
            async_track_time_change(self.hass, self._handle_midnight, hour=0, minute=0, second=0)
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
    def available(self) -> bool:
        return not self._unavailable

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
    def _handle_midnight(self, now) -> None:
        self.async_recompute()

    def _read_number(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return None
        try:
            return float(state.state)
        except ValueError:
            return None

    def _read_outdoor(self) -> tuple[float | None, str]:
        """Apparent temperature if the weather entity offers one, else plain."""
        entity_id = self.entry.options.get(CONF_WEATHER_ENTITY)
        if not entity_id:
            return None, "unknown"
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return None, "unknown"

        apparent = state.attributes.get("apparent_temperature")
        if apparent is not None:
            self.outdoor_temperature_source = SOURCE_APPARENT
            return float(apparent), state.state

        temperature = state.attributes.get("temperature")
        self.outdoor_temperature_source = SOURCE_MEASURED
        return (None if temperature is None else float(temperature)), state.state

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
        # a configured-but-unavailable sensor, and both must leave the
        # coordinator unavailable rather than pass None into recommend().
        unavailable = False
        missing_entity: str | None = None
        if outdoor is None:
            unavailable = True
            missing_entity = options.get(CONF_WEATHER_ENTITY)
        elif room is None:
            unavailable = True
            missing_entity = options.get(CONF_ROOM_ENTITY)

        self._unavailable = unavailable
        self.missing_entity = missing_entity

        if unavailable:
            self._recommendations = {}
            self._uv = None
            self._uv_index = None
            self._notify()
            return

        hour = dt_util.now().hour
        age = self.age_months

        self._recommendations = {
            situation: recommend(
                situation=situation,
                outdoor_temperature=outdoor,
                room_temperature=room,
                age_months=age,
                weather_condition=condition,
                uv_index=uv_index,
                hour=hour,
            )
            for situation in Situation
        }
        self._uv_index = uv_index
        self._uv = None if uv_index is None else uv_advice(uv_index, age, hour)
        self._notify()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()
