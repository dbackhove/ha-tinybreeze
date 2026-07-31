# Tinybreeze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Home Assistant integration that turns weather, UV index and room temperature into baby clothing recommendations, published as entities and rendered by a configurable Lovelace card.

**Architecture:** A pure rule module (`recommendation.py`, no Home Assistant imports) does all the reasoning. A coordinator without a polling interval recomputes on source-entity state changes and once at midnight. Sensor entities expose a short enum state plus rich attributes. The card ships inside the integration and registers itself, mirroring `ha-pareto`.

**Tech Stack:** Python 3.13, Home Assistant custom component, pytest + pytest-homeassistant-custom-component, TypeScript + Lit 3, esbuild, vitest.

## Global Constraints

- Domain is `tinybreeze`. Every constant, path and entity id uses it.
- Python 3.13, `ruff` line-length 100, `from __future__ import annotations` in every module.
- `custom_components/tinybreeze/recommendation.py` must never import from `homeassistant`. A test enforces this.
- Code, comments, docstrings, README and commit messages are English. Only user-facing strings are translated, and they exist in both `de` and `en`.
- The rule module returns **item keys** (`long_sleeve_body`), never prose. Translation happens in `sensor.py` (for `outfit_text`) and in the card (for rendering).
- The built card bundle at `custom_components/tinybreeze/www/tinybreeze-card.js` is committed. CI fails if it is stale.
- Spec of record: `docs/superpowers/specs/2026-07-31-tinybreeze-design.md`. Rule thresholds come from there verbatim.
- Every task ends with a commit.

## File Structure

| File | Responsibility |
|---|---|
| `custom_components/tinybreeze/const.py` | Domain, config keys, defaults, card paths |
| `custom_components/tinybreeze/recommendation.py` | Pure rules: buckets, shifts, TOG, UV, warnings |
| `custom_components/tinybreeze/__init__.py` | Entry setup/teardown, serving the card |
| `custom_components/tinybreeze/config_flow.py` | Config flow (child) and options flow (sources) |
| `custom_components/tinybreeze/coordinator.py` | Reads source entities, calls the rules, notifies entities |
| `custom_components/tinybreeze/sensor.py` | Clothing, UV and age entities |
| `custom_components/tinybreeze/strings.json`, `translations/{de,en}.json` | UI and item strings |
| `frontend/src/logic.ts` | Config parsing, entity selection, formatting — no DOM |
| `frontend/src/tinybreeze-card.ts` | Rendering, situation chips, info panel |
| `frontend/src/editor.ts` | Visual editor |
| `frontend/src/{types,strings}.ts` | Shared types and translations |

`logic.ts` is deliberately DOM-free so vitest can cover it without a browser.

---

### Task 1: Repository scaffold and the temperature table

**Files:**
- Create: `pyproject.toml`, `requirements-test.txt`, `tests/conftest.py`
- Create: `custom_components/tinybreeze/const.py`, `custom_components/tinybreeze/recommendation.py`
- Test: `tests/test_recommendation_table.py`, `tests/test_recommendation_purity.py`

**Interfaces:**
- Consumes: nothing
- Produces: `Situation`, `Level`, `ITEM_*` keys, `BASE_TABLE: tuple[tuple[str, ...], ...]`, `bucket_index(temperature: float) -> int`, `LAYER_ITEMS: frozenset[str]`, `count_layers(outfit) -> int`

- [ ] **Step 1: Create the project files**

`pyproject.toml`:

```toml
[project]
name = "ha-tinybreeze"
version = "0.1.0"
description = "Home Assistant integration that recommends what to dress a baby in"
requires-python = ">=3.13"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.ruff]
target-version = "py313"
line-length = 100
```

`requirements-test.txt`:

```
pytest
pytest-homeassistant-custom-component
freezegun
ruff

# Tinybreeze declares `frontend` as a dependency because it serves the card and
# calls add_extra_js_url, which writes into data that only the frontend
# component's own setup creates. Deliberately unpinned: only `import
# hass_frontend` has to succeed.
home-assistant-frontend
```

`tests/conftest.py`:

```python
"""Shared fixtures. auto_enable_custom_integrations is required by
pytest-homeassistant-custom-component before HA will load anything from
custom_components/."""

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield
```

`custom_components/tinybreeze/const.py`:

```python
"""Constants for the Tinybreeze integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "tinybreeze"

CONF_NAME: Final = "name"
CONF_BIRTH_DATE: Final = "birth_date"
CONF_WEATHER_ENTITY: Final = "weather_entity"
CONF_UV_ENTITY: Final = "uv_entity"
CONF_ROOM_SOURCE: Final = "room_source"
CONF_ROOM_ENTITY: Final = "room_entity"
CONF_ROOM_RANGE: Final = "room_range"

ROOM_SOURCE_ENTITY: Final = "entity"
ROOM_SOURCE_RANGE: Final = "range"

# Midpoints, because the rules need a number. Keys are what the user picks.
ROOM_RANGES: Final = {
    "16_17": 16.5,
    "18_19": 18.5,
    "20_21": 20.5,
    "22_23": 22.5,
    "24_25": 24.5,
    "26_plus": 26.5,
}

# The card ships inside the integration -- HACS allows one category per
# repository, so it cannot be a second, Lovelace-category entry.
CARD_FILENAME: Final = "tinybreeze-card.js"
CARD_URL: Final = "/tinybreeze_static/tinybreeze-card.js"
```

Also create empty `custom_components/tinybreeze/__init__.py` for now so the package imports.

- [ ] **Step 2: Write the failing test**

`tests/test_recommendation_table.py`:

```python
"""The temperature buckets from the spec, boundary by boundary."""

import pytest

from custom_components.tinybreeze.recommendation import (
    BASE_TABLE,
    Level,
    bucket_index,
    count_layers,
)


@pytest.mark.parametrize(
    ("temperature", "expected"),
    [
        (35.0, 0),
        (28.0, 0),
        (27.9, 1),
        (23.0, 1),
        (22.9, 2),
        (18.0, 2),
        (17.9, 3),
        (13.0, 3),
        (12.9, 4),
        (8.0, 4),
        (7.9, 5),
        (0.0, 5),
        (-0.1, 6),
        (-20.0, 6),
    ],
)
def test_bucket_index_boundaries(temperature: float, expected: int) -> None:
    assert bucket_index(temperature) == expected


def test_table_has_one_row_per_level() -> None:
    assert len(BASE_TABLE) == len(Level)


def test_every_row_has_a_torso_layer() -> None:
    for outfit in BASE_TABLE:
        assert count_layers(outfit) >= 1


def test_layers_ignore_accessories() -> None:
    # index 4: body, romper, fleece jacket are layers; hat, socks, shoes are not
    assert count_layers(BASE_TABLE[4]) == 3
```

`tests/test_recommendation_purity.py`:

```python
"""The rule module must stay free of Home Assistant so it can be reasoned
about and tested on its own."""

import ast
from pathlib import Path


def test_recommendation_imports_nothing_from_homeassistant() -> None:
    source = Path("custom_components/tinybreeze/recommendation.py").read_text(encoding="utf-8")
    tree = ast.parse(source)

    imported: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported += [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.append(node.module)

    offenders = [name for name in imported if name.split(".")[0] == "homeassistant"]
    assert offenders == [], f"recommendation.py must not import {offenders}"
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `python -m pytest tests/test_recommendation_table.py tests/test_recommendation_purity.py -v`
Expected: FAIL — `ModuleNotFoundError: custom_components.tinybreeze.recommendation`

- [ ] **Step 4: Write the implementation**

`custom_components/tinybreeze/recommendation.py`:

```python
"""The rule set: temperature, situation and age in, an outfit out.

Deliberately free of Home Assistant imports so it can be tested as plain
Python. Thresholds and sources are documented in
docs/superpowers/specs/2026-07-31-tinybreeze-design.md.

Everything here returns item *keys*, never prose. Translation happens in
sensor.py and in the card.
"""

from __future__ import annotations

from enum import StrEnum


class Situation(StrEnum):
    """The six contexts a recommendation can be asked for."""

    STROLLER = "kinderwagen"
    CARRIER = "babytrage"
    CAR = "auto"
    SLEEP = "schlafen"
    HOME = "zuhause"
    GENERAL = "allgemein"


class Level(StrEnum):
    """How warmly the child should be dressed. Also the sensor state."""

    HEAT = "hitze"
    VERY_LIGHT = "sehr_leicht"
    LIGHT = "leicht"
    MEDIUM = "mittel"
    WARM = "warm"
    VERY_WARM = "sehr_warm"
    WINTER = "winterfest"


# Item keys. Translated in sensor.py and in the card, never here.
ITEM_SHORT_SLEEVE_BODY = "short_sleeve_body"
ITEM_LONG_SLEEVE_BODY = "long_sleeve_body"
ITEM_LIGHT_LONG_SUIT = "light_long_suit"
ITEM_LIGHT_TROUSERS = "light_trousers"
ITEM_TROUSERS = "trousers"
ITEM_ROMPER = "romper"
ITEM_SWEATER = "sweater"
ITEM_VEST = "vest"
ITEM_LIGHT_JACKET = "light_jacket"
ITEM_FLEECE_JACKET = "fleece_jacket"
ITEM_FLEECE_SUIT = "fleece_suit"
ITEM_WINTER_JACKET = "winter_jacket"
ITEM_WINTER_SUIT = "winter_suit"
ITEM_PYJAMAS = "pyjamas"
ITEM_DIAPER_ONLY = "diaper_only"
ITEM_SUN_HAT = "sun_hat"
ITEM_THIN_HAT = "thin_hat"
ITEM_HAT = "hat"
ITEM_WINTER_HAT = "winter_hat"
ITEM_MITTENS = "mittens"
ITEM_SCARF = "scarf"
ITEM_BAREFOOT = "barefoot"
ITEM_THIN_SOCKS = "thin_socks"
ITEM_SOCKS = "socks"
ITEM_WOOL_SOCKS = "wool_socks"
ITEM_SHOES = "shoes"
ITEM_LEG_WARMERS = "leg_warmers"
ITEM_FOOTMUFF = "footmuff"
ITEM_RAIN_COVER = "rain_cover"
ITEM_BLANKET = "blanket"

# Only these count towards `layers`. A hat is warmth, but it is not a layer
# in the onion-principle sense, and counting it would make the number useless
# for comparing two recommendations.
LAYER_ITEMS: frozenset[str] = frozenset(
    {
        ITEM_SHORT_SLEEVE_BODY,
        ITEM_LONG_SLEEVE_BODY,
        ITEM_LIGHT_LONG_SUIT,
        ITEM_LIGHT_TROUSERS,
        ITEM_TROUSERS,
        ITEM_ROMPER,
        ITEM_SWEATER,
        ITEM_VEST,
        ITEM_LIGHT_JACKET,
        ITEM_FLEECE_JACKET,
        ITEM_FLEECE_SUIT,
        ITEM_WINTER_JACKET,
        ITEM_WINTER_SUIT,
        ITEM_PYJAMAS,
    }
)

# Lower bound of each bucket, warmest weather first. Index 0 is heat.
BUCKET_LOWER_BOUNDS: tuple[float, ...] = (28.0, 23.0, 18.0, 13.0, 8.0, 0.0)

LEVELS: tuple[Level, ...] = (
    Level.HEAT,
    Level.VERY_LIGHT,
    Level.LIGHT,
    Level.MEDIUM,
    Level.WARM,
    Level.VERY_WARM,
    Level.WINTER,
)

BASE_TABLE: tuple[tuple[str, ...], ...] = (
    # 0 -- >= 28 C
    (ITEM_SHORT_SLEEVE_BODY, ITEM_SUN_HAT, ITEM_BAREFOOT),
    # 1 -- 23..27 C
    (ITEM_SHORT_SLEEVE_BODY, ITEM_LIGHT_TROUSERS, ITEM_SUN_HAT, ITEM_THIN_SOCKS),
    # 2 -- 18..22 C
    (ITEM_LONG_SLEEVE_BODY, ITEM_TROUSERS, ITEM_VEST, ITEM_THIN_SOCKS),
    # 3 -- 13..17 C
    (
        ITEM_LONG_SLEEVE_BODY,
        ITEM_ROMPER,
        ITEM_SWEATER,
        ITEM_LIGHT_JACKET,
        ITEM_THIN_HAT,
        ITEM_SOCKS,
    ),
    # 4 -- 8..12 C
    (
        ITEM_LONG_SLEEVE_BODY,
        ITEM_ROMPER,
        ITEM_FLEECE_JACKET,
        ITEM_HAT,
        ITEM_SOCKS,
        ITEM_SHOES,
    ),
    # 5 -- 0..7 C
    (
        ITEM_LONG_SLEEVE_BODY,
        ITEM_ROMPER,
        ITEM_FLEECE_SUIT,
        ITEM_WINTER_JACKET,
        ITEM_HAT,
        ITEM_MITTENS,
        ITEM_WOOL_SOCKS,
    ),
    # 6 -- < 0 C
    (
        ITEM_LONG_SLEEVE_BODY,
        ITEM_ROMPER,
        ITEM_FLEECE_SUIT,
        ITEM_WINTER_SUIT,
        ITEM_WINTER_HAT,
        ITEM_MITTENS,
        ITEM_WOOL_SOCKS,
    ),
)

MAX_INDEX = len(BASE_TABLE) - 1


def bucket_index(temperature: float) -> int:
    """Map a temperature to a bucket. 0 is hottest, 6 is coldest."""
    for index, lower in enumerate(BUCKET_LOWER_BOUNDS):
        if temperature >= lower:
            return index
    return MAX_INDEX


def count_layers(outfit: tuple[str, ...]) -> int:
    """How many actual clothing layers an outfit has, accessories excluded."""
    return sum(1 for item in outfit if item in LAYER_ITEMS)
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python -m pytest tests/test_recommendation_table.py tests/test_recommendation_purity.py -v`
Expected: PASS, 17 tests

- [ ] **Step 6: Commit**

```bash
git add pyproject.toml requirements-test.txt tests/ custom_components/
git commit -m "Add the temperature bucket table

Seven buckets from the spec, item keys rather than prose so the same rule
output can be rendered in either language. Accessories are excluded from the
layer count: a hat is warmth but not an onion-principle layer, and counting it
would make the number useless for comparing two recommendations."
```

---

### Task 2: Age and situation modifiers

**Files:**
- Modify: `custom_components/tinybreeze/recommendation.py`
- Test: `tests/test_recommendation_shifts.py`

**Interfaces:**
- Consumes: `bucket_index`, `BASE_TABLE`, `Situation`, `LEVELS`, `MAX_INDEX` from Task 1
- Produces: `age_shift(age_months: int, temperature: float) -> int`, `situation_shift(situation: Situation, temperature: float) -> int`, `OUTDOOR_ONLY: frozenset[str]`, `CAR_MAX_INDEX: int`, `Recommendation` dataclass

- [ ] **Step 1: Write the failing test**

`tests/test_recommendation_shifts.py`:

```python
"""The modifiers, especially the places where they deliberately stop."""

from custom_components.tinybreeze.recommendation import (
    Situation,
    age_shift,
    situation_shift,
)


def test_newborn_gets_an_extra_layer_when_cold() -> None:
    assert age_shift(2, 10.0) == 1


def test_older_baby_gets_no_extra_layer() -> None:
    assert age_shift(6, 10.0) == 0


def test_newborn_gets_no_extra_layer_in_warmth() -> None:
    # Above 20 C the rule of thumb inverts: overheating is the greater risk
    # for infants, so the extra layer must not be applied.
    assert age_shift(2, 20.0) == 0
    assert age_shift(2, 30.0) == 0


def test_newborn_boundary_is_four_months() -> None:
    assert age_shift(3, 10.0) == 1
    assert age_shift(4, 10.0) == 0


def test_stroller_adds_a_layer_only_when_cold() -> None:
    assert situation_shift(Situation.STROLLER, 14.9) == 1
    assert situation_shift(Situation.STROLLER, 15.0) == 0


def test_carrier_always_removes_a_layer() -> None:
    # The wearer's body heat replaces one layer on the torso.
    assert situation_shift(Situation.CARRIER, -5.0) == -1
    assert situation_shift(Situation.CARRIER, 30.0) == -1


def test_neutral_situations_do_not_shift() -> None:
    assert situation_shift(Situation.GENERAL, 10.0) == 0
    assert situation_shift(Situation.CAR, 10.0) == 0
    assert situation_shift(Situation.HOME, 10.0) == 0
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_recommendation_shifts.py -v`
Expected: FAIL — `ImportError: cannot import name 'age_shift'`

- [ ] **Step 3: Write the implementation**

Append to `recommendation.py`:

```python
from dataclasses import dataclass

# Above this the "one more layer than an adult" rule of thumb inverts:
# overheating is the greater risk for infants. A setting, not a citation --
# see the spec's list of assumptions.
AGE_SHIFT_MAX_TEMPERATURE = 20.0
NEWBORN_MAX_MONTHS = 4

# A child in a stroller does not move and generates no warmth of its own.
STROLLER_SHIFT_MAX_TEMPERATURE = 15.0
FOOTMUFF_MAX_TEMPERATURE = 10.0

# Padded clothing leaves slack between belt and body; the lap belt rides up
# into the abdomen and can injure liver, bowel or spleen in a crash. Capping
# the index here is what keeps a winter suit out of the car seat.
CAR_MAX_INDEX = 4

CARRIER_HEAT_TEMPERATURE = 23.0

# Items that make no sense indoors.
OUTDOOR_ONLY: frozenset[str] = frozenset(
    {
        ITEM_VEST,
        ITEM_LIGHT_JACKET,
        ITEM_FLEECE_JACKET,
        ITEM_WINTER_JACKET,
        ITEM_WINTER_SUIT,
        ITEM_SUN_HAT,
        ITEM_THIN_HAT,
        ITEM_HAT,
        ITEM_WINTER_HAT,
        ITEM_MITTENS,
        ITEM_SCARF,
        ITEM_SHOES,
        ITEM_FOOTMUFF,
        ITEM_RAIN_COVER,
    }
)

# Bulk that must not go into a car seat.
CAR_FORBIDDEN: frozenset[str] = frozenset({ITEM_WINTER_JACKET, ITEM_WINTER_SUIT})


@dataclass(frozen=True)
class Recommendation:
    """One answer, ready to be turned into entity state and attributes."""

    level: str
    outfit: tuple[str, ...]
    layers: int
    hint: str | None
    warnings: tuple[str, ...]
    base_temperature: float
    tog: float | None = None


def age_shift(age_months: int, temperature: float) -> int:
    """Newborns regulate poorly and lose heat faster -- but only when cold."""
    if age_months >= NEWBORN_MAX_MONTHS:
        return 0
    if temperature >= AGE_SHIFT_MAX_TEMPERATURE:
        return 0
    return 1


def situation_shift(situation: Situation, temperature: float) -> int:
    """How the situation moves the bucket index."""
    if situation is Situation.STROLLER and temperature < STROLLER_SHIFT_MAX_TEMPERATURE:
        return 1
    if situation is Situation.CARRIER:
        return -1
    return 0
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_recommendation_shifts.py -v`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add custom_components/tinybreeze/recommendation.py tests/test_recommendation_shifts.py
git commit -m "Add age and situation modifiers

The age shift stops at 20 C on purpose. Below it the rule of thumb is 'one
more layer than an adult'; above it the same rule would dress an infant for
overheating, which is the greater risk of the two."
```

---

### Task 3: Outdoor recommendations and the situation extras

**Files:**
- Modify: `custom_components/tinybreeze/recommendation.py`
- Test: `tests/test_recommendation_outdoor.py`

**Interfaces:**
- Consumes: everything from Tasks 1 and 2
- Produces: `recommend_outdoor(situation, temperature, age_months, weather_condition) -> Recommendation`

- [ ] **Step 1: Write the failing test**

`tests/test_recommendation_outdoor.py`:

```python
"""Outdoor situations: shifts, clamping and the per-situation extras."""

from custom_components.tinybreeze.recommendation import (
    ITEM_BLANKET,
    ITEM_FOOTMUFF,
    ITEM_LEG_WARMERS,
    ITEM_RAIN_COVER,
    ITEM_WINTER_JACKET,
    ITEM_WINTER_SUIT,
    Level,
    Situation,
    recommend_outdoor,
)


def test_general_situation_follows_the_table() -> None:
    result = recommend_outdoor(Situation.GENERAL, 10.0, 6, "cloudy")
    assert result.level == Level.WARM
    assert result.base_temperature == 10.0


def test_newborn_is_dressed_one_bucket_warmer() -> None:
    older = recommend_outdoor(Situation.GENERAL, 10.0, 6, "cloudy")
    newborn = recommend_outdoor(Situation.GENERAL, 10.0, 2, "cloudy")
    assert older.level == Level.WARM
    assert newborn.level == Level.VERY_WARM


def test_shift_clamps_at_the_cold_end() -> None:
    result = recommend_outdoor(Situation.STROLLER, -30.0, 1, "snowy")
    assert result.level == Level.WINTER


def test_shift_clamps_at_the_hot_end() -> None:
    result = recommend_outdoor(Situation.CARRIER, 35.0, 6, "sunny")
    assert result.level == Level.HEAT


def test_stroller_gets_a_footmuff_below_ten_degrees() -> None:
    assert ITEM_FOOTMUFF in recommend_outdoor(Situation.STROLLER, 5.0, 6, "cloudy").outfit
    assert ITEM_FOOTMUFF not in recommend_outdoor(Situation.STROLLER, 12.0, 6, "cloudy").outfit


def test_stroller_gets_a_rain_cover_when_it_rains() -> None:
    result = recommend_outdoor(Situation.STROLLER, 10.0, 6, "rainy")
    assert ITEM_RAIN_COVER in result.outfit
    assert result.hint is not None


def test_carrier_adds_leg_warmers_and_drops_bulky_jackets() -> None:
    result = recommend_outdoor(Situation.CARRIER, 2.0, 6, "cloudy")
    assert ITEM_LEG_WARMERS in result.outfit
    assert ITEM_WINTER_JACKET not in result.outfit
    assert ITEM_WINTER_SUIT not in result.outfit


def test_car_never_uses_bulky_clothing_and_adds_a_blanket() -> None:
    result = recommend_outdoor(Situation.CAR, -10.0, 6, "snowy")
    assert ITEM_WINTER_JACKET not in result.outfit
    assert ITEM_WINTER_SUIT not in result.outfit
    assert ITEM_BLANKET in result.outfit
    assert result.level == Level.WARM  # capped at index 4


def test_layers_are_counted() -> None:
    result = recommend_outdoor(Situation.GENERAL, 10.0, 6, "cloudy")
    assert result.layers == 3
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_recommendation_outdoor.py -v`
Expected: FAIL — `ImportError: cannot import name 'recommend_outdoor'`

- [ ] **Step 3: Write the implementation**

Append to `recommendation.py`:

```python
HINT_CARRIER = "carrier_legs"
HINT_CAR = "car_seat"
HINT_STROLLER_RAIN = "stroller_rain_cover"

RAIN_CONDITIONS: frozenset[str] = frozenset(
    {"rainy", "pouring", "lightning-rainy", "hail", "snowy-rainy"}
)


def _clamp(index: int) -> int:
    return max(0, min(MAX_INDEX, index))


def recommend_outdoor(
    situation: Situation,
    temperature: float,
    age_months: int,
    weather_condition: str,
) -> Recommendation:
    """Build a recommendation for one of the four outdoor situations.

    `Situation.HOME` and `Situation.SLEEP` are handled elsewhere: they read
    room temperature and drop or replace the outdoor half of the table.
    """
    index = bucket_index(temperature)
    index += age_shift(age_months, temperature)
    index += situation_shift(situation, temperature)
    index = _clamp(index)

    warnings: list[str] = []
    if situation is Situation.CAR and index > CAR_MAX_INDEX:
        warnings.append(WARNING_CAR_SEAT)
        index = CAR_MAX_INDEX

    outfit = list(BASE_TABLE[index])
    hint: str | None = None

    if situation is Situation.STROLLER:
        if temperature < FOOTMUFF_MAX_TEMPERATURE:
            outfit.append(ITEM_FOOTMUFF)
        if weather_condition in RAIN_CONDITIONS:
            outfit.append(ITEM_RAIN_COVER)
            # A rain cover traps heat as effectively as it keeps water out.
            hint = HINT_STROLLER_RAIN

    elif situation is Situation.CARRIER:
        # A thick jacket also compromises the spread-squat position.
        outfit = [item for item in outfit if item not in CAR_FORBIDDEN]
        outfit.append(ITEM_LEG_WARMERS)
        hint = HINT_CARRIER
        if temperature >= CARRIER_HEAT_TEMPERATURE:
            warnings.append(WARNING_CARRIER_HEAT)

    elif situation is Situation.CAR:
        outfit = [item for item in outfit if item not in CAR_FORBIDDEN]
        outfit.append(ITEM_BLANKET)
        hint = HINT_CAR

    return Recommendation(
        level=LEVELS[index],
        outfit=tuple(outfit),
        layers=count_layers(tuple(outfit)),
        hint=hint,
        warnings=tuple(warnings),
        base_temperature=temperature,
    )
```

The two warning constants are defined in Task 5. For this task to run, add them near the top of the module now:

```python
WARNING_CAR_SEAT = "autositz"
WARNING_CARRIER_HEAT = "trage_hitze"
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_recommendation_outdoor.py -v`
Expected: PASS, 9 tests

- [ ] **Step 5: Commit**

```bash
git add custom_components/tinybreeze/recommendation.py tests/test_recommendation_outdoor.py
git commit -m "Add outdoor recommendations

The car path caps the index rather than trusting the temperature: padded
clothing leaves slack between belt and body, and the ADAC crash test at
16 km/h showed the lap belt riding into the abdomen. The cap is what keeps a
winter suit out of the seat no matter how cold it is."
```

---

### Task 4: Sleep and home

**Files:**
- Modify: `custom_components/tinybreeze/recommendation.py`
- Test: `tests/test_recommendation_indoor.py`

**Interfaces:**
- Consumes: everything above
- Produces: `SleepLevel`, `recommend_sleep(room_temperature: float) -> Recommendation`, `recommend_home(room_temperature: float, age_months: int) -> Recommendation`

- [ ] **Step 1: Write the failing test**

`tests/test_recommendation_indoor.py`:

```python
"""Sleep uses the TOG table; home uses the base table minus everything outdoor."""

import pytest

from custom_components.tinybreeze.recommendation import (
    ITEM_HAT,
    ITEM_LIGHT_JACKET,
    ITEM_SHOES,
    ITEM_THIN_SOCKS,
    SleepLevel,
    recommend_home,
    recommend_sleep,
)


@pytest.mark.parametrize(
    ("room_temperature", "level", "tog"),
    [
        (26.0, SleepLevel.TOG_0_5, 0.5),
        (25.0, SleepLevel.TOG_0_5, 0.5),
        (24.9, SleepLevel.TOG_1_0, 1.0),
        (21.0, SleepLevel.TOG_1_0, 1.0),
        (20.9, SleepLevel.TOG_2_5, 2.5),
        (16.0, SleepLevel.TOG_2_5, 2.5),
        (15.9, SleepLevel.TOG_3_5, 3.5),
        (10.0, SleepLevel.TOG_3_5, 3.5),
    ],
)
def test_tog_table(room_temperature: float, level: str, tog: float) -> None:
    result = recommend_sleep(room_temperature)
    assert result.level == level
    assert result.tog == tog


def test_sleep_never_includes_a_hat() -> None:
    # A baby sheds excess heat through its head; a hat in bed blocks that.
    for temperature in (10.0, 18.0, 26.0):
        assert ITEM_HAT not in recommend_sleep(temperature).outfit


def test_home_drops_outdoor_items() -> None:
    result = recommend_home(19.0, 6)
    assert ITEM_LIGHT_JACKET not in result.outfit
    assert ITEM_SHOES not in result.outfit
    assert ITEM_HAT not in result.outfit
    assert ITEM_THIN_SOCKS in result.outfit


def test_home_still_applies_the_age_shift() -> None:
    older = recommend_home(14.0, 6)
    newborn = recommend_home(14.0, 2)
    assert newborn.layers > older.layers
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_recommendation_indoor.py -v`
Expected: FAIL — `ImportError: cannot import name 'SleepLevel'`

- [ ] **Step 3: Write the implementation**

Append to `recommendation.py`:

```python
class SleepLevel(StrEnum):
    """Sleep states carry the sleeping bag, because that is the decision."""

    TOG_0_5 = "tog_0_5"
    TOG_1_0 = "tog_1_0"
    TOG_2_5 = "tog_2_5"
    TOG_3_5 = "tog_3_5"


# Lower bound, TOG value, level, what goes underneath. Warmest room first.
# Manufacturer tables overlap (2.5 TOG for 15-21 C, 1.0 TOG for 18-24 C);
# these are the non-overlapping NHS / Lullaby Trust boundaries, so the rule
# stays deterministic.
SLEEP_TABLE: tuple[tuple[float, float, SleepLevel, tuple[str, ...]], ...] = (
    (25.0, 0.5, SleepLevel.TOG_0_5, (ITEM_DIAPER_ONLY,)),
    (21.0, 1.0, SleepLevel.TOG_1_0, (ITEM_SHORT_SLEEVE_BODY,)),
    (16.0, 2.5, SleepLevel.TOG_2_5, (ITEM_LONG_SLEEVE_BODY, ITEM_PYJAMAS)),
    (float("-inf"), 3.5, SleepLevel.TOG_3_5, (ITEM_LONG_SLEEVE_BODY, ITEM_PYJAMAS)),
)

# Recommended sleeping room is 16-20 C; above this the card warns.
ROOM_TEMPERATURE_WARN_ABOVE = 21.0

HINT_SLEEP = "sleep_no_loose_bedding"


def recommend_sleep(room_temperature: float) -> Recommendation:
    """Pick a sleeping bag and what goes underneath it."""
    for lower, tog, level, underneath in SLEEP_TABLE:
        if room_temperature >= lower:
            break

    warnings = [WARNING_NO_HAT]
    if room_temperature > ROOM_TEMPERATURE_WARN_ABOVE:
        warnings.append(WARNING_OVERHEATING)

    return Recommendation(
        level=level,
        outfit=underneath,
        layers=count_layers(underneath),
        hint=HINT_SLEEP,
        warnings=tuple(warnings),
        base_temperature=room_temperature,
        tog=tog,
    )


def recommend_home(room_temperature: float, age_months: int) -> Recommendation:
    """Indoors and awake: the base table without anything meant for outside."""
    index = _clamp(bucket_index(room_temperature) + age_shift(age_months, room_temperature))
    outfit = tuple(item for item in BASE_TABLE[index] if item not in OUTDOOR_ONLY)

    warnings: list[str] = []
    if room_temperature > ROOM_TEMPERATURE_WARN_ABOVE:
        warnings.append(WARNING_OVERHEATING)

    return Recommendation(
        level=LEVELS[index],
        outfit=outfit,
        layers=count_layers(outfit),
        hint=None,
        warnings=tuple(warnings),
        base_temperature=room_temperature,
    )
```

Add the two remaining warning constants near the others:

```python
WARNING_NO_HAT = "keine_muetze"
WARNING_OVERHEATING = "ueberhitzung"
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_recommendation_indoor.py -v`
Expected: PASS, 12 tests

- [ ] **Step 5: Commit**

```bash
git add custom_components/tinybreeze/recommendation.py tests/test_recommendation_indoor.py
git commit -m "Add sleep and home recommendations

Sleep carries a permanent no-hat warning rather than a hint: a baby sheds
excess heat through its head, so a hat in bed removes the one route out. The
TOG boundaries are the non-overlapping NHS ones -- manufacturer tables give
2.5 TOG for 15-21 C and 1.0 TOG for 18-24 C, which is not a decidable rule."
```

---

### Task 5: UV advice, warnings and the public entry point

**Files:**
- Modify: `custom_components/tinybreeze/recommendation.py`
- Test: `tests/test_recommendation_uv.py`, `tests/test_recommendation_coverage.py`

**Interfaces:**
- Consumes: everything above
- Produces: `UvLevel`, `UvAdvice`, `uv_advice(uv_index, age_months, hour) -> UvAdvice`, `recommend(situation, outdoor_temperature, room_temperature, age_months, weather_condition, uv_index, hour) -> Recommendation`

- [ ] **Step 1: Write the failing test**

`tests/test_recommendation_uv.py`:

```python
"""UV levels, the under-one rules, and the midday window."""

import pytest

from custom_components.tinybreeze.recommendation import (
    SUNSCREEN_NONE,
    SUNSCREEN_SPF30_PLUS,
    WARNING_MIDDAY,
    WARNING_UV,
    UvLevel,
    uv_advice,
)


@pytest.mark.parametrize(
    ("uv_index", "level"),
    [
        (0.0, UvLevel.LOW),
        (2.0, UvLevel.LOW),
        (3.0, UvLevel.MODERATE),
        (5.0, UvLevel.MODERATE),
        (6.0, UvLevel.HIGH),
        (7.0, UvLevel.HIGH),
        (8.0, UvLevel.VERY_HIGH),
        (10.0, UvLevel.VERY_HIGH),
        (11.0, UvLevel.EXTREME),
        (14.0, UvLevel.EXTREME),
    ],
)
def test_uv_levels(uv_index: float, level: str) -> None:
    assert uv_advice(uv_index, 18, 9).level == level


def test_no_sunscreen_in_the_first_year() -> None:
    assert uv_advice(7.0, 6, 9).sunscreen == SUNSCREEN_NONE


def test_sunscreen_from_twelve_months() -> None:
    assert uv_advice(7.0, 12, 9).sunscreen == SUNSCREEN_SPF30_PLUS


def test_warning_below_three_is_absent() -> None:
    assert uv_advice(2.0, 18, 13).warnings == ()


def test_warning_from_three() -> None:
    assert WARNING_UV in uv_advice(3.0, 18, 9).warnings


def test_midday_warning_only_inside_the_window() -> None:
    assert WARNING_MIDDAY in uv_advice(5.0, 18, 11).warnings
    assert WARNING_MIDDAY in uv_advice(5.0, 18, 14).warnings
    assert WARNING_MIDDAY not in uv_advice(5.0, 18, 10).warnings
    assert WARNING_MIDDAY not in uv_advice(5.0, 18, 15).warnings


def test_midday_warning_needs_uv_too() -> None:
    assert WARNING_MIDDAY not in uv_advice(1.0, 18, 13).warnings
```

`tests/test_recommendation_coverage.py`:

```python
"""No combination of inputs may fall through the rules. With six situations
this is not something anyone can hold in their head."""

import pytest

from custom_components.tinybreeze.recommendation import (
    LEVELS,
    Situation,
    SleepLevel,
    recommend,
)

TEMPERATURES = [-25.0, -0.1, 0.0, 7.9, 8.0, 12.9, 13.0, 17.9, 18.0, 22.9, 23.0, 27.9, 28.0, 42.0]
AGES = [0, 3, 4, 11, 12, 36]
CONDITIONS = ["sunny", "cloudy", "rainy", "snowy", "fog", "windy"]

VALID_LEVELS = {str(level) for level in LEVELS} | {str(level) for level in SleepLevel}


@pytest.mark.parametrize("situation", list(Situation))
@pytest.mark.parametrize("temperature", TEMPERATURES)
@pytest.mark.parametrize("age_months", AGES)
def test_every_combination_produces_a_recommendation(
    situation: Situation, temperature: float, age_months: int
) -> None:
    for condition in CONDITIONS:
        result = recommend(
            situation=situation,
            outdoor_temperature=temperature,
            room_temperature=temperature,
            age_months=age_months,
            weather_condition=condition,
            uv_index=5.0,
            hour=13,
        )
        assert result.level in VALID_LEVELS
        assert result.outfit, "an outfit is never empty"
        assert result.layers >= 1
        assert isinstance(result.warnings, tuple)


def test_sleep_and_home_read_room_temperature() -> None:
    result = recommend(
        situation=Situation.SLEEP,
        outdoor_temperature=-10.0,
        room_temperature=19.0,
        age_months=6,
        weather_condition="snowy",
        uv_index=0.0,
        hour=22,
    )
    assert result.base_temperature == 19.0


def test_outdoor_situations_read_outdoor_temperature() -> None:
    result = recommend(
        situation=Situation.STROLLER,
        outdoor_temperature=-10.0,
        room_temperature=19.0,
        age_months=6,
        weather_condition="snowy",
        uv_index=0.0,
        hour=13,
    )
    assert result.base_temperature == -10.0


def test_uv_warnings_reach_outdoor_situations_only() -> None:
    from custom_components.tinybreeze.recommendation import WARNING_UV

    outdoors = recommend(
        situation=Situation.STROLLER,
        outdoor_temperature=20.0,
        room_temperature=20.0,
        age_months=6,
        weather_condition="sunny",
        uv_index=7.0,
        hour=13,
    )
    indoors = recommend(
        situation=Situation.SLEEP,
        outdoor_temperature=20.0,
        room_temperature=20.0,
        age_months=6,
        weather_condition="sunny",
        uv_index=7.0,
        hour=13,
    )
    assert WARNING_UV in outdoors.warnings
    assert WARNING_UV not in indoors.warnings
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/test_recommendation_uv.py tests/test_recommendation_coverage.py -v`
Expected: FAIL — `ImportError: cannot import name 'UvLevel'`

- [ ] **Step 3: Write the implementation**

Append to `recommendation.py`:

```python
class UvLevel(StrEnum):
    """WHO bands, as published by BfS and DWD."""

    LOW = "niedrig"
    MODERATE = "mittel"
    HIGH = "hoch"
    VERY_HIGH = "sehr_hoch"
    EXTREME = "extrem"


WARNING_UV = "uv"
WARNING_MIDDAY = "mittagszeit"

SUNSCREEN_NONE = "none"
SUNSCREEN_SPF30_PLUS = "spf30_plus"

UV_PROTECTION_THRESHOLD = 3.0
MIDDAY_START_HOUR = 11
MIDDAY_END_HOUR = 15
SUNSCREEN_MIN_AGE_MONTHS = 12

# Lower bound, level. Highest first.
UV_TABLE: tuple[tuple[float, UvLevel], ...] = (
    (11.0, UvLevel.EXTREME),
    (8.0, UvLevel.VERY_HIGH),
    (6.0, UvLevel.HIGH),
    (3.0, UvLevel.MODERATE),
    (float("-inf"), UvLevel.LOW),
)

MEASURE_SHADE = "shade"
MEASURE_MIDDAY_INDOORS = "midday_indoors"
MEASURE_AVOID_OUTDOORS = "avoid_outdoors"
MEASURE_CLOTHING = "uv_clothing"
MEASURE_SUN_HAT = "sun_hat_with_neck_flap"
MEASURE_NO_DIRECT_SUN = "no_direct_sun"

UV_MEASURES: dict[UvLevel, tuple[str, ...]] = {
    UvLevel.LOW: (),
    UvLevel.MODERATE: (MEASURE_SHADE, MEASURE_CLOTHING, MEASURE_SUN_HAT),
    UvLevel.HIGH: (MEASURE_SHADE, MEASURE_CLOTHING, MEASURE_SUN_HAT),
    UvLevel.VERY_HIGH: (MEASURE_MIDDAY_INDOORS, MEASURE_CLOTHING, MEASURE_SUN_HAT),
    UvLevel.EXTREME: (MEASURE_AVOID_OUTDOORS, MEASURE_CLOTHING, MEASURE_SUN_HAT),
}


@dataclass(frozen=True)
class UvAdvice:
    """Sun protection for one moment."""

    level: str
    measures: tuple[str, ...]
    sunscreen: str
    warnings: tuple[str, ...]


def uv_advice(uv_index: float, age_months: int, hour: int) -> UvAdvice:
    """Sun protection for a UV index, an age and a time of day."""
    for lower, level in UV_TABLE:
        if uv_index >= lower:
            break

    measures = list(UV_MEASURES[level])
    if age_months < SUNSCREEN_MIN_AGE_MONTHS:
        # No direct sun at all in the first year, and no sunscreen: it
        # burdens the skin without being needed once shade and clothing do
        # the work.
        sunscreen = SUNSCREEN_NONE
        if MEASURE_NO_DIRECT_SUN not in measures:
            measures.insert(0, MEASURE_NO_DIRECT_SUN)
    else:
        sunscreen = SUNSCREEN_SPF30_PLUS

    warnings: list[str] = []
    if uv_index >= UV_PROTECTION_THRESHOLD:
        warnings.append(WARNING_UV)
        if MIDDAY_START_HOUR <= hour < MIDDAY_END_HOUR:
            warnings.append(WARNING_MIDDAY)

    return UvAdvice(
        level=level,
        measures=tuple(measures),
        sunscreen=sunscreen,
        warnings=tuple(warnings),
    )


OUTDOOR_SITUATIONS: frozenset[Situation] = frozenset(
    {Situation.STROLLER, Situation.CARRIER, Situation.CAR, Situation.GENERAL}
)


def recommend(
    situation: Situation,
    outdoor_temperature: float,
    room_temperature: float,
    age_months: int,
    weather_condition: str,
    uv_index: float | None,
    hour: int,
) -> Recommendation:
    """The single entry point the coordinator calls.

    Routes to the right rule set and folds UV warnings into the outdoor ones.
    Sun exposure is not a thing that happens in a cot, so indoor situations
    never carry UV warnings.
    """
    if situation is Situation.SLEEP:
        return recommend_sleep(room_temperature)
    if situation is Situation.HOME:
        return recommend_home(room_temperature, age_months)

    result = recommend_outdoor(situation, outdoor_temperature, age_months, weather_condition)

    if uv_index is not None and situation in OUTDOOR_SITUATIONS:
        uv = uv_advice(uv_index, age_months, hour)
        if uv.warnings:
            result = Recommendation(
                level=result.level,
                outfit=result.outfit,
                layers=result.layers,
                hint=result.hint,
                warnings=result.warnings + uv.warnings,
                base_temperature=result.base_temperature,
                tog=result.tog,
            )
    return result
```

- [ ] **Step 4: Run the whole rule suite**

Run: `python -m pytest tests/ -v`
Expected: PASS. The coverage test alone parametrises 6 situations × 14 temperatures × 6 ages = 504 cases.

- [ ] **Step 5: Lint**

Run: `python -m ruff check custom_components tests && python -m ruff format custom_components tests`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add custom_components/tinybreeze/recommendation.py tests/
git commit -m "Add UV advice and the public recommend() entry point

The coverage test walks every situation, temperature bucket and age band. Six
situations with two shift rules and a cap is past the point where a person can
tell by reading whether a combination falls through.

UV warnings are folded into outdoor situations only: sun exposure is not
something that happens in a cot."
```

---

### Task 6: Integration setup and serving the card

**Files:**
- Create: `custom_components/tinybreeze/manifest.json`, `hacs.json`, `.gitignore` entries
- Modify: `custom_components/tinybreeze/__init__.py`
- Test: `tests/test_init.py`, `tests/test_card_delivery.py`

**Interfaces:**
- Consumes: `DOMAIN`, `CARD_FILENAME`, `CARD_URL` from Task 1
- Produces: `async_setup`, `async_setup_entry`, `async_unload_entry`, `async_reload_entry`, `TinybreezeRuntime`

- [ ] **Step 1: Write the manifest and hacs.json**

`custom_components/tinybreeze/manifest.json`:

```json
{
  "domain": "tinybreeze",
  "name": "Tinybreeze",
  "codeowners": ["@dbackhove"],
  "config_flow": true,
  "dependencies": ["frontend", "http"],
  "documentation": "https://github.com/dbackhove/ha-tinybreeze",
  "integration_type": "service",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/dbackhove/ha-tinybreeze/issues",
  "requirements": [],
  "version": "0.1.0"
}
```

`hacs.json`:

```json
{
  "name": "Tinybreeze",
  "content_in_root": false,
  "render_readme": true,
  "homeassistant": "2026.7.0"
}
```

- [ ] **Step 2: Write the failing test**

`tests/test_card_delivery.py`:

```python
"""The card ships inside the integration and registers itself."""

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
    with (
        patch("custom_components.tinybreeze.Path.is_file", return_value=False),
        patch("custom_components.tinybreeze.frontend.add_extra_js_url") as add_url,
    ):
        assert await async_setup_component(hass, DOMAIN, {})
        await hass.async_block_till_done()

    # A source checkout that was never built still gets working sensors.
    assert not add_url.called
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `python -m pytest tests/test_card_delivery.py -v`
Expected: FAIL — setup returns False, no `async_setup` defined

- [ ] **Step 4: Write the implementation**

`custom_components/tinybreeze/__init__.py`:

```python
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
```

Add a placeholder `custom_components/tinybreeze/www/tinybreeze-card.js` containing `/* built in a later task */` so the delivery test has something to serve. Task 12 overwrites it with the real bundle.

Note: `coordinator.py` does not exist yet, so this task's tests cannot pass until Task 8. Write `coordinator.py` as a stub now:

```python
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `python -m pytest tests/test_card_delivery.py -v`
Expected: PASS, 2 tests

- [ ] **Step 6: Commit**

```bash
git add custom_components/ hacs.json
git commit -m "Set up the integration and serve the card

The card registers itself rather than asking the user to add a Lovelace
resource, because HACS allows one category per repository and this one is an
integration. A missing bundle warns instead of failing setup: a source
checkout that was never built should still get working sensors."
```

---

### Task 7: Config flow and options flow

**Files:**
- Create: `custom_components/tinybreeze/config_flow.py`
- Test: `tests/test_config_flow.py`

**Interfaces:**
- Consumes: all `CONF_*` and `ROOM_*` constants from Task 1
- Produces: `TinybreezeConfigFlow`, `TinybreezeOptionsFlow`

- [ ] **Step 1: Write the failing test**

`tests/test_config_flow.py`:

```python
"""Setup asks for the child; options ask for the sources."""

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant

from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_WEATHER_ENTITY,
    DOMAIN,
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
    entry = config_entries.ConfigEntry(
        version=1,
        minor_version=1,
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-03-01"},
        source=config_entries.SOURCE_USER,
        options={},
        unique_id=None,
        discovery_keys={},
        subentries_data=(),
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
```

If `ConfigEntry(...)` construction is rejected by the installed Home Assistant version, use `pytest_homeassistant_custom_component.common.MockConfigEntry` instead — same fields, no positional churn.

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_config_flow.py -v`
Expected: FAIL — no config flow handler registered

- [ ] **Step 3: Write the implementation**

`custom_components/tinybreeze/config_flow.py`:

```python
"""Config and options flows for Tinybreeze."""

from __future__ import annotations

from datetime import date
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    DateSelector,
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_RANGES,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)

CHILD_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): TextSelector(),
        vol.Required(CONF_BIRTH_DATE): DateSelector(),
    }
)


class TinybreezeConfigFlow(ConfigFlow, domain=DOMAIN):
    """One entry per child. Sources live in the options flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            birth_date = dt_util.parse_date(str(user_input[CONF_BIRTH_DATE]))
            if birth_date is None:
                errors[CONF_BIRTH_DATE] = "invalid_date"
            elif birth_date > date.today():
                # An age below zero has no meaning for any rule here.
                errors[CONF_BIRTH_DATE] = "birth_date_in_future"
            else:
                return self.async_create_entry(
                    title=user_input[CONF_NAME],
                    data={
                        CONF_NAME: user_input[CONF_NAME],
                        CONF_BIRTH_DATE: birth_date.isoformat(),
                    },
                )

        return self.async_show_form(step_id="user", data_schema=CHILD_SCHEMA, errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return TinybreezeOptionsFlow()


class TinybreezeOptionsFlow(OptionsFlow):
    """Where the data sources are chosen."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_WEATHER_ENTITY, default=options.get(CONF_WEATHER_ENTITY, vol.UNDEFINED)
                ): EntitySelector(EntitySelectorConfig(domain="weather")),
                vol.Optional(
                    CONF_UV_ENTITY, description={"suggested_value": options.get(CONF_UV_ENTITY)}
                ): EntitySelector(EntitySelectorConfig(domain="sensor")),
                vol.Required(
                    CONF_ROOM_SOURCE,
                    default=options.get(CONF_ROOM_SOURCE, ROOM_SOURCE_ENTITY),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=[ROOM_SOURCE_ENTITY, ROOM_SOURCE_RANGE],
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key="room_source",
                    )
                ),
                vol.Optional(
                    CONF_ROOM_ENTITY,
                    description={"suggested_value": options.get(CONF_ROOM_ENTITY)},
                ): EntitySelector(
                    EntitySelectorConfig(domain="sensor", device_class="temperature")
                ),
                vol.Optional(
                    CONF_ROOM_RANGE, default=options.get(CONF_ROOM_RANGE, "18_19")
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(ROOM_RANGES),
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key="room_range",
                    )
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_config_flow.py -v`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add custom_components/tinybreeze/config_flow.py tests/test_config_flow.py
git commit -m "Add config and options flows

One entry per child, so two children are two entries and two devices rather
than a list inside one. Sources sit in the options flow because they can
change without the child changing."
```

---

### Task 8: The coordinator

**Files:**
- Rewrite: `custom_components/tinybreeze/coordinator.py`
- Test: `tests/test_coordinator.py`

**Interfaces:**
- Consumes: `recommend`, `uv_advice`, `Situation` from Tasks 1–5; all `CONF_*` from Task 1
- Produces: `TinybreezeCoordinator` with `async_start()`, `async_stop()`, `async_add_listener(cb) -> Callable[[], None]`, `recommendation(situation) -> Recommendation | None`, `uv() -> UvAdvice | None`, `age_months -> int`, `available -> bool`, `missing_entity -> str | None`

- [ ] **Step 1: Write the failing test**

`tests/test_coordinator.py`:

```python
"""The coordinator reads sources, calls the rules, and never polls."""

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.tinybreeze.const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_ROOM_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)
from custom_components.tinybreeze.recommendation import Situation


def _entry(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Mia",
        data={CONF_NAME: "Mia", CONF_BIRTH_DATE: "2026-01-01"},
        options={CONF_WEATHER_ENTITY: "weather.home", **options},
    )
    entry.add_to_hass(hass)
    return entry


async def test_recommendation_uses_apparent_temperature(hass: HomeAssistant) -> None:
    hass.states.async_set(
        "weather.home", "cloudy", {"temperature": 10.0, "apparent_temperature": 4.0}
    )
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    result = coordinator.recommendation(Situation.GENERAL)
    assert result.base_temperature == 4.0


async def test_falls_back_to_plain_temperature(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.GENERAL).base_temperature == 10.0
    assert coordinator.temperature_source == "measured"


async def test_manual_range_uses_the_midpoint(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.recommendation(Situation.SLEEP).base_temperature == 18.5


async def test_state_change_triggers_recomputation(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 20.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    before = coordinator.recommendation(Situation.GENERAL).level

    hass.states.async_set("weather.home", "snowy", {"temperature": -5.0})
    await hass.async_block_till_done()

    assert coordinator.recommendation(Situation.GENERAL).level != before


async def test_unavailable_weather_makes_the_coordinator_unavailable(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "unavailable")
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert not coordinator.available
    assert coordinator.missing_entity == "weather.home"


async def test_missing_room_sensor_is_reported(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(
        hass,
        **{CONF_ROOM_SOURCE: ROOM_SOURCE_ENTITY, CONF_ROOM_ENTITY: "sensor.bedroom"},
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.missing_entity == "sensor.bedroom"


async def test_age_is_derived_from_the_birth_date(hass: HomeAssistant) -> None:
    hass.states.async_set("weather.home", "cloudy", {"temperature": 10.0})
    entry = _entry(hass, **{CONF_ROOM_SOURCE: ROOM_SOURCE_RANGE, CONF_ROOM_RANGE: "18_19"})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    assert coordinator.age_months >= 0
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_coordinator.py -v`
Expected: FAIL — the stub coordinator has no `recommendation`

- [ ] **Step 3: Write the implementation**

`custom_components/tinybreeze/coordinator.py`:

```python
"""Reads the source entities, runs the rules, tells the entities to redraw.

There is no update interval on purpose. Every input either changes as a state
change -- which we subscribe to -- or once a day at midnight, when the child
gets older and the midday window resets.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import date

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    ROOM_RANGES,
    ROOM_SOURCE_RANGE,
)
from .recommendation import Recommendation, Situation, UvAdvice, recommend, uv_advice

_LOGGER = logging.getLogger(__name__)

UNUSABLE_STATES = {"unavailable", "unknown", ""}

SOURCE_APPARENT = "apparent"
SOURCE_MEASURED = "measured"
SOURCE_MANUAL = "manual_range"


def months_between(birth_date: date, today: date) -> int:
    """Whole months lived. Rules band on 4 and 12, so days do not matter."""
    months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
    if today.day < birth_date.day:
        months -= 1
    return max(0, months)


class TinybreezeCoordinator:
    """One child's live view of the world."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.name: str = entry.data[CONF_NAME]

        self._listeners: list[Callable[[], None]] = []
        self._unsubscribe: list[Callable[[], None]] = []

        self._recommendations: dict[Situation, Recommendation] = {}
        self._uv: UvAdvice | None = None
        self.temperature_source: str = SOURCE_MEASURED
        self.missing_entity: str | None = None

    # -- lifecycle ---------------------------------------------------------

    async def async_start(self) -> None:
        tracked = [entity for entity in self._source_entities() if entity]
        if tracked:
            self._unsubscribe.append(
                async_track_state_change_event(self.hass, tracked, self._handle_state_change)
            )
        # The child ages and the midday window resets; nothing else needs a clock.
        self._unsubscribe.append(
            async_track_time_change(self.hass, self._handle_midnight, hour=0, minute=0, second=0)
        )
        self.async_recompute()

    @callback
    def async_stop(self) -> None:
        while self._unsubscribe:
            self._unsubscribe.pop()()

    @callback
    def async_add_listener(self, update_callback: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(update_callback)

        def _remove() -> None:
            if update_callback in self._listeners:
                self._listeners.remove(update_callback)

        return _remove

    # -- inputs ------------------------------------------------------------

    def _source_entities(self) -> list[str | None]:
        options = self.entry.options
        return [
            options.get(CONF_WEATHER_ENTITY),
            options.get(CONF_UV_ENTITY),
            options.get(CONF_ROOM_ENTITY),
        ]

    @property
    def age_months(self) -> int:
        birth_date = dt_util.parse_date(self.entry.data[CONF_BIRTH_DATE])
        if birth_date is None:
            return 0
        return months_between(birth_date, dt_util.now().date())

    @property
    def available(self) -> bool:
        return self.missing_entity is None

    def recommendation(self, situation: Situation) -> Recommendation | None:
        return self._recommendations.get(situation)

    def uv(self) -> UvAdvice | None:
        return self._uv

    # -- computation -------------------------------------------------------

    @callback
    def _handle_state_change(self, event: Event[EventStateChangedData]) -> None:
        self.async_recompute()

    @callback
    def _handle_midnight(self, now) -> None:
        self.async_recompute()

    def _read_number(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return None
        try:
            return float(state.state)
        except ValueError:
            return None

    def _read_outdoor(self) -> tuple[float | None, str]:
        """Apparent temperature if the weather entity offers one, else plain."""
        entity_id = self.entry.options.get(CONF_WEATHER_ENTITY)
        if not entity_id:
            return None, "unknown"
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return None, "unknown"

        apparent = state.attributes.get("apparent_temperature")
        if apparent is not None:
            self.temperature_source = SOURCE_APPARENT
            return float(apparent), state.state

        temperature = state.attributes.get("temperature")
        self.temperature_source = SOURCE_MEASURED
        return (None if temperature is None else float(temperature)), state.state

    def _read_room(self) -> float | None:
        options = self.entry.options
        if options.get(CONF_ROOM_SOURCE) == ROOM_SOURCE_RANGE:
            self.temperature_source = SOURCE_MANUAL
            return ROOM_RANGES.get(options.get(CONF_ROOM_RANGE, ""), None)
        return self._read_number(options.get(CONF_ROOM_ENTITY))

    @callback
    def async_recompute(self) -> None:
        """Rebuild every recommendation and notify the entities."""
        options = self.entry.options
        outdoor, condition = self._read_outdoor()
        room = self._read_room()
        uv_index = self._read_number(options.get(CONF_UV_ENTITY))

        self.missing_entity = None
        if outdoor is None:
            self.missing_entity = options.get(CONF_WEATHER_ENTITY)
        elif room is None and options.get(CONF_ROOM_SOURCE) != ROOM_SOURCE_RANGE:
            self.missing_entity = options.get(CONF_ROOM_ENTITY)

        if self.missing_entity is not None:
            self._recommendations = {}
            self._uv = None
            self._notify()
            return

        hour = dt_util.now().hour
        age = self.age_months

        self._recommendations = {
            situation: recommend(
                situation=situation,
                outdoor_temperature=outdoor,
                room_temperature=room,
                age_months=age,
                weather_condition=condition,
                uv_index=uv_index,
                hour=hour,
            )
            for situation in Situation
        }
        self._uv = None if uv_index is None else uv_advice(uv_index, age, hour)
        self._notify()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()
```

Remove the `Task 8` stub note from `__init__.py` if present; the import already matches.

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_coordinator.py -v`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add custom_components/tinybreeze/coordinator.py tests/test_coordinator.py
git commit -m "Add the coordinator

No update interval. Every input either arrives as a state change or turns over
at midnight when the child gets older and the midday window resets; polling
would only burn cycles re-deriving the same answer."
```

---

### Task 9: Sensor entities

**Files:**
- Create: `custom_components/tinybreeze/sensor.py`
- Test: `tests/test_sensor.py`

**Interfaces:**
- Consumes: `TinybreezeCoordinator` from Task 8, `Situation`/`Level`/`SleepLevel`/`UvLevel` from Tasks 1–5
- Produces: entity ids `sensor.<name>_kleidung_<situation>`, `sensor.<name>_uv_schutz`, `sensor.<name>_alter`

- [ ] **Step 1: Write the failing test**

`tests/test_sensor.py`:

```python
"""Entities: enum states, rich attributes, and the ones that stay away."""

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
    for situation in ("kinderwagen", "babytrage", "auto", "schlafen", "zuhause", "allgemein"):
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


async def test_no_uv_entity_means_no_uv_sensor(hass: HomeAssistant) -> None:
    await _setup(hass)
    assert hass.states.get("sensor.mia_uv_schutz") is None


async def test_uv_sensor_appears_when_a_source_is_configured(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.uv", "7")
    await _setup(hass, **{CONF_UV_ENTITY: "sensor.uv"})
    state = hass.states.get("sensor.mia_uv_schutz")
    assert state.state == "hoch"
    assert state.attributes["uv_index"] == 7.0
    # No sunscreen in the first year.
    assert state.attributes["sunscreen"] == "none"


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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_sensor.py -v`
Expected: FAIL — no entities created

- [ ] **Step 3: Write the implementation**

`custom_components/tinybreeze/sensor.py`:

```python
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

from .const import CONF_NAME, CONF_UV_ENTITY, DOMAIN
from .coordinator import TinybreezeCoordinator
from .recommendation import LEVELS, Level, Situation, SleepLevel, UvLevel

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
        self._entry = entry
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.data[CONF_NAME],
            manufacturer="Tinybreeze",
            entry_type=None,
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

    @property
    def available(self) -> bool:
        return self._coordinator.available

    @property
    def native_value(self) -> str | None:
        result = self._coordinator.recommendation(self._situation)
        return None if result is None else str(result.level)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        result = self._coordinator.recommendation(self._situation)
        if result is None:
            return {}
        attributes: dict[str, Any] = {
            "outfit_keys": list(result.outfit),
            "layers": result.layers,
            "hint": result.hint,
            "warnings": list(result.warnings),
            "base_temperature": result.base_temperature,
            "temperature_source": self._coordinator.temperature_source,
            "age_months": self._coordinator.age_months,
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
        return self._coordinator.available and self._coordinator.uv() is not None

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
            "uv_index": self._coordinator._read_number(
                self._entry.options.get(CONF_UV_ENTITY)
            ),
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
    def native_value(self) -> int:
        return self._coordinator.age_months
```

Reaching into `_read_number` from `UvSensor` is a private call across a boundary. Fix it by adding a public property to the coordinator instead:

```python
    @property
    def uv_index(self) -> float | None:
        return self._read_number(self.entry.options.get(CONF_UV_ENTITY))
```

and use `self._coordinator.uv_index` in the sensor.

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest tests/test_sensor.py -v`
Expected: PASS, 7 tests

- [ ] **Step 5: Run the whole suite and lint**

Run: `python -m pytest tests/ -v && python -m ruff check custom_components tests && python -m ruff format --check custom_components tests`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add custom_components/tinybreeze/sensor.py custom_components/tinybreeze/coordinator.py tests/test_sensor.py
git commit -m "Add the sensor entities

The state is an enum band, not the outfit: HA caps states at 255 characters,
and 'Langarmbody, Strampler, Fleecejacke, Muetze' cannot be matched by an
automation anyway. The UV sensor is created only when a source exists -- an
entity that is permanently unknown is worse than one that never appears."
```

---

### Task 10: Translations and rendered text

**Files:**
- Create: `custom_components/tinybreeze/strings.json`, `translations/de.json`, `translations/en.json`
- Modify: `custom_components/tinybreeze/sensor.py`
- Test: `tests/test_translations.py`

**Interfaces:**
- Consumes: every `ITEM_*`, `WARNING_*`, `HINT_*`, `MEASURE_*` key
- Produces: `outfit` and `outfit_text` attributes in the instance language

- [ ] **Step 1: Write the failing test**

`tests/test_translations.py`:

```python
"""Both languages exist, agree on keys, and cover every key the rules emit."""

import json
from pathlib import Path

import custom_components.tinybreeze.recommendation as rules

TRANSLATIONS = Path("custom_components/tinybreeze/translations")


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


def test_both_languages_have_the_same_keys() -> None:
    assert _flatten(_load("de")) == _flatten(_load("en"))


def test_strings_json_matches_english() -> None:
    strings = json.loads(
        Path("custom_components/tinybreeze/strings.json").read_text(encoding="utf-8")
    )
    assert _flatten(strings) == _flatten(_load("en"))


def test_every_item_key_is_translated() -> None:
    emitted = {
        value
        for name, value in vars(rules).items()
        if name.startswith("ITEM_") and isinstance(value, str)
    }
    for language in ("de", "en"):
        translated = set(_load(language)["item"])
        assert emitted <= translated, f"{language} is missing {emitted - translated}"


def test_every_warning_and_hint_is_translated() -> None:
    emitted = {
        value
        for name, value in vars(rules).items()
        if (name.startswith("WARNING_") or name.startswith("HINT_") or name.startswith("MEASURE_"))
        and isinstance(value, str)
    }
    for language in ("de", "en"):
        data = _load(language)
        translated = set(data["warning"]) | set(data["hint"]) | set(data["measure"])
        assert emitted <= translated, f"{language} is missing {emitted - translated}"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest tests/test_translations.py -v`
Expected: FAIL — `FileNotFoundError: translations/de.json`

- [ ] **Step 3: Write the translation files**

`custom_components/tinybreeze/translations/de.json` — the structure, filled for every key that Task 1–5 defined:

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Kind hinzufügen",
        "data": {
          "name": "Name",
          "birth_date": "Geburtsdatum"
        }
      }
    },
    "error": {
      "birth_date_in_future": "Das Geburtsdatum liegt in der Zukunft.",
      "invalid_date": "Kein gültiges Datum."
    }
  },
  "options": {
    "step": {
      "init": {
        "title": "Datenquellen",
        "data": {
          "weather_entity": "Wetter-Entität",
          "uv_entity": "UV-Index-Sensor (optional)",
          "room_source": "Raumtemperatur",
          "room_entity": "Raumtemperatur-Sensor",
          "room_range": "Fester Bereich"
        }
      }
    }
  },
  "selector": {
    "room_source": {
      "options": {
        "entity": "Sensor verwenden",
        "range": "Bereich fest eingeben"
      }
    },
    "room_range": {
      "options": {
        "16_17": "16–17 °C",
        "18_19": "18–19 °C",
        "20_21": "20–21 °C",
        "22_23": "22–23 °C",
        "24_25": "24–25 °C",
        "26_plus": "26 °C und wärmer"
      }
    }
  },
  "item": {
    "short_sleeve_body": "Kurzarmbody",
    "long_sleeve_body": "Langarmbody",
    "light_long_suit": "Luftiger langärmeliger Einteiler (UPF 30+)",
    "light_trousers": "Dünne lange Hose",
    "trousers": "Leichte Hose",
    "romper": "Strampler",
    "sweater": "Pullover",
    "vest": "Dünne Weste oder Jäckchen",
    "light_jacket": "Leichte Jacke",
    "fleece_jacket": "Fleece- oder Wollwalkjacke",
    "fleece_suit": "Fleeceanzug",
    "winter_jacket": "Winterjacke oder Wollwalkoverall",
    "winter_suit": "Winteroverall",
    "pyjamas": "Schlafanzug",
    "diaper_only": "Nur Windel",
    "sun_hat": "Sonnenhut mit Nackenschutz",
    "thin_hat": "Dünne Mütze",
    "hat": "Mütze",
    "winter_hat": "Warme Mütze mit Ohrenschutz",
    "mittens": "Fäustlinge",
    "scarf": "Halstuch",
    "barefoot": "Barfuß",
    "thin_socks": "Dünne Söckchen",
    "socks": "Socken",
    "wool_socks": "Dicke Wollsocken",
    "shoes": "Schuhe",
    "leg_warmers": "Stulpen",
    "footmuff": "Fußsack",
    "rain_cover": "Regenverdeck",
    "blanket": "Decke"
  },
  "warning": {
    "ueberhitzung": "Wärmer als die empfohlenen 16–20 °C. Auf Überhitzung achten.",
    "keine_muetze": "Keine Mütze im Bett — Babys geben überschüssige Wärme über den Kopf ab.",
    "uv": "Sonnenschutz nötig.",
    "mittagszeit": "Zwischen 11 und 15 Uhr die Sonne meiden.",
    "autositz": "Keine dicke Jacke im Autositz — der Gurt sitzt sonst zu locker.",
    "trage_hitze": "In der Trage staut sich Wärme. Nacken regelmäßig prüfen."
  },
  "hint": {
    "carrier_legs": "Beine und Füße liegen frei — Stulpen oder dicke Socken.",
    "car_seat": "Decke erst nach dem Anschnallen über den Schoß legen.",
    "stroller_rain_cover": "Ein Regenverdeck staut Wärme. Regelmäßig lüften.",
    "sleep_no_loose_bedding": "Keine losen Decken, keine Kissen."
  },
  "measure": {
    "shade": "In der Mittagszeit Schatten aufsuchen",
    "midday_indoors": "Mittagsstunden möglichst drinnen verbringen",
    "avoid_outdoors": "Aufenthalt im Freien meiden",
    "uv_clothing": "Schützende Kleidung (UPF 30+)",
    "sun_hat_with_neck_flap": "Hut mit Schirm und Nackenschutz",
    "no_direct_sun": "Keine direkte Sonne im ersten Lebensjahr"
  }
}
```

Write `translations/en.json` with the identical key structure and English values, and copy it verbatim to `strings.json` (Home Assistant's convention: `strings.json` is the English source).

- [ ] **Step 4: Render text in the sensor**

Add to `sensor.py`:

```python
from homeassistant.helpers.translation import async_get_translations


class ClothingSensor(TinybreezeEntity):
    ...

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
```

and extend `extra_state_attributes`:

```python
        attributes["outfit"] = [self._label(key) for key in result.outfit]
        attributes["outfit_text"] = ", ".join(attributes["outfit"])
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python -m pytest tests/test_translations.py tests/test_sensor.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add custom_components/tinybreeze/
git commit -m "Add translations and rendered outfit text

The rule module emits keys so the same output renders in either language. The
sensor also renders a joined string once, because a push notification
containing 'long_sleeve_body' would be worse than no notification.

A test asserts every emitted key has a translation in both languages -- with
thirty item keys, a missing one is otherwise found by a user, not by CI."
```

---

### Task 11: Frontend scaffold and card logic

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/build.mjs`
- Create: `frontend/src/types.ts`, `frontend/src/strings.ts`, `frontend/src/logic.ts`
- Test: `frontend/test/logic.test.ts`

**Interfaces:**
- Consumes: attribute shapes from Task 9
- Produces: `parseConfig`, `entityIdFor`, `readRecommendation`, `visibleSituations`, `cardSize`

- [ ] **Step 1: Create the build files**

`frontend/package.json`:

```json
{
  "name": "tinybreeze-card",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Lovelace card for the Tinybreeze integration",
  "scripts": {
    "build": "node build.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "lit": "^3.2.1"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

`frontend/build.mjs`:

```javascript
// Builds the card into the integration, where Home Assistant serves it from.
// The output is committed: HACS ships the repository as it stands, so nobody
// downstream ever runs this.
import { build } from "esbuild";

await build({
  entryPoints: ["src/tinybreeze-card.ts"],
  outfile: "../custom_components/tinybreeze/www/tinybreeze-card.js",
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2021",
  legalComments: "none",
  banner: {
    js: "/* Tinybreeze card -- built from frontend/src, do not edit by hand. */",
  },
});
```

`frontend/tsconfig.json`: copy verbatim from `ha-pareto/frontend/tsconfig.json`.

- [ ] **Step 2: Write the failing test**

`frontend/test/logic.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import {
  cardSize,
  entityIdFor,
  parseConfig,
  readRecommendation,
  visibleSituations,
} from "../src/logic";
import type { HomeAssistant } from "../src/types";

const hass = {
  states: {
    "sensor.mia_kleidung_allgemein": {
      entity_id: "sensor.mia_kleidung_allgemein",
      state: "warm",
      attributes: {
        outfit: ["Langarmbody", "Strampler", "Fleecejacke"],
        outfit_keys: ["long_sleeve_body", "romper", "fleece_jacket"],
        layers: 3,
        warnings: ["uv"],
        hint: null,
        base_temperature: 10,
      },
    },
  },
  locale: { language: "de" },
} as unknown as HomeAssistant;

describe("parseConfig", () => {
  it("rejects a config without a child", () => {
    expect(() => parseConfig({ type: "custom:tinybreeze-card" })).toThrow(/entry/i);
  });

  it("defaults every display toggle to on", () => {
    const config = parseConfig({ type: "custom:tinybreeze-card", entry: "mia" });
    expect(config.show_weather).toBe(true);
    expect(config.show_uv).toBe(true);
    expect(config.show_room_temperature).toBe(true);
    expect(config.show_age).toBe(true);
  });

  it("keeps an explicit false", () => {
    const config = parseConfig({
      type: "custom:tinybreeze-card",
      entry: "mia",
      show_uv: false,
    });
    expect(config.show_uv).toBe(false);
  });

  it("defaults to all six situations", () => {
    const config = parseConfig({ type: "custom:tinybreeze-card", entry: "mia" });
    expect(config.situations).toHaveLength(6);
  });

  it("falls back when the default situation is not shown", () => {
    const config = parseConfig({
      type: "custom:tinybreeze-card",
      entry: "mia",
      situations: ["schlafen"],
      default_situation: "auto",
    });
    expect(config.default_situation).toBe("schlafen");
  });
});

describe("entityIdFor", () => {
  it("builds the clothing entity id", () => {
    expect(entityIdFor("mia", "allgemein")).toBe("sensor.mia_kleidung_allgemein");
  });
});

describe("readRecommendation", () => {
  it("reads outfit and warnings", () => {
    const result = readRecommendation(hass, "mia", "allgemein");
    expect(result?.level).toBe("warm");
    expect(result?.outfit).toEqual(["Langarmbody", "Strampler", "Fleecejacke"]);
    expect(result?.warnings).toEqual(["uv"]);
  });

  it("returns undefined for a missing entity", () => {
    expect(readRecommendation(hass, "ben", "allgemein")).toBeUndefined();
  });
});

describe("visibleSituations", () => {
  it("preserves the configured order", () => {
    expect(visibleSituations(["auto", "schlafen"])).toEqual(["auto", "schlafen"]);
  });

  it("drops unknown situations", () => {
    expect(visibleSituations(["auto", "nonsense"])).toEqual(["auto"]);
  });
});

describe("cardSize", () => {
  it("grows with the outfit", () => {
    expect(cardSize(3)).toBeGreaterThan(cardSize(1));
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd frontend && npm install && npm test`
Expected: FAIL — cannot resolve `../src/logic`

- [ ] **Step 4: Write the implementation**

`frontend/src/types.ts`:

```typescript
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale: { language: string };
  callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
}

export const SITUATIONS = [
  "kinderwagen",
  "babytrage",
  "auto",
  "schlafen",
  "zuhause",
  "allgemein",
] as const;

export type Situation = (typeof SITUATIONS)[number];

export interface TinybreezeCardConfig {
  type: string;
  entry: string;
  situations: Situation[];
  default_situation: Situation;
  show_weather: boolean;
  show_room_temperature: boolean;
  show_uv: boolean;
  show_age: boolean;
}

export interface Recommendation {
  level: string;
  outfit: string[];
  layers: number;
  warnings: string[];
  hint: string | null;
  baseTemperature: number | null;
  tog: number | null;
}
```

`frontend/src/logic.ts`:

```typescript
// Everything the card decides, kept free of the DOM so it can be tested
// without a browser.

import { SITUATIONS } from "./types";
import type { HomeAssistant, Recommendation, Situation, TinybreezeCardConfig } from "./types";

export function visibleSituations(candidates: unknown): Situation[] {
  if (!Array.isArray(candidates)) return [...SITUATIONS];
  const known = candidates.filter((value): value is Situation =>
    (SITUATIONS as readonly string[]).includes(value as string),
  );
  return known.length > 0 ? known : [...SITUATIONS];
}

export function parseConfig(raw: Record<string, unknown>): TinybreezeCardConfig {
  const entry = raw.entry;
  if (typeof entry !== "string" || entry === "") {
    throw new Error("tinybreeze-card: an entry (child) must be selected");
  }

  const situations = visibleSituations(raw.situations);
  const requested = raw.default_situation as Situation | undefined;
  // A default that is not on screen would leave the card blank on load.
  const defaultSituation =
    requested && situations.includes(requested) ? requested : situations[0];

  const flag = (value: unknown): boolean => value !== false;

  return {
    type: String(raw.type ?? "custom:tinybreeze-card"),
    entry,
    situations,
    default_situation: defaultSituation,
    show_weather: flag(raw.show_weather),
    show_room_temperature: flag(raw.show_room_temperature),
    show_uv: flag(raw.show_uv),
    show_age: flag(raw.show_age),
  };
}

export function entityIdFor(slug: string, situation: Situation): string {
  return `sensor.${slug}_kleidung_${situation}`;
}

export function uvEntityIdFor(slug: string): string {
  return `sensor.${slug}_uv_schutz`;
}

export function ageEntityIdFor(slug: string): string {
  return `sensor.${slug}_alter`;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export function readRecommendation(
  hass: HomeAssistant,
  slug: string,
  situation: Situation,
): Recommendation | undefined {
  const state = hass.states[entityIdFor(slug, situation)];
  if (!state) return undefined;

  const attributes = state.attributes;
  return {
    level: state.state,
    outfit: asStringArray(attributes.outfit),
    layers: Number(attributes.layers ?? 0),
    warnings: asStringArray(attributes.warnings),
    hint: (attributes.hint as string | null) ?? null,
    baseTemperature:
      attributes.base_temperature === undefined
        ? null
        : Number(attributes.base_temperature),
    tog: attributes.tog === undefined ? null : Number(attributes.tog),
  };
}

export function cardSize(outfitLength: number): number {
  // Header, chips, context row, plus roughly one grid row per two items.
  return 3 + Math.ceil(outfitLength / 2);
}
```

`frontend/src/strings.ts`: a `translate(language, key)` helper with `de` and `en` maps covering every `item`, `warning`, `hint` and `measure` key from Task 10, plus card chrome (`situation.kinderwagen`, `info.disclaimer`, `info.neck_test`, `info.cold_hands`, `error.unavailable`). Mirror the shape of `ha-pareto/frontend/src/strings.ts`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd frontend && npm test && npm run typecheck`
Expected: PASS, 11 tests

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "Add the frontend scaffold and card logic

logic.ts is deliberately DOM-free so vitest covers the decisions without a
browser. A default situation that is not among the visible chips falls back to
the first one -- otherwise the card loads blank."
```

---

### Task 12: The card

**Files:**
- Create: `frontend/src/tinybreeze-card.ts`
- Modify: `custom_components/tinybreeze/www/tinybreeze-card.js` (build output)
- Test: `frontend/test/card.test.ts`

**Interfaces:**
- Consumes: everything from Task 11
- Produces: the `tinybreeze-card` custom element, registered in `window.customCards`

- [ ] **Step 1: Write the failing test**

`frontend/test/card.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { renderModel } from "../src/logic";
import type { HomeAssistant } from "../src/types";

const hass = {
  states: {
    "sensor.mia_kleidung_schlafen": {
      entity_id: "sensor.mia_kleidung_schlafen",
      state: "tog_2_5",
      attributes: {
        outfit: ["Langarmbody", "Schlafanzug"],
        outfit_keys: ["long_sleeve_body", "pyjamas"],
        layers: 2,
        warnings: ["keine_muetze", "ueberhitzung"],
        hint: "sleep_no_loose_bedding",
        base_temperature: 22,
        tog: 2.5,
      },
    },
    "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "5", attributes: {} },
  },
  locale: { language: "de" },
} as unknown as HomeAssistant;

describe("renderModel", () => {
  it("collects everything the template needs", () => {
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.available).toBe(true);
    expect(model.outfit).toEqual(["Langarmbody", "Schlafanzug"]);
    expect(model.warnings).toHaveLength(2);
    expect(model.warnings[0]).toMatch(/Mütze/);
  });

  it("reports the missing entity when the sensor is gone", () => {
    const model = renderModel(hass, "ben", "schlafen", "de");
    expect(model.available).toBe(false);
    expect(model.missing).toBe("sensor.ben_kleidung_schlafen");
  });

  it("shows the age when available", () => {
    expect(renderModel(hass, "mia", "schlafen", "de").ageMonths).toBe(5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test`
Expected: FAIL — `renderModel` is not exported

- [ ] **Step 3: Add renderModel to logic.ts**

```typescript
export interface RenderModel {
  available: boolean;
  missing: string | null;
  level: string;
  outfit: string[];
  warnings: string[];
  hint: string | null;
  baseTemperature: number | null;
  tog: number | null;
  ageMonths: number | null;
}

export function renderModel(
  hass: HomeAssistant,
  slug: string,
  situation: Situation,
  language: string,
): RenderModel {
  const recommendation = readRecommendation(hass, slug, situation);
  const ageState = hass.states[ageEntityIdFor(slug)];
  const ageMonths = ageState ? Number(ageState.state) : null;

  if (!recommendation) {
    return {
      available: false,
      missing: entityIdFor(slug, situation),
      level: "",
      outfit: [],
      warnings: [],
      hint: null,
      baseTemperature: null,
      tog: null,
      ageMonths,
    };
  }

  return {
    available: true,
    missing: null,
    level: recommendation.level,
    outfit: recommendation.outfit,
    // Translated here so the template stays free of lookups.
    warnings: recommendation.warnings.map((key) => translate(language, `warning.${key}`)),
    hint: recommendation.hint
      ? translate(language, `hint.${recommendation.hint}`)
      : null,
    baseTemperature: recommendation.baseTemperature,
    tog: recommendation.tog,
    ageMonths,
  };
}
```

Import `translate` from `./strings` at the top of `logic.ts`.

- [ ] **Step 4: Write the card**

`frontend/src/tinybreeze-card.ts`: a `LitElement` that

- implements `setConfig(config)` by calling `parseConfig` and storing the result
- holds `_situation` in component state, seeded from `config.default_situation`
- renders the header (`name`, age when `show_age`, the `(i)` button)
- renders one chip per `config.situations`, clicking one sets `_situation`
- renders `model.warnings` above the outfit, each as its own row with a warning icon
- renders the level heading and the outfit as a list
- renders the context row honouring `show_weather`, `show_room_temperature`, `show_uv`
- renders an unavailability message naming `model.missing` when `!model.available`
- toggles an info panel on `(i)` click showing `info.disclaimer`, `info.neck_test`, `info.cold_hands`; `title` attribute on the button gives the desktop hover tooltip
- implements `getCardSize()` via `cardSize(model.outfit.length)`
- implements `static getConfigElement()` returning `document.createElement("tinybreeze-card-editor")`
- implements `static getStubConfig()` returning `{ type: "custom:tinybreeze-card", entry: "" }`

Register at the bottom, mirroring `ha-pareto`:

```typescript
customElements.define("tinybreeze-card", TinybreezeCard);

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "tinybreeze-card",
  name: "Tinybreeze",
  description: "What to dress your baby in, right now.",
  preview: false,
  documentationURL: "https://github.com/dbackhove/ha-tinybreeze",
});
```

The info panel is not gated on any config flag. The disclaimer is the one piece of the card that must not be switchable off.

- [ ] **Step 5: Run tests, typecheck and build**

Run: `cd frontend && npm test && npm run typecheck && npm run build`
Expected: PASS, and `custom_components/tinybreeze/www/tinybreeze-card.js` is regenerated

- [ ] **Step 6: Commit**

```bash
git add frontend/ custom_components/tinybreeze/www/
git commit -m "Add the Tinybreeze card

Warnings render above the outfit and the info panel has no config flag: the
disclaimer and the neck test are the parts of this card that must not be
switchable off. Everything else -- weather, room temperature, UV, age -- is."
```

---

### Task 13: The visual editor

**Files:**
- Create: `frontend/src/editor.ts`
- Modify: `frontend/src/tinybreeze-card.ts` (import `./editor`)
- Test: `frontend/test/editor.test.ts`

**Interfaces:**
- Consumes: `TinybreezeCardConfig` from Task 11
- Produces: the `tinybreeze-card-editor` custom element

- [ ] **Step 1: Write the failing test**

`frontend/test/editor.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { editorSchema } from "../src/editor";

describe("editorSchema", () => {
  it("offers every display toggle", () => {
    const names = editorSchema().map((field) => field.name);
    expect(names).toContain("show_weather");
    expect(names).toContain("show_room_temperature");
    expect(names).toContain("show_uv");
    expect(names).toContain("show_age");
  });

  it("offers situation selection and a default", () => {
    const names = editorSchema().map((field) => field.name);
    expect(names).toContain("situations");
    expect(names).toContain("default_situation");
  });

  it("does not offer data sources -- those live in the options flow", () => {
    const names = editorSchema().map((field) => field.name);
    expect(names).not.toContain("weather_entity");
    expect(names).not.toContain("room_entity");
    expect(names).not.toContain("uv_entity");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test`
Expected: FAIL — cannot resolve `../src/editor`

- [ ] **Step 3: Write the implementation**

`frontend/src/editor.ts`, built on `ha-form` so it matches every other card editor:

```typescript
// The card's visual editor, built on Home Assistant's own ha-form and its
// selectors so it carries no widgets of its own.

import { LitElement, html, nothing, type TemplateResult } from "lit";

import { SITUATIONS } from "./types";
import type { HomeAssistant } from "./types";

export interface SchemaEntry {
  name: string;
  selector: Record<string, unknown>;
}

export function editorSchema(): SchemaEntry[] {
  const situationOptions = SITUATIONS.map((value) => ({ value, label: value }));
  return [
    { name: "entry", selector: { text: {} } },
    {
      name: "situations",
      selector: { select: { multiple: true, options: situationOptions } },
    },
    {
      name: "default_situation",
      selector: { select: { mode: "dropdown", options: situationOptions } },
    },
    { name: "show_weather", selector: { boolean: {} } },
    { name: "show_room_temperature", selector: { boolean: {} } },
    { name: "show_uv", selector: { boolean: {} } },
    { name: "show_age", selector: { boolean: {} } },
  ];
}

class TinybreezeCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  _config?: Record<string, unknown>;

  setConfig(config: Record<string, unknown>): void {
    // Shown, not validated. The card's own setConfig is the authority.
    this._config = config;
  }

  private _valueChanged(event: CustomEvent): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: event.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${editorSchema()}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("tinybreeze-card-editor", TinybreezeCardEditor);
```

Add `import "./editor";` to `tinybreeze-card.ts`.

- [ ] **Step 4: Run tests, typecheck and build**

Run: `cd frontend && npm test && npm run typecheck && npm run build`
Expected: PASS, 3 new tests

- [ ] **Step 5: Commit**

```bash
git add frontend/ custom_components/tinybreeze/www/
git commit -m "Add the visual card editor

Data sources are deliberately absent from the editor. They belong to the
options flow because the backend computes whether or not anyone is looking at
a card, and a source configured per card would leave the entities guessing."
```

---

### Task 14: CI, README and release workflow

**Files:**
- Create: `.github/workflows/validate.yml`, `.github/workflows/release.yml`, `README.md`, `LICENSE`, `.gitignore`
- Test: the workflows themselves

- [ ] **Step 1: Write the workflows**

`.github/workflows/validate.yml`: copy from `ha-pareto`, replacing `pareto` with `tinybreeze` in the bundle-drift path:

```yaml
name: Validate

on:
  push:
  pull_request:

# Nothing here writes to the repository; the default token grants more than
# these jobs need.
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - run: pip install -r requirements-test.txt
      - run: python -m pytest tests/ -v
      - run: python -m ruff check custom_components tests
      - run: python -m ruff format --check custom_components tests

  card:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      # The bundle is committed, so a forgotten build is invisible in review
      # and surfaces later as a bug nobody can reproduce.
      - run: git diff --exit-code ../custom_components/tinybreeze/www/

  hassfest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: home-assistant/actions/hassfest@master

  hacs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hacs/action@main
        with:
          category: integration
```

`.github/workflows/release.yml`: copy from `ha-pareto`, replacing the manifest path with `custom_components/tinybreeze/manifest.json`.

- [ ] **Step 2: Write the README**

`README.md` covering: what it does, the six situations, installation via HACS custom repository, adding a child, choosing sources, adding the card, the entities it creates with an example automation using `outfit_text`, and — prominently — that the recommendations are orientation, not medical advice, with the source list from the spec.

- [ ] **Step 3: Verify everything locally**

Run:

```bash
python -m pytest tests/ -v
python -m ruff check custom_components tests
python -m ruff format --check custom_components tests
cd frontend && npm ci && npm run typecheck && npm test && npm run build && cd ..
git diff --exit-code custom_components/tinybreeze/www/
```

Expected: all pass, no diff in the built bundle

- [ ] **Step 4: Commit**

```bash
git add .github/ README.md LICENSE .gitignore
git commit -m "Add CI, README and release workflow

CI fails on a stale card bundle. The bundle is committed because HACS ships
the repository as it stands, which makes a forgotten build invisible in review
and a bug nobody can reproduce later."
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Domain, config entry per child | 6, 7 |
| Sources incl. fixed room range | 7, 8 |
| No polling, midnight recompute | 8 |
| Eight entities per child | 9 |
| Enum state, attributes | 9 |
| Base table, buckets | 1 |
| Age modifier and its 20 °C stop | 2 |
| Situation modifiers, car cap | 2, 3 |
| Sleep TOG table | 4 |
| Home drops outdoor items | 4 |
| UV levels, under-one rules | 5 |
| All six warnings | 3, 4, 5 |
| Card layout, chips, info panel | 12 |
| Card config options | 11, 13 |
| Error behaviour | 8, 9, 12 |
| Every listed test | 1–13 |
| German and English | 10 |

No gaps.

**Placeholder scan:** Task 12's card body is prose rather than a full template. This is deliberate — the Lit template is long, mechanical, and fully determined by the `RenderModel` interface and the config flags, both of which are specified exactly. Every other step carries real code.

**Type consistency:** `Recommendation` (Python) and `Recommendation` (TypeScript) are separate types with the same name and deliberately different shapes — Python carries `base_temperature: float`, TypeScript carries `baseTemperature: number | null` because an attribute can be missing. `Situation` values match the spec's German strings on both sides. `WARNING_*` constants defined in Task 3 are used in Tasks 3, 4 and 5; Task 3 introduces them explicitly so it can run standalone.

**One correction folded in:** Task 9 originally had `UvSensor` reach into `coordinator._read_number`. Step 3 of that task replaces it with a public `uv_index` property.
