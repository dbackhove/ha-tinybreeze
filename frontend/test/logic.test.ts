import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  ageEntityIdFor,
  cardSize,
  entityIdFor,
  parseConfig,
  readRecommendation,
  uvEntityIdFor,
  visibleSituations,
} from "../src/logic";
import type { HomeAssistant } from "../src/types";
import { SITUATIONS } from "../src/types";

const hass = {
  states: {
    "sensor.mia_kleidung_allgemein": {
      entity_id: "sensor.mia_kleidung_allgemein",
      state: "warm",
      attributes: {
        // outfit is the backend's pre-translated attribute, rendered in
        // hass.config.language for push notifications. The mock carries it
        // to prove readRecommendation ignores it in favour of outfit_keys.
        outfit: ["Langarmbody", "Strampler", "Fleecejacke"],
        outfit_keys: ["long_sleeve_body", "romper", "fleece_jacket"],
        layers: 3,
        warnings: ["uv"],
        hint: null,
        base_temperature: 10,
      },
    },
    "sensor.mia_kleidung_schlafen": {
      entity_id: "sensor.mia_kleidung_schlafen",
      state: "tog_2_5",
      attributes: {
        outfit_keys: ["long_sleeve_body", "pyjamas"],
        layers: 2,
        warnings: ["keine_muetze"],
        hint: "sleep_no_loose_bedding",
        base_temperature: 0,
        tog: 2.5,
      },
    },
  },
  locale: { language: "de" },
} as unknown as HomeAssistant;

describe("parseConfig", () => {
  it("rejects a config without an entry", () => {
    expect(() => parseConfig({ type: "custom:tinybreeze-card" })).toThrow(
      "tinybreeze-card: an entry (child) must be selected",
    );
  });

  it("rejects an empty entry", () => {
    expect(() => parseConfig({ entry: "" })).toThrow(/entry/i);
  });

  it("rejects a non-string entry", () => {
    expect(() => parseConfig({ entry: 42 })).toThrow(/entry/i);
  });

  it("rejects a missing configuration instead of crashing on the next line", () => {
    expect(() => parseConfig(null)).toThrow("tinybreeze-card: configuration is missing");
    expect(() => parseConfig(undefined)).toThrow("tinybreeze-card: configuration is missing");
  });

  it("defaults every display toggle to on", () => {
    const config = parseConfig({ type: "custom:tinybreeze-card", entry: "mia" });
    expect(config.show_weather).toBe(true);
    expect(config.show_uv).toBe(true);
    expect(config.show_room_temperature).toBe(true);
    expect(config.show_age).toBe(true);
  });

  it("keeps an explicit false without dragging down the other toggles", () => {
    const config = parseConfig({
      type: "custom:tinybreeze-card",
      entry: "mia",
      show_uv: false,
    });
    expect(config.show_uv).toBe(false);
    expect(config.show_weather).toBe(true);
    expect(config.show_room_temperature).toBe(true);
    expect(config.show_age).toBe(true);
  });

  it("defaults the type when omitted", () => {
    expect(parseConfig({ entry: "mia" }).type).toBe("custom:tinybreeze-card");
  });

  it("defaults to all six situations, in the fixed order", () => {
    const config = parseConfig({ type: "custom:tinybreeze-card", entry: "mia" });
    expect(config.situations).toEqual([...SITUATIONS]);
  });

  it("falls back when the default situation is not shown", () => {
    const config = parseConfig({
      type: "custom:tinybreeze-card",
      entry: "mia",
      situations: ["schlafen"],
      default_situation: "auto",
    });
    expect(config.default_situation).toBe("schlafen");
  });

  it("keeps the requested default situation when it is visible", () => {
    const config = parseConfig({
      entry: "mia",
      situations: ["auto", "schlafen"],
      default_situation: "schlafen",
    });
    expect(config.default_situation).toBe("schlafen");
  });

  it("defaults the default situation to the first visible one", () => {
    const config = parseConfig({ entry: "mia", situations: ["auto", "schlafen"] });
    expect(config.default_situation).toBe("auto");
  });
});

describe("entityIdFor", () => {
  it("builds the clothing entity id", () => {
    expect(entityIdFor("mia", "allgemein")).toBe("sensor.mia_kleidung_allgemein");
  });
});

describe("uvEntityIdFor", () => {
  it("builds the UV entity id", () => {
    expect(uvEntityIdFor("mia")).toBe("sensor.mia_uv_schutz");
  });
});

describe("ageEntityIdFor", () => {
  it("builds the age entity id", () => {
    expect(ageEntityIdFor("mia")).toBe("sensor.mia_alter");
  });
});

describe("readRecommendation", () => {
  it("reads level, outfit keys and warnings -- never the pre-translated outfit", () => {
    const result = readRecommendation(hass, "mia", "allgemein");
    expect(result?.level).toBe("warm");
    expect(result?.outfitKeys).toEqual(["long_sleeve_body", "romper", "fleece_jacket"]);
    expect(result?.warnings).toEqual(["uv"]);
    expect(result?.layers).toBe(3);
    expect(result?.hint).toBeNull();
    expect(result?.baseTemperature).toBe(10);
    expect(result?.tog).toBeNull();
  });

  it("reads tog and hint on the sleep sensor", () => {
    const result = readRecommendation(hass, "mia", "schlafen");
    expect(result?.tog).toBe(2.5);
    expect(result?.hint).toBe("sleep_no_loose_bedding");
    expect(result?.outfitKeys).toEqual(["long_sleeve_body", "pyjamas"]);
  });

  it("keeps a zero base temperature instead of treating it as missing", () => {
    // base_temperature: 0 is a real winter reading. A naive `attrs.x ?? null`
    // read would be fine here since 0 is not nullish, but `||` would break it
    // -- this test pins the correct operator.
    expect(readRecommendation(hass, "mia", "schlafen")?.baseTemperature).toBe(0);
  });

  it("returns undefined for a missing entity", () => {
    expect(readRecommendation(hass, "ben", "allgemein")).toBeUndefined();
  });

  it("defaults warnings to an empty list when the attribute is absent", () => {
    const bare = {
      states: {
        "sensor.ben_kleidung_allgemein": {
          entity_id: "sensor.ben_kleidung_allgemein",
          state: "leicht",
          attributes: { outfit_keys: ["romper"], layers: 1, hint: null },
        },
      },
      locale: { language: "en" },
    } as unknown as HomeAssistant;
    const result = readRecommendation(bare, "ben", "allgemein");
    expect(result?.warnings).toEqual([]);
    expect(result?.baseTemperature).toBeNull();
    expect(result?.tog).toBeNull();
  });
});

describe("visibleSituations", () => {
  it("preserves the configured order", () => {
    expect(visibleSituations(["auto", "schlafen"])).toEqual(["auto", "schlafen"]);
  });

  it("drops unknown situations", () => {
    expect(visibleSituations(["auto", "nonsense"])).toEqual(["auto"]);
  });

  it("falls back to all six when nothing recognisable is given", () => {
    expect(visibleSituations([])).toEqual([...SITUATIONS]);
    expect(visibleSituations(["nonsense"])).toEqual([...SITUATIONS]);
  });

  it("falls back to all six for a non-array value", () => {
    expect(visibleSituations(undefined)).toEqual([...SITUATIONS]);
  });
});

describe("cardSize", () => {
  it("follows the header-plus-grid formula exactly", () => {
    // Pinned to concrete numbers, not just "grows" -- a formula change that
    // still happens to be monotonic would otherwise slip through unnoticed.
    expect(cardSize(0)).toBe(3);
    expect(cardSize(1)).toBe(4);
    expect(cardSize(2)).toBe(4);
    expect(cardSize(3)).toBe(5);
    expect(cardSize(4)).toBe(5);
  });

  it("grows with the outfit", () => {
    expect(cardSize(3)).toBeGreaterThan(cardSize(1));
  });
});

describe("logic.ts stays DOM-free", () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.resolve(here, "../src/logic.ts"), "utf-8");

  it("does not import lit", () => {
    expect(source).not.toMatch(/from\s+["']lit/);
  });

  it("does not reference DOM globals", () => {
    // Matches actual usage (a member access or a type reference), not the
    // words appearing in prose -- this file's own top comment explains the
    // rule by naming document/window, which a bare word match would flag.
    expect(source).not.toMatch(/\b(document|window)\./);
    expect(source).not.toMatch(/\bHTMLElement\b/);
    expect(source).not.toMatch(/\bcustomElements\b/);
  });
});
