"""The modifiers, especially the places where they deliberately stop."""

from __future__ import annotations

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
