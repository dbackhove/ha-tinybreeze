"""Constants for the Tinybreeze integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "tinybreeze"

CONF_NAME: Final = "name"
CONF_BIRTH_DATE: Final = "birth_date"
CONF_WEATHER_ENTITY: Final = "weather_entity"
CONF_UV_ENTITY: Final = "uv_entity"
CONF_ROOM_SOURCE: Final = "room_source"
CONF_ROOM_ENTITY: Final = "room_entity"
CONF_ROOM_RANGE: Final = "room_range"

ROOM_SOURCE_ENTITY: Final = "entity"
ROOM_SOURCE_RANGE: Final = "range"

# Midpoints, because the rules need a number. Keys are what the user picks.
ROOM_RANGES: Final = {
    "16_17": 16.5,
    "18_19": 18.5,
    "20_21": 20.5,
    "22_23": 22.5,
    "24_25": 24.5,
    "26_plus": 26.5,
}

# The card ships inside the integration -- HACS allows one category per
# repository, so it cannot be a second, Lovelace-category entry.
CARD_FILENAME: Final = "tinybreeze-card.js"
CARD_URL: Final = "/tinybreeze_static/tinybreeze-card.js"
