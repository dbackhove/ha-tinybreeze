"""The rule set: temperature, situation and age in, an outfit out.

Deliberately free of Home Assistant imports so it can be tested as plain
Python. Thresholds and sources are documented in
docs/superpowers/specs/2026-07-31-tinybreeze-design.md.

Everything here returns item *keys*, never prose. Translation happens in
sensor.py and in the card.
"""

from __future__ import annotations

from dataclasses import dataclass
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
