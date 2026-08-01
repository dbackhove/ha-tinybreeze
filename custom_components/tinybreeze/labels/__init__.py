"""Names for the things the rule module emits keys for.

These are deliberately *not* in `strings.json`. Home Assistant validates that
file against a fixed schema -- config, options, selector, services and the
entity categories -- and hassfest rejects any other top-level key. Garment
names, warnings, hints and sun-protection measures fit none of those
categories: they are the rule module's vocabulary, not the integration's UI
chrome, and there are forty-six of them per language.

So they live here and are read directly. The card carries its own copy for the
same reason a custom card always must -- it cannot reach these files from the
browser -- and `frontend/test/strings.test.ts` asserts the two stay in exact
agreement, in both directions.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

DEFAULT_LANGUAGE = "en"

# Every category in the label files, flattened into one lookup. The keys are
# unique across categories by construction -- they come from distinct constant
# prefixes in recommendation.py -- and a test enforces it.
CATEGORIES = ("item", "warning", "hint", "measure")


@lru_cache(maxsize=8)
def load_labels(language: str) -> dict[str, str]:
    """Flat key -> label map for one language, falling back to English.

    Cached because it is read from disk on every entity setup and the files
    cannot change without a restart. Runs in an executor at the call site:
    this touches the filesystem.
    """
    labels = _read(DEFAULT_LANGUAGE)
    if language != DEFAULT_LANGUAGE:
        # Overlay rather than replace, so a language that is missing a key
        # falls back to English for that key instead of showing a raw one.
        labels.update(_read(language))
    return labels


def _read(language: str) -> dict[str, str]:
    path = Path(__file__).parent / f"{language}.json"
    if not path.is_file():
        return {}

    data = json.loads(path.read_text(encoding="utf-8"))
    flat: dict[str, str] = {}
    for category in CATEGORIES:
        flat.update(data.get(category, {}))
    return flat
