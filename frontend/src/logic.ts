// Everything the card decides, kept free of the DOM so it can be tested
// without a browser. Must not import "lit" or reference document/window --
// test/logic.test.ts enforces both with a source scan, since a module-level
// reference that is only reached inside a function body would not
// necessarily fail just by being imported under vitest's node environment.

import { SITUATIONS } from "./types";
import type { HomeAssistant, Recommendation, Situation, TinybreezeCardConfig } from "./types";
import { translate } from "./strings";

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

// Matches the entity built by entityIdFor(slug, "allgemein") -- every child
// publishes this one regardless of which situations are enabled, so it is a
// reliable anchor for "does this slug exist" without a config-entry lookup.
const CHILD_ENTITY_PATTERN = /^sensor\.(.+)_kleidung_allgemein$/;

/**
 * Discovers which children exist by scanning hass.states for the
 * `sensor.<slug>_kleidung_allgemein` entity every child publishes. Used by
 * the editor to offer a dropdown of known slugs instead of free text, where
 * a typo would silently produce an unrenderable card.
 *
 * Returned sorted, not in hass.states' own (unspecified) key order, so the
 * dropdown a user sees is stable across reloads.
 */
export function discoverChildSlugs(hass: HomeAssistant): string[] {
  const slugs = new Set<string>();
  for (const entityId of Object.keys(hass.states)) {
    const match = CHILD_ENTITY_PATTERN.exec(entityId);
    if (match) {
      slugs.add(match[1]!);
    }
  }
  return [...slugs].sort();
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
    // Strict `=== true`: an absent attribute (an older backend, or a state
    // that carries no attributes at all) must read as "no outage reported",
    // never as one.
    uvUnavailable: attributes.uv_unavailable === true,
  };
}

export function cardSize(outfitLength: number): number {
  // Header, chips, context row, plus roughly one grid row per two items.
  return 3 + Math.ceil(outfitLength / 2);
}

// Mirrors coordinator.py's UNUSABLE_STATES. A clothing sensor whose
// coordinator has gone unavailable still exists in hass.states -- Home
// Assistant reports its *state* as "unavailable" (attributes stripped to
// {} by sensor.py's own extra_state_attributes, which returns {} once the
// coordinator has no recommendation) rather than removing the entity
// outright. Checking only "does the entity exist" would miss exactly that
// case and render an empty outfit list instead of naming the entity.
const UNAVAILABLE_STATES = new Set(["unavailable", "unknown", ""]);

export interface RenderModel {
  available: boolean;
  missing: string | null;
  level: string;
  outfit: string[];
  warnings: string[];
  hint: string | null;
  baseTemperature: number | null;
  tog: number | null;
  ageMonths: number | null;
  uvUnavailable: boolean;
}

/**
 * The source entity that took this situation's sensor down, if the backend
 * could name one.
 *
 * Read from the age sensor rather than the clothing sensor, because Home
 * Assistant merges extra_state_attributes into a state only while the entity
 * is available -- the sensor that went dark is exactly the one that cannot
 * explain itself. The age sensor is available by construction (its value
 * comes from the birth date alone), so it is the one place per child that can
 * still carry the answer. Split by domain: outdoor and room sources fail
 * independently, and naming the wrong one is no better than naming none.
 */
function missingSourceEntity(
  hass: HomeAssistant,
  slug: string,
  situation: Situation,
): string | null {
  const attributes = hass.states[ageEntityIdFor(slug)]?.attributes;
  if (!attributes) return null;
  const value = usesRoomTemperature(situation)
    ? attributes.missing_room_entity
    : attributes.missing_outdoor_entity;
  return typeof value === "string" && value !== "" ? value : null;
}

export function renderModel(
  hass: HomeAssistant,
  slug: string,
  situation: Situation,
  language: string,
): RenderModel {
  const entityId = entityIdFor(slug, situation);
  const state = hass.states[entityId];
  const recommendation =
    state && !UNAVAILABLE_STATES.has(state.state)
      ? readRecommendation(hass, slug, situation)
      : undefined;

  const ageState = hass.states[ageEntityIdFor(slug)];
  // Same guard as the clothing entity above: a bare Number(state) on
  // "unavailable"/"unknown" would be NaN, not null, and NaN !== null would
  // slip past the header's `ageMonths === null` check and render "NaN
  // Monate". AgeSensor is hardcoded always-available on the backend (see
  // sensor.py), so this should not occur in practice, but two sibling reads
  // guarding the same class of value inconsistently is a trap worth closing
  // regardless.
  const ageMonths =
    ageState && !UNAVAILABLE_STATES.has(ageState.state) ? Number(ageState.state) : null;

  if (!recommendation) {
    return {
      available: false,
      // The failing *source* if the backend named one, and only then this
      // card's own entity id -- "not available:
      // sensor.mia_kleidung_schlafen" tells a user nothing they did not
      // already know from looking at the blank card.
      missing: missingSourceEntity(hass, slug, situation) ?? entityId,
      level: "",
      outfit: [],
      warnings: [],
      hint: null,
      baseTemperature: null,
      tog: null,
      ageMonths,
      uvUnavailable: false,
    };
  }

  return {
    available: true,
    missing: null,
    level: recommendation.level,
    // Translated here, from the untranslated outfitKeys, so the template
    // stays free of lookups and so the card follows the viewing user's own
    // hass.locale.language rather than the backend's hass.config.language
    // (see the doc comment on Recommendation.outfitKeys in types.ts).
    outfit: recommendation.outfitKeys.map((key) => translate(language, "item", key)),
    warnings: recommendation.warnings.map((key) => translate(language, "warning", key)),
    hint: recommendation.hint ? translate(language, "hint", recommendation.hint) : null,
    baseTemperature: recommendation.baseTemperature,
    tog: recommendation.tog,
    ageMonths,
    uvUnavailable: recommendation.uvUnavailable,
  };
}

// Mirrors sensor.py's ROOM_SITUATIONS: sleep and home read the room's
// temperature, the other four read outdoor. Spelled out rather than derived,
// same as the backend -- a third room-based situation would need both
// updated by hand either way.
const ROOM_SITUATIONS: ReadonlySet<Situation> = new Set(["schlafen", "zuhause"]);

export function usesRoomTemperature(situation: Situation): boolean {
  return ROOM_SITUATIONS.has(situation);
}

/**
 * A human-friendly header from the config's slug (e.g. "mia" -> "Mia").
 * The card config carries only the entity slug, not a separate display
 * name -- there is nothing else to build a header from.
 */
export function displayName(entry: string): string {
  return entry
    .split(/[_\s-]+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}
