// The card's visual editor.
//
// Built on Home Assistant's own `ha-form` and its selectors, so the controls
// look and behave like every other card editor, and so this file carries no
// widgets of its own.
//
// The "entry" (child) field is a dropdown discovered from hass.states rather
// than free text: every child publishes a `sensor.<slug>_kleidung_allgemein`
// entity, and discoverChildSlugs (logic.ts) turns that into the option list,
// labelled with displayName. A free-text slug field would let a typo produce
// a silently unrenderable card -- poor for a card whose whole point is being
// configurable. When no children are discoverable yet (a fresh install, or a
// hass whose state has not populated), the field falls back to plain text
// rather than presenting an empty dropdown the user cannot escape.
//
// Data sources (weather/room/UV entities, name, birth date) are deliberately
// absent: they live in the integration's options flow, because the backend
// computes whether or not anyone is looking at a card, and a source
// configured per card would leave the entities guessing.

import { LitElement, html, nothing, type TemplateResult } from "lit";

import { discoverChildSlugs, displayName } from "./logic";
import { translate } from "./strings";
import { SITUATIONS } from "./types";
import type { HomeAssistant } from "./types";

export interface SchemaEntry {
  name: string;
  selector: Record<string, unknown>;
}

// Same fallback as the card's own `_language` getter (tinybreeze-card.ts):
// hass.locale.language is where the viewing user's language lives, "en" is
// what covers a hass that has not supplied one yet.
function editorLanguage(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language ?? "en";
}

function entryField(hass: HomeAssistant | undefined): SchemaEntry {
  const children = hass ? discoverChildSlugs(hass) : [];
  if (children.length === 0) {
    return { name: "entry", selector: { text: {} } };
  }
  return {
    name: "entry",
    selector: {
      select: {
        mode: "dropdown",
        options: children.map((slug) => ({ value: slug, label: displayName(slug) })),
      },
    },
  };
}

export function editorSchema(hass?: HomeAssistant): SchemaEntry[] {
  const language = editorLanguage(hass);
  const situationOptions = SITUATIONS.map((value) => ({
    value,
    label: translate(language, "situation", value),
  }));

  return [
    entryField(hass),
    {
      name: "situations",
      selector: { select: { multiple: true, options: situationOptions } },
    },
    {
      name: "default_situation",
      selector: { select: { mode: "dropdown", options: situationOptions } },
    },
    { name: "show_weather", selector: { boolean: {} } },
    { name: "show_room_temperature", selector: { boolean: {} } },
    { name: "show_uv", selector: { boolean: {} } },
    { name: "show_age", selector: { boolean: {} } },
  ];
}

class TinybreezeCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  _config?: Record<string, unknown>;

  setConfig(config: Record<string, unknown>): void {
    // Shown, not validated. The card's own setConfig is the authority; an
    // editor that rejected a half-configured value would fight the person
    // still filling it in.
    this._config = config;
  }

  private _valueChanged(event: CustomEvent): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: event.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${editorSchema(this.hass)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

// Guarded the same way as tinybreeze-card.ts's own registration: a second
// evaluation of this bundle must not throw on the redefinition.
if (!customElements.get("tinybreeze-card-editor")) {
  customElements.define("tinybreeze-card-editor", TinybreezeCardEditor);
}
