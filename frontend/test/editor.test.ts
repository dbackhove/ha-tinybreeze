// editorSchema() is the testable surface of the visual editor: a pure
// function returning ha-form's field descriptors. Importing "../src/editor"
// also registers the tinybreeze-card-editor custom element as a module-level
// side effect (same idiom as tinybreeze-card.ts), which the registration
// tests below rely on.
//
// Lit ships its own minimal SSR shim (@lit-labs/ssr-dom-shim) that installs
// `customElements` and `HTMLElement` on globalThis the moment "lit" is
// imported -- see test/tinybreeze-card.test.ts for the fuller explanation.
// Unlike that card, this editor never touches `window` itself, so no extra
// alias is needed to import it under plain Node.

import { describe, expect, it } from "vitest";

import { editorSchema } from "../src/editor";
import { SITUATIONS } from "../src/types";
import type { HomeAssistant } from "../src/types";

function entity(entityId: string): [string, { entity_id: string; state: string; attributes: Record<string, unknown> }] {
  return [entityId, { entity_id: entityId, state: "warm", attributes: {} }];
}

function hassWithChildren(language = "de"): HomeAssistant {
  return {
    states: Object.fromEntries([
      entity("sensor.mia_kleidung_allgemein"),
      entity("sensor.mia_kleidung_schlafen"),
      entity("sensor.ben_kleidung_allgemein"),
    ]),
    locale: { language },
  } as unknown as HomeAssistant;
}

function hassWithNoChildren(language = "de"): HomeAssistant {
  return { states: {}, locale: { language } } as unknown as HomeAssistant;
}

interface SelectSelector {
  select: { multiple?: boolean; mode?: string; options: Array<{ value: string; label: string }> };
}

interface TextSelector {
  text: Record<string, never>;
}

const EXPECTED_FIELD_NAMES = [
  "entry",
  "situations",
  "default_situation",
  "show_weather",
  "show_room_temperature",
  "show_uv",
  "show_age",
].sort();

describe("editorSchema", () => {
  it("offers exactly the expected fields -- every toggle present, nothing extra", () => {
    // An exact-set comparison, not a series of .toContain checks: it fails
    // both if a required field is missing AND if an unwanted one (e.g. a
    // data source) sneaks in, so it cannot pass vacuously against an
    // editorSchema that returns too few or too many fields.
    const names = editorSchema(hassWithChildren())
      .map((field) => field.name)
      .sort();
    expect(names).toEqual(EXPECTED_FIELD_NAMES);
  });

  it("offers every display toggle as a boolean selector", () => {
    const schema = editorSchema(hassWithChildren());
    for (const name of ["show_weather", "show_room_temperature", "show_uv", "show_age"]) {
      const field = schema.find((entry) => entry.name === name);
      expect(field?.selector).toEqual({ boolean: {} });
    }
  });

  it("does not offer any data source -- those live in the options flow", () => {
    const names = editorSchema(hassWithChildren()).map((field) => field.name);
    // Backed by the exact-set assertion above (which pins the full field
    // list), so these absence checks cannot pass simply because
    // editorSchema() returned an empty or unrelated array.
    expect(names.length).toBeGreaterThan(0);
    expect(names).not.toContain("weather_entity");
    expect(names).not.toContain("room_entity");
    expect(names).not.toContain("uv_entity");
    expect(names).not.toContain("name");
    expect(names).not.toContain("birth_date");
  });

  it("offers every situation for both the chip selection and the default", () => {
    const schema = editorSchema(hassWithChildren());
    const situations = schema.find((field) => field.name === "situations");
    const defaultSituation = schema.find((field) => field.name === "default_situation");

    const situationsSelector = situations?.selector as unknown as SelectSelector;
    const defaultSelector = defaultSituation?.selector as unknown as SelectSelector;

    expect(situationsSelector.select.multiple).toBe(true);
    expect(situationsSelector.select.options.map((option) => option.value)).toEqual([
      ...SITUATIONS,
    ]);
    expect(defaultSelector.select.options.map((option) => option.value)).toEqual([...SITUATIONS]);
  });

  it("labels situation options with the translated name, not the raw slug", () => {
    const de = editorSchema(hassWithChildren("de"));
    const deOptions = (
      de.find((field) => field.name === "situations")?.selector as unknown as SelectSelector
    ).select.options;
    expect(deOptions.find((option) => option.value === "kinderwagen")?.label).toBe("Kinderwagen");

    const en = editorSchema(hassWithChildren("en"));
    const enOptions = (
      en.find((field) => field.name === "situations")?.selector as unknown as SelectSelector
    ).select.options;
    expect(enOptions.find((option) => option.value === "kinderwagen")?.label).toBe("Stroller");
  });

  it("offers the discovered children as a dropdown, labelled with their display name", () => {
    const entryField = editorSchema(hassWithChildren()).find((field) => field.name === "entry");
    const options = (entryField?.selector as unknown as SelectSelector).select.options;
    // Exact array, not arrayContaining -- also proves the sleep sensor did
    // not sneak in a bogus third option and that "mia" is not duplicated.
    expect(options).toEqual([
      { value: "ben", label: "Ben" },
      { value: "mia", label: "Mia" },
    ]);
  });

  it("falls back to a text field when no children are discoverable yet", () => {
    // A fresh install, or a hass whose states have not populated: an empty
    // dropdown the user cannot escape would be worse than free text here.
    const entryField = editorSchema(hassWithNoChildren()).find((field) => field.name === "entry");
    expect(entryField?.selector).toEqual({ text: {} } satisfies TextSelector);
  });

  it("falls back to a text field and English labels when hass itself is not available yet", () => {
    const schema = editorSchema(undefined);
    const entryField = schema.find((field) => field.name === "entry");
    expect(entryField?.selector).toEqual({ text: {} });

    const situationsSelector = schema.find((field) => field.name === "situations")
      ?.selector as unknown as SelectSelector;
    expect(
      situationsSelector.select.options.find((option) => option.value === "kinderwagen")?.label,
    ).toBe("Stroller");
  });
});

interface EditorCtor {
  new (): EditorInstance;
}

interface EditorInstance {
  setConfig(config: Record<string, unknown>): void;
}

describe("tinybreeze-card-editor registration", () => {
  it("registers itself under its expected tag", () => {
    expect(customElements.get("tinybreeze-card-editor")).toBeTruthy();
  });
});

describe("tinybreeze-card-editor.setConfig", () => {
  it("stores a config without throwing", () => {
    const ctor = customElements.get("tinybreeze-card-editor") as unknown as EditorCtor;
    const editor = new ctor();
    expect(() =>
      editor.setConfig({ type: "custom:tinybreeze-card", entry: "mia" }),
    ).not.toThrow();
  });
});
