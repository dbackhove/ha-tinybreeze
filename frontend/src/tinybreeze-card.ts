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

import {
  ageEntityIdFor,
  cardSize,
  displayName,
  parseConfig,
  renderModel,
  usesRoomTemperature,
  uvEntityIdFor,
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
    // A default that is not among the configured chips is already resolved
    // by parseConfig, so this is always one of the situations on screen.
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

        <div class="chips">
          ${this._config.situations.map((situation) => this._chip(situation, language))}
        </div>

        ${this._infoOpen ? this._infoPanel(language) : nothing}
        ${model?.available ? this._body(model) : this._unavailable(model, language)}
      </ha-card>
    `;
  }

  private _age(model: RenderModel | undefined): TemplateResult | typeof nothing {
    if (!model || model.ageMonths === null) {
      return nothing;
    }
    const unit = this._ageUnit();
    return html`<span class="age">· ${model.ageMonths}${unit ? ` ${unit}` : ""}</span>`;
  }

  private _chip(situation: Situation, language: string): TemplateResult {
    return html`
      <button
        class="chip ${situation === this._situation ? "selected" : ""}"
        @click=${() => this._selectSituation(situation)}
      >
        ${translate(language, "situation", situation)}
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
        ${message}${model?.missing ? html`: ${model.missing}` : nothing}
      </div>
    `;
  }

  private _body(model: RenderModel): TemplateResult {
    return html`
      ${model.warnings.length ? this._warnings(model.warnings) : nothing}
      <div class="level">${this._heading(model)}</div>
      <ul class="outfit">
        ${model.outfit.map((item) => html`<li>${item}</li>`)}
      </ul>
      ${model.hint ? html`<div class="hint">${model.hint}</div>` : nothing}
      ${this._context(model)}
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

  private _heading(model: RenderModel): string {
    // A sleep recommendation is best described by its TOG rating -- that is
    // the number on the sleeping bag's own label, in either language. Every
    // other situation falls back to the raw level state (e.g. "warm",
    // "leicht"); there is no translation for it (see the report: the Level
    // and UvLevel enums are German words with no localisation on the backend
    // side either, so the card does not invent one).
    if (model.tog !== null) {
      return `TOG ${model.tog}`;
    }
    return model.level.length ? model.level[0]!.toUpperCase() + model.level.slice(1) : "";
  }

  private _context(model: RenderModel): TemplateResult | typeof nothing {
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
            UV&nbsp;${uvIndex}
          </span>
        `);
      }
    }

    return parts.length ? html`<div class="context-row">${parts}</div>` : nothing;
  }

  static override styles = css`
    ha-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .title {
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
      color: var(--ha-card-header-color, var(--primary-text-color));
      line-height: 1.2;
    }

    .title .age {
      margin-left: 4px;
      font-size: 0.55em;
      font-weight: 400;
      color: var(--secondary-text-color);
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

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 0.85em;
      cursor: pointer;
    }

    .chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }

    .info-panel p {
      margin: 0;
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }

    .warnings {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .warning-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--error-color, #db4437);
      font-size: 0.9em;
    }

    .warning-row ha-icon {
      --mdc-icon-size: 18px;
      flex-shrink: 0;
    }

    .level {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    ul.outfit {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    ul.outfit li {
      color: var(--primary-text-color);
    }

    ul.outfit li::before {
      content: "· ";
      color: var(--secondary-text-color);
    }

    .hint {
      font-size: 0.85em;
      font-style: italic;
      color: var(--secondary-text-color);
    }

    .context-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.85em;
      color: var(--secondary-text-color);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }

    .context-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .context-item ha-icon {
      --mdc-icon-size: 16px;
    }

    .notice {
      color: var(--secondary-text-color);
    }

    .notice.error {
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
