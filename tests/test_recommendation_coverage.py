"""No combination of inputs may fall through the rules. With six situations
this is not something anyone can hold in their head."""

from __future__ import annotations

import pytest

from custom_components.tinybreeze.recommendation import (
    ITEM_DIAPER_ONLY,
    LEVELS,
    WARNING_UV,
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
        # A diaper alone is the one legitimate zero-layer outfit: recommend_sleep's
        # top TOG band for room temperature >= 25 C, where a bodysuit would add
        # unwanted warmth under the sleeping bag. Anything else with zero layers
        # is a bug, so this must not become a blanket "layers can be 0" escape
        # hatch.
        assert result.layers >= 1 or result.outfit == (ITEM_DIAPER_ONLY,)
        assert isinstance(result.warnings, tuple)


@pytest.mark.parametrize("situation", [Situation.SLEEP, Situation.HOME])
def test_sleep_and_home_read_room_temperature(situation: Situation) -> None:
    result = recommend(
        situation=situation,
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
