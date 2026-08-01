// Home Assistant publishes no types for custom cards, so this is the
// smallest set the card actually touches. Keeping it hand-written and
// minimal beats depending on a third-party mirror that goes stale.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassLocale {
  language?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: HassLocale;
  callWS?<T>(message: Record<string, unknown>): Promise<T>;
}

export const SITUATIONS = [
  "kinderwagen",
  "babytrage",
  "auto",
  "schlafen",
  "zuhause",
  "allgemein",
] as const;

export type Situation = (typeof SITUATIONS)[number];

export interface TinybreezeCardConfig {
  type: string;
  entry: string;
  situations: Situation[];
  default_situation: Situation;
  show_weather: boolean;
  show_room_temperature: boolean;
  show_uv: boolean;
  show_age: boolean;
}

/**
 * One situation's recommendation, read from a clothing sensor's state and
 * attributes.
 *
 * `outfitKeys` deliberately holds the untranslated `outfit_keys` attribute,
 * not the backend's pre-translated `outfit`. The backend renders `outfit`
 * (and `outfit_text`) in `hass.config.language` -- the Home Assistant
 * instance's language -- because that is what a push notification needs. A
 * card instead must follow the *viewing user's* language, which lives in
 * `hass.locale.language` and can differ from the instance's. Translation of
 * `outfitKeys`, `warnings` and `hint` happens in the card via strings.ts.
 */
export interface Recommendation {
  level: string;
  outfitKeys: string[];
  layers: number;
  warnings: string[];
  hint: string | null;
  baseTemperature: number | null;
  tog: number | null;
  /**
   * A UV source is configured but currently unreadable. The backend skips
   * the whole UV block in that case, so nothing else in this object would
   * differ from a genuinely UV-free day -- which is precisely why the flag
   * exists. It is never turned into a warning: a missing reading is not
   * evidence of sun.
   */
  uvUnavailable: boolean;
}
