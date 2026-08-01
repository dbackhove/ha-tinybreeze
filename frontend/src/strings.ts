// Custom cards cannot reach Home Assistant's translation files, so the item,
// warning, hint and measure strings that already exist in
// custom_components/tinybreeze/translations/{de,en}.json are copied here.
// That duplication is unavoidable -- HA does not expose its translation
// catalogue to Lovelace cards -- but silent drift between the two copies is
// not: test/strings.test.ts reads both JSON files straight off disk and
// fails loudly if this file gains, loses or renames a key on either side.
//
// `situation`, `info` and `error` are card-only chrome with no backend
// equivalent to drift against.

// Forces DE to mirror EN's exact key shape (same nesting, same keys) while
// letting its string values differ freely. A key EN has and DE lacks, or
// vice versa, is a compile error -- not just a runtime gap the drift test
// would have to catch on its own.
type Translations<T> = { [K in keyof T]: T[K] extends string ? string : Translations<T[K]> };

const EN = {
  item: {
    short_sleeve_body: "Short-sleeve bodysuit",
    long_sleeve_body: "Long-sleeve bodysuit",
    light_long_suit: "Lightweight long-sleeve sun suit (UPF 30+)",
    light_trousers: "Thin long trousers",
    trousers: "Light trousers",
    romper: "Romper",
    sweater: "Sweater",
    vest: "Thin vest or light cardigan",
    light_jacket: "Light jacket",
    fleece_jacket: "Fleece or boiled-wool jacket",
    fleece_suit: "Fleece suit",
    winter_jacket: "Winter jacket or boiled-wool overall",
    winter_suit: "Snowsuit",
    pyjamas: "Pyjamas",
    diaper_only: "Diaper only",
    sun_hat: "Sun hat with neck flap",
    thin_hat: "Thin hat",
    hat: "Hat",
    winter_hat: "Warm hat with ear flaps",
    mittens: "Mittens",
    scarf: "Neck scarf",
    barefoot: "Bare feet",
    thin_socks: "Thin socks",
    socks: "Socks",
    wool_socks: "Thick wool socks",
    shoes: "Shoes",
    leg_warmers: "Leg warmers",
    footmuff: "Footmuff",
    rain_cover: "Rain cover",
    blanket: "Blanket",
  },
  warning: {
    ueberhitzung: "Warmer than the recommended 16–20 °C. Watch for overheating.",
    keine_muetze: "No hat in bed — babies release excess heat through the head.",
    uv: "Sun protection needed.",
    mittagszeit: "Avoid the sun between 11am and 3pm.",
    autositz: "No bulky jacket in the car seat — the harness would sit too loose.",
    trage_hitze: "Heat builds up in a carrier. Check the neck regularly.",
  },
  hint: {
    carrier_legs: "Legs and feet are exposed — use leg warmers or thick socks.",
    car_seat: "Add the blanket over the lap only after buckling the harness.",
    stroller_rain_cover: "A rain cover traps heat. Ventilate regularly.",
    sleep_no_loose_bedding: "No loose blankets, no pillows.",
  },
  measure: {
    shade: "Seek shade around midday",
    midday_indoors: "Spend the midday hours indoors where possible",
    avoid_outdoors: "Avoid time outdoors",
    uv_clothing: "Protective clothing (UPF 30+)",
    sun_hat_with_neck_flap: "Hat with brim and neck flap",
    no_direct_sun: "No direct sun in the first year of life",
  },
  situation: {
    kinderwagen: "Stroller",
    babytrage: "Carrier",
    auto: "Car",
    schlafen: "Sleep",
    zuhause: "At home",
    allgemein: "General",
  },
  info: {
    disclaimer: "General guidance, not medical advice -- trust your own judgement.",
    neck_test: "Check warmth at the neck or chest, not the hands or feet.",
    cold_hands: "Cool hands and feet are normal and not a sign of being cold.",
  },
  error: {
    unavailable: "Not available",
  },
} as const;

const DE: Translations<typeof EN> = {
  item: {
    short_sleeve_body: "Kurzarmbody",
    long_sleeve_body: "Langarmbody",
    light_long_suit: "Luftiger langärmeliger Einteiler (UPF 30+)",
    light_trousers: "Dünne lange Hose",
    trousers: "Leichte Hose",
    romper: "Strampler",
    sweater: "Pullover",
    vest: "Dünne Weste oder Jäckchen",
    light_jacket: "Leichte Jacke",
    fleece_jacket: "Fleece- oder Wollwalkjacke",
    fleece_suit: "Fleeceanzug",
    winter_jacket: "Winterjacke oder Wollwalkoverall",
    winter_suit: "Winteroverall",
    pyjamas: "Schlafanzug",
    diaper_only: "Nur Windel",
    sun_hat: "Sonnenhut mit Nackenschutz",
    thin_hat: "Dünne Mütze",
    hat: "Mütze",
    winter_hat: "Warme Mütze mit Ohrenschutz",
    mittens: "Fäustlinge",
    scarf: "Halstuch",
    barefoot: "Barfuß",
    thin_socks: "Dünne Söckchen",
    socks: "Socken",
    wool_socks: "Dicke Wollsocken",
    shoes: "Schuhe",
    leg_warmers: "Stulpen",
    footmuff: "Fußsack",
    rain_cover: "Regenverdeck",
    blanket: "Decke",
  },
  warning: {
    ueberhitzung: "Wärmer als die empfohlenen 16–20 °C. Auf Überhitzung achten.",
    keine_muetze: "Keine Mütze im Bett — Babys geben überschüssige Wärme über den Kopf ab.",
    uv: "Sonnenschutz nötig.",
    mittagszeit: "Zwischen 11 und 15 Uhr die Sonne meiden.",
    autositz: "Keine dicke Jacke im Autositz — der Gurt sitzt sonst zu locker.",
    trage_hitze: "In der Trage staut sich Wärme. Nacken regelmäßig prüfen.",
  },
  hint: {
    carrier_legs: "Beine und Füße liegen frei — Stulpen oder dicke Socken.",
    car_seat: "Decke erst nach dem Anschnallen über den Schoß legen.",
    stroller_rain_cover: "Ein Regenverdeck staut Wärme. Regelmäßig lüften.",
    sleep_no_loose_bedding: "Keine losen Decken, keine Kissen.",
  },
  measure: {
    shade: "In der Mittagszeit Schatten aufsuchen",
    midday_indoors: "Mittagsstunden möglichst drinnen verbringen",
    avoid_outdoors: "Aufenthalt im Freien meiden",
    uv_clothing: "Schützende Kleidung (UPF 30+)",
    sun_hat_with_neck_flap: "Hut mit Schirm und Nackenschutz",
    no_direct_sun: "Keine direkte Sonne im ersten Lebensjahr",
  },
  situation: {
    kinderwagen: "Kinderwagen",
    babytrage: "Trage",
    auto: "Auto",
    schlafen: "Schlafen",
    zuhause: "Zuhause",
    allgemein: "Allgemein",
  },
  info: {
    disclaimer:
      "Allgemeine Orientierung, keine medizinische Beratung -- verlasse dich auf dein eigenes Urteilsvermögen.",
    neck_test: "Wärme am Nacken oder Brustkorb prüfen, nicht an Händen oder Füßen.",
    cold_hands: "Kühle Hände und Füße sind normal und kein Anzeichen von Frieren.",
  },
  error: {
    unavailable: "Nicht verfügbar",
  },
};

export const STRINGS = { en: EN, de: DE } as const;

export type Language = keyof typeof STRINGS;
export type Category = keyof typeof EN;

function resolveLanguage(language: string | undefined): Language {
  return language?.toLowerCase().startsWith("de") ? "de" : "en";
}

export function translate(language: string | undefined, category: Category, key: string): string {
  const table = STRINGS[resolveLanguage(language)][category] as Record<string, string>;
  // Mirrors the backend's own fallback (sensor.py's ClothingSensor._label):
  // an unrecognised key renders as itself rather than throwing, so a stray
  // key is visible in the UI instead of taking the card down.
  return table[key] ?? key;
}
