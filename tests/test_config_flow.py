"""Setup asks for the child; options ask for the sources."""

from __future__ import annotations

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)


async def test_user_flow_creates_an_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == data_entry_flow.FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"}
    )
    assert result["type"] == data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == "Mia"
    assert result["data"][CONF_BIRTH_DATE] == "2026-03-01"


async def test_future_birth_date_is_rejected(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_NAME: "Mia", CONF_BIRTH_DATE: "2099-01-01"}
    )
    assert result["type"] == data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_BIRTH_DATE: "birth_date_in_future"}


async def test_two_children_can_coexist(hass: HomeAssistant) -> None:
    for name in ("Mia", "Ben"):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_NAME: name, CONF_BIRTH_DATE: "2026-03-01"}
        )
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
