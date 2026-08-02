# Tinybreeze for Home Assistant

Parents ask themselves the same question several times a day, in different
situations: what should the baby wear right now — for a walk, for the car,
for bed? The answer depends on the weather, the UV index, the room
temperature and the child's age, and Home Assistant already knows all of
these. Tinybreeze reads them and turns them into a plain recommendation,
published as entities you can use in automations and a Lovelace card you can
glance at.

## The six situations

Tinybreeze produces a separate recommendation for each of six everyday
situations, because the same weather calls for different clothing depending
on what the baby is actually doing:

- **Stroller** — wrapped one band warmer **below 15 °C**, since a child being
  pushed moves no muscles of its own and generates no warmth from them; above
  that it is dressed like any other outdoor situation. A footmuff joins below
  10 °C, and a rain cover in the rain comes with a warning about the heat it
  traps.
- **Carrier** — one layer lighter on the torso, since the wearer's own body
  heat replaces it; legs and feet are left exposed by the carrier and need
  their own socks or leg warmers, and no thick jacket, because it would
  interfere with the spread-squat carrying position.
- **Car** — capped so that no padded winter clothing ends up under the
  harness; a blanket is only recommended over the lap, and only after
  buckling.
- **Sleep** — its state is a sleeping bag TOG rating rather than a clothing
  level, alongside what to dress the baby in underneath it.
- **Home** — its own table for being awake indoors.
- **General** — the baseline recommendation, with no situational adjustment.

Stroller, carrier, car and general read the **outdoor temperature** (a
weather entity's `apparent_temperature` if it has one, otherwise its plain
`temperature`). Sleep and home read the **room temperature** instead.

## Installation

1. Add this repository to HACS as a custom repository (category:
   **Integration**).
2. Install **Tinybreeze** and restart Home Assistant.
3. Add a child under **Settings → Devices & Services**. Setup has two steps:
   the child (name, date of birth), then the data sources it reads.

Have a weather integration set up before you start — it is required. A UV
index sensor and a room temperature sensor are optional, and the second step
explains what each one is for.

Repeat step 3 for every child; each one is its own config entry, its own
device, and its own set of entities.

The card ships inside the integration and registers itself once Tinybreeze is
set up — there is no second HACS entry to install and no Lovelace resource to
add by hand.

## Configuration

Name and date of birth are set once, at installation. The data sources are
asked for during setup too, but unlike the child they stay editable
afterwards, in the child's **options** (the cog on the integration entry):

| Option | Required | Meaning |
|---|---|---|
| Weather entity | yes | A `weather.*` entity. Its `apparent_temperature` is used when present, otherwise `temperature`. |
| UV index sensor | no | Any sensor entity that reports a UV index. |
| Room temperature | yes | Either a temperature sensor, or a fixed range picked from a list (16–17, 18–19, 20–21, 22–23, 24–25, 26+ °C) if you don't have one. A fixed range is evaluated at its midpoint. |

**UV features only appear when a UV source is configured.** Most weather
integrations do not publish a UV index at all — Met.no, Home Assistant's
default, among them — so on many setups there is simply nothing to read.
OpenWeatherMap and Open-Meteo do provide one; point the UV index sensor
option at that entity if you use either. Without a UV source, the sun
protection sensor described below is never created, and no UV warning ever
appears.

## Entities

Each child gets one device with these entities:

| Entity | Reports |
|---|---|
| `sensor.<child>_kleidung_kinderwagen` | Stroller recommendation |
| `sensor.<child>_kleidung_babytrage` | Carrier recommendation |
| `sensor.<child>_kleidung_auto` | Car recommendation |
| `sensor.<child>_kleidung_schlafen` | Sleep recommendation |
| `sensor.<child>_kleidung_zuhause` | Home recommendation |
| `sensor.<child>_kleidung_allgemein` | General recommendation |
| `sensor.<child>_uv_schutz` | Sun protection advice — only if a UV source is configured |
| `sensor.<child>_alter` | Age, in whole months |

All six clothing sensors are always created, even for a household that only
ever checks one or two — the card needs all of them to switch between, and
disabling the ones you don't want is cheaper than a configuration option for
it.

A clothing sensor's state is a short band (`hitze`, `leicht`, `warm`,
`winterfest`, …), because Home Assistant caps entity states at 255 characters
and a full sentence makes a poor automation trigger. The actual detail sits in
attributes:

| Attribute | Content |
|---|---|
| `outfit` | The list of garments, translated |
| `outfit_text` | The same list, joined into one line — meant for a notification message |
| `layers` | How many of those garments are actual clothing layers (accessories don't count) |
| `hint` | A note that applies to this situation regardless of the weather, e.g. "legs and feet are exposed" for the carrier |
| `warnings` | Whichever warnings apply right now — car seat, overheating, UV, midday sun, and so on |
| `base_temperature` | The temperature the recommendation was computed from |
| `temperature_source` | `apparent`, `measured`, or `manual_range` |
| `weather_condition` | The weather entity's own state (`cloudy`, `rainy`, …) |
| `age_months` | The child's age at the time of the calculation |
| `uv_unavailable` | `true` when a UV source is configured but cannot be read right now |
| `tog` | Sleeping-bag TOG rating — sleep sensor only |

Outdoor and room sources are tracked separately, so an outage only takes down
the sensors that read the failed source: a weather entity going `unavailable`
leaves the sleep and home recommendations alone, and a room sensor going
`unavailable` leaves the stroller, carrier, car and general ones alone. The
age sensor stays available throughout, and carries `missing_outdoor_entity`
and `missing_room_entity` so the card can name the entity that actually
failed.

Automations should read `outfit_text` rather than the state, since the state
is deliberately terse:

```yaml
automation:
  - alias: Morning outfit for Mia
    triggers:
      - trigger: time
        at: "07:00:00"
    conditions:
      - condition: not
        conditions:
          - condition: state
            entity_id: sensor.mia_kleidung_kinderwagen
            state: "unavailable"
    actions:
      - action: notify.mobile_app_phone
        data:
          title: Mia's outfit for the stroller
          message: "{{ state_attr('sensor.mia_kleidung_kinderwagen', 'outfit_text') }}"
```

## The card

Add it from the card picker under **Tinybreeze**, or in YAML:

```yaml
type: custom:tinybreeze-card
entry: mia
```

`entry` is the child's slug — the same one that already appears in its entity
IDs (`sensor.mia_kleidung_allgemein` → `mia`). The visual editor offers it as
a dropdown built from whatever children it can already find on your instance,
so you rarely need to type it by hand.

| Option | Default | Meaning |
|---|---|---|
| `situations` | all six | Which situations the selector offers |
| `default_situation` | first shown situation | Which one is selected when the card loads |
| `show_weather` | `true` | Outdoor temperature in the context row, for outdoor situations |
| `show_room_temperature` | `true` | Room temperature in the context row, for sleep and home |
| `show_uv` | `true` | UV index in the context row |
| `show_age` | `true` | Age next to the child's name |

One card shows one child; several children means several cards. The data
sources (weather entity, room sensor, UV sensor, name, date of birth) are
deliberately not card options — they live in the options flow instead, so the
entities keep recomputing whether or not anyone has the card open.

Every card carries an (i) button in the header, and it cannot be turned off.
Clicking it opens the disclaimer and the safety notes below — which is the
whole reason it is there.

## Not medical advice

Tinybreeze turns temperature, weather and age into an orientation value. It
is not a medical device, it has not been reviewed by a doctor, and it does
not know your particular baby. Use your own judgement, and where it disagrees
with the recommendation, trust it over the card.

Two things worth knowing, echoed in the card's own (i) panel:

- **Check warmth at the neck or chest — not at the hands or feet.** That is
  the reliable place to tell whether a baby is too warm or too cold.
- **Cold hands and feet are normal.** A baby's circulation to its
  extremities behaves differently from an adult's; cool hands and feet on
  their own are not a sign that another layer is needed.

## Sources

The parts of this integration that are direct citations, not judgement
calls:

- [BIÖG (formerly BZgA) — sleep environment](https://www.kindergesundheit-info.de/themen/schlafen/0-12-monate/schlafumgebung/)
  — a room temperature around 18 °C, a sleeping bag instead of a blanket,
  never a hat in bed, the neck test between the shoulder blades, and that
  overheating gives no warning sign a baby can show.
- [BIÖG — protecting a child's skin](https://www.kindergesundheit-info.de/themen/risiken-vorbeugen/sonnenschutz/kinderhaut-schuetzen/)
  — no direct sun and no sunscreen in the first year of life, SPF 30+ from
  the second year on, a hat with neck protection, avoiding 11am–3pm, UPF 30+
  clothing.
- [Bundesamt für Strahlenschutz — the UV index and protection](https://www.bfs.de/DE/themen/opt/uv/uv-index/einfuehrung/einfuehrung_node.html)
  — UV 1–2 is harmless, protection is needed from 3 upward, SPF 50+ for
  children.
- [Deutscher Wetterdienst — what the UV index is](https://www.dwd.de/DE/klimaumwelt/ku_beratung/gesundheit/uv/informationen.html)
  — the UV index bands themselves.
- [The Lullaby Trust — dress your baby for sleep](https://www.lullabytrust.org.uk/baby-safety/baby-product-information/dress-your-baby-for-sleep/)
  — the 16–20 °C room range, the TOG steps, and the NHS's 2.5 TOG
  recommendation for 16–20 °C.
- [ADAC — no thick winter jacket in the car](https://presse.adac.de/meldungen/adac-ev/technik/dicke-winterjacke.html)
  and [ADAC — winter jacket in the car](https://www.adac.de/verkehr/verkehrssicherheit/wetter/winterjacke-auto/)
  — the crash test at 16 km/h and how a lap belt runs over padded clothing.

[baby-wetter.de](https://www.baby-wetter.de) was the model for the six
situations and the age bands, rather than a source for any particular number.

## What's derived, and what's cited

The TOG table, the UV bands, the age thresholds for sun exposure and
sunscreen, and the car-seat rule above are all grounded in the sources listed
above.

So is the rule that **age and situation together may add at most one band**
to what the temperature alone calls for. Without that bound the two
adjustments simply added up, and a two-month-old in a pram at 12.9 °C came
out dressed for below freezing. The bound itself is a judgement call; the
direction is not, since a baby who is too warm gives no sign of it.

The **outdoor temperature-to-clothing table is not.** No official body
publishes a table mapping outdoor temperature directly to baby garments. That
table is a derivation from two things that *are* documented — the layering
principle, and the rule of thumb that a baby wears one more layer than an
adult would in the same weather — worked out into seven concrete temperature
bands and outfits. It is the part of this integration most likely to need
adjusting for a particular baby, climate, or opinion; treat its bands as a
starting point, not a citation.

## License

[MIT](LICENSE) © 2026 Daniel Backhove.
