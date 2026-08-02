"""Setup asks for the child and then for the sources; options change them later."""

from __future__ import annotations

from typing import Any

from homeassistant import config_entries, data_entry_flow
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

SOURCES: dict[str, Any] = {
    CONF_WEATHER_ENTITY: "weather.home",
    CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE,
    CONF_ROOM_RANGE: "18_19",
}


async def _child_step(hass: HomeAssistant, name: str = "Mia", birth_date: str = "2026-03-01"):
    """Run the first step and return whatever it produced."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    return await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: name, CONF_BIRTH_DATE: birth_date}
    )


async def test_the_child_step_leads_to_the_sources_step(hass: HomeAssistant) -> None:
    """No entry is created until the sources are in."""
    result = await _child_step(hass)
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["step_id"] == "sources"
    assert not hass.config_entries.async_entries(DOMAIN)


async def test_user_flow_creates_an_entry(hass: HomeAssistant) -> None:
    result = await _child_step(hass)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], dict(SOURCES))

    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == "Mia"
    assert result["data"][CONF_BIRTH_DATE] == "2026-03-01"


async def test_setup_puts_the_child_in_data_and_the_sources_in_options(
    hass: HomeAssistant,
) -> None:
    """The split the coordinator already reads (`entry.options`), unchanged.

    Sources arriving from setup rather than from the options flow must land in
    the same place, or nothing downstream would find them.
    """
    result = await _child_step(hass)
    await hass.config_entries.flow.async_configure(
        result["flow_id"],
        dict(SOURCES) | {CONF_UV_ENTITY: "sensor.uv_index"},
    )

    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert entry.data == {CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"}
    assert entry.options[CONF_WEATHER_ENTITY] == "weather.home"
    assert entry.options[CONF_UV_ENTITY] == "sensor.uv_index"
    assert entry.options[CONF_ROOM_RANGE] == "18_19"
    assert CONF_WEATHER_ENTITY not in entry.data


async def test_setup_accepts_a_room_sensor(hass: HomeAssistant) -> None:
    result = await _child_step(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_WEATHER_ENTITY: "weather.home",
            CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY,
            CONF_ROOM_ENTITY: "sensor.nursery_temperature",
        },
    )

    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["options"][CONF_ROOM_ENTITY] == "sensor.nursery_temperature"


async def test_setup_requires_a_room_entity_when_the_source_is_one(hass: HomeAssistant) -> None:
    """The same rule the options flow enforces, in its own error namespace."""
    result = await _child_step(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_WEATHER_ENTITY: "weather.home", CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY},
    )

    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["step_id"] == "sources"
    assert result["errors"] == {CONF_ROOM_ENTITY: "room_entity_required"}
    assert not hass.config_entries.async_entries(DOMAIN)


async def test_a_rejected_sources_step_can_still_be_completed(hass: HomeAssistant) -> None:
    """The child data survives a failed second step rather than being lost."""
    result = await _child_step(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_WEATHER_ENTITY: "weather.home", CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY},
    )
    result = await hass.config_entries.flow.async_configure(result["flow_id"], dict(SOURCES))

    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == "Mia"
    assert result["data"][CONF_BIRTH_DATE] == "2026-03-01"


async def test_future_birth_date_is_rejected(hass: HomeAssistant) -> None:
    result = await _child_step(hass, birth_date="2099-01-01")
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["step_id"] == "user"
    assert result["errors"] == {CONF_BIRTH_DATE: "birth_date_in_future"}


async def test_two_children_can_coexist(hass: HomeAssistant) -> None:
    for name in ("Mia", "Ben"):
        result = await _child_step(hass, name=name)
        result = await hass.config_entries.flow.async_configure(result["flow_id"], dict(SOURCES))
        assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY

    assert len(hass.config_entries.async_entries(DOMAIN)) == 2


async def test_options_flow_stores_a_manual_range(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"},
        options={},
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] == data_entry_flow.FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_WEATHER_ENTITY: "weather.home",
            CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE,
            CONF_ROOM_RANGE: "18_19",
        },
    )
    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_ROOM_RANGE] == "18_19"


async def test_options_flow_requires_room_entity_when_source_is_entity(
    hass: HomeAssistant,
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"},
        options={},
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] == data_entry_flow.FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_WEATHER_ENTITY: "weather.home",
            CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY,
        },
    )
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_ROOM_ENTITY: "room_entity_required"}


async def test_options_flow_accepts_entity_source_with_an_entity(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"},
        options={},
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] == data_entry_flow.FlowResultType.FORM

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_WEATHER_ENTITY: "weather.home",
            CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY,
            CONF_ROOM_ENTITY: "sensor.nursery_temperature",
        },
    )
    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_ROOM_ENTITY] == "sensor.nursery_temperature"
