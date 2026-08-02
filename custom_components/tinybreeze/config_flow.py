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


def build_sources_schema(values: Mapping[str, Any]) -> vol.Schema:
    """The data-source form, prefilled from `values`.

    Shared by setup and options: the same five fields mean the same thing in
    both places, and a second copy would drift.
    """
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
            ): EntitySelector(EntitySelectorConfig(domain="sensor", device_class="temperature")),
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


def validate_sources(user_input: Mapping[str, Any]) -> dict[str, str]:
    """Errors keyed by field; empty when the sources are usable.

    Returns them rather than showing a form, because the two flows that call
    this resolve error keys in different namespaces (`config.error.*` and
    `options.error.*`) and so must build their own form.
    """
    if user_input[CONF_ROOM_SOURCE] == ROOM_SOURCE_ENTITY and not user_input.get(CONF_ROOM_ENTITY):
        # A range default exists to fall back on; an entity source has none,
        # so an unresolvable room temperature must be caught here rather than
        # surfacing as a TypeError in the rules.
        return {CONF_ROOM_ENTITY: "room_entity_required"}
    return {}


class TinybreezeConfigFlow(ConfigFlow, domain=DOMAIN):
    """One entry per child: who they are, then where the numbers come from."""

    VERSION = 1

    def __init__(self) -> None:
        self._child: dict[str, str] = {}

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
                # Held rather than written: no entry exists until the sources
                # are in, so a setup abandoned on the second step leaves
                # nothing behind.
                self._child = {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_BIRTH_DATE: birth_date.isoformat(),
                }
                return await self.async_step_sources()

        return self.async_show_form(step_id="user", data_schema=CHILD_SCHEMA, errors=errors)

    async def async_step_sources(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """The sources, asked at setup rather than left to the options flow.

        They are required: a child with no weather entity has every sensor
        unavailable and nothing on screen saying why.
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = validate_sources(user_input)
            if not errors:
                # Sources go to `options`, not `data`, which is where the
                # coordinator reads them and where the options flow writes
                # them -- so nothing downstream has to know they can now also
                # arrive from setup.
                return self.async_create_entry(
                    title=self._child[CONF_NAME],
                    data=self._child,
                    options=dict(user_input),
                )

        # On re-show after an error, echo back what was just submitted.
        # Nothing is saved yet, so the first showing starts empty.
        values = user_input if user_input is not None else {}
        return self.async_show_form(
            step_id="sources", data_schema=build_sources_schema(values), errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return TinybreezeOptionsFlow()


class TinybreezeOptionsFlow(OptionsFlow):
    """Where the data sources are changed after setup."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = validate_sources(user_input)
            if not errors:
                return self.async_create_entry(data=user_input)

        # On re-show after an error, echo back what the user just submitted
        # instead of resetting the form to the previously saved options.
        values = user_input if user_input is not None else self.config_entry.options
        return self.async_show_form(
            step_id="init", data_schema=build_sources_schema(values), errors=errors
        )
