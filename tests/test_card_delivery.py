"""The card ships inside the integration and registers itself.

Registration happens twice over, by design: an extra module url and a
Lovelace resource. The second one is what reaches the iOS companion app,
whose cached index page never carries the first. See
`_async_register_card_resource`.
"""

from __future__ import annotations

from unittest.mock import patch

from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_YAML
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.tinybreeze import _async_register_card_resource
from custom_components.tinybreeze.const import CARD_URL, DOMAIN


def _card_resources(hass: HomeAssistant) -> list[dict]:
    return [
        item
        for item in hass.data[LOVELACE_DATA].resources.async_items()
        if str(item.get("url", "")).startswith(CARD_URL)
    ]


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
    # ...and no resource pointing at a file that is not there.
    assert _card_resources(hass) == []


async def test_card_is_registered_as_a_lovelace_resource(hass: HomeAssistant) -> None:
    """The path that actually reaches the companion app.

    An extra module url alone is rendered into the index page, which a
    cached client never re-fetches; the resource is fetched per dashboard
    load. Asserted on the stored collection rather than on a mock, since
    what matters is that the entry survives in Lovelace's own storage.
    """
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()

    resources = _card_resources(hass)
    assert len(resources) == 1
    assert resources[0]["type"] == "module"
    assert resources[0]["url"].startswith(CARD_URL)
    assert "?v=" in resources[0]["url"]


async def test_a_stale_resource_is_corrected_rather_than_duplicated(
    hass: HomeAssistant,
) -> None:
    """The case this integration actually hit in the field.

    A hand-added resource carrying an outdated cache-busting tag must be
    adopted and rewritten. Left alone it pins clients to a version that was
    never installed; added beside, the card would load twice under two
    cache entries and the stale one would keep winning on some clients.
    """
    assert await async_setup_component(hass, "lovelace", {})
    collection = hass.data[LOVELACE_DATA].resources
    await collection.async_load()
    collection.loaded = True
    await collection.async_create_item({"res_type": "module", "url": f"{CARD_URL}?v=deadbee"})

    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()

    resources = _card_resources(hass)
    assert len(resources) == 1
    assert resources[0]["url"] != f"{CARD_URL}?v=deadbee"
    assert "?v=" in resources[0]["url"]


async def test_registering_the_same_url_twice_does_not_duplicate_it(
    hass: HomeAssistant,
) -> None:
    """Upgrades and restarts must not accumulate resources for one card.

    Exercises the registration directly rather than running setup twice:
    `async_setup` runs once per Home Assistant start, and a second call
    would fail earlier, on the static route, for reasons unrelated to what
    is being pinned here.
    """
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()
    assert len(_card_resources(hass)) == 1
    url = _card_resources(hass)[0]["url"]

    await _async_register_card_resource(hass, url)

    assert len(_card_resources(hass)) == 1
    assert _card_resources(hass)[0]["url"] == url


async def test_yaml_resource_mode_is_left_alone(hass: HomeAssistant) -> None:
    """YAML mode owns its resource list; writing to the collection raises."""
    assert await async_setup_component(hass, "lovelace", {})
    hass.data[LOVELACE_DATA].resource_mode = MODE_YAML

    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()

    assert _card_resources(hass) == []
