// Custom cards cannot read the integration's files from the browser, so
// src/strings.ts carries its own copy of the item, warning, hint and measure
// strings that already live in custom_components/tinybreeze/labels/{de,en}.json.
// That duplication is unavoidable, but silent drift is not: this suite reads
// both JSON files straight off disk and fails loudly the moment a key is
// renamed, added on one side only, or left orphaned on the card side.
//
// Those four categories sit in labels/ rather than in strings.json because
// Home Assistant validates strings.json against a fixed schema and hassfest
// rejects any other top-level key.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { STRINGS, translate } from "../src/strings";

const here = path.dirname(fileURLToPath(import.meta.url));
const LABELS_DIR = path.resolve(here, "../../custom_components/tinybreeze/labels");

const GUARDED_CATEGORIES = ["item", "warning", "hint", "measure"] as const;
const LANGUAGES = ["en", "de"] as const;

type BackendFile = Record<string, Record<string, string>>;

function loadBackend(language: (typeof LANGUAGES)[number]): BackendFile {
  const file = path.join(LABELS_DIR, `${language}.json`);
  return JSON.parse(readFileSync(file, "utf-8")) as BackendFile;
}

function backendKeys(
  language: (typeof LANGUAGES)[number],
  category: (typeof GUARDED_CATEGORIES)[number],
): string[] {
  return Object.keys(loadBackend(language)[category]).sort();
}

function cardKeys(
  language: (typeof LANGUAGES)[number],
  category: (typeof GUARDED_CATEGORIES)[number],
): string[] {
  return Object.keys(STRINGS[language][category]).sort();
}

describe("strings.ts stays in sync with the backend translations", () => {
  for (const language of LANGUAGES) {
    for (const category of GUARDED_CATEGORIES) {
      it(`covers exactly the backend's ${category} keys (${language})`, () => {
        // toEqual on two sorted arrays fails on either direction of drift: a
        // key the backend has and the card is missing, or a key the card
        // still carries after the backend dropped or renamed it.
        expect(cardKeys(language, category)).toEqual(backendKeys(language, category));
      });
    }
  }

  it("never falls back to an untranslated backend key by accident", () => {
    // Guards against a category existing in strings.ts but as an empty
    // object (which would pass the key-set check only if the backend
    // category were also empty -- it never is).
    for (const category of GUARDED_CATEGORIES) {
      expect(backendKeys("en", category).length).toBeGreaterThan(0);
    }
  });
});

describe("translate", () => {
  it("returns the German string for a known key", () => {
    expect(translate("de", "item", "romper")).toBe("Strampler");
  });

  it("returns the English string by default and for an explicit en", () => {
    expect(translate("en", "item", "romper")).toBe("Romper");
    expect(translate(undefined, "item", "romper")).toBe("Romper");
  });

  it("treats regional variants like de-DE as German", () => {
    expect(translate("de-DE", "item", "romper")).toBe("Strampler");
  });

  it("falls back to the raw key for an unknown key, matching the backend's own fallback", () => {
    expect(translate("en", "item", "made_up_key")).toBe("made_up_key");
  });

  it("translates warning, hint and measure keys too, not just item", () => {
    expect(translate("de", "warning", "uv")).toBe(loadBackend("de").warning.uv);
    expect(translate("en", "hint", "car_seat")).toBe(loadBackend("en").hint.car_seat);
    expect(translate("de", "measure", "shade")).toBe(loadBackend("de").measure.shade);
  });
});

describe("level", () => {
  // Pinned to the exact, complete table for both languages -- not just one
  // or two spot checks -- so a transposition between two rows (e.g. "warm"
  // and "sehr_warm" swapped) is caught. A test that only asserted the
  // heading is non-empty, or checked a single key, would pass under that
  // kind of mistake just as easily as under correct code.
  const EXPECTED_EN: Record<string, string> = {
    hitze: "Dress as lightly as possible",
    sehr_leicht: "Dress very lightly",
    leicht: "Dress lightly",
    mittel: "Dress moderately",
    warm: "Dress warmly",
    sehr_warm: "Dress very warmly",
    winterfest: "Dress for winter",
    tog_0_5: "Light sleeping bag",
    tog_1_0: "Medium-light sleeping bag",
    tog_2_5: "Standard sleeping bag",
    tog_3_5: "Warm sleeping bag",
  };

  const EXPECTED_DE: Record<string, string> = {
    hitze: "So leicht wie möglich anziehen",
    sehr_leicht: "Sehr leicht anziehen",
    leicht: "Leicht anziehen",
    mittel: "Mitteldick anziehen",
    warm: "Warm anziehen",
    sehr_warm: "Sehr warm anziehen",
    winterfest: "Winterfest anziehen",
    tog_0_5: "Dünner Schlafsack",
    tog_1_0: "Leichter Schlafsack",
    tog_2_5: "Normaler Schlafsack",
    tog_3_5: "Dicker Schlafsack",
  };

  it("translates every clothing level and sleep TOG band in English", () => {
    for (const [key, expected] of Object.entries(EXPECTED_EN)) {
      expect(translate("en", "level", key)).toBe(expected);
    }
  });

  it("translates every clothing level and sleep TOG band in German", () => {
    for (const [key, expected] of Object.entries(EXPECTED_DE)) {
      expect(translate("de", "level", key)).toBe(expected);
    }
  });

  it("covers exactly these 11 keys -- no more, no fewer", () => {
    // Guards against a level being silently dropped (the card would fall
    // back to the raw enum for it) or an orphan left behind after a rule
    // change on the backend side.
    expect(Object.keys(STRINGS.en.level).sort()).toEqual(Object.keys(EXPECTED_EN).sort());
  });

  it("falls back to the raw state for a level with no translation, rather than rendering nothing", () => {
    expect(translate("en", "level", "some_future_level")).toBe("some_future_level");
    expect(translate("de", "level", "some_future_level")).toBe("some_future_level");
  });
});

describe("label", () => {
  it("provides TOG and UV, identical in both languages by design", () => {
    expect(translate("en", "label", "tog")).toBe("TOG");
    expect(translate("de", "label", "tog")).toBe("TOG");
    expect(translate("en", "label", "uv")).toBe("UV");
    expect(translate("de", "label", "uv")).toBe("UV");
  });
});

describe("editor", () => {
  // Pinned to the exact prose for all seven editorSchema() field names, in
  // both languages -- not just "is non-empty", which would pass just as
  // well against a wrong-category wiring bug (e.g. reading from "label" or
  // "situation" instead of "editor") or against translate()'s own
  // unknown-key fallback silently returning the raw identifier.
  const EXPECTED_EN: Record<string, string> = {
    entry: "Child",
    situations: "Visible situations",
    default_situation: "Default situation",
    show_weather: "Show weather",
    show_room_temperature: "Show room temperature",
    show_uv: "Show UV index",
    show_age: "Show age",
  };

  const EXPECTED_DE: Record<string, string> = {
    entry: "Kind",
    situations: "Angezeigte Situationen",
    default_situation: "Voreingestellte Situation",
    show_weather: "Wetter anzeigen",
    show_room_temperature: "Raumtemperatur anzeigen",
    show_uv: "UV-Index anzeigen",
    show_age: "Alter anzeigen",
  };

  it("translates every editor field label in English", () => {
    for (const [key, expected] of Object.entries(EXPECTED_EN)) {
      expect(translate("en", "editor", key)).toBe(expected);
    }
  });

  it("translates every editor field label in German", () => {
    for (const [key, expected] of Object.entries(EXPECTED_DE)) {
      expect(translate("de", "editor", key)).toBe(expected);
    }
  });

  it("covers exactly these 7 keys -- no more, no fewer", () => {
    expect(Object.keys(STRINGS.en.editor).sort()).toEqual(Object.keys(EXPECTED_EN).sort());
  });

  it("falls back to the raw field name for an unrecognised schema entry, rather than empty text", () => {
    expect(translate("en", "editor", "some_future_field")).toBe("some_future_field");
    expect(translate("de", "editor", "some_future_field")).toBe("some_future_field");
  });
});
