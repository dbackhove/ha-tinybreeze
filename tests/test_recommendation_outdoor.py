"""Outdoor situations: shifts, clamping and the per-situation extras."""

from __future__ import annotations

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
