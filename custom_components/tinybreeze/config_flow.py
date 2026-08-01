"""Config and options flows for Tinybreeze."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    DateSelector,
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BIRTH_DATE,
    CONF_NAME,
    CONF_ROOM_ENTITY,
    CONF_ROOM_RANGE,
    CONF_ROOM_SOURCE,
    CONF_UV_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    ROOM_RANGES,
    ROOM_SOURCE_ENTITY,
    ROOM_SOURCE_RANGE,
)

CHILD_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_NAME): TextSelector(),
        vol.Required(CONF_BIRTH_DATE): DateSelector(),
    }
)


class TinybreezeConfigFlow(ConfigFlow, domain=DOMAIN):
    """One entry per child. Sources live in the options flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            birth_date = dt_util.parse_date(str(user_input[CONF_BIRTH_DATE]))
            if birth_date is None:
                errors[CONF_BIRTH_DATE] = "invalid_date"
            elif birth_date > dt_util.now().date():
                # An age below zero has no meaning for any rule here.
                errors[CONF_BIRTH_DATE] = "birth_date_in_future"
            else:
                return self.async_create_entry(
                    title=user_input[CONF_NAME],
                    data={
                        CONF_NAME: user_input[CONF_NAME],
                        CONF_BIRTH_DATE: birth_date.isoformat(),
                    },
                )

        return self.async_show_form(step_id="user", data_schema=CHILD_SCHEMA, errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return TinybreezeOptionsFlow()


class TinybreezeOptionsFlow(OptionsFlow):
    """Where the data sources are chosen."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            if user_input[CONF_ROOM_SOURCE] == ROOM_SOURCE_ENTITY and not user_input.get(
                CONF_ROOM_ENTITY
            ):
                # A range default exists to fall back on; an entity source has
                # none, so an unresolvable room temperature must be caught
                # here rather than surfacing as a TypeError in the rules.
                errors[CONF_ROOM_ENTITY] = "room_entity_required"
            else:
                return self.async_create_entry(data=user_input)

        # On re-show after an error, echo back what the user just submitted
        # instead of resetting the form to the previously saved options.
        values = user_input if user_input is not None else self.config_entry.options
        return self.async_show_form(
            step_id="init", data_schema=self._build_schema(values), errors=errors
        )

    @staticmethod
    def _build_schema(values: Mapping[str, Any]) -> vol.Schema:
        return vol.Schema(
            {
                vol.Required(
                    CONF_WEATHER_ENTITY, default=values.get(CONF_WEATHER_ENTITY, vol.UNDEFINED)
                ): EntitySelector(EntitySelectorConfig(domain="weather")),
                vol.Optional(
                    CONF_UV_ENTITY, description={"suggested_value": values.get(CONF_UV_ENTITY)}
                ): EntitySelector(EntitySelectorConfig(domain="sensor")),
                vol.Required(
                    CONF_ROOM_SOURCE,
                    default=values.get(CONF_ROOM_SOURCE, ROOM_SOURCE_ENTITY),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=[ROOM_SOURCE_ENTITY, ROOM_SOURCE_RANGE],
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key="room_source",
                    )
                ),
                vol.Optional(
                    CONF_ROOM_ENTITY,
                    description={"suggested_value": values.get(CONF_ROOM_ENTITY)},
                ): EntitySelector(
                    EntitySelectorConfig(domain="sensor", device_class="temperature")
                ),
                vol.Optional(
                    CONF_ROOM_RANGE, default=values.get(CONF_ROOM_RANGE, "18_19")
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(ROOM_RANGES),
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key="room_range",
                    )
                ),
            }
        )
