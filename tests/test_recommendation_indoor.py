"""Sleep uses the TOG table; home uses the base table minus everything outdoor."""

from __future__ import annotations

import pytest

from custom_components.tinybreeze.recommendation import (
    ITEM_HAT,
    ITEM_LIGHT_JACKET,
    ITEM_SHOES,
    ITEM_THIN_SOCKS,
    ITEM_VEST,
    WARNING_NO_HAT,
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


def test_home_drops_outdoor_items() -> None:
    # In BASE_TABLE, thin_socks never shares a bucket row with a jacket, hat
    # or shoes (those only start appearing once the table switches to
    # regular socks), so no temperature can make all three "not in outfit"
    # checks below load-bearing at once -- they hold vacuously here, because
    # none of those three items were ever in this bucket's row to begin
    # with. The vest is: 19 C's row has one, so its removal is the part of
    # this test that actually exercises the OUTDOOR_ONLY filter.
    result = recommend_home(19.0, 6)
    assert ITEM_LIGHT_JACKET not in result.outfit
    assert ITEM_SHOES not in result.outfit
    assert ITEM_HAT not in result.outfit
    assert ITEM_VEST not in result.outfit
    assert ITEM_THIN_SOCKS in result.outfit


def test_home_still_applies_the_age_shift() -> None:
    # 12.0 C (not the brief's 14.0 C): at 14.0 C the age shift moves the
    # bucket index from MEDIUM to WARM, and WARM's only extra warmth over
    # MEDIUM is a fleece jacket + hat + shoes -- all OUTDOOR_ONLY, so indoors
    # the newborn would end up with *fewer* layers than the older baby
    # (2 vs. 3), a false negative for this test. 12.0 C shifts WARM to
    # VERY_WARM instead, where the extra layer is a fleece suit, which is
    # not outdoor-only, so it survives the strip and the assertion is
    # genuinely load-bearing.
    older = recommend_home(12.0, 6)
    newborn = recommend_home(12.0, 2)
    assert newborn.layers > older.layers
