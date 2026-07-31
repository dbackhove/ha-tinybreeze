"""The card ships inside the integration and registers itself."""

from __future__ import annotations

from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.tinybreeze.const import CARD_URL, DOMAIN


async def test_card_is_registered_and_served(hass: HomeAssistant) -> None:
    with patch("custom_components.tinybreeze.frontend.add_extra_js_url") as add_url:
        assert await async_setup_component(hass, DOMAIN, {})
        await hass.async_block_till_done()

    assert add_url.called
    url = add_url.call_args[0][1]
    assert url.startswith(CARD_URL)
    # The query string busts the browser cache on upgrade.
    assert "?v=" in url


async def test_missing_bundle_does_not_break_setup(hass: HomeAssistant) -> None:
    # Patching Path.is_file itself (rather than CARD_FILENAME) would monkeypatch
    # pathlib.Path globally for the duration of the "with" block. Home
    # Assistant's own integration loader also calls Path.is_file while resolving
    # the "tinybreeze" manifest, so that broader patch makes async_setup_component
    # fail with "Integration not found" before our code ever runs -- the test
    # would then pass for the wrong reason (setup failing outright) rather than
    # because the card bundle was reported missing.
    with (
        patch("custom_components.tinybreeze.CARD_FILENAME", "never-built.js"),
        patch("custom_components.tinybreeze.frontend.add_extra_js_url") as add_url,
    ):
        assert await async_setup_component(hass, DOMAIN, {})
        await hass.async_block_till_done()

    # A source checkout that was never built still gets working sensors.
    assert not add_url.called
