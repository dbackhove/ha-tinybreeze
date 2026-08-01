// Everything the card decides, kept free of the DOM so it can be tested
// without a browser. Must not import "lit" or reference document/window --
// test/logic.test.ts enforces both with a source scan, since a module-level
// reference that is only reached inside a function body would not
// necessarily fail just by being imported under vitest's node environment.

import { SITUATIONS } from "./types";
import type { HomeAssistant, Recommendation, Situation, TinybreezeCardConfig } from "./types";

export function visibleSituations(candidates: unknown): Situation[] {
  if (!Array.isArray(candidates)) return [...SITUATIONS];
  const known = candidates.filter((value): value is Situation =>
    (SITUATIONS as readonly string[]).includes(value as string),
  );
  // An empty or fully-unrecognised list would otherwise render a card with
  // no chips at all; falling back to every situation keeps it usable.
  return known.length > 0 ? known : [...SITUATIONS];
}

export function parseConfig(raw: unknown): TinybreezeCardConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("tinybreeze-card: configuration is missing");
  }
  const config = raw as Record<string, unknown>;

  const entry = config.entry;
  if (typeof entry !== "string" || entry === "") {
    throw new Error("tinybreeze-card: an entry (child) must be selected");
  }

  const situations = visibleSituations(config.situations);
  const requested = config.default_situation as Situation | undefined;
  // A default that is not on screen would leave the card blank on load.
  const defaultSituation =
    requested && situations.includes(requested) ? requested : situations[0];

  const flag = (value: unknown): boolean => value !== false;

  return {
    type: String(config.type ?? "custom:tinybreeze-card"),
    entry,
    situations,
    default_situation: defaultSituation,
    show_weather: flag(config.show_weather),
    show_room_temperature: flag(config.show_room_temperature),
    show_uv: flag(config.show_uv),
    show_age: flag(config.show_age),
  };
}

export function entityIdFor(slug: string, situation: Situation): string {
  return `sensor.${slug}_kleidung_${situation}`;
}

export function uvEntityIdFor(slug: string): string {
  return `sensor.${slug}_uv_schutz`;
}

export function ageEntityIdFor(slug: string): string {
  return `sensor.${slug}_alter`;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asNumberOrNull(value: unknown): number | null {
  // `=== undefined` alone would also treat an explicit `null` as "present",
  // and `??`/`||` shortcuts would turn a real 0 (a valid winter reading)
  // into null. Both are checked for explicitly instead.
  return value === undefined || value === null ? null : Number(value);
}

export function readRecommendation(
  hass: HomeAssistant,
  slug: string,
  situation: Situation,
): Recommendation | undefined {
  const state = hass.states[entityIdFor(slug, situation)];
  if (!state) return undefined;

  const attributes = state.attributes;
  return {
    level: state.state,
    outfitKeys: asStringArray(attributes.outfit_keys),
    layers: Number(attributes.layers ?? 0),
    warnings: asStringArray(attributes.warnings),
    hint: (attributes.hint as string | null | undefined) ?? null,
    baseTemperature: asNumberOrNull(attributes.base_temperature),
    tog: asNumberOrNull(attributes.tog),
  };
}

export function cardSize(outfitLength: number): number {
  // Header, chips, context row, plus roughly one grid row per two items.
  return 3 + Math.ceil(outfitLength / 2);
}
