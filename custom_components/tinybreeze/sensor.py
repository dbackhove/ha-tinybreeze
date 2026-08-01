"""Entities for one child.

HA caps state values at 255 characters and a sentence is useless as an
automation trigger, so the state is an enum band and the substance sits in
attributes.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.translation import async_get_translations

from .const import CONF_NAME, CONF_UV_ENTITY, DOMAIN
from .coordinator import TinybreezeCoordinator
from .recommendation import LEVELS, ROOM_SITUATIONS, Situation, SleepLevel, UvLevel

SITUATION_LABELS: dict[Situation, str] = {
    Situation.STROLLER: "Kleidung Kinderwagen",
    Situation.CARRIER: "Kleidung Babytrage",
    Situation.CAR: "Kleidung Auto",
    Situation.SLEEP: "Kleidung Schlafen",
    Situation.HOME: "Kleidung Zuhause",
    Situation.GENERAL: "Kleidung Allgemein",
}


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create every entity this child owns."""
    coordinator: TinybreezeCoordinator = hass.data[DOMAIN][entry.entry_id].coordinator

    entities: list[SensorEntity] = [
        ClothingSensor(coordinator, entry, situation) for situation in Situation
    ]
    entities.append(AgeSensor(coordinator, entry))
    if entry.options.get(CONF_UV_ENTITY):
        # Without a source there is nothing to report; an entity that is
        # permanently unknown is worse than one that never appears.
        entities.append(UvSensor(coordinator, entry))

    async_add_entities(entities)


class TinybreezeEntity(SensorEntity):
    """Shared plumbing: device grouping and coordinator subscription."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, coordinator: TinybreezeCoordinator, entry: ConfigEntry) -> None:
        self._coordinator = coordinator
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.data[CONF_NAME],
            manufacturer="Tinybreeze",
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._coordinator.async_add_listener(self._handle_update))
        self._handle_update()

    @callback
    def _handle_update(self) -> None:
        if self.hass is not None:
            self.async_write_ha_state()


class ClothingSensor(TinybreezeEntity):
    """One situation's recommendation."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_icon = "mdi:tshirt-crew"

    def __init__(
        self, coordinator: TinybreezeCoordinator, entry: ConfigEntry, situation: Situation
    ) -> None:
        super().__init__(coordinator, entry)
        self._situation = situation
        self._attr_name = SITUATION_LABELS[situation]
        self._attr_unique_id = f"{entry.entry_id}_clothing_{situation}"
        self._attr_options = (
            [str(level) for level in SleepLevel]
            if situation is Situation.SLEEP
            else [str(level) for level in LEVELS]
        )
        self._strings: dict[str, str] = {}

    async def async_added_to_hass(self) -> None:
        # Rendered once here rather than per attribute read: a push
        # notification must not contain "long_sleeve_body", and the language
        # cannot change without a restart.
        self._strings = await async_get_translations(
            self.hass, self.hass.config.language, "item", {DOMAIN}
        )
        await super().async_added_to_hass()

    def _label(self, key: str) -> str:
        return self._strings.get(f"component.{DOMAIN}.item.{key}", key)

    @property
    def available(self) -> bool:
        # Gated on the source this situation actually reads, not on the
        # coordinator as a whole: a weather outage has nothing to say about
        # a sleeping child, and with a fixed room range there is no room
        # source that could fail in the first place.
        return self._coordinator.available_for(self._situation)

    @property
    def native_value(self) -> str | None:
        result = self._coordinator.recommendation(self._situation)
        return None if result is None else str(result.level)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        result = self._coordinator.recommendation(self._situation)
        if result is None:
            return {}
        # ROOM_SITUATIONS lives in recommendation.py, defined as the
        # complement of OUTDOOR_SITUATIONS. It decides two things that must
        # never disagree: which of the coordinator's two source fields this
        # situation reports, and (in `available` above) which of its two
        # availability flags gates the entity.
        temperature_source = (
            self._coordinator.room_temperature_source
            if self._situation in ROOM_SITUATIONS
            else self._coordinator.outdoor_temperature_source
        )
        outfit = [self._label(key) for key in result.outfit]
        attributes: dict[str, Any] = {
            "outfit_keys": list(result.outfit),
            "outfit": outfit,
            "outfit_text": ", ".join(outfit),
            "layers": result.layers,
            "hint": result.hint,
            "warnings": list(result.warnings),
            "base_temperature": result.base_temperature,
            "temperature_source": temperature_source,
            "weather_condition": self._coordinator.weather_condition,
            "age_months": self._coordinator.age_months,
            # True only when a UV source is configured and unreadable. The
            # UV block is skipped silently in that case, so without this the
            # card would show an ordinary recommendation with no sun
            # protection and no reason given.
            "uv_unavailable": self._coordinator.uv_unavailable,
        }
        if result.tog is not None:
            attributes["tog"] = result.tog
        return attributes


class UvSensor(TinybreezeEntity):
    """Sun protection, only when a UV source exists."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_icon = "mdi:weather-sunny-alert"
    _attr_name = "UV-Schutz"

    def __init__(self, coordinator: TinybreezeCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_uv"
        self._attr_options = [str(level) for level in UvLevel]

    @property
    def available(self) -> bool:
        # Its own rule, and only its own: the UV reading is independent of
        # both temperatures, so neither a weather nor a room outage says
        # anything about whether this sensor still knows the UV index.
        return self._coordinator.uv() is not None

    @property
    def native_value(self) -> str | None:
        advice = self._coordinator.uv()
        return None if advice is None else str(advice.level)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        advice = self._coordinator.uv()
        if advice is None:
            return {}
        return {
            "uv_index": self._coordinator.uv_index,
            "measures": list(advice.measures),
            "sunscreen": advice.sunscreen,
            "warnings": list(advice.warnings),
        }


class AgeSensor(TinybreezeEntity):
    """Age in whole months. The rules band on 4 and 12."""

    _attr_icon = "mdi:cake-variant"
    _attr_name = "Alter"
    _attr_native_unit_of_measurement = "Monate"

    def __init__(self, coordinator: TinybreezeCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_age"

    @property
    def available(self) -> bool:
        # Deliberately not gated on coordinator.available. Age comes solely
        # from the configured birth date and is recomputed fresh on every
        # read -- it owes nothing to the weather or room entities that make
        # the coordinator unavailable, so it is never stale. Tying it to
        # that flag would take down an automation like "notify at 6 months"
        # whenever an unrelated sensor glitches, for a value that was always
        # correct.
        return True

    @property
    def native_value(self) -> int:
        return self._coordinator.age_months

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Also the child's one always-readable channel for source outages.

        Home Assistant merges ``extra_state_attributes`` into a state only
        while the entity is available (see ``Entity.__async_calculate_state``
        in helpers/entity.py), so an unavailable clothing sensor cannot name
        the source that took it down -- which left the card reporting its own
        entity id back at the user ("not available:
        sensor.mia_kleidung_schlafen"), circular and unactionable. This
        entity is available by construction, so it is the only place per
        child that can still say ``weather.home``. Split by source domain
        because availability is: the card picks the one belonging to the
        situation it is rendering.
        """
        return {
            "missing_outdoor_entity": self._coordinator.missing_outdoor_entity,
            "missing_room_entity": self._coordinator.missing_room_entity,
        }
