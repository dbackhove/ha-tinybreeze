# Tinybreeze — Design

Home-Assistant-Integration, die aus Wetter, UV-Index und Raumtemperatur eine
Kleidungsempfehlung für ein Baby ableitet — als Entities für Automationen und
als Lovelace-Karte.

Dieses Dokument ist auf Deutsch geschrieben, weil die fachlichen Quellen es
sind. Code, README und Commits entstehen auf Englisch, analog zu `ha-pareto`;
die UI-Strings gibt es auf Deutsch und Englisch.

## Zweck

Eltern stellen sich dieselbe Frage mehrmals täglich in unterschiedlichen
Situationen: Was zieht das Kind jetzt an — für den Spaziergang, für die Autofahrt,
fürs Bett? Die Antwort hängt von Temperatur, Wetter, UV-Index, Raumtemperatur und
Alter ab. Alle diese Werte liegen bereits in Home Assistant.

## Umfang

**Im Umfang:** Empfehlungen für sechs Situationen, UV-Schutzhinweise,
Sicherheits- und Überhitzungswarnungen, eine konfigurierbare Karte, ein Config
Flow pro Kind.

**Nicht im Umfang:** Vorhersage für später am Tag (nur der aktuelle Zustand),
eigene Wetter- oder UV-Abfrage über eine externe API, vom Nutzer überschreibbare
Regeln, mehrere Kinder in einer Karte (ein Kind pro Karte, mehrere Kinder sind
mehrere Karten).

## Architektur

Domain `tinybreeze`, HACS-Kategorie *Integration*. Der Aufbau folgt `ha-pareto`:

```
custom_components/tinybreeze/
    __init__.py           Setup, statischer Pfad + add_extra_js_url für die Karte
    config_flow.py        Config Flow (Kind) + Options Flow (Quellen)
    const.py
    coordinator.py        Neuberechnung bei State-Change und um Mitternacht
    recommendation.py     Reines Regelmodul, keine HA-Abhängigkeit
    sensor.py             Entities
    manifest.json, strings.json, translations/{de,en}.json
    brand/, www/tinybreeze-card.js
frontend/
    src/tinybreeze-card.ts, editor.ts, logic.ts, types.ts, strings.ts
    build.mjs             esbuild → custom_components/tinybreeze/www/
    test/
tests/                    pytest
```

Die Karte wird von der Integration selbst ausgeliefert und registriert
(`hass.http.async_register_static_paths` plus `frontend.add_extra_js_url`), wie
bei Pareto. Das gebaute Bundle wird eingecheckt, weil HACS das Repository
ausliefert, wie es ist.

**Ein Config Entry pro Kind.** Der Config Flow fragt Name und Geburtsdatum. Der
Options Flow die Quellen:

- Wetter-Entity (`weather.*`), erforderlich
- UV-Sensor-Entity, optional
- Raumtemperatur: entweder eine Sensor-Entity oder ein fester Bereich
  (`16–17`, `18–19`, `20–21`, `22–23`, `24–25`, `26+`) — bei einem festen Bereich
  rechnet das Regelwerk mit der Bereichsmitte

**Kein Polling.** Der Coordinator hat kein `update_interval`. Er rechnet neu bei
`async_track_state_change_event` auf den Quell-Entities und einmal täglich um
Mitternacht (`async_track_time_change`), weil das Kind älter wird und die
Mittagszeit-Warnung tagesabhängig ist.

## Entities

Ein Device pro Kind, darunter:

| Entity | Bedeutung |
|---|---|
| `sensor.<kind>_kleidung_kinderwagen` | Empfehlung Kinderwagen |
| `sensor.<kind>_kleidung_babytrage` | Empfehlung Babytrage |
| `sensor.<kind>_kleidung_auto` | Empfehlung Auto |
| `sensor.<kind>_kleidung_schlafen` | Empfehlung Schlafen |
| `sensor.<kind>_kleidung_zuhause` | Empfehlung Zuhause |
| `sensor.<kind>_kleidung_allgemein` | Basisempfehlung |
| `sensor.<kind>_uv_schutz` | nur wenn eine UV-Quelle konfiguriert ist |
| `sensor.<kind>_alter` | Alter in Monaten, `device_class` none, `unit` Monate |

Alle sechs Situationen werden immer angelegt. Wer nur zwei braucht, deaktiviert
die übrigen in Home Assistant — das ist der idiomatische Weg und billiger als
eine Konfigurationsoption. Die Karte braucht ohnehin alle, um umschalten zu
können.

### State und Attribute

Home Assistant begrenzt States auf 255 Zeichen, und lange Sätze sind als
Automations-Trigger unbrauchbar. Der State ist deshalb eine Stufe
(`SensorDeviceClass.ENUM`), der Inhalt steckt in Attributen.

Die fünf Außen-Situationen und `zuhause` nutzen diese `options`:

`hitze`, `sehr_leicht`, `leicht`, `mittel`, `warm`, `sehr_warm`, `winterfest`

`schlafen` nutzt eigene `options`, weil dort der Schlafsack die Aussage trägt:

`tog_0_5`, `tog_1_0`, `tog_2_5`, `tog_3_5`

Attribute aller Kleidungs-Sensoren:

| Attribut | Inhalt |
|---|---|
| `outfit` | Liste der Kleidungsstücke |
| `outfit_text` | Fließtext, für Push-Nachrichten |
| `layers` | Anzahl der Schichten |
| `hint` | Hinweis, der für diese Situation **immer** gilt, unabhängig vom Wetter — etwa „Beine und Füße liegen frei" bei der Babytrage |
| `warnings` | Liste der Warnungen, die **gerade** zutreffen (siehe unten) |
| `base_temperature` | Temperatur, mit der gerechnet wurde |
| `temperature_source` | `apparent` \| `measured` \| `manual_range` |
| `weather_condition` | State der Wetter-Entity |
| `age_months` | Alter zum Berechnungszeitpunkt |
| `tog` | nur bei `schlafen` |

Attribute des UV-Sensors: `uv_index`, `level`, `measures` (Liste),
`sunscreen` (`none` \| `spf30_plus`), `warnings`.

## Regelwerk

Das Modul `recommendation.py` enthält reine Funktionen ohne HA-Abhängigkeit.
Kern ist ein Index über sieben Temperaturbereiche; Situation und Alter
verschieben diesen Index, statt jede Kombination einzeln zu pflegen.

```
index  = bucket_index(base_temperature)      # 0 = Hitze … 6 = winterfest
index += age_shift(age_months, base_temperature)
index += situation_shift(situation, base_temperature)
index  = clamp(index, 0, 6)
outfit = BASE_TABLE[index] + situation_extras(situation, weather_condition)
```

Höherer Index heißt wärmer angezogen.

### Basistabelle (Außentemperatur, 4+ Monate, Situation *Allgemein*)

| Index | Bereich | Stufe | Outfit |
|---|---|---|---|
| 0 | ≥ 28 °C | `hitze` | Kurzarmbody aus Baumwolle; bei direkter Sonne stattdessen luftiger langärmeliger Einteiler (UPF 30+); Sonnenhut mit Nackenschutz; barfuß oder dünne Söckchen |
| 1 | 23–27 °C | `sehr_leicht` | Kurzarmbody, dünne lange Hose; Sonnenhut; dünne Söckchen |
| 2 | 18–22 °C | `leicht` | Langarmbody, leichte Hose; dünne Weste oder Jäckchen für unterwegs; Söckchen |
| 3 | 13–17 °C | `mittel` | Langarmbody, Strampler oder Hose mit Pullover; leichte Jacke; dünne Mütze; Socken |
| 4 | 8–12 °C | `warm` | Langarmbody, Strampler, Fleece- oder Wollwalkjacke; Mütze; Socken und Schuhe; bei Wind zusätzlich Halstuch |
| 5 | 0–7 °C | `sehr_warm` | Langarmbody, Strampler, Fleeceanzug, Winterjacke oder Wollwalkoverall; Mütze; Fäustlinge; dicke Socken |
| 6 | < 0 °C | `winterfest` | Langarmbody, Strampler, Fleeceanzug, Winteroverall; warme Mütze mit Ohrenschutz; Fäustlinge; dicke Wollsocken; Aufenthalt im Freien kurz halten |

Basistemperatur ist `apparent_temperature` der Wetter-Entity, falls vorhanden,
sonst `temperature`. Welche verwendet wurde, steht in `temperature_source`. Eine
eigene Windchill-Formel wird bewusst nicht gerechnet — Wind fließt nur als
Zusatzempfehlung ein.

### Altersmodifikator

`age_shift = +1`, wenn das Kind jünger als vier Monate ist **und** die
Basistemperatur unter 20 °C liegt.

Neugeborene regulieren ihre Temperatur noch nicht selbst und verlieren Wärme
schneller — daher die zusätzliche Schicht. Die 20-Grad-Schwelle ist notwendig,
weil dieselbe Faustregel oberhalb davon ins Gegenteil kippt: Überhitzung ist bei
Säuglingen das größere Risiko, nicht Kälte.

### Situationsmodifikatoren

| Situation | Basiswert | Shift | Zusätze und Hinweise |
|---|---|---|---|
| Allgemein | Außentemperatur | 0 | — |
| Kinderwagen | Außentemperatur | +1 bei < 15 °C | Fußsack ab < 10 °C. Regenverdeck bei Regen, aber Hinweis auf Wärmestau darunter. Das Kind bewegt sich nicht und erzeugt keine eigene Wärme. |
| Babytrage | Außentemperatur | −1 | Körperwärme der tragenden Person ersetzt eine Schicht am Oberkörper. Beine und Füße liegen frei: extra Socken oder Stulpen. Keine dicke Jacke — sie beeinträchtigt die Anhock-Spreiz-Haltung. Ab 23 °C Warnung wegen Überhitzung. |
| Auto | Außentemperatur | 0, Index gedeckelt auf 4 | Keine dicke Winterkleidung im Sitz. Decke erst **nach** dem Anschnallen über den Schoß. Fleece oder Wollwalk statt wattierter Jacke. |
| Zuhause | Raumtemperatur | — | Eigene Innentabelle, siehe unten. |
| Schlafen | Raumtemperatur | — | Eigene TOG-Tabelle, siehe unten. |

Die Auto-Deckelung ist kein Komfortdetail. Wattierte Kleidung lässt Spiel
zwischen Gurt und Körper; der Beckengurt rutscht in den Bauchraum und kann bei
einem Aufprall Leber, Darm oder Milz verletzen — der ADAC hat das im Crashtest
bei 16 km/h gezeigt.

### Schlafen (TOG)

| Raumtemperatur | Stufe | Schlafsack | Darunter |
|---|---|---|---|
| ≥ 25 °C | `tog_0_5` | 0,5 TOG, Musselin | nur Windel oder Kurzarmbody |
| 21–24 °C | `tog_1_0` | 1,0 TOG | Kurzarmbody |
| 16–20 °C | `tog_2_5` | 2,5 TOG | Langarmbody und Schlafanzug |
| < 16 °C | `tog_3_5` | 3,5 TOG | Langarmbody und Schlafanzug |

Immer, unabhängig von der Temperatur: kein Mützchen, keine losen Decken, keine
Kissen. Empfohlene Raumtemperatur 16–20 °C, optimal 18 °C.

Hersteller-TOG-Tabellen überlappen sich (2,5 TOG wird für 15–21 °C angegeben,
1,0 TOG für 18–24 °C). Übernommen sind deshalb die überschneidungsfreien
Grenzen von NHS und Lullaby Trust, damit die Regel deterministisch bleibt.

### Zuhause

| Raumtemperatur | Stufe | Kleidung |
|---|---|---|
| ≥ 24 °C | `sehr_leicht` | Kurzarmbody |
| 21–23 °C | `leicht` | Kurzarmbody, leichte Hose |
| 18–20 °C | `mittel` | Langarmbody, leichte Hose, dünne Söckchen |
| 16–17 °C | `warm` | Langarmbody, Strampler, Pullover, Socken |
| < 16 °C | `sehr_warm` | Langarmbody, Strampler, Pullover, Fleeceanzug, Socken |

Keine Mütze, keine Schuhe. Der Altersmodifikator gilt wie draußen: unter vier
Monaten ein Band wärmer, aber nur unterhalb von 20 °C.

Diese Tabelle existiert, weil der ursprüngliche Entwurf — Basistabelle nehmen
und die Draußen-Teile herausfiltern — nicht funktioniert. Die Wärmezunahme der
Basistabelle steckt ab Zeile 4 in der Oberbekleidung: `fleece_jacket` ersetzt
dort den `sweater`. Nach dem Filtern bleibt eine Zeile weiter unten also
*weniger* übrig als eine Zeile darüber. Konkret bekam ein zwei Monate altes
Kind bei 16–17 °C Raumtemperatur zwei Schichten, ein sechs Monate altes drei —
der Altersmodifikator kehrte sich um, ausgerechnet bei der empfohlenen
Schlafzimmertemperatur. Eine eigene Tabelle ist per Konstruktion monoton; die
Basistabelle bleibt unangetastet und damit auch die Draußen-Regeln.

Das unterste Band ist bei 16 °C geteilt, damit der Altersmodifikator dort nicht
gegen die Tabellenkante läuft und wirkungslos wird.

### UV

| UV-Index | Stufe | Maßnahmen |
|---|---|---|
| 0–2 | `niedrig` | kein besonderer Schutz nötig |
| 3–5 | `mittel` | Schatten in der Mittagszeit, schützende Kleidung, Hut |
| 6–7 | `hoch` | wie oben, konsequent |
| 8–10 | `sehr_hoch` | Mittagsstunden möglichst drinnen |
| 11+ | `extrem` | Aufenthalt im Freien meiden |

Altersabhängig, unabhängig vom Index:

- **Unter 12 Monaten:** keine direkte Sonne. Keine Sonnencreme — sie belastet die
  Haut unnötig. Schutz über Schatten, Kleidung (UPF 30+) und Hut mit Nackenschutz.
  `sunscreen` = `none`.
- **Ab 12 Monaten:** Sonnencreme mit mindestens LSF 30, für Kinder empfohlen 50+.
  `sunscreen` = `spf30_plus`.

### Warnungen

Warnungen erscheinen im Attribut `warnings` und in der Karte oberhalb des
Outfits. Sie sind nicht abschaltbar.

| Kennung | Bedingung |
|---|---|
| `ueberhitzung` | Raumtemperatur > 21 °C bei `schlafen` oder `zuhause` |
| `keine_muetze` | immer bei `schlafen` |
| `uv` | UV-Index ≥ 3, nur bei den Außen-Situationen und am UV-Sensor |
| `mittagszeit` | lokale Zeit zwischen 11:00 und 15:00 und UV-Index ≥ 3, ebenfalls nur draußen |
| `autositz` | Situation `auto` und Index ≥ 4 vor der Deckelung |
| `trage_hitze` | Situation `babytrage` und Basistemperatur ≥ 23 °C |

Die Überhitzungswarnung wiegt schwerer, als die Zahl vermuten lässt: Ist einem
Säugling zu warm, schläft er in der Regel einfach weiter, während er bei Kälte
protestiert. Das Kind meldet nur eine der beiden Richtungen.

## Karte

```
┌──────────────────────────────────────────┐
│ Mia · 5 Monate                       (i) │
│ ┌──────┬───────┬──────┬─────────┬──────┐ │
│ │Wagen │ Trage │ Auto │ Schlafen│ ...  │ │
│ └──────┴───────┴──────┴─────────┴──────┘ │
│ ⚠ UV-Index 6 — Schatten aufsuchen        │
│                                          │
│ Warm anziehen                            │
│  · Langarmbody                           │
│  · Strampler                             │
│  · Fleecejacke                           │
│  · Mütze, Socken, Schuhe                 │
│                                          │
│ 9 °C bewölkt · Zimmer 19 °C · UV 6       │
└──────────────────────────────────────────┘
```

Klick auf das (i) öffnet ein Panel innerhalb der Karte mit dem rechtlichen
Hinweis (Orientierungswert, keine medizinische Beratung), dem Nackentest
(zwischen den Schulterblättern prüfen — warm, aber nicht feucht) und dem Hinweis,
dass kalte Hände und Füße kein Zeichen für Frieren sind. Auf Desktop zeigt Hover
zusätzlich einen Tooltip; Klick ist die verlässliche Interaktion, weil Touch kein
Hover kennt. Das (i) ist nicht abschaltbar.

Konfiguration über einen visuellen Editor:

| Option | Bedeutung |
|---|---|
| `entry` | welches Kind (Config Entry / Device) |
| `situations` | welche Chips angezeigt werden |
| `default_situation` | welche beim Laden aktiv ist |
| `show_weather` | Wetter und Außentemperatur in der Kontextzeile |
| `show_room_temperature` | Raumtemperatur in der Kontextzeile |
| `show_uv` | UV-Index in der Kontextzeile |
| `show_age` | Alter in der Kopfzeile |

Die Datenquellen (Wetter-Entity, Raumsensor, UV-Sensor, Name, Geburtsdatum)
stehen bewusst nicht in der Karte, sondern im Options Flow: das Backend rechnet
auch dann, wenn niemand auf die Karte schaut.

## Fehlerverhalten

- Quell-Entity fehlt oder ist `unavailable` → der abhängige Sensor wird
  `unavailable`; die Karte nennt konkret die fehlende Entity, statt leer zu bleiben
- Wetter-Entity ohne `apparent_temperature` → `temperature`, vermerkt in
  `temperature_source`
- keine UV-Quelle konfiguriert → `sensor.<kind>_uv_schutz` wird nicht angelegt;
  die Karte blendet UV-Anzeige und UV-Warnungen aus
- fester Raumtemperatur-Bereich → immer verfügbar, `temperature_source` =
  `manual_range`
- Geburtsdatum in der Zukunft → im Config Flow abgewiesen
- Karte referenziert einen gelöschten Config Entry → Hinweis, die Karte neu zu
  konfigurieren

## Tests

Backend mit pytest, Frontend mit vitest, analog zu `ha-pareto`:

- `test_recommendation_purity` — `recommendation.py` importiert nichts aus
  `homeassistant`
- `test_recommendation_table` — jede Zeile der Basistabelle, der TOG-Tabelle und
  der UV-Tabelle
- `test_recommendation_coverage` — **jede** Kombination aus Temperaturbereich ×
  Situation × Altersstufe liefert ein Ergebnis ohne Lücke; bei sechs Situationen
  ist das von Hand nicht mehr überschaubar
- `test_recommendation_shifts` — Grenzfälle der Modifikatoren: kein
  Alters-Shift ab 20 °C, Auto-Deckelung bei Index 4, Clamping an den Rändern
- `test_warnings` — jede Warnbedingung einzeln, inklusive Zeitfenster 11–15 Uhr
- `test_config_flow`, `test_coordinator`, `test_sensor`, `test_init`
- `test_translations` — `de` und `en` vollständig und deckungsgleich
- `test_card_delivery` — die Karte wird registriert und ausgeliefert
- Frontend: Rendering je Situation, Ausblende-Optionen, Fehlerzustände,
  (i)-Panel

## Quellen

- [BIÖG (ehem. BZgA) — Schlafumgebung](https://www.kindergesundheit-info.de/themen/schlafen/0-12-monate/schlafumgebung/):
  Raumtemperatur 18 °C, Schlafsack statt Decke, niemals Mützchen im Bett,
  Nackentest zwischen den Schulterblättern, Überwärmung wird nicht angezeigt
- [BIÖG — Kinderhaut schützen](https://www.kindergesundheit-info.de/themen/risiken-vorbeugen/sonnenschutz/kinderhaut-schuetzen/):
  erstes Lebensjahr keine direkte Sonne, keine Sonnencreme; ab dem zweiten
  Lebensjahr LSF ≥ 30; Hut mit Nackenschutz; 11–15 Uhr meiden; UPF 30+
- [Bundesamt für Strahlenschutz — UV-Index und Schutz](https://www.bfs.de/DE/themen/opt/uv/uv-index/einfuehrung/einfuehrung_node.html):
  UV 1–2 unbedenklich, Schutz ab 3; für Kinder LSF 50+
- [Deutscher Wetterdienst — Was ist der UV-Index](https://www.dwd.de/DE/klimaumwelt/ku_beratung/gesundheit/uv/informationen.html):
  Stufen des UV-Index
- [The Lullaby Trust — Dress your baby for sleep](https://www.lullabytrust.org.uk/baby-safety/baby-product-information/dress-your-baby-for-sleep/):
  Raumtemperatur 16–20 °C, TOG-Stufen, NHS-Empfehlung 2,5 TOG bei 16–20 °C
- [ADAC — Keine dicke Winterjacke im Auto](https://presse.adac.de/meldungen/adac-ev/technik/dicke-winterjacke.html)
  und [ADAC — Winterjacke im Auto](https://www.adac.de/verkehr/verkehrssicherheit/wetter/winterjacke-auto/):
  Crashtest bei 16 km/h, Gurtverlauf, Decke nach dem Anschnallen
- [baby-wetter.de](https://www.baby-wetter.de): Vorbild für Situationsauswahl und
  Altersstufen

## Annahmen, die Review brauchen

1. **Die Bereichsgrenzen der Basistabelle sind eine Ableitung**, kein Zitat.
   Zwiebelprinzip und die Faustregel „eine Schicht mehr als Erwachsene" sind
   belegt, eine amtliche Tabelle Außentemperatur → Kleidungsstück gibt es nicht.
   Die sieben Bereiche und ihre Outfits sind daher der Teil des Spec, der am
   ehesten Korrektur braucht.
2. **Die 20-Grad-Schwelle für den Alters-Shift** ist gesetzt, nicht zitiert. Die
   Richtung ist belegt (Überhitzung ist das größere Risiko), der genaue Wert
   nicht.
3. **Die Überhitzungswarnung bei > 21 °C** leitet sich aus dem empfohlenen
   Bereich 16–20 °C ab.
4. **Die Deckelung des Auto-Index auf 4** entspricht „keine wattierte
   Winterjacke". Ob 4 die richtige Grenze ist oder 3, ist eine Setzung.
