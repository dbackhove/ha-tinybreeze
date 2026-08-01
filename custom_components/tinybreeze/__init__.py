"""The Tinybreeze integration."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .const import CARD_FILENAME, CARD_URL, DOMAIN
from .coordinator import TinybreezeCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the card once for the component, not once per entry."""
    await _async_serve_card(hass)
    return True


async def _async_serve_card(hass: HomeAssistant) -> None:
    """Publish the built card bundle and have the frontend load it.

    HACS allows one category per repository, so the card ships inside the
    integration and registers itself instead of asking the user to add a
    Lovelace resource by hand.
    """
    card_path = Path(__file__).parent / "www" / CARD_FILENAME
    if not await hass.async_add_executor_job(card_path.is_file):
        # A source checkout that was never built. The sensors still work, so
        # this is a missing extra rather than a reason to fail setup.
        _LOGGER.warning("Tinybreeze card bundle missing at %s, not serving it", card_path)
        return

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), cache_headers=True)]
    )

    # The query string busts the browser cache on upgrade. It comes from the
    # manifest rather than a second constant, which would eventually drift.
    integration = await async_get_integration(hass, DOMAIN)
    frontend.add_extra_js_url(hass, f"{CARD_URL}?v={integration.version}")


@dataclass
class TinybreezeRuntime:
    """Everything one config entry owns at runtime."""

    coordinator: TinybreezeCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one child from a config entry."""
    coordinator = TinybreezeCoordinator(hass, entry)
    await coordinator.async_start()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = TinybreezeRuntime(coordinator=coordinator)

    try:
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:
        # HA never calls async_unload_entry for an entry that did not reach
        # LOADED, so the listeners started above must be unwound here or they
        # keep firing with no way to stop them short of a restart.
        hass.data[DOMAIN].pop(entry.entry_id, None)
        coordinator.async_stop()
        raise

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Tear down a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unloaded:
        return False

    runtime: TinybreezeRuntime = hass.data[DOMAIN].pop(entry.entry_id)
    runtime.coordinator.async_stop()
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload after the options changed."""
    await hass.config_entries.async_reload(entry.entry_id)
