"""The rule module must stay free of Home Assistant so it can be reasoned
about and tested on its own."""

from __future__ import annotations

import ast
from pathlib import Path


def test_recommendation_imports_nothing_from_homeassistant() -> None:
    source = Path("custom_components/tinybreeze/recommendation.py").read_text(encoding="utf-8")
    tree = ast.parse(source)

    imported: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported += [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.append(node.module)

    offenders = [name for name in imported if name.split(".")[0] == "homeassistant"]
    assert offenders == [], f"recommendation.py must not import {offenders}"
