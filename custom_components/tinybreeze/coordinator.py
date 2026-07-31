"""Placeholder, implemented in Task 8."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant


class TinybreezeCoordinator:
    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry

    async def async_start(self) -> None:
        return None

    def async_stop(self) -> None:
        return None
