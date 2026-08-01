// The card element itself, tested to the extent vitest's node environment
// (no browser, no jsdom) allows.
//
// Lit ships its own minimal SSR shim (@lit-labs/ssr-dom-shim, a real
// dependency of "lit", not something added for this suite) that installs
// `customElements` and `HTMLElement` on globalThis the moment "lit" is
// imported -- confirmed by probing this environment directly before writing
// these tests. That is enough to construct a LitElement subclass, call its
// methods and read its static ones, entirely headlessly. It is not enough to
// attach the element to a document or exercise Lit's own update/render
// scheduling (that needs a real DOM), so this suite deliberately stops at
// setConfig, getCardSize, getStubConfig and registration, per the brief --
// no elaborate DOM-rendering harness is being built here.
//
// One gap remains even with the shim: this environment has no `window`
// global (only `globalThis`), and the module under test does
// `window.customCards = ...` as its final side effect, mirroring
// ha-pareto's own registration idiom. The one-line alias below (not a
// change to the production module) is what makes importing it possible at
// all; every card that follows this idiom would need the same alias to be
// importable under plain Node.
//
// The alias has to run *before* the card module is evaluated, but static
// `import` declarations are hoisted above all other top-level code in an ES
// module regardless of where they are written -- so a plain
// `import "../src/tinybreeze-card"` above this comment would run before the
// alias below ever executes. A dynamic `import()` is not hoisted, which is
// why it is used here instead of a static import.
if (typeof window === "undefined") {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

import { describe, expect, it } from "vitest";

// Imported for its module-level side effect (customElements.define +
// window.customCards.push) -- nothing is imported by name, matching the
// card's own house style of not exporting the class (ha-pareto's
// pareto-card.ts does the same; the element is only ever reached through
// the custom elements registry, exactly as Home Assistant itself reaches
// it).
await import("../src/tinybreeze-card");

interface CardCtor {
  new (): CardInstance;
  getStubConfig(): Record<string, unknown>;
}

interface CardInstance {
  setConfig(config: unknown): void;
  getCardSize(): number;
  hass?: unknown;
}

function cardCtor(): CardCtor {
  const ctor = customElements.get("tinybreeze-card");
  if (!ctor) {
    throw new Error("tinybreeze-card did not register itself");
  }
  return ctor as unknown as CardCtor;
}

describe("tinybreeze-card registration", () => {
  it("defines the custom element under its expected tag", () => {
    expect(customElements.get("tinybreeze-card")).toBeTruthy();
  });

  it("lists itself in window.customCards with the fields Lovelace's card picker needs", () => {
    const entries = (window.customCards ?? []) as Array<Record<string, unknown>>;
    const entry = entries.find((candidate) => candidate.type === "tinybreeze-card");
    expect(entry).toBeTruthy();
    expect(entry?.name).toBe("Tinybreeze");
    // Not just "is present" -- pins the exact description a reviewer or the
    // repository would see in the card picker, so a copy change here is a
    // deliberate, visible diff rather than a silent one.
    expect(entry?.description).toBe("What to dress your baby in, right now.");
  });

  it("appears exactly once in window.customCards", () => {
    // The card picker would list a duplicate entry if the registration
    // guard (`if (!customElements.get(...))`) were ever removed. vitest only
    // evaluates this module once regardless, so this cannot exercise a
    // genuine re-evaluation the way a real HA frontend reload would -- it
    // only pins the steady-state shape.
    const entries = (window.customCards ?? []) as Array<Record<string, unknown>>;
    expect(entries.filter((candidate) => candidate.type === "tinybreeze-card")).toHaveLength(1);
  });
});

describe("tinybreeze-card.setConfig", () => {
  it("accepts a valid config and does not throw", () => {
    const card = new (cardCtor())();
    expect(() => card.setConfig({ type: "custom:tinybreeze-card", entry: "mia" })).not.toThrow();
  });

  it("rejects a config with no entry, via the same error parseConfig raises", () => {
    // Not just "throws" -- pins the exact message, so this test would fail
    // if setConfig stopped delegating to parseConfig and grew its own
    // (possibly looser) validation instead.
    const card = new (cardCtor())();
    expect(() => card.setConfig({ type: "custom:tinybreeze-card" })).toThrow(
      "tinybreeze-card: an entry (child) must be selected",
    );
  });

  it("rejects a missing configuration outright", () => {
    const card = new (cardCtor())();
    expect(() => card.setConfig(undefined)).toThrow("tinybreeze-card: configuration is missing");
  });
});

describe("tinybreeze-card.getCardSize", () => {
  it("falls back to the empty-outfit size before hass ever arrives", () => {
    // No hass means _model() cannot run at all -- this pins that getCardSize
    // still returns a real number (Lovelace calls it before layout) rather
    // than throwing or returning undefined/NaN.
    const card = new (cardCtor())();
    card.setConfig({ type: "custom:tinybreeze-card", entry: "mia" });
    expect(card.getCardSize()).toBe(3);
  });

  it("grows with the outfit once hass supplies a real recommendation", () => {
    const card = new (cardCtor())();
    card.setConfig({
      type: "custom:tinybreeze-card",
      entry: "mia",
      situations: ["allgemein"],
      default_situation: "allgemein",
    });
    card.hass = {
      states: {
        "sensor.mia_kleidung_allgemein": {
          entity_id: "sensor.mia_kleidung_allgemein",
          state: "warm",
          attributes: {
            outfit_keys: ["long_sleeve_body", "romper", "fleece_jacket"],
            layers: 3,
            warnings: [],
            hint: null,
            base_temperature: 10,
          },
        },
      },
      locale: { language: "en" },
    };
    // 3 outfit items -> cardSize(3) = 3 + ceil(3/2) = 5, not the empty-model
    // fallback of 3 -- this is what proves getCardSize is actually reading
    // the live model rather than a constant.
    expect(card.getCardSize()).toBe(5);
  });
});

describe("tinybreeze-card.getStubConfig", () => {
  it("returns exactly the documented stub, not merely a truthy object", () => {
    expect(cardCtor().getStubConfig()).toEqual({ type: "custom:tinybreeze-card", entry: "" });
  });

  it("produces a stub that setConfig itself rejects (an empty entry is a real placeholder, not a valid default)", () => {
    const card = new (cardCtor())();
    expect(() => card.setConfig(cardCtor().getStubConfig())).toThrow(/entry/i);
  });
});

interface HeadingModel {
  level: string;
  tog: number | null;
}

interface CardWithHeading {
  _heading(model: HeadingModel, language: string): string;
}

function cardWithHeading(): CardWithHeading {
  return new (cardCtor())() as unknown as CardWithHeading;
}

interface ContextModel {
  baseTemperature: number | null;
  uvUnavailable: boolean;
}

interface CardWithContext {
  setConfig(config: unknown): void;
  hass?: unknown;
  _context(model: ContextModel, language: string): unknown;
}

/**
 * The text of a rendered Lit template, without a DOM.
 *
 * A TemplateResult is a plain object of `strings` and `values`, and `values`
 * may hold further TemplateResults (the context row holds one per item), so
 * this walks it and collects every literal it would print. Enough to assert
 * *what* the row says, which is what these tests are about; the arrangement
 * of it needs a browser and is out of scope here, as the file header says.
 */
function renderedText(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (Array.isArray(node)) return node.map(renderedText).join(" ");
  if (typeof node === "object" && "strings" in node && "values" in node) {
    const template = node as { strings: readonly string[]; values: unknown[] };
    return [...template.strings, ...template.values.map(renderedText)].join(" ");
  }
  return String(node);
}

function cardWithContext(config: Record<string, unknown>, hass: unknown): CardWithContext {
  const card = new (cardCtor())() as unknown as CardWithContext;
  card.setConfig(config);
  card.hass = hass;
  return card;
}

describe("tinybreeze-card context row", () => {
  const CONFIG = {
    type: "custom:tinybreeze-card",
    entry: "mia",
    situations: ["allgemein"],
    default_situation: "allgemein",
  };

  const hassWithUv = {
    states: {
      "sensor.mia_uv_schutz": {
        entity_id: "sensor.mia_uv_schutz",
        state: "hoch",
        attributes: { uv_index: 6 },
      },
    },
    locale: { language: "de" },
  };

  // The UV sensor is unavailable, so Home Assistant has stripped its
  // attributes -- there is no uv_index to read, and nothing else in the
  // recommendation differs from a genuinely UV-free day.
  const hassWithoutUv = {
    states: {
      "sensor.mia_uv_schutz": {
        entity_id: "sensor.mia_uv_schutz",
        state: "unavailable",
        attributes: {},
      },
    },
    locale: { language: "de" },
  };

  it("shows the UV index when there is one", () => {
    const card = cardWithContext(CONFIG, hassWithUv);
    const text = renderedText(card._context({ baseTemperature: 10, uvUnavailable: false }, "de"));
    expect(text).toContain("UV");
    expect(text).not.toContain("Keine UV-Daten");
  });

  it("says so, quietly, when a configured UV source has gone dark", () => {
    const card = cardWithContext(CONFIG, hassWithoutUv);
    const text = renderedText(card._context({ baseTemperature: 10, uvUnavailable: true }, "de"));
    expect(text).toContain("Keine UV-Daten");
    expect(text).toContain("muted");
  });

  it("stays silent when no UV source is configured at all", () => {
    // uvUnavailable is false in that case: a card that never wanted UV must
    // not grow a permanent note about it.
    const card = cardWithContext(CONFIG, hassWithoutUv);
    const text = renderedText(card._context({ baseTemperature: 10, uvUnavailable: false }, "de"));
    expect(text).not.toContain("Keine UV-Daten");
  });

  it("respects show_uv for the note as well as for the index", () => {
    const card = cardWithContext({ ...CONFIG, show_uv: false }, hassWithoutUv);
    const text = renderedText(card._context({ baseTemperature: 10, uvUnavailable: true }, "de"));
    expect(text).not.toContain("Keine UV-Daten");
  });
});

describe("tinybreeze-card heading", () => {
  // strings.test.ts already pins the full "level" translation table; what is
  // missing there is proof that the card's heading actually routes through
  // that category with the right field. A wiring mistake (e.g. reading the
  // wrong RenderModel field, or translating against "situation" instead of
  // "level" -- both of which would still type-check, since both categories
  // take a plain string key) would not be caught by strings.test.ts alone.
  it("routes the clothing level through the 'level' translation category, in both languages", () => {
    const card = cardWithHeading();
    expect(card._heading({ level: "warm", tog: null }, "de")).toBe("Warm anziehen");
    expect(card._heading({ level: "warm", tog: null }, "en")).toBe("Dress warmly");
  });

  it("still shows the sleeping-bag heading for a TOG level, not just the detail line", () => {
    // TOG itself is rendered as a separate detail line by _body, not by
    // _heading -- this pins that _heading's job is unconditionally the
    // level lookup, with no special-casing for tog !== null left over from
    // the pre-fix heading that used to substitute "TOG {n}" in its place.
    const card = cardWithHeading();
    expect(card._heading({ level: "tog_2_5", tog: 2.5 }, "de")).toBe("Normaler Schlafsack");
  });

  it("falls back to the raw level for an unrecognised state, rather than empty text", () => {
    const card = cardWithHeading();
    expect(card._heading({ level: "some_future_level", tog: null }, "en")).toBe(
      "some_future_level",
    );
  });
});
