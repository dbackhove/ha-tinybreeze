// The Tinybreeze card: one child's outfit recommendation for whichever
// situation is selected.
//
// Warnings render above the outfit and carry no config flag -- they are the
// safety-relevant part (car seat, no hat in bed, overheating, UV, midday
// sun; recommend() in the backend folds the UV ones into the same list, see
// recommendation.py). The (i) info panel is likewise never gated: the
// disclaimer and the neck test must stay reachable. Its `title` attribute
// gives a hover tooltip on desktop, but the click toggle is what everyone
// else has, since touch has no hover.
//
// `hass` is declared as a genuine reactive Lit property (unlike ha-pareto's
// card, which assigns it to a private field with a hand-written setter).
// That card's visible content lives in externally-managed tile elements that
// re-render themselves; this card computes everything it shows from `hass`
// directly in its own `render()`, so it must actually re-render whenever
// `hass` changes -- which a hand-written setter only does if it remembers to
// call `requestUpdate()` itself. Declaring the property lets Lit do that
// automatically instead of relying on that being remembered.

import { LitElement, css, html, nothing, type TemplateResult } from "lit";

import "./editor";
import {
  ageEntityIdFor,
  cardSize,
  displayName,
  parseConfig,
  renderModel,
  usesRoomTemperature,
  uvEntityIdFor,
  SITUATION_ICONS,
  type RenderModel,
} from "./logic";
import { translate } from "./strings";
import type { HomeAssistant, Situation, TinybreezeCardConfig } from "./types";

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

class TinybreezeCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _situation: { state: true },
    _infoOpen: { state: true },
  };

  hass?: HomeAssistant;
  _config?: TinybreezeCardConfig;
  _situation?: Situation;
  _infoOpen = false;

  static getStubConfig(): Record<string, unknown> {
    return { type: "custom:tinybreeze-card", entry: "" };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("tinybreeze-card-editor");
  }

  setConfig(config: unknown): void {
    this._config = parseConfig(config);
    // A default that is not among the configured situations is already
    // resolved by parseConfig, so this is always one on screen.
    this._situation = this._config.default_situation;
  }

  getCardSize(): number {
    return cardSize(this._model()?.outfit.length ?? 0);
  }

  private get _language(): string {
    return this.hass?.locale?.language ?? "en";
  }

  private _model(): RenderModel | undefined {
    if (!this.hass || !this._config || !this._situation) {
      return undefined;
    }
    return renderModel(this.hass, this._config.entry, this._situation, this._language);
  }

  private _ageUnit(): string {
    const slug = this._config?.entry;
    if (!slug || !this.hass) {
      return "";
    }
    // Read straight off the age entity rather than duplicating it as a
    // hand-maintained translated string: AgeSensor's unit_of_measurement is
    // the one place that value lives.
    const unit = this.hass.states[ageEntityIdFor(slug)]?.attributes.unit_of_measurement;
    return typeof unit === "string" ? unit : "";
  }

  private _uvIndex(): number | null {
    const slug = this._config?.entry;
    if (!slug || !this.hass) {
      return null;
    }
    const value = this.hass.states[uvEntityIdFor(slug)]?.attributes.uv_index;
    if (typeof value === "number") {
      return value;
    }
    return value === undefined || value === null ? null : Number(value);
  }

  private _selectSituation(situation: Situation): void {
    this._situation = situation;
  }

  private _toggleInfo(): void {
    this._infoOpen = !this._infoOpen;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this._config) {
      return nothing;
    }

    const language = this._language;
    const model = this._model();

    return html`
      <ha-card>
        <div class="header">
          <div class="title">
            <span class="name">${displayName(this._config.entry)}</span>
            ${this._config.show_age ? this._age(model) : nothing}
          </div>
          <button
            class="info-toggle"
            title=${translate(language, "info", "disclaimer")}
            aria-label=${translate(language, "info", "disclaimer")}
            @click=${this._toggleInfo}
          >
            <ha-icon icon="mdi:information-outline"></ha-icon>
          </button>
        </div>

        ${this._situations(language)} ${this._infoOpen ? this._infoPanel(language) : nothing}
        ${model?.available ? this._body(model, language) : this._unavailable(model, language)}
      </ha-card>
    `;
  }

  private _age(model: RenderModel | undefined): TemplateResult | typeof nothing {
    if (!model || model.ageMonths === null) {
      return nothing;
    }
    const unit = this._ageUnit();
    return html`<span class="age">${model.ageMonths}${unit ? ` ${unit}` : ""}</span>`;
  }

  private _situations(language: string): TemplateResult | typeof nothing {
    if (!this._config) {
      return nothing;
    }
    return html`
      <div class="situations" role="tablist">
        ${this._config.situations.map((situation) => this._situationTab(situation, language))}
      </div>
    `;
  }

  private _situationTab(situation: Situation, language: string): TemplateResult {
    // `aria-selected` is the only marker: it is what a screen reader
    // announces, and the stylesheet keys off the same attribute rather than a
    // parallel class, so the two can never disagree about which segment is
    // the current one.
    return html`
      <button
        class="situation"
        role="tab"
        aria-selected=${String(situation === this._situation)}
        @click=${() => this._selectSituation(situation)}
      >
        <ha-icon icon=${SITUATION_ICONS[situation]}></ha-icon>
        <span class="situation-label">${translate(language, "situation", situation)}</span>
      </button>
    `;
  }

  private _infoPanel(language: string): TemplateResult {
    return html`
      <div class="info-panel">
        <p>${translate(language, "info", "disclaimer")}</p>
        <p>${translate(language, "info", "neck_test")}</p>
        <p>${translate(language, "info", "cold_hands")}</p>
      </div>
    `;
  }

  private _unavailable(model: RenderModel | undefined, language: string): TemplateResult {
    const message = translate(language, "error", "unavailable");
    return html`
      <div class="notice error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>${message}${model?.missing ? html`: ${model.missing}` : nothing}</span>
      </div>
    `;
  }

  private _body(model: RenderModel, language: string): TemplateResult {
    return html`
      ${model.warnings.length ? this._warnings(model.warnings) : nothing}
      <div class="level-row">
        <span class="level">${this._heading(model, language)}</span>
        ${model.tog !== null
          ? html`<span class="tog">${translate(language, "label", "tog")} ${model.tog}</span>`
          : nothing}
      </div>
      <ul class="outfit">
        ${model.outfit.map((item) => html`<li>${item}</li>`)}
      </ul>
      ${model.hint ? html`<div class="hint">${model.hint}</div>` : nothing}
      ${this._context(model, language)}
    `;
  }

  private _warnings(warnings: string[]): TemplateResult {
    return html`
      <div class="warnings">
        ${warnings.map(
          (warning) => html`
            <div class="warning-row">
              <ha-icon icon="mdi:alert"></ha-icon>
              <span>${warning}</span>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _heading(model: RenderModel, language: string): string {
    // The heading tells a parent what to do ("Warm anziehen" / "Standard
    // sleeping bag"), not which enum value the backend is in -- translate()'s
    // own unknown-key fallback (return the raw state) covers a level with no
    // "level" entry, so a future backend level still shows *something*
    // rather than rendering blank.
    return translate(language, "level", model.level);
  }

  private _context(model: RenderModel, language: string): TemplateResult | typeof nothing {
    if (!this._config || !this._situation) {
      return nothing;
    }

    const roomBased = usesRoomTemperature(this._situation);
    const showTemperature = roomBased
      ? this._config.show_room_temperature
      : this._config.show_weather;

    const parts: TemplateResult[] = [];

    if (showTemperature && model.baseTemperature !== null) {
      parts.push(html`
        <span class="context-item">
          <ha-icon
            icon=${roomBased ? "mdi:home-thermometer-outline" : "mdi:thermometer"}
          ></ha-icon>
          ${model.baseTemperature}&nbsp;°C
        </span>
      `);
    }

    if (this._config.show_uv) {
      const uvIndex = this._uvIndex();
      if (uvIndex !== null) {
        parts.push(html`
          <span class="context-item">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${translate(language, "label", "uv")}&nbsp;${uvIndex}
          </span>
        `);
      } else if (model.uvUnavailable) {
        // A configured UV source that has stopped reporting. Said plainly
        // and quietly: the backend deliberately fabricates no UV warning
        // from a missing reading, so the honest statement is that the data
        // is gone, not that the sun is dangerous.
        parts.push(html`
          <span class="context-item muted">
            <ha-icon icon="mdi:weather-sunny-alert"></ha-icon>
            ${translate(language, "error", "uv_unavailable")}
          </span>
        `);
      }
    }

    return parts.length ? html`<div class="context-row">${parts}</div>` : nothing;
  }

  // Every colour comes from a Home Assistant theme variable with a fallback,
  // and nothing here paints a surface of its own. That is what makes the card
  // sit correctly in an arbitrary theme and get dark mode for free -- the
  // reason the design stays inside HA's own visual language rather than
  // bringing one of its own.
  static override styles = css`
    ha-card {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
      color: var(--ha-card-header-color, var(--primary-text-color));
      line-height: 1.2;
    }

    .title .age {
      font-size: 0.5em;
      font-weight: 400;
      line-height: 1;
      color: var(--secondary-text-color);
      background: var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 4px 8px;
      white-space: nowrap;
    }

    button.info-toggle {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }

    button.info-toggle:hover {
      color: var(--primary-text-color);
    }

    /* Equal-width segments that wrap rather than scroll: six situations fit
       on a full-width card and stack tidily on a narrow one. */
    .situations {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .situation {
      flex: 1 1 76px;
      min-width: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 12px;
      background: none;
      color: var(--secondary-text-color);
      font-family: inherit;
      font-size: 0.78em;
      line-height: 1.15;
      text-align: center;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .situation ha-icon {
      --mdc-icon-size: 22px;
    }

    .situation:hover {
      color: var(--primary-text-color);
    }

    .situation[aria-selected="true"] {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 10px;
    }

    .info-panel p {
      margin: 0;
      font-size: 0.8em;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }

    /* Deliberately quiet: no fill, no border, no accent bar. The warnings
       stay above the recommendation and stay unfilterable, but a car-seat
       note should not shout down the answer the card exists to give. */
    .warnings {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .warning-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.85em;
      line-height: 1.35;
      color: var(--primary-text-color);
    }

    .warning-row ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
      color: var(--error-color, #db4437);
    }

    .level-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }

    .level {
      font-size: 1.5em;
      font-weight: 500;
      line-height: 1.2;
      color: var(--primary-text-color);
    }

    /* Beside the heading rather than below it: the TOG value qualifies the
       recommendation, it is not a second one. */
    .tog {
      flex-shrink: 0;
      font-size: 0.72em;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 2px 8px;
      white-space: nowrap;
    }

    ul.outfit {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    ul.outfit li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.35;
      color: var(--primary-text-color);
    }

    ul.outfit li::before {
      content: "";
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      margin-top: 0.45em;
      border-radius: 50%;
      background: var(--primary-color, #03a9f4);
    }

    .hint {
      font-size: 0.85em;
      line-height: 1.35;
      color: var(--secondary-text-color);
    }

    .context-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .context-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78em;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      padding: 3px 8px;
    }

    .context-item ha-icon {
      --mdc-icon-size: 15px;
    }

    .context-item.muted {
      font-style: italic;
      opacity: 0.75;
    }

    .notice {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.9em;
      line-height: 1.35;
      color: var(--secondary-text-color);
    }

    .notice ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .notice.error ha-icon {
      color: var(--error-color, #db4437);
    }
  `;
}

// Guarded as one unit: a second evaluation of this bundle must not throw on
// the redefinition, nor leave the card listed twice in the card picker.
if (!customElements.get("tinybreeze-card")) {
  customElements.define("tinybreeze-card", TinybreezeCard);

  window.customCards = window.customCards ?? [];
  window.customCards.push({
    type: "tinybreeze-card",
    name: "Tinybreeze",
    description: "What to dress your baby in, right now.",
    preview: false,
    documentationURL: "https://github.com/dbackhove/ha-tinybreeze",
  });
}
