"""Sleep uses the TOG table; home has its own monotonic indoor table."""

from __future__ import annotations

import pytest

from custom_components.tinybreeze.recommendation import (
    ITEM_HAT,
    ITEM_SHOES,
    WARNING_NO_HAT,
    WARNING_OVERHEATING,
    Level,
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
    # No SLEEP_TABLE row ever contains a hat, so "not in outfit" holds no
    # matter what recommend_sleep does -- it would pass even if the function
    # were broken. WARNING_NO_HAT is the part that actually depends on the
    # implementation running, so assert that too.
    for temperature in (10.0, 18.0, 26.0):
        result = recommend_sleep(temperature)
        assert ITEM_HAT not in result.outfit
        assert WARNING_NO_HAT in result.warnings


@pytest.mark.parametrize(
    ("room_temperature", "level"),
    [
        (24.0, Level.VERY_LIGHT),
        (23.9, Level.LIGHT),
        (21.0, Level.LIGHT),
        (20.9, Level.MEDIUM),
        (18.0, Level.MEDIUM),
        (17.9, Level.WARM),
        (16.0, Level.WARM),
        (15.9, Level.VERY_WARM),
    ],
)
def test_home_table_boundaries(room_temperature: float, level: str) -> None:
    # age=6 keeps the age shift out of it -- this is the table on its own.
    assert recommend_home(room_temperature, 6).level == level


@pytest.mark.parametrize("room_temperature", [16.0, 17.0])
def test_home_age_shift_no_longer_inverts_at_recommended_bedroom_temperature(
    room_temperature: float,
) -> None:
    # The regression that started this change: recommend_home used to filter
    # BASE_TABLE through OUTDOOR_ONLY, and at 16-17 C -- the recommended
    # bedroom range -- that left a 2-month-old with *fewer* layers than a
    # 6-month-old, because the row's only extra warmth over the one above
    # was outdoor-only gear. With its own table this must never invert.
    older = recommend_home(room_temperature, 6)
    newborn = recommend_home(room_temperature, 2)
    assert newborn.layers > older.layers


def test_home_age_shift_moves_a_band() -> None:
    older = recommend_home(19.0, 6)
    newborn = recommend_home(19.0, 2)
    assert older.level == Level.MEDIUM
    assert newborn.level == Level.WARM


def test_home_age_shift_absent_at_or_above_20() -> None:
    older = recommend_home(20.0, 6)
    newborn = recommend_home(20.0, 2)
    assert older.level == Level.MEDIUM
    assert newborn.level == Level.MEDIUM


def test_sleep_warns_about_an_overwarm_room() -> None:
    assert WARNING_OVERHEATING in recommend_sleep(21.1).warnings
    assert WARNING_OVERHEATING not in recommend_sleep(21.0).warnings


@pytest.mark.parametrize("room_temperature", [21.1, 22.0, 26.0])
def test_home_does_not_warn_about_an_overwarm_room(room_temperature: float) -> None:
    # The 16-20 C range comes from BIOEG's *sleep environment* guidance, not
    # from a general recommendation for living rooms. A 22 C living room in
    # winter is ordinary, and a warning that is on all season devalues the
    # same warning where it matters -- on the sleep sensor, where a baby
    # cannot tell anyone it is too warm.
    assert WARNING_OVERHEATING not in recommend_home(room_temperature, 6).warnings
    assert WARNING_OVERHEATING in recommend_sleep(room_temperature).warnings


def test_home_never_includes_a_hat_or_shoes() -> None:
    for room_temperature in (24.0, 21.0, 18.0, 16.0, 10.0):
        for age_months in (2, 6):
            result = recommend_home(room_temperature, age_months)
            assert ITEM_HAT not in result.outfit
            assert ITEM_SHOES not in result.outfit
