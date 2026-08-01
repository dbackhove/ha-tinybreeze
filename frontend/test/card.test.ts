// renderModel is the one piece of Task 12 that lives outside the DOM: it
// collects everything the template needs (Task 12's own template is written
// as prose in the brief, not as testable code, so this is where the actual
// coverage has to live). test/tinybreeze-card.test.ts covers the element
// itself -- setConfig, getCardSize, getStubConfig, registration -- to the
// extent that is possible without a browser.

import { describe, expect, it } from "vitest";

import { displayName, renderModel, usesRoomTemperature } from "../src/logic";
import type { HomeAssistant } from "../src/types";

const hass = {
  states: {
    "sensor.mia_kleidung_schlafen": {
      entity_id: "sensor.mia_kleidung_schlafen",
      state: "tog_2_5",
      attributes: {
        outfit: ["Langarmbody", "Schlafanzug"],
        outfit_keys: ["long_sleeve_body", "pyjamas"],
        layers: 2,
        warnings: ["keine_muetze", "ueberhitzung"],
        hint: "sleep_no_loose_bedding",
        base_temperature: 22,
        tog: 2.5,
      },
    },
    "sensor.mia_kleidung_allgemein": {
      entity_id: "sensor.mia_kleidung_allgemein",
      state: "warm",
      attributes: {
        outfit_keys: ["long_sleeve_body", "romper", "fleece_jacket"],
        layers: 3,
        warnings: ["uv"],
        hint: null,
        base_temperature: 10,
      },
    },
    "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "5", attributes: {} },
  },
  locale: { language: "de" },
} as unknown as HomeAssistant;

describe("renderModel", () => {
  it("collects everything the template needs", () => {
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.available).toBe(true);
    expect(model.outfit).toEqual(["Langarmbody", "Schlafanzug"]);
    expect(model.warnings).toHaveLength(2);
    expect(model.warnings[0]).toMatch(/Mütze/);
  });

  it("translates every warning, not just the first, and in the requested language", () => {
    // Tightened beyond the brief's single toMatch assertion: pins both
    // warnings to their exact backend-sourced German strings, and proves the
    // `language` parameter is actually plumbed through (not hardcoded) by
    // reading the same entity in English too.
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.warnings).toEqual([
      "Keine Mütze im Bett — Babys geben überschüssige Wärme über den Kopf ab.",
      "Wärmer als die empfohlenen 16–20 °C. Auf Überhitzung achten.",
    ]);

    const english = renderModel(hass, "mia", "schlafen", "en");
    expect(english.warnings).toEqual([
      "No hat in bed — babies release excess heat through the head.",
      "Warmer than the recommended 16–20 °C. Watch for overheating.",
    ]);
  });

  it("translates the outfit from outfitKeys, in the requested language", () => {
    // A model built from `attributes.outfit` (the backend's pre-translated,
    // German-only copy) rather than `outfitKeys` would happen to match the
    // "de" case here but fail in English -- this is the case that catches it.
    const english = renderModel(hass, "mia", "schlafen", "en");
    expect(english.outfit).toEqual(["Long-sleeve bodysuit", "Pyjamas"]);
  });

  it("translates the hint", () => {
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.hint).toBe("Keine losen Decken, keine Kissen.");
  });

  it("passes through a null hint untranslated", () => {
    const model = renderModel(hass, "mia", "allgemein", "de");
    expect(model.hint).toBeNull();
  });

  it("carries the sleep situation's TOG and base temperature", () => {
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.tog).toBe(2.5);
    expect(model.baseTemperature).toBe(22);
    expect(model.level).toBe("tog_2_5");
  });

  it("leaves tog null for a situation that does not carry one", () => {
    const model = renderModel(hass, "mia", "allgemein", "de");
    expect(model.tog).toBeNull();
    expect(model.baseTemperature).toBe(10);
  });

  it("reports the missing entity when the sensor is gone", () => {
    const model = renderModel(hass, "ben", "schlafen", "de");
    expect(model.available).toBe(false);
    expect(model.missing).toBe("sensor.ben_kleidung_schlafen");
  });

  it("blanks every other field when unavailable, rather than leaving stale data", () => {
    // Tightened: the brief's own given test only checks `available` and
    // `missing`. A renderModel that forgot to reset `outfit`/`warnings` on
    // this path would still pass that test.
    const model = renderModel(hass, "ben", "schlafen", "de");
    expect(model.level).toBe("");
    expect(model.outfit).toEqual([]);
    expect(model.warnings).toEqual([]);
    expect(model.hint).toBeNull();
    expect(model.baseTemperature).toBeNull();
    expect(model.tog).toBeNull();
  });

  it("still reads the age for a child with no recommendation at all", () => {
    // "ben" has no clothing sensor and no age sensor in this fixture, so this
    // pins ageMonths to null rather than leaving it unasserted (an implementer
    // who only ever tested the happy path could easily leave age coupled to
    // the recommendation lookup by accident).
    const model = renderModel(hass, "ben", "schlafen", "de");
    expect(model.ageMonths).toBeNull();
  });

  it("shows the age when available", () => {
    expect(renderModel(hass, "mia", "schlafen", "de").ageMonths).toBe(5);
  });

  it("treats an entity stuck in state 'unavailable' the same as a missing one", () => {
    // The realistic way a recommendation goes dark: the coordinator itself
    // becomes unavailable (its weather or room source drops out), and Home
    // Assistant reports the *existing* entity's state as "unavailable" with
    // its extra_state_attributes stripped to {} -- see coordinator.py's
    // `_unavailable` flag and sensor.py's `available` property, which key off
    // exactly this. The entity_id is never absent from hass.states in this
    // case, so checking only "does the entity exist" (as the brief's own
    // renderModel sketch does) would miss it and render an empty outfit list
    // instead of naming the missing entity.
    const flaky = {
      states: {
        "sensor.mia_kleidung_schlafen": {
          entity_id: "sensor.mia_kleidung_schlafen",
          state: "unavailable",
          attributes: {},
        },
        "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "5", attributes: {} },
      },
      locale: { language: "de" },
    } as unknown as HomeAssistant;

    const model = renderModel(flaky, "mia", "schlafen", "de");
    expect(model.available).toBe(false);
    expect(model.missing).toBe("sensor.mia_kleidung_schlafen");
    // The age sensor is unaffected by the clothing sensor's outage.
    expect(model.ageMonths).toBe(5);
  });

  it("also treats state 'unknown' as unavailable", () => {
    const flaky = {
      states: {
        "sensor.mia_kleidung_schlafen": {
          entity_id: "sensor.mia_kleidung_schlafen",
          state: "unknown",
          attributes: {},
        },
        "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "5", attributes: {} },
      },
      locale: { language: "de" },
    } as unknown as HomeAssistant;

    expect(renderModel(flaky, "mia", "schlafen", "de").available).toBe(false);
  });

  it("reads ageMonths as null, not NaN, when the age entity is itself unavailable", () => {
    // A bare Number("unavailable") is NaN, and NaN === null is false, so a
    // template guard written as `ageMonths === null` would let a "· NaN
    // Monate" header through. Pinned to `toBeNull()` rather than
    // `toBeFalsy()` or `not.toBeTruthy()` -- both of the latter would also
    // pass for NaN (NaN is falsy), which is exactly the bug this guards
    // against.
    const flakyAge = {
      states: {
        "sensor.mia_kleidung_schlafen": hass.states["sensor.mia_kleidung_schlafen"],
        "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "unavailable", attributes: {} },
      },
      locale: { language: "de" },
    } as unknown as HomeAssistant;

    const model = renderModel(flakyAge, "mia", "schlafen", "de");
    expect(model.ageMonths).toBeNull();
    // The clothing recommendation itself is unaffected by the age sensor's
    // outage -- the two reads are independent.
    expect(model.available).toBe(true);
  });
});

describe("renderModel names the source that failed", () => {
  // The backend puts these on the age sensor, which is available by
  // construction: Home Assistant strips extra_state_attributes from an
  // entity that is unavailable, so the clothing sensor that went dark cannot
  // name the entity that took it down. See AgeSensor.extra_state_attributes.
  function hassWith(attributes: Record<string, unknown>): HomeAssistant {
    return {
      states: {
        "sensor.mia_kleidung_schlafen": {
          entity_id: "sensor.mia_kleidung_schlafen",
          state: "unavailable",
          attributes: {},
        },
        "sensor.mia_kleidung_kinderwagen": {
          entity_id: "sensor.mia_kleidung_kinderwagen",
          state: "unavailable",
          attributes: {},
        },
        "sensor.mia_alter": { entity_id: "sensor.mia_alter", state: "5", attributes },
      },
      locale: { language: "de" },
    } as unknown as HomeAssistant;
  }

  it("names the weather entity for an outdoor situation", () => {
    const model = renderModel(
      hassWith({ missing_outdoor_entity: "weather.home", missing_room_entity: null }),
      "mia",
      "kinderwagen",
      "de",
    );
    expect(model.available).toBe(false);
    expect(model.missing).toBe("weather.home");
  });

  it("names the room sensor for a room situation", () => {
    const model = renderModel(
      hassWith({ missing_outdoor_entity: null, missing_room_entity: "sensor.bedroom" }),
      "mia",
      "schlafen",
      "de",
    );
    expect(model.missing).toBe("sensor.bedroom");
  });

  it("does not name the other domain's entity", () => {
    // Both halves can be out at once; the card must still report the one
    // belonging to the chip it is rendering, not whichever came first.
    const hass = hassWith({
      missing_outdoor_entity: "weather.home",
      missing_room_entity: "sensor.bedroom",
    });
    expect(renderModel(hass, "mia", "schlafen", "de").missing).toBe("sensor.bedroom");
    expect(renderModel(hass, "mia", "kinderwagen", "de").missing).toBe("weather.home");
  });

  it("falls back to the entity id when there is nothing to name", () => {
    // Room source "entity" with no entity ever chosen: the backend has no
    // id to report, so the card says which of its own sensors is dark
    // rather than nothing at all.
    const model = renderModel(
      hassWith({ missing_outdoor_entity: null, missing_room_entity: null }),
      "mia",
      "schlafen",
      "de",
    );
    expect(model.missing).toBe("sensor.mia_kleidung_schlafen");
  });

  it("falls back to the entity id when the age sensor is absent entirely", () => {
    expect(renderModel(hass, "ben", "schlafen", "de").missing).toBe(
      "sensor.ben_kleidung_schlafen",
    );
  });
});

describe("renderModel carries the UV outage flag", () => {
  it("is false when the attribute says so", () => {
    expect(renderModel(hass, "mia", "allgemein", "de").uvUnavailable).toBe(false);
  });

  it("is true when a configured UV source cannot be read", () => {
    const noUv = {
      states: {
        "sensor.mia_kleidung_allgemein": {
          entity_id: "sensor.mia_kleidung_allgemein",
          state: "warm",
          attributes: {
            outfit_keys: ["romper"],
            layers: 1,
            warnings: [],
            hint: null,
            base_temperature: 10,
            uv_unavailable: true,
          },
        },
      },
      locale: { language: "de" },
    } as unknown as HomeAssistant;

    expect(renderModel(noUv, "mia", "allgemein", "de").uvUnavailable).toBe(true);
  });

  it("is false, not undefined, for a sensor that predates the attribute", () => {
    // Nothing must be inferred from an absent attribute: the note is only
    // shown for an outage the backend actually reported.
    const model = renderModel(hass, "mia", "schlafen", "de");
    expect(model.uvUnavailable).toBe(false);
  });
});

describe("usesRoomTemperature", () => {
  it("is true for sleep and home, the two situations that read the room", () => {
    expect(usesRoomTemperature("schlafen")).toBe(true);
    expect(usesRoomTemperature("zuhause")).toBe(true);
  });

  it("is false for every outdoor situation", () => {
    expect(usesRoomTemperature("kinderwagen")).toBe(false);
    expect(usesRoomTemperature("babytrage")).toBe(false);
    expect(usesRoomTemperature("auto")).toBe(false);
    expect(usesRoomTemperature("allgemein")).toBe(false);
  });
});

describe("displayName", () => {
  it("capitalises a plain slug", () => {
    expect(displayName("mia")).toBe("Mia");
  });

  it("capitalises each word of a multi-word slug", () => {
    expect(displayName("baby_ben")).toBe("Baby Ben");
    expect(displayName("baby-ben")).toBe("Baby Ben");
  });

  it("does not crash on an empty slug", () => {
    expect(displayName("")).toBe("");
  });
});
