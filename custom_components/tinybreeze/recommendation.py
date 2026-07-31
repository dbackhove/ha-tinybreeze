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

# Warning keys. Translated in sensor.py and in the card, never here.
WARNING_CAR_SEAT = "autositz"
WARNING_CARRIER_HEAT = "trage_hitze"
WARNING_NO_HAT = "keine_muetze"
WARNING_OVERHEATING = "ueberhitzung"


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


# Home's own indoor table. Filtering BASE_TABLE through OUTDOOR_ONLY does not
# work here: from row 4 on, BASE_TABLE carries its extra warmth in outerwear
# (fleece_jacket replaces sweater), so filtering leaves *fewer* indoor layers
# one row down than the row above -- inverting the age shift at 16-17 C, the
# recommended bedroom temperature. This table is monotonic by construction;
# BASE_TABLE and the outdoor rules stay untouched. Reuses Level -- only five
# of its seven values are reachable indoors, and that is fine.
HOME_TABLE: tuple[tuple[float, Level, tuple[str, ...]], ...] = (
    (24.0, Level.VERY_LIGHT, (ITEM_SHORT_SLEEVE_BODY,)),
    (21.0, Level.LIGHT, (ITEM_SHORT_SLEEVE_BODY, ITEM_LIGHT_TROUSERS)),
    (18.0, Level.MEDIUM, (ITEM_LONG_SLEEVE_BODY, ITEM_TROUSERS, ITEM_THIN_SOCKS)),
    (16.0, Level.WARM, (ITEM_LONG_SLEEVE_BODY, ITEM_ROMPER, ITEM_SWEATER, ITEM_SOCKS)),
    (
        float("-inf"),
        Level.VERY_WARM,
        (ITEM_LONG_SLEEVE_BODY, ITEM_ROMPER, ITEM_SWEATER, ITEM_FLEECE_SUIT, ITEM_SOCKS),
    ),
)

# The bottom band is split at 16 C so the age shift below always has a
# warmer band to move into, rather than running into the table's edge.
HOME_MAX_INDEX = len(HOME_TABLE) - 1


def recommend_home(room_temperature: float, age_months: int) -> Recommendation:
    """Indoors and awake: its own monotonic table, not the outdoor one."""
    for index, (lower, _level, _outfit) in enumerate(HOME_TABLE):
        if room_temperature >= lower:
            break

    index = min(HOME_MAX_INDEX, index + age_shift(age_months, room_temperature))
    _, level, outfit = HOME_TABLE[index]

    warnings: list[str] = []
    if room_temperature > ROOM_TEMPERATURE_WARN_ABOVE:
        warnings.append(WARNING_OVERHEATING)

    return Recommendation(
        level=level,
        outfit=outfit,
        layers=count_layers(outfit),
        hint=None,
        warnings=tuple(warnings),
        base_temperature=room_temperature,
    )


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
