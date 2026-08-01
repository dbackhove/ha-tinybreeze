"""Properties that must hold for every input, not just the tabulated ones.

The tabulated tests check the rows someone thought to write down. These sweep
the whole usable temperature range and assert the three properties the rule
set exists to guarantee -- monotonicity in temperature, monotonicity in age,
and the bound on the composed shift. They are the cheapest guard against a
defect that only shows up in a combination nobody enumerated: the composed
shift was unbounded until one of these was written, and a two-month-old in a
stroller at 12.9 C was getting the sub-zero outfit.
"""

from __future__ import annotations

import pytest

from custom_components.tinybreeze.recommendation import (
    LEVELS,
    MAX_SHIFT_ABOVE_BUCKET,
    OUTDOOR_SITUATIONS,
    Level,
    Situation,
    SleepLevel,
    bucket_index,
    recommend,
    recommend_outdoor,
)

# Every boundary in the rule set sits on a whole degree (0, 8, 13, 15, 16, 18,
# 20, 21, 23, 24, 25, 28), so a step of 0.1 C puts a sample on each boundary
# and one immediately below it. Integers alone would never test the "just
# under" side, which is where an off-by-one band lives.
TEMPERATURES: list[float] = [tenths / 10 for tenths in range(-250, 451)]

# Both sides of the four-month boundary, plus the twelve-month one the UV
# rules band on, so a shift that keyed off the wrong comparison is visible.
YOUNG_AGES: list[int] = [0, 2, 3]
OLD_AGES: list[int] = [4, 6, 12, 36]
AGES: list[int] = YOUNG_AGES + OLD_AGES

# One ordinal scale for both level enums. They share no values, so a single
# mapping is unambiguous, and it is what makes "warmer than" comparable
# across the sleep and clothing situations in the same test.
WARMTH: dict[str, int] = {
    **{str(level): index for index, level in enumerate(LEVELS)},
    **{str(level): index for index, level in enumerate(SleepLevel)},
}


def _warmth(situation: Situation, temperature: float, age_months: int) -> int:
    """How warmly a situation dresses a child, as a comparable ordinal.

    Both temperatures are fed the same value so the sweep drives whichever
    one the situation actually reads.
    """
    result = recommend(
        situation=situation,
        outdoor_temperature=temperature,
        room_temperature=temperature,
        age_months=age_months,
        weather_condition="cloudy",
        uv_index=None,
        hour=9,
    )
    return WARMTH[str(result.level)]


@pytest.mark.parametrize("situation", list(Situation))
@pytest.mark.parametrize("age_months", AGES)
def test_colder_is_never_dressed_more_lightly(situation: Situation, age_months: int) -> None:
    """Walking down the thermometer must never take a layer off."""
    warmer_reading: float | None = None
    warmer_warmth: int | None = None

    for temperature in reversed(TEMPERATURES):
        warmth = _warmth(situation, temperature, age_months)
        if warmer_warmth is not None and warmth < warmer_warmth:
            pytest.fail(
                f"{situation} at {temperature} C dresses a {age_months}-month-old more "
                f"lightly (level ordinal {warmth}) than at the warmer "
                f"{warmer_reading} C (ordinal {warmer_warmth})"
            )
        warmer_reading, warmer_warmth = temperature, warmth


@pytest.mark.parametrize("situation", list(Situation))
def test_a_newborn_is_never_dressed_more_lightly_than_an_older_child(
    situation: Situation,
) -> None:
    """The age shift may add warmth or do nothing. It may never subtract."""
    for temperature in TEMPERATURES:
        coldest_young = min(_warmth(situation, temperature, age) for age in YOUNG_AGES)
        warmest_old = max(_warmth(situation, temperature, age) for age in OLD_AGES)
        if coldest_young < warmest_old:
            pytest.fail(
                f"{situation} at {temperature} C dresses a child under four months more "
                f"lightly (ordinal {coldest_young}) than an older one (ordinal "
                f"{warmest_old})"
            )


@pytest.mark.parametrize("situation", sorted(OUTDOOR_SITUATIONS))
@pytest.mark.parametrize("age_months", AGES)
def test_the_composed_shift_never_exceeds_one_band(situation: Situation, age_months: int) -> None:
    """The invariant the whole cap exists for.

    Age and situation each shift the index, and before the cap they simply
    added: a two-month-old in a stroller below 13 C collected +2 and was
    dressed for below freezing. Whatever the shifts want, the result may
    never sit more than ``MAX_SHIFT_ABOVE_BUCKET`` band above the band the
    temperature alone calls for.
    """
    for temperature in TEMPERATURES:
        result = recommend_outdoor(situation, temperature, age_months, "cloudy")
        index = LEVELS.index(Level(result.level))
        bucket = bucket_index(temperature)
        if index > bucket + MAX_SHIFT_ABOVE_BUCKET:
            pytest.fail(
                f"{situation} at {temperature} C dresses a {age_months}-month-old at "
                f"index {index}, more than {MAX_SHIFT_ABOVE_BUCKET} band above the "
                f"temperature's own band {bucket}"
            )
