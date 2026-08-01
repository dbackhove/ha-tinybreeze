"""The config-entry lifecycle: setup, unload, and options-triggered reload.

Coordinator and platform were both stubs when this file was planned, so it
could not be written until Task 9 made both real. Assertions stay concrete
(exact entity sets, exact states) rather than smoke-level, since this is the
first test of that lifecycle.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_SOURCE_RANGE,
)

EXPECTED_ENTITIES = {
    "sensor.mia_kleidung_kinderwagen",
    "sensor.mia_kleidung_babytrage",
    "sensor.mia_kleidung_auto",
    "sensor.mia_kleidung_schlafen",
    "sensor.mia_kleidung_zuhause",
    "sensor.mia_kleidung_allgemein",
    "sensor.mia_alter",
}


async def _setup(hass: HomeAssistant, **options) -> MockConfigEntry:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-01-01"},
        options={
            CONF_WEATHER_ENTITY: "weather.home",
            CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE,
            CONF_ROOM_RANGE: "18_19",
            **options,
        },
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_setup_creates_the_expected_entities(hass: HomeAssistant) -> None:
    entry = await _setup(hass)

    assert entry.state is ConfigEntryState.LOADED
    actual = {state.entity_id for state in hass.states.async_all("sensor")}
    assert actual == EXPECTED_ENTITIES

    # Concrete, not smoke-level: every one of them must actually be reporting
    # a real value, not sitting there unavailable or unknown.
    for entity_id in EXPECTED_ENTITIES:
        state = hass.states.get(entity_id)
        assert state.state not in ("unavailable", "unknown")


async def test_unload_removes_entities_and_stops_the_coordinator_subscription(
    hass: HomeAssistant,
) -> None:
    entry = await _setup(hass)
    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator

    # Prove the entities exist before unload, so their absence afterwards is
    # a real contrast rather than a setup that never created them.
    for entity_id in EXPECTED_ENTITIES:
        assert hass.states.get(entity_id) is not None

    calls: list[int] = []
    coordinator.async_add_listener(lambda: calls.append(1))

    # Prove the subscription is live before unload, so its absence afterwards
    # is a real contrast rather than a listener that never worked.
    hass.states.async_set("weather.home", "sunny", {"temperature": 15.0})
    await hass.async_block_till_done()
    assert calls == [1]

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.NOT_LOADED
    assert entry.entry_id not in hass.data.get(DOMAIN, {})
    for entity_id in EXPECTED_ENTITIES:
        # Entities with a registry entry are soft-removed on unload: HA sets
        # the state to unavailable rather than deleting the row outright
        # (homeassistant.helpers.entity.Entity.async_remove), so the entity
        # object itself is gone and no longer live, even though the state
        # machine still shows a placeholder.
        state = hass.states.get(entity_id)
        assert state is not None
        assert state.state == "unavailable"

    # No lingering coordinator subscription: a state change on the tracked
    # entity must no longer trigger a recompute/notify cycle.
    hass.states.async_set("weather.home", "snowy", {"temperature": -5.0})
    await hass.async_block_till_done()
    assert calls == [1]


async def test_options_change_reloads_entry_and_entities_survive_with_new_configuration(
    hass: HomeAssistant,
) -> None:
    entry = await _setup(hass)
    assert hass.states.get("sensor.mia_uv_schutz") is None
    # Positive twin: the rest of the platform exists before the reload, so
    # its survival afterwards is a real check rather than an entity set
    # that was empty throughout.
    for entity_id in EXPECTED_ENTITIES:
        assert hass.states.get(entity_id) is not None
    old_coordinator = hass.data[DOMAIN][entry.entry_id].coordinator

    hass.states.async_set("sensor.uv", "7")
    new_options = {**entry.options, CONF_UV_ENTITY: "sensor.uv"}
    hass.config_entries.async_update_entry(entry, options=new_options)
    await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.LOADED
    # A genuine reload, not a no-op: a fresh coordinator now owns the entry.
    new_coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert new_coordinator is not old_coordinator

    # The original entities survive the reload...
    for entity_id in EXPECTED_ENTITIES:
        state = hass.states.get(entity_id)
        assert state is not None
        assert state.state not in ("unavailable", "unknown")

    # ...and the new configuration actually took effect.
    uv_state = hass.states.get("sensor.mia_uv_schutz")
    assert uv_state is not None
    assert uv_state.state == "hoch"
