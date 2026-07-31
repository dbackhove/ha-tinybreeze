"""UV levels, the under-one rules, and the midday window."""

from __future__ import annotations

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
