"""The coordinator reads sources, calls the rules, and never polls."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

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


async def test_unavailable_weather_makes_the_coordinator_unavailable(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "unavailable")
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.available
    assert coordinator.missing_entity == "weather.home"


async def test_missing_room_sensor_is_reported(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(
        hass,
        **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY, CONF_ROOM_ENTITY: "sensor.bedroom"},
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.available
    assert coordinator.missing_entity == "sensor.bedroom"


async def test_missing_room_entity_key_leaves_coordinator_unavailable(
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
    assert not coordinator.available


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
