"""The coordinator reads sources, calls the rules, and never polls."""

from __future__ import annotations

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)
from custom_components.tinybreeze.coordinator import TinybreezeCoordinator
from custom_components.tinybreeze.recommendation import Situation


def _entry(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-01-01"},
        options={CONF_WEATHER_ENTITY: "weather.home", **options},
    )
    entry.add_to_hass(hass)
    return entry


async def test_recommendation_uses_apparent_temperature(hass: HomeAssistant) -> None:
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": 4.0}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    result = coordinator.recommendation(Situation.GENERAL)
    assert result.base_temperature == 4.0


async def test_falls_back_to_plain_temperature(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.GENERAL).base_temperature == 10.0
    assert coordinator.outdoor_temperature_source == "measured"


async def test_temperature_sources_are_independent(hass: HomeAssistant) -> None:
    """A manual room range must not overwrite the outdoor provenance.

    Regression test: an earlier version kept a single ``temperature_source``
    field. Because the room reader ran second, it always won -- so a
    configured fixed room range made every clothing sensor, including the
    stroller and car ones that only care about the outdoor half, report
    ``manual_range``. The two fields must vary independently.
    """
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": 4.0}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.outdoor_temperature_source == "apparent"
    assert coordinator.room_temperature_source == "manual_range"


async def test_outdoor_source_does_not_go_stale_when_weather_becomes_unavailable(
    hass: HomeAssistant,
) -> None:
    """Every path out of ``_read_outdoor`` must set the source, not just the
    two successful ones.

    Regression test: an earlier version only assigned
    ``outdoor_temperature_source`` on the apparent/measured success paths, so
    a weather entity that went unavailable after a good reading kept
    reporting the provenance of that last good reading instead of admitting
    it no longer knows.
    """
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": 4.0}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.outdoor_temperature_source == "apparent"

    hass.states.async_set("weather.home", "unavailable")
    await hass.async_block_till_done()

    assert coordinator.outdoor_temperature_source == "unknown"


async def test_room_entity_source_is_reported_as_measured(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    hass.states.async_set("sensor.bedroom", "19.0")
    entry = _entry(
        hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY, CONF_ROOM_ENTITY: "sensor.bedroom"}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.room_temperature_source == "measured"
    assert coordinator.recommendation(Situation.SLEEP).base_temperature == 19.0


async def test_manual_range_uses_the_midpoint(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.SLEEP).base_temperature == 18.5


async def test_state_change_triggers_recomputation(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 20.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    before = coordinator.recommendation(Situation.GENERAL)
    assert before is not None

    hass.states.async_set("weather.home", "snowy", {"temperature": -5.0})
    await hass.async_block_till_done()

    after = coordinator.recommendation(Situation.GENERAL)
    assert after is not None
    # Both the level and the raw temperature must move: checking the level
    # alone would also pass if recomputation never ran but happened to start
    # from an already-different cached value.
    assert after.level != before.level
    assert after.base_temperature == -5.0


async def test_unavailable_weather_makes_the_outdoor_half_unavailable(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("weather.home", "unavailable")
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.outdoor_available
    assert coordinator.missing_outdoor_entity == "weather.home"


async def test_missing_room_sensor_is_reported(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(
        hass,
        **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY, CONF_ROOM_ENTITY: "sensor.bedroom"},
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.room_available
    assert coordinator.missing_room_entity == "sensor.bedroom"


async def test_missing_room_entity_key_leaves_the_room_half_unavailable(
    hass: HomeAssistant,
) -> None:
    """Room source is ``entity`` but no ``room_entity`` was ever configured.

    Regression test: an earlier version keyed the unavailable guard off
    ``options.get(CONF_ROOM_ENTITY)`` being truthy. With nothing configured
    that lookup is ``None``, so the guard never fired, the coordinator
    reported itself available, and ``recommend()`` would have received
    ``room_temperature=None`` -- a ``TypeError`` on the first numeric
    comparison. Availability must be tracked independently of the
    (possibly ``None``) description string.
    """
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.room_available
    assert coordinator.recommendation(Situation.SLEEP) is None
    # Nothing to name -- the guard must still fire, and the card falls back
    # to naming the sensor itself.
    assert coordinator.missing_room_entity is None


async def test_a_non_numeric_apparent_temperature_falls_back_to_the_plain_one(
    hass: HomeAssistant,
) -> None:
    """A weather entity may publish `apparent_temperature: "unknown"`.

    Regression test: ``_read_outdoor`` called ``float()`` on the attribute
    with no guard, so this raised ``ValueError`` out of
    ``async_setup_entry`` -- the entry failed to set up and the child got no
    entities at all. The plain ``temperature`` is right there and readable,
    so the recommendation carries on from that.
    """
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": "unknown"}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.GENERAL).base_temperature == 10.0
    assert coordinator.outdoor_temperature_source == "measured"


async def test_a_non_numeric_temperature_leaves_the_entry_usable(hass: HomeAssistant) -> None:
    """Neither attribute is readable: unavailable, but never an exception.

    Setup must still succeed -- an entry that fails to set up takes every
    entity with it, including the age sensor and the room-based situations
    that never look at the weather.
    """
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": "n/a", "apparent_temperature": "unknown"}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.outdoor_available
    assert coordinator.outdoor_temperature_source == "unknown"
    assert coordinator.missing_outdoor_entity == "weather.home"
    # The room half is untouched and still produces a recommendation.
    assert coordinator.recommendation(Situation.SLEEP) is not None


async def test_a_non_numeric_value_arriving_later_does_not_raise(hass: HomeAssistant) -> None:
    """The same guard has to hold on the state-change path.

    Without it the exception surfaces inside the callback rather than at
    setup, which is worse: every recommendation silently stops updating and
    the entities keep showing the last good values as if they were current.
    """
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": 4.0}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 12.0, "apparent_temperature": "unknown"}
    )
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.GENERAL).base_temperature == 12.0


@pytest.mark.parametrize("value", ["nan", "inf", "-inf"])
async def test_a_non_finite_temperature_is_unreadable(hass: HomeAssistant, value: str) -> None:
    """float("nan") parses, and then poisons every comparison after it.

    ``bucket_index(nan)`` falls through every bound and returns the coldest
    band, so a NaN reading would dress a child for below freezing in July.
    Non-finite values are rejected at the read path, exactly like a value
    that never parsed at all.
    """
    hass.states.async_set("weather.home", "cloudy", {"temperature": float(value)})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.outdoor_available
    assert coordinator.recommendation(Situation.GENERAL) is None


async def test_a_non_finite_uv_index_is_unreadable(hass: HomeAssistant) -> None:
    # The string "nan" survives float() just as the float does, and the UV
    # bands would then resolve to `niedrig` -- "no protection needed" from a
    # reading that does not exist.
    hass.states.async_set("weather.home", "cloudy", {"temperature": 20.0})
    hass.states.async_set("sensor.uv", "nan")
    entry = _entry(
        hass,
        **{
            CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE,
            CONF_ROOM_RANGE: "18_19",
            CONF_UV_ENTITY: "sensor.uv",
        },
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.uv_index is None
    assert coordinator.uv() is None
    assert coordinator.uv_unavailable


async def test_uv_is_not_reported_unavailable_when_no_source_is_configured(
    hass: HomeAssistant,
) -> None:
    # "No UV source" is a configuration choice, not an outage; flagging it
    # would put a permanent note on every card that never wanted UV.
    hass.states.async_set("weather.home", "cloudy", {"temperature": 20.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.uv_unavailable


async def test_a_weather_outage_leaves_the_room_situations_alone(hass: HomeAssistant) -> None:
    """Availability is per source, not coordinator-wide.

    Sleep and home read room temperature and never look at the weather. With
    a fixed room range -- a source that cannot fail -- they must stay
    available no matter what the weather entity does.
    """
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator

    hass.states.async_set("weather.home", "unavailable")
    await hass.async_block_till_done()

    assert not coordinator.outdoor_available
    assert coordinator.room_available
    assert coordinator.recommendation(Situation.STROLLER) is None
    assert coordinator.recommendation(Situation.SLEEP) is not None
    assert coordinator.recommendation(Situation.HOME) is not None
    assert coordinator.missing_outdoor_entity == "weather.home"
    assert coordinator.missing_room_entity is None


async def test_a_room_outage_leaves_the_outdoor_situations_alone(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    hass.states.async_set("sensor.bedroom", "19.0")
    entry = _entry(
        hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY, CONF_ROOM_ENTITY: "sensor.bedroom"}
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator

    hass.states.async_set("sensor.bedroom", "unavailable")
    await hass.async_block_till_done()

    assert coordinator.outdoor_available
    assert not coordinator.room_available
    assert coordinator.recommendation(Situation.STROLLER) is not None
    assert coordinator.recommendation(Situation.SLEEP) is None
    assert coordinator.missing_room_entity == "sensor.bedroom"
    assert coordinator.missing_outdoor_entity is None


async def test_the_weather_condition_is_kept_for_the_attributes(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "rainy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.weather_condition == "rainy"

    hass.states.async_set("weather.home", "unavailable")
    await hass.async_block_till_done()

    # Not the last good condition: the entity no longer says anything.
    assert coordinator.weather_condition is None


@pytest.mark.parametrize("hour", [11, 15])
async def test_the_midday_window_is_scheduled(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, hour: int
) -> None:
    """WARNING_MIDDAY covers 11:00-15:00 and nothing else moves at those times.

    Regression test: the coordinator registered a midnight time change only,
    so the midday warning appeared and disappeared whenever a source entity
    happened to change state -- which, with a weather entity that updates
    every half hour, is close enough to right to hide the bug and far enough
    off to be wrong.
    """
    freezer.move_to(dt_util.now().replace(hour=9, minute=0, second=0, microsecond=0))
    hass.states.async_set("weather.home", "sunny", {"temperature": 20.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    calls: list[int] = []
    coordinator.async_add_listener(lambda: calls.append(1))

    target = dt_util.now().replace(hour=hour, minute=0, second=30)
    freezer.move_to(target)
    async_fire_time_changed(hass, target)
    await hass.async_block_till_done()

    assert calls, f"no recomputation at {hour}:00"


async def test_age_is_derived_from_the_birth_date(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.age_months >= 0


async def test_uv_index_and_advice_are_exposed(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 20.0})
    hass.states.async_set("sensor.uv", "6.0")
    entry = _entry(
        hass,
        **{
            CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE,
            CONF_ROOM_RANGE: "18_19",
            CONF_UV_ENTITY: "sensor.uv",
        },
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.uv_index == 6.0
    assert coordinator.uv() is not None


async def test_add_listener_returns_a_working_remove_callback(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    calls: list[int] = []
    remove = coordinator.async_add_listener(lambda: calls.append(1))

    coordinator.async_recompute()
    assert calls == [1]

    remove()
    coordinator.async_recompute()
    assert calls == [1]


async def test_a_raising_listener_does_not_block_the_others(hass: HomeAssistant) -> None:
    """One misbehaving sensor must not leave the rest stale.

    Mirrors ha-pareto's coordinator, which wraps each listener call so a
    single bad one cannot stop the loop before it reaches the others.
    """
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    calls: list[int] = []

    def _raises() -> None:
        raise RuntimeError("boom")

    coordinator.async_add_listener(_raises)
    coordinator.async_add_listener(lambda: calls.append(1))

    coordinator.async_recompute()

    assert calls == [1]


async def test_async_stop_unsubscribes_the_state_listener(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    before = coordinator.recommendation(Situation.GENERAL)
    assert before is not None

    coordinator.async_stop()
    hass.states.async_set("weather.home", "snowy", {"temperature": -5.0})
    await hass.async_block_till_done()

    after = coordinator.recommendation(Situation.GENERAL)
    assert after is not None
    assert after.base_temperature == before.base_temperature


async def test_async_stop_is_safe_when_async_start_never_ran(hass: HomeAssistant) -> None:
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    coordinator = TinybreezeCoordinator(hass, entry)

    coordinator.async_stop()
