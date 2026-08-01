"""Both languages exist, agree on keys, and cover every key that rules and
config_flow.py emit.

The lower-bound assertions before each `<=` comparison exist because
`emitted <= translated` passes trivially if `emitted` is empty -- for
instance if the introspection over `vars(rules)` silently finds nothing.
"""

from __future__ import annotations

import json
from pathlib import Path

import custom_components.tinybreeze.recommendation as rules
from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    ROOM_RANGES,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)

TRANSLATIONS = Path("custom_components/tinybreeze/translations")
STRINGS = Path("custom_components/tinybreeze/strings.json")

# As of this writing recommendation.py defines 30 ITEM_* constants and 16
# WARNING_*/HINT_*/MEASURE_* ones. These lower bounds are set well below
# that so a couple of items being renamed doesn't break this test, but a
# gutted or misspelled prefix that finds (almost) nothing still will.
MIN_ITEM_KEYS = 20
MIN_WARNING_HINT_MEASURE_KEYS = 10

# Enumerated straight from const.py's CONF_*/ROOM_* names, not copied from
# the task brief's strings.json sketch: that sketch was written before task
# 7 added `room_entity_required` to the options flow, and does not carry it.
CONFIG_FLOW_DATA_KEYS = {
    f"config.step.user.data.{CONF_NAME}",
    f"config.step.user.data.{CONF_BIRTH_DATE}",
    f"options.step.init.data.{CONF_WEATHER_ENTITY}",
    f"options.step.init.data.{CONF_UV_ENTITY}",
    f"options.step.init.data.{CONF_ROOM_SOURCE}",
    f"options.step.init.data.{CONF_ROOM_ENTITY}",
    f"options.step.init.data.{CONF_ROOM_RANGE}",
}

CONFIG_FLOW_ERROR_KEYS = {
    "config.error.invalid_date",
    "config.error.birth_date_in_future",
    "options.error.room_entity_required",
}

SELECTOR_KEYS = {
    f"selector.room_source.options.{ROOM_SOURCE_ENTITY}",
    f"selector.room_source.options.{ROOM_SOURCE_RANGE}",
} | {f"selector.room_range.options.{key}" for key in ROOM_RANGES}

CONFIG_FLOW_KEYS = CONFIG_FLOW_DATA_KEYS | CONFIG_FLOW_ERROR_KEYS | SELECTOR_KEYS


def _load(language: str) -> dict:
    return json.loads((TRANSLATIONS / f"{language}.json").read_text(encoding="utf-8"))


def _flatten(data: dict, prefix: str = "") -> set[str]:
    keys: set[str] = set()
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys |= _flatten(value, path)
        else:
            keys.add(path)
    return keys


def _emitted(*prefixes: str) -> set[str]:
    return {
        value
        for name, value in vars(rules).items()
        if name.startswith(prefixes) and isinstance(value, str)
    }


def test_both_languages_have_the_same_keys() -> None:
    de_keys = _flatten(_load("de"))
    en_keys = _flatten(_load("en"))
    assert len(de_keys) > 20, "de.json looks empty or barely populated"
    assert de_keys == en_keys


def test_strings_json_matches_english() -> None:
    strings = json.loads(STRINGS.read_text(encoding="utf-8"))
    strings_keys = _flatten(strings)
    assert len(strings_keys) > 20, "strings.json looks empty or barely populated"
    assert strings_keys == _flatten(_load("en"))


def test_every_item_key_is_translated() -> None:
    emitted = _emitted("ITEM_")
    assert len(emitted) >= MIN_ITEM_KEYS, (
        f"introspection over vars(rules) only found {len(emitted)} ITEM_* "
        "constants -- did recommendation.py change shape?"
    )
    for language in ("de", "en"):
        translated = set(_load(language)["item"])
        assert emitted <= translated, f"{language} is missing {emitted - translated}"


def test_every_warning_and_hint_is_translated() -> None:
    emitted = _emitted("WARNING_", "HINT_", "MEASURE_")
    assert len(emitted) >= MIN_WARNING_HINT_MEASURE_KEYS, (
        f"introspection over vars(rules) only found {len(emitted)} "
        "WARNING_*/HINT_*/MEASURE_* constants -- did recommendation.py change shape?"
    )
    for language in ("de", "en"):
        data = _load(language)
        translated = set(data["warning"]) | set(data["hint"]) | set(data["measure"])
        assert emitted <= translated, f"{language} is missing {emitted - translated}"


def test_every_config_flow_key_is_translated() -> None:
    """config_flow.py's form fields, errors and selectors all resolve.

    Includes `options.error.room_entity_required`, which task 7 added to the
    options flow after this task's brief was written.
    """
    assert len(CONFIG_FLOW_KEYS) >= 15
    for language in ("de", "en"):
        keys = _flatten(_load(language))
        assert CONFIG_FLOW_KEYS <= keys, f"{language} is missing {CONFIG_FLOW_KEYS - keys}"
