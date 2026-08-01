// Custom cards cannot read Home Assistant's translation files, so
// src/strings.ts carries its own copy of the item, warning, hint and measure
// strings that already live in
// custom_components/tinybreeze/translations/{de,en}.json. That duplication
// is unavoidable, but silent drift is not: this suite reads both JSON files
// straight off disk and fails loudly the moment a key is renamed, added on
// one side only, or left orphaned on the card side.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { STRINGS, translate } from "../src/strings";

const here = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_DIR = path.resolve(here, "../../custom_components/tinybreeze/translations");

const GUARDED_CATEGORIES = ["item", "warning", "hint", "measure"] as const;
const LANGUAGES = ["en", "de"] as const;

type BackendFile = Record<string, Record<string, string>>;

function loadBackend(language: (typeof LANGUAGES)[number]): BackendFile {
  const file = path.join(TRANSLATIONS_DIR, `${language}.json`);
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
