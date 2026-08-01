"""The temperature buckets from the spec, boundary by boundary."""

from __future__ import annotations

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
