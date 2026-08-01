"""Entities: enum states, rich attributes, and the ones that stay away."""

from __future__ import annotations

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

SITUATIONS = ("kinderwagen", "babytrage", "auto", "schlafen", "zuhause", "allgemein")


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


async def test_all_six_situations_get_an_entity(hass: HomeAssistant) -> None:
    await _setup(hass)
    for situation in SITUATIONS:
        assert hass.states.get(f"sensor.mia_kleidung_{situation}") is not None


async def test_state_is_a_level_and_the_outfit_is_an_attribute(hass: HomeAssistant) -> None:
    await _setup(hass)
    state = hass.states.get("sensor.mia_kleidung_allgemein")
    assert state.state == "warm"
    assert "long_sleeve_body" in state.attributes["outfit_keys"]
    assert state.attributes["layers"] == 3
    assert len(state.state) < 255


async def test_sleep_sensor_reports_tog(hass: HomeAssistant) -> None:
    await _setup(hass)
    state = hass.states.get("sensor.mia_kleidung_schlafen")
    assert state.state == "tog_2_5"
    assert state.attributes["tog"] == 2.5
    assert "keine_muetze" in state.attributes["warnings"]


async def test_temperature_source_matches_situation_kind(hass: HomeAssistant) -> None:
    """Outdoor situations must report ``outdoor_temperature_source``; sleep
    and home must report ``room_temperature_source``.

    The fixture gives the two fields different values on purpose (a plain
    "measured" outdoor reading, a "manual_range" room): reading the wrong
    field for a given situation would be caught by this, whereas reading the
    same field for both would not be if the two happened to agree.
    """
    await _setup(hass)

    outdoor_state = hass.states.get("sensor.mia_kleidung_allgemein")
    assert outdoor_state.attributes["temperature_source"] == "measured"

    home_state = hass.states.get("sensor.mia_kleidung_zuhause")
    assert home_state.attributes["temperature_source"] == "manual_range"

    sleep_state = hass.states.get("sensor.mia_kleidung_schlafen")
    assert sleep_state.attributes["temperature_source"] == "manual_range"


async def test_no_uv_entity_means_no_uv_sensor(hass: HomeAssistant) -> None:
    await _setup(hass)
    # Proves the absence is deliberate, not collateral damage from a setup
    # that failed outright: the rest of the platform must still be there.
    assert hass.states.get("sensor.mia_kleidung_allgemein") is not None
    assert hass.states.get("sensor.mia_uv_schutz") is None


async def test_uv_sensor_appears_when_a_source_is_configured(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.uv", "7")
    await _setup(hass, **{CONF_UV_ENTITY: "sensor.uv"})
    state = hass.states.get("sensor.mia_uv_schutz")
    assert state.state == "hoch"
    assert state.attributes["uv_index"] == 7.0
    # No sunscreen in the first year.
    assert state.attributes["sunscreen"] == "none"


async def test_uv_sensor_goes_unavailable_when_its_source_does(hass: HomeAssistant) -> None:
    """The UV sensor's availability must depend on the UV reading itself, not
    only on ``coordinator.available`` -- outdoor and room temperature stay
    readable here, so the coordinator as a whole is fine, and only the UV
    reading is lost.
    """
    hass.states.async_set("sensor.uv", "7")
    await _setup(hass, **{CONF_UV_ENTITY: "sensor.uv"})
    assert hass.states.get("sensor.mia_uv_schutz").state == "hoch"

    hass.states.async_set("sensor.uv", "unavailable")
    await hass.async_block_till_done()

    # The rest of the platform is unaffected: only the UV reading was lost.
    assert hass.states.get("sensor.mia_kleidung_allgemein").state != "unavailable"
    assert hass.states.get("sensor.mia_uv_schutz").state == "unavailable"


async def test_age_sensor_counts_months(hass: HomeAssistant) -> None:
    await _setup(hass)
    state = hass.states.get("sensor.mia_alter")
    assert int(state.state) >= 0


async def test_entities_go_unavailable_when_the_source_does(hass: HomeAssistant) -> None:
    await _setup(hass)
    hass.states.async_set("weather.home", "unavailable")
    await hass.async_block_till_done()

    state = hass.states.get("sensor.mia_kleidung_allgemein")
    assert state.state == "unavailable"


async def test_outfit_attributes_render_english_labels_by_default(hass: HomeAssistant) -> None:
    await _setup(hass)
    state = hass.states.get("sensor.mia_kleidung_allgemein")
    assert state.attributes["outfit"]
    assert "long_sleeve_body" not in state.attributes["outfit_text"]
    assert "Long-sleeve bodysuit" in state.attributes["outfit"]
    assert state.attributes["outfit_text"] == ", ".join(state.attributes["outfit"])


async def test_outfit_text_is_rendered_in_german_when_configured(hass: HomeAssistant) -> None:
    """A push notification containing 'long_sleeve_body' would be worse than
    no notification, so this must fail loudly if the translation category
    used by the sensor silently fails to load and `_label` falls back to
    the raw key for every item.
    """
    hass.config.language = "de"
    await _setup(hass)
    state = hass.states.get("sensor.mia_kleidung_allgemein")
    assert "long_sleeve_body" not in state.attributes["outfit_text"]
    assert "Langarmbody" in state.attributes["outfit_text"]
    assert "Strampler" in state.attributes["outfit_text"]


async def test_age_sensor_stays_available_when_the_source_does_not(hass: HomeAssistant) -> None:
    """Age is derived from the birth date alone and recomputed on every read,
    so it owes nothing to the weather or room entities that gate
    ``coordinator.available``. It must not go unavailable along with the
    clothing sensors.
    """
    await _setup(hass)
    hass.states.async_set("weather.home", "unavailable")
    await hass.async_block_till_done()

    # Confirms the clothing sensor really did go unavailable in this
    # scenario, so the age sensor's survival below is a real contrast and
    # not an artifact of the source outage not having landed yet.
    assert hass.states.get("sensor.mia_kleidung_allgemein").state == "unavailable"

    state = hass.states.get("sensor.mia_alter")
    assert state.state != "unavailable"
    assert int(state.state) >= 0
