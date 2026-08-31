# AI Jathagam Generator — System Architecture

## 1. Overview

The system takes **date of birth, exact time of birth, and birth place** and produces a complete Jathagam (Vedic astrology birth chart): Rasi chart, Navamsa and other divisional charts, Nakshatra, Lagna, Dasa-Bhukti, Yogas/Doshas, Ashtakavarga and Porutham. It also renders the chart in a **traditional handwritten-manuscript style** (not a plain digital grid), and generates a **natural-language narration** of the chart.

**Core principle:** chart computation is deterministic astronomy (Swiss Ephemeris), never an LLM. The LLM is used only to narrate an already-correct chart in words — never to produce the planetary positions or numbers themselves. Handwritten-style rendering is a *visual/styling* layer on top of the same correct chart data — it changes how the chart looks, not what it contains.

### 1.1 Full feature set (traditional Tamil Jathagam)

The system is scoped to produce every section of a complete Tamil Jathagam, not just a basic chart:

| # | Section | Elements |
|---|---|---|
| 1 | **Basic Birth Details** (பிறப்பு விவரங்கள்) | Lagnam (லக்னம்), Rasi (ராசி), Nakshatram (நட்சத்திரம்) + pada, Thithi, Vaaram, Yogam, Karanam |
| 2 | **Core Charts** (ஜாதக கட்டங்கள்) | Rasi Kattam (D1, 9 Navagrahas across 12 houses), Navamsam Kattam (D9); extensible to other Vargas (D2–D60) |
| 3 | **Bhava Predictions** (12 பாவங்கள்) | House-wise significations for houses 1–12 (character/health, wealth/family, education/children, disease/marriage/longevity, fortune/career/gains/moksha) |
| 4 | **Dasa & Bhukti** (திசா புக்தி) | Vimshottari Dasha (major periods) and Bhukti (sub-periods), keyed off birth Nakshatra |
| 5 | **Yogas & Doshas** (யோகங்கள் / தோஷங்கள்) | Auspicious yogas (Gaja Kesari, Guru Mangala, Raja Yogas, etc.) and doshas (Sevvai/Mangal Dosha, Kala Sarpa, Naga/Rahu-Ketu, Pitru, Guru Chandala, Ganda Moola) with pariharam notes |
| 6 | **Ashtakavarga & Porutham** (அட்டகவர்க்கம் / பொருத்தம்) | Bhinnashtakavarga + Sarvashtakavarga point tables; marriage compatibility — both the North Indian Ashta Koota (36-point) and the South Indian/Tamil 10-Porutham system |
| 7 | **Handwritten-style Chart** | The Rasi/Navamsa charts and cover page rendered to look like a traditionally handwritten Jathagam manuscript (ink-style strokes, Tamil calligraphic font, aged-paper/palm-leaf texture) instead of a flat digital grid |
| 8 | **Narration** | Chart JSON → LLM-generated natural-language reading in Tamil (and English), covering the Dasa periods, key yogas/doshas, and a general life summary |
| 9 | **Chart Drawing Style** | User-selectable regional layout: **Tamil/South Indian** (fixed-sign squares), **Kerala style**, or **North Indian** (diamond) chart — same underlying planet data, different traditional layout |
| 10 | **Panchangam System** | User-selectable calculation convention: **Thirukkanitham** (drik-siddha) or **Vakhyam** — affects nakshatra/thithi boundary edge-cases |
| 11 | **Output Modes** | **Single-page** quick-summary Jathagam vs. **Full Jathagam** (every section in 1–10) |
| 12 | **Baby Name Suggestions** | Nakshatra/Rasi-appropriate starting-syllable name suggestions, generated from the birth chart |
| 13 | **Shareable Image Card** | A WhatsApp-style image card (name + one-line chart highlight + link back to the full report) for sharing outside the app |

```
┌─────────────────────┐        ┌──────────────────────────────┐        ┌────────────────────┐
│   Next.js Frontend   │ ─────► │        FastAPI Backend        │ ─────► │  External Services  │
│   (TypeScript)       │ ◄───── │                                │ ◄───── │                      │
└─────────────────────┘        └──────────────────────────────┘        └────────────────────┘
                                          │
                                          ├── Geocoding service (place → lat/long/tz)
                                          ├── Ephemeris engine (Swiss Ephemeris / PyJHora)
                                          ├── Chart computation (Rasi, Navamsa, Dasha, Yogas)
                                          ├── LLM narration layer (Tamil/English reading)
                                          ├── Handwritten-style renderer (frontend: canvas/SVG + texture)
                                          └── Persistence (DB) for saved charts
```

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.11+), Pydantic v2 — *(a comparable reference build plan for this same scope uses Django REST Framework instead; both are fine for a calculation-heavy API, FastAPI is kept here per your earlier choice)* |
| Chart engine | **PyJHora** (built on `pyswisseph`, Lahiri ayanamsa) — chosen because it already implements Rasi/Navamsa/D2–D60 charts, Vimshottari Dasha-Bhukti, a dedicated `dosha.py` (Kala Sarpa, Sevvai/Manglik, Pitru, Guru Chandala, Ganda Moola, etc.), `raja_yoga.py`, Ashtakavarga, and a `compatibility.py` with **both** Ashta Koota (36-pt) and the South Indian/Tamil 10-Porutham system built in. **Data & licensing:** use the actual compressed Swiss Ephemeris `.se1` files (~30MB, free download, JPL DE431/441-derived, sub-arcsecond precision) rather than Moshier mode — Moshier only skips the data-file download, it does **not** change the license, since the AGPL-vs-commercial choice applies to the `pyswisseph` code itself regardless of calculation mode. So there's no accuracy trade-off worth making: get the real files for free, and separately decide between (a) AGPL — free, but obliges releasing your backend source since AGPL's network-use clause covers a live web app, or (b) Astrodienst's one-time commercial license (~USD 500 for one project, ~CHF 1,550 unlimited, valid 99 years) to stay closed-source, or (c) a third-party Vedic-astrology calculation API that has already cleared this question, paid per request. |
| Geocoding | Geocoding API (e.g. OpenStreetMap/Nominatim or Google Geocoding) + timezone lookup (`timezonefinder`) |
| Database | PostgreSQL (via SQLAlchemy / SQLModel) — stores saved birth profiles and computed charts |
| Auth (optional) | JWT-based, FastAPI's `OAuth2PasswordBearer` or a provider like Clerk/Auth0 |
| LLM narration | Hosted LLM API (e.g. Claude API), called server-side with the computed chart JSON as context; response cached per chart |
| Handwritten-style rendering | `rough.js` (hand-drawn-look SVG/canvas strokes) + a Tamil calligraphic font (e.g. Google Fonts "Kavivanar") + an aged-paper/palm-leaf (ஓலைச்சுவடி) texture background |
| Deployment | Backend on a container host (Docker → Fly.io/Render/EC2); Frontend on Vercel |

### 2.1 Ephemeris data files to download

From `https://github.com/aloistr/swisseph/tree/master/ephe` (also mirrored at Astrodienst's Dropbox), download and place in one `ephe/` folder, pointed to by `SE_EPHE_PATH` / `swe_set_ephe_path()`:

| File | Covers | Needed for |
|---|---|---|
| `sepl_18.se1` | Planets, 1800–2400 AD | Core Navagraha positions (Sun–Saturn) |
| `semo_18.se1` | Moon, 1800–2400 AD | Moon position — Rasi, Nakshatra, Dasha all depend on this |
| `seas_18.se1` | Main asteroids, 1800–2400 AD | Rahu/Ketu (lunar nodes) and any asteroid-based points if added later |
| `sefstars.txt` | Fixed star catalog | Fixed-star-based yogas/doshas (e.g. Bhrigu Bindu, star conjunctions) if/when that's added |

Direct download:
```bash
mkdir -p ephe
curl -L -o ephe/sepl_18.se1   https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sepl_18.se1
curl -L -o ephe/semo_18.se1   https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/semo_18.se1
curl -L -o ephe/seas_18.se1   https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/seas_18.se1
curl -L -o ephe/sefstars.txt  https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sefstars.txt
```

Still skipped: `*m` files (BC/pre-1AD dates), `all_ast`/`long_ast` folders, and raw JPL binary files — none of those apply to a Jathagam app. Total size for the four files above: a few MB.

## 3. Backend (FastAPI)

### 3.1 Module structure

```
backend/
├── app/
│   ├── main.py                # FastAPI app, router registration
│   ├── api/
│   │   ├── charts.py          # /charts endpoints
│   │   ├── profiles.py        # /profiles endpoints (saved birth details)
│   │   ├── porutham.py        # /porutham endpoint (marriage matching, 2 profiles)
│   │   └── narration.py       # /narration endpoint (LLM narrative layer)
│   ├── core/
│   │   ├── config.py          # env vars, settings
│   │   └── security.py        # auth (if added)
│   ├── services/
│   │   ├── geocode.py         # place name → lat/long/tz
│   │   ├── ephemeris.py       # wraps pyswisseph / PyJHora
│   │   ├── chart_builder.py   # Rasi + Navamsa (D9) + other Vargas, Bhava mapping
│   │   ├── dasha_builder.py   # Vimshottari Dasha-Bhukti timeline
│   │   ├── yoga_dosha.py      # wraps PyJHora raja_yoga.py + dosha.py
│   │   ├── ashtakavarga.py    # Bhinnashtakavarga + Sarvashtakavarga
│   │   ├── porutham.py        # wraps PyJHora compatibility.py (Ashta Koota + Tamil 10-Porutham)
│   │   ├── baby_names.py      # Nakshatra/Rasi-based starting-syllable name suggestions
│   │   ├── chart_style.py     # renders Rasi/Navamsa layout as Tamil-square / Kerala / North-Indian-diamond
│   │   ├── tamil_labels.py    # Sanskrit/English → Tamil term lookup, shared with frontend
│   │   ├── llm_narration.py   # chart JSON → Tamil/English narrative reading
│   │   ├── pdf_export.py      # renders the handwritten-style chart + narration to a printable PDF
│   │   └── share_card.py      # renders a small shareable PNG image card (name + highlight + link)
│   ├── models/
│   │   ├── schemas.py         # Pydantic request/response models
│   │   └── db_models.py       # SQLModel/SQLAlchemy ORM models
│   └── db/
│       └── session.py
├── tests/
└── requirements.txt
```

### 3.2 Key endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/charts/generate` | Input: DOB, time, place, `panchangam_system` (thirukkanitham\|vakhyam), `chart_style` (tamil\|kerala\|north_indian), `output_mode` (single_page\|full) → Output: Jathagam JSON scoped to the requested mode |
| `GET` | `/api/charts/{id}/dasha` | Full Dasha-Bhukti-Antara drill-down for a saved chart |
| `GET` | `/api/charts/{id}/yogas-doshas` | Yogas and doshas list with descriptions/pariharam notes |
| `GET` | `/api/charts/{id}/ashtakavarga` | Bhinnashtakavarga (per-planet) + Sarvashtakavarga tables |
| `GET` | `/api/charts/{id}/baby-names` | Nakshatra/Rasi-based baby name suggestions for the chart |
| `POST` | `/api/porutham` | Input: two profile IDs (boy/girl) → Output: Ashta Koota (36-pt) **and** Tamil 10-Porutham compatibility results |
| `POST` | `/api/profiles` | Save a birth+contact profile (name, gender, DOB/time/place, parent name, personal/family details, phone, email) |
| `GET` | `/api/profiles/{id}` | Retrieve a saved profile + its chart |
| `POST` | `/api/narration` | Input: chart JSON → Output: Tamil/English narrative reading (Dasa summary, key yogas/doshas, general life summary) |
| `GET` | `/api/charts/{id}/export/pdf` | Returns a printable PDF: handwritten-style chart + narration text, styled like a traditional manuscript |
| `GET` | `/api/charts/{id}/export/share-card` | Returns a shareable PNG card (name + one-line highlight + link back to the full report) |
| `GET` | `/api/health` | Health check |

### 3.3 Request/response shape (example)

```jsonc
// POST /api/charts/generate
{
  "date_of_birth": "1996-08-15",
  "time_of_birth": "07:00:00",
  "place": "Coimbatore, Tamil Nadu, India",
  "panchangam_system": "thirukkanitham",
  "chart_style": "tamil",
  "output_mode": "full"
}
```

```jsonc
// POST /api/profiles  (optional full-intake fields, per client requirement sheet)
{
  "name": "...", "gender": "...",
  "date_of_birth": "1996-08-15", "time_of_birth": "07:00:00", "place": "Coimbatore, Tamil Nadu, India",
  "parent_name": "...", "personal_details": "...",
  "phone": "...", "email": "...",
  "family_details": "..."
}
```

```jsonc
// Response
{
  "basic_details": {
    "lagnam": "Mesham", "rasi": "Karkatakam", "nakshatram": "Pushyami", "pada": 2,
    "thithi": "Shukla Panchami", "vaaram": "Vyazhakizhamai", "yogam": "Siddhi", "karanam": "Bava"
  },
  "planets": [
    { "name": "Sun", "rasi": "Simha", "degree": 28.4, "house": 5, "nakshatra": "Purva Phalguni" }
    // ... all 9 Navagrahas
  ],
  "rasi_kattam": { "...": "12-house grid, planet placements" },
  "navamsa_kattam": { "...": "D9 chart" },
  "bhava_predictions": [
    { "house": 1, "significations": ["character", "health"], "summary": "..." }
    // ... houses 2-12
  ],
  "vimshottari_dasha": [
    { "planet": "Ketu", "start": "1996-08-15", "end": "2003-08-16",
      "bhukti": [ { "planet": "Ketu", "start": "1996-08-15", "end": "1996-12-20" } ] }
    // ...
  ],
  "yogas": [ { "name": "Gaja Kesari Yoga", "present": true, "description": "..." } ],
  "doshas": [ { "name": "Sevvai Dosham", "present": false }, { "name": "Kala Sarpa Dosham", "present": false } ],
  "ashtakavarga": {
    "bhinnashtakavarga": { "Sun": [4,3,6,2, "..."], "Moon": ["..."] },
    "sarvashtakavarga": [30, 28, 32, "..."]
  }
}
```

```jsonc
// POST /api/porutham  { "profile_id_boy": 1, "profile_id_girl": 2 }
// Response
{
  "ashta_koota": { "total_points": 28, "max_points": 36, "kutas": [ { "name": "Varna", "points": 1 } ] },
  "tamil_10_porutham": {
    "dina": true, "gana": true, "mahendra": true, "sthree_deergha": true,
    "yoni": false, "rasi": true, "rajju": true, "vedha": true, "vasya": true, "rajju_dosha": false
  },
  "verdict": "..."
}
```

```jsonc
// GET /api/charts/42/baby-names
// Response
{
  "nakshatra": "Pushyami", "pada": 2, "starting_syllable": "Hu",
  "suggestions": ["Hema", "Hitesh", "Hariharan"]
}
```

### 3.4 Chart computation flow

1. `geocode.py` resolves the birth place to latitude, longitude, and IANA timezone.
2. Local birth date/time + timezone is converted to UTC, then to Julian Day.
3. `ephemeris.py` calls into PyJHora/`pyswisseph` with the Lahiri ayanamsa to get sidereal planetary longitudes, using whichever `panchangam_system` (Thirukkanitham/Vakhyam) was requested for nakshatra/thithi boundary rules.
4. `chart_builder.py` derives houses, Rasi Kattam, Navamsam Kattam (and other Vargas), nakshatra, and Bhava significations from those longitudes; `chart_style.py` lays the same house data out in the requested regional style (Tamil-square / Kerala / North-Indian-diamond) for rendering.
5. `dasha_builder.py` computes the Vimshottari Dasha-Bhukti-Antara timeline from the Moon's nakshatra at birth.
6. `yoga_dosha.py` runs PyJHora's yoga and dosha detection rules against the chart (Gaja Kesari, Raja Yogas, Sevvai/Kala Sarpa/Pitru doshas, etc.).
7. `ashtakavarga.py` computes Bhinnashtakavarga and Sarvashtakavarga point tables.
8. `tamil_labels.py` attaches the Tamil name/label to every planet, rasi, nakshatra, yoga, and dosha in the payload.
9. Result is validated against a Pydantic response schema and returned as JSON.
10. `llm_narration.py` sends the chart JSON to the LLM with a structured prompt to produce a Tamil/English narrative — this step never touches the numbers, only reads and describes them; the narration text is cached alongside the chart so it isn't regenerated on every view.
11. `baby_names.py` looks up the starting syllable(s) for the birth Nakshatra/pada from a fixed reference table and returns a matching name shortlist — a lookup, not an LLM guess.
12. For matching, `/api/porutham` loads two saved charts and calls `porutham.py` (PyJHora `compatibility.py`) for both the Ashta Koota and Tamil 10-Porutham results.

### 3.5 Feature → module map

| Jathagam section | PyJHora module used |
|---|---|
| Rasi Kattam / Navamsam Kattam / D2–D60 | `horoscope/chart/charts.py` |
| Bhava predictions | `horoscope/chart/house.py` |
| Dasa & Bhukti | Vimshottari dasha module |
| Yogas | `horoscope/chart/raja_yoga.py` |
| Doshas | `horoscope/chart/dosha.py` |
| Ashtakavarga | Ashtakavarga module |
| Porutham (Ashta Koota + Tamil 10-Porutham) | `horoscope/match/compatibility.py` |
| Baby name suggestions | Custom lookup table (Nakshatra/pada → starting syllable), not a PyJHora module |
| Chart style (Tamil/Kerala/North Indian) | Rendering-layer only — same `charts.py` house data, different layout in `chart_style.py` |

### 3.6 Narration example

```jsonc
// POST /api/narration  { "chart_id": 42, "language": "ta" }
// Response
{
  "language": "ta",
  "sections": {
    "summary": "...", 
    "current_dasa": "...",
    "yogas_doshas": "...",
    "career": "...", "marriage": "...", "health": "..."
  }
}
```

The prompt sent to the LLM includes only the already-computed chart JSON (planets, houses, dasha, yogas, doshas) plus an instruction to narrate it in Tamil in a specific voice/tone — the model is never asked to determine positions or dates, only to describe given facts.

## 3.7 Handwritten-style chart rendering

Instead of a flat digital grid, the Rasi/Navamsa charts (and an optional cover page) are rendered to resemble a traditionally hand-written Jathagam manuscript:

- **Hand-drawn strokes**: use `rough.js` to draw the 12-house square grid with slightly irregular, sketch-like lines instead of perfectly straight SVG/CSS borders.
- **Calligraphic fonts, paired**: a handwriting-style Tamil Google Font (e.g. **Kavivanar** or **Meera Inimai**) paired with an English handwritten/script font (e.g. **Caveat** or **Kalam**) so both languages feel consistent. **Keep numerals and Dasa dates in a clean serif/monospace font** — handwritten-style digits reduce trust in an astrology product where the numbers *are* the product.
- **Colour palette, per chart style**: colour theming follows the selected regional chart style, not a single global theme —
  - Tamil: temple-gopuram tones — maroon, mustard-gold, deep green
  - Kerala: Kathakali-inspired — emerald green, gold, deep red
  - North Indian: saffron, deep red, royal blue, gold mandala borders
- **Aged paper / palm-leaf texture**: a subtle paper/palm-leaf (ஓலைச்சுவடி) background texture behind the chart, with thin gold/ink borders — colourful without hurting contrast or accessibility.
- **Rendering approach**: build this as a `HandwrittenChartCanvas.tsx` component (HTML5 Canvas or SVG) that takes the same typed chart JSON as the regular `RasiChart`/`NavamsaChart` components — it's a different renderer for identical data, not a different data source.
- **Export**: the same styled view is what `pdf_export.py` rasterizes (e.g. via a headless browser like Playwright) into the downloadable/printable PDF, so the PDF a user saves looks like a real handwritten jathagam booklet.
- **Colourful variant**: the palette above already varies per region; optionally allow a lighter/darker intensity toggle within that palette, still hand-drawn via `rough.js`.

### 3.8 Single-page layout order

The full Jathagam ships as one scrollable page (no wizard/tabs), in this order: **header** (name, DOB, place, panchangam system used) → **Rasi + Navamsa charts side by side** → **planetary position table** → **Dasa-Bukthi timeline** → **dosha panel** → **LLM narration/summary paragraph** → **action row** (Download PDF, Share card, Baby Names, Check Match).

## 4. Frontend (Next.js + TypeScript)

### 4.1 Structure

```
frontend/
├── app/
│   ├── page.tsx                  # birth-details input form
│   ├── chart/[id]/page.tsx       # chart display page
│   └── layout.tsx
├── components/
│   ├── BirthDetailsForm.tsx      # DOB / time / place + name, gender, parent name, contact, family details
│   ├── ChartStyleSelector.tsx    # choose Tamil / Kerala / North Indian layout + panchangam system + output mode
│   ├── RasiChart.tsx             # renders the South Indian (Tamil) chart grid (standard digital view)
│   ├── HandwrittenChartCanvas.tsx # same chart data, rendered manuscript-style (rough.js + Tamil calligraphic font + paper texture, sepia or colourful theme)
│   ├── NavamsaChart.tsx
│   ├── BhavaPredictions.tsx      # 12-house significations
│   ├── DashaTimeline.tsx         # Dasa-Bhukti drill-down
│   ├── YogaDoshaList.tsx         # yogas + doshas with pariharam notes
│   ├── AshtakavargaTable.tsx     # Bhinna/Sarva-ashtakavarga point grids
│   ├── BabyNameSuggestions.tsx   # Nakshatra/pada-based name shortlist
│   ├── PoruthamForm.tsx          # two-profile marriage-matching input
│   ├── PoruthamResult.tsx        # Ashta Koota + Tamil 10-Porutham results
│   ├── ShareCard.tsx             # WhatsApp-style shareable image card preview
│   └── NarrationPanel.tsx        # optional LLM text output
├── lib/
│   ├── api.ts                    # typed fetch wrapper for the FastAPI backend
│   └── types.ts                  # TypeScript types mirroring backend Pydantic schemas
└── package.json
```

### 4.2 Data flow

1. User fills `BirthDetailsForm` (date, time, place — with a place autocomplete, e.g. via a geocoding API called from the backend to avoid exposing keys client-side).
2. Form calls `POST /api/charts/generate` through `lib/api.ts`.
3. Response is rendered into `RasiChart`/`HandwrittenChartCanvas`, `NavamsaChart`, `BhavaPredictions`, and `DashaTimeline` (each a pure presentational component driven by the same typed chart JSON — the handwritten view and the plain digital view are just two renderers of one data source).
4. `NarrationPanel` calls `/api/narration` with the chart ID and displays the Tamil/English reading.
5. A "Download Jathagam" action calls `/api/charts/{id}/export/pdf` to get the handwritten-style, narration-included PDF.
6. A "Share" action calls `/api/charts/{id}/export/share-card` and shows the result in `ShareCard.tsx` for sharing outside the app.

### 4.3 Type sharing

Keep `lib/types.ts` in sync with the backend's Pydantic schemas — either by hand or by generating TypeScript types from the FastAPI OpenAPI schema (e.g. `openapi-typescript`) as a build step, so frontend and backend never drift apart on the chart JSON shape.

## 5. Data Model (if persisting profiles)

```
Profile
├── id
├── name
├── gender
├── date_of_birth
├── time_of_birth
├── place_name
├── latitude
├── longitude
├── timezone
├── parent_name (optional)
├── personal_details (optional, free text)
├── phone (optional)
├── email (optional)
├── family_details (optional, free text)
└── created_at

Chart
├── id
├── profile_id (FK)
├── chart_json (full computed output — basic details, charts, bhava, dasha, yogas, doshas, ashtakavarga — cached so it isn't recomputed every view)
└── computed_at

MatchResult (Porutham)
├── id
├── profile_id_boy (FK)
├── profile_id_girl (FK)
├── result_json (Ashta Koota + Tamil 10-Porutham breakdown)
└── computed_at
```

## 6. Tamil Localization

Since the product is built for Tamil-speaking users, localization is a first-class concern, not an afterthought:

- **UI language**: multi-language, with **Tamil and English as the primary/main languages**, defaulting to Tamil with an English toggle. Use `next-intl` or `next-i18next` for translation strings rather than hardcoding text, so more languages can be added later.
- **Chart terminology in Tamil**: Rasi names (மேஷம், ரிஷபம், மிதுனம் ...), Nakshatra names (அசுவினி, பரணி ...), planet names (சூரியன், சந்திரன், செவ்வாய் ...), and Dasha lord names should all have a Tamil label alongside the Sanskrit/English one. Store this as a lookup table (`backend/app/data/tamil_labels.py` or a shared JSON consumed by both frontend and backend) so labels stay consistent everywhere they're rendered.
- **Panchangam system (user-selectable)**: support **both Thirukkanitham and Vakhyam** conventions rather than hardcoding one — expose it as a `panchangam_system` option on chart generation, since the two can disagree on nakshatra/thithi boundaries for a given birth moment.
- **Chart drawing style (user-selectable)**: support Tamil/South Indian, Kerala, and North Indian layouts via `chart_style.py` — same computed planet positions, different traditional grid presentation.
- **Place input**: birth-place autocomplete should handle Tamil Nadu town/village names well (including Tamil-script input), not just major cities.
- **Date/number formatting**: Tamil calendar month names (சித்திரை, வைகாசி, ...) can optionally be shown alongside the Gregorian date on the chart display.
- **Fonts**: ensure a Tamil Unicode font (e.g. Noto Sans Tamil) is loaded in the Next.js app so chart labels render correctly on all devices.

## 7. Non-functional notes

- **Accuracy is the product.** Any bug in the ephemeris/timezone/DST handling produces a wrong chart; add tests comparing output against known reference charts (e.g. Jagannatha Hora or existing Tamil panchangam calculators) for a set of fixed birth details.
- **Timezone/DST correctness** for historical dates is the most common source of chart errors — resolve timezone from place + date (not just current offset) using a library like `timezonefinder` + `pytz`/`zoneinfo`.
- **Caching**: cache computed charts per profile so repeated views don't recompute ephemeris data.
- **Narration is text-only interpretation of correct data** — cache it per chart (like the chart itself) so it isn't regenerated on every view, and keep it in a Tamil-first tone consistent with the rest of the product.
- **Handwritten-style rendering is presentation-only** — it consumes the same validated chart JSON as the plain digital view, so a rendering bug there can never produce an inaccurate chart, only an ugly one.
- **Baby names are a curated lookup, not a model** — the Nakshatra/pada → starting-syllable mapping is a fixed traditional table; an LLM can optionally suggest actual names *from* that syllable constraint, but must not be allowed to invent the syllable rule itself.
- **Single-page mode** is a subset view (Lagnam/Rasi/Nakshatram + Rasi Kattam + current Dasa only) computed from the same full chart, not a separately computed "lite" chart — this avoids the two modes ever disagreeing.
- **Competitor reference**: ICS Software and Prokerala.com are useful references for feature parity and page layout conventions, but treat their exact wording/UI as reference only, not something to copy directly. **JyothishaDeepthi** (Kerala/Malayalam) is a useful third reference confirming Kerala astrology is its own tradition — its own calendar references and Ayanamsha/Dasa conventions — not just a Tamil app relabeled in Malayalam.

## 8. MVP Scope & Key Risks

Two calculation systems, three chart styles, and full multilingual narration is a lot to build and verify at once. If you're working to a tight timeline, these scope calls keep the product accurate rather than fast-but-wrong:

- **Thirukanitham vs Vakhyam**: treat **Thirukanitham** (drik-ganita, what most modern engines/APIs implement out of the box) as the primary, fully-verified system. Ship **Vakhyam** as a clearly-labeled secondary mode using the closest available approximation, with a visible note that it's a first pass pending refinement — the two systems can genuinely disagree by up to about a day on tithi/nakshatra transitions, so never silently blend or fake the difference.
- **Kerala & North Indian styles**: the **chart-rendering differences** (box vs diamond layout) are a frontend/SVG task and fully achievable early. Deep Kerala-specific Dasa/Varga calculation conventions are a heavier lift — it's reasonable to default Kerala calculations to the standard Vedic engine while still using the authentic Kerala visual style, and treat true Kerala-specific calculation rules as a later refinement.
- **Accuracy validation is non-negotiable**: before launch, spot-check 3–5 known birth charts against Prokerala's free output and reconcile any discrepancies. A wrong Rasi, Nakshatra, or dosha is a credibility-ending bug for this category of product — this check should never get squeezed out by feature work.
- **Timezone/DST edge cases** for older birth dates and ambiguous place names are a common, hard-to-notice source of silent errors — test this path early, since it silently breaks everything computed downstream.
- **LLM scope creep**: keep the LLM strictly on narrative generation (readings, dosha explanations, name suggestions from a given syllable set) — never let it touch calculation, even under time pressure.
- **Ephemeris data & licensing**: use the free, full-precision Swiss Ephemeris `.se1` files (not Moshier mode — it saves a small download but doesn't change the license). Resolve the AGPL-vs-commercial-license decision (see §2 Tech Stack) early since it gates whether the backend can stay closed-source.
