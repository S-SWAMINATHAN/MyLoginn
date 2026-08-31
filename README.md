# AI Jathagam Generator | தமிழ் வேத ஜோதிட ஜாதகம்

> **High-precision Vedic astrology birth-chart (Jathagam) generator with deterministic Swiss Ephemeris calculations, traditional Tamil manuscript rendering, and AI narration.**

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Engine-Swiss%20Ephemeris%20%2B%20PyJHora-gold?style=flat-square" alt="Swiss Ephemeris" />
  <img src="https://img.shields.io/badge/Ayanamsha-Lahiri%20(Chitrapaksha)-6b1426?style=flat-square" alt="Lahiri" />
  <img src="https://img.shields.io/badge/License-AGPL%20%2F%20Commercial-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-d4af37?style=flat-square" alt="Version" />
</p>

```
ௐ ஸ்ரீ கணபதயே நமஹ

┌─────────────────────┐        ┌──────────────────────────────┐        ┌────────────────────┐
│   Next.js Frontend   │ ─────► │        FastAPI Backend        │ ─────► │  External Services  │
│   (TypeScript)       │ ◄───── │  Swiss Ephemeris / PyJHora   │ ◄───── │  Geocoding + LLM   │
└─────────────────────┘        └──────────────────────────────┘        └────────────────────┘
         │                                │                                   │
         ├── Birth form + place            ├── Chart computation               ├── Geocoding (Nominatim)
         ├── Rasi/Navamsa canvas           ├── Dasha / Yoga / Dosha            ├── Timezone (timezonefinder)
         ├── Manuscript renderer           ├── Ashtakavarga / Porutham         └── Narration (Claude/OpenAI)
         └── PDF / Share-card export      └── SQLite / Postgres persistence
```

**Core principle:** Chart computation is *deterministic astronomy* — never an LLM. The LLM only narrates an already-correct chart in words. Every planetary position, house, nakshatra, dasha date, yoga/dosha and porutham score is traceable to a `pyswisseph` / PyJHora call.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Architecture Overview](#architecture-overview)
5. [Quick Start](#quick-start)
6. [Environment Variables](#environment-variables)
7. [Ephemeris Data Files](#ephemeris-data-files)
8. [API Reference](#api-reference)
9. [Frontend Guide](#frontend-guide)
10. [Data Model](#data-model)
11. [Testing](#testing)
12. [Tamil Localization & Chart Styles](#tamil-localization--chart-styles)
13. [Example Output](#example-output)
14. [Production & Ops Notes](#production--ops-notes)
15. [Important Notes & Gotchas](#important-notes--gotchas)
16. [Non-Hallucination Rules](#non-hallucination-rules)
17. [Contributing & Changelog Discipline](#contributing--changelog-discipline)
18. [License & Attribution](#license--attribution)

---

## Features

| # | Capability | Details | Source of Truth |
|---|-----------|---------|-----------------|
| 1 | **Basic Birth Details** பிறப்பு விவரங்கள் | Lagnam, Rasi, Nakshatram + pada, Thithi, Vaaram, Nithya Yogam, Karanam, Paksha, Ayanamsa | `backend/app/services/ephemeris.py:50` |
| 2 | **Core Charts** ஜாதக கட்டங்கள் | Rasi Kattam (D1, 9 Navagrahas × 12 houses) + Navamsam Kattam (D9); extensible to D2–D60 | `backend/app/services/chart_builder.py` |
| 3 | **Bhava Predictions** 12 பாவங்கள் | House-wise significations & predictions for houses 1–12 | `backend/app/services/chart_builder.py` |
| 4 | **Dasa & Bhukti** திசா புக்தி | Full Vimshottari Dasha → 9 Mahadashas → 9 Bhuktis each (81 periods), current-dasha flagged | `backend/app/services/dasha_builder.py` |
| 5 | **Yogas & Doshas** யோகங்கள் / தோஷங்கள் | Gaja Kesari, Hamsa/Bhadra, Neechabhanga Raja Yoga, etc. + Sevvai/Manglik, Kala Sarpa, Pitru, Guru Chandala, Ganda Moola with cancellation rules & pariharam | `backend/app/services/yoga_dosha.py` |
| 6 | **Ashtakavarga** அட்டகவர்க்கம் | Bhinnashtakavarga (7 planets × 12 signs) + Sarvashtakavarga; classical invariant sum = **337** | `backend/app/services/ashtakavarga.py` |
| 7 | **Porutham / Matching** பொருத்தம் | Dual engine: North Indian **Ashta Koota (36-pt)** + South Indian **Tamil 10-Porutham** with Rajju & Vedha dosha detection | `backend/app/services/porutham.py` |
| 8 | **Handwritten-Style Rendering** | `rough.js` sketch strokes + Kavivanar / Caveat calligraphic fonts + palm-leaf (ஓலைச்சுவடி) texture | `frontend/components/HandwrittenChartCanvas.tsx` |
| 9 | **AI Narration** | Chart JSON → Tamil/English reading (summary, current dasa, yogas/doshas, career, marriage, health) — cached per chart | `backend/app/services/llm_narration.py` |
| 10 | **Baby Name Suggestions** | Nakshatra/pada → starting-syllable → curated name list (lookup table, not LLM-invented) | `backend/app/services/baby_names.py` |
| 11 | **Regional Chart Styles** | Tamil (fixed-sign squares), Kerala, North Indian (diamond) — **rendering-only**, same computed data | `backend/app/services/chart_style.py` |
| 12 | **Panchangam System** | `thirukkanitham` (drik-siddha, primary) / `vakhyam` selector | `backend/app/services/ephemeris.py:50` |
| 13 | **Output Modes** | `full` (every section) vs `single_page` (Lagnam/Rasi/Nakshatram + Rasi Kattam + current Dasa) | `backend/app/models/schemas.py:157` |
| 14 | **Exports** | Print/PDF (handwritten-style rasterized) + WhatsApp-style shareable PNG card | `frontend/components/ShareCard.tsx` |
| 15 | **Profiles & Persistence** | Save birth intake (name, gender, parent, phone, email, family details) + cached charts & match results | `backend/app/models/db_models.py` |

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Backend** | **FastAPI** (Python 3.11+) + Pydantic v2 + SQLAlchemy | `backend/requirements.txt:1` |
| **Chart engine** | **PyJHora + `pyswisseph` 2.10.3.2**, Lahiri ayanamsa | Sub-arcsecond, JPL DE431/441-derived `.se1` files |
| **Geocoding / TZ** | `httpx` + `timezonefinder` 6.5 + `pytz` | Place → lat/lon/tz, historical DST-correct |
| **Database** | **SQLite** locally (`backend/jathagam.db`), **PostgreSQL** in prod | `backend/app/db/session.py:1` |
| **Frontend** | **Next.js 14** (App Router) + TypeScript + Tailwind CSS | `frontend/package.json:14` |
| **Manuscript renderer** | `roughjs` 4.6 + `html2canvas` + `jspdf` + `canvas-confetti` | `frontend/package.json:15` |
| **Icons / styling** | `lucide-react`, `clsx` + `tailwind-merge`, Noto Sans Tamil, Kavivanar, Cinzel, Caveat | `frontend/tailwind.config.ts:11` |
| **Testing** | `pytest` 8+ | `backend/tests/test_calculations.py:1` |

---

## Repository Structure

```
ai-ja/
├── AGENTS.md                        # Agent operating guide + non-hallucination rules + prod architecture
├── jathagam-architecture.md         # Full product & system architecture (source of truth for design)
├── Sharmela_Jathagam.md             # Reference rendered Jathagam (Udumalaippettai 2002-08-26) — example output
├── ephe/                            # Swiss Ephemeris data files (tracked, ~30 MB)
│   ├── sepl_18.se1                  # Planets 1800–2400  (core Navagrahas)
│   ├── semo_18.se1                  # Moon 1800–2400     (Rasi / Nakshatra / Dasha)
│   ├── seas_18.se1                  # Asteroids / nodes  (Rahu/Ketu)
│   └── sefstars.txt                 # Fixed star catalog
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS + router mount                          :14
│   │   ├── core/config.py           # Settings (PROJECT_NAME, DB URL, EPHE_PATH, CORS)          :8
│   │   ├── db/session.py            # SQLAlchemy engine / SessionLocal / Base / get_db          :1
│   │   ├── models/
│   │   │   ├── schemas.py           # All Pydantic request/response schemas                     :1
│   │   │   └── db_models.py         # ORM: Profile, Chart, MatchResult                          :1
│   │   ├── api/
│   │   │   ├── charts.py            # POST /charts/generate + GET /charts/{id}/*               :16
│   │   │   ├── profiles.py          # POST/GET /profiles                                        :1
│   │   │   ├── porutham.py          # POST /porutham (dual matching)                            :1
│   │   │   └── narration.py         # POST /narration (LLM reading)                             :1
│   │   └── services/
│   │       ├── geocode.py           # place → lat/lon/tz (resolve_place)
│   │       ├── ephemeris.py         # JD + sidereal positions + Lagna + Panchangam              :1
│   │       ├── chart_builder.py     # Rasi/Navamsa kattams + Bhava predictions
│   │       ├── dasha_builder.py     # Vimshottari Dasha-Bhukti-Antara timeline
│   │       ├── yoga_dosha.py        # Yogas (raja_yoga) + Doshas (dosha.py) detection
│   │       ├── ashtakavarga.py      # Bhinna + Sarva tables (sum=337 invariant)
│   │       ├── porutham.py          # Ashta Koota + Tamil 10-Porutham + Rajju/Vedha
│   │       ├── baby_names.py        # Nakshatra/pada → syllable → curated names
│   │       ├── chart_style.py       # Tamil / Kerala / North-Indian layout (rendering only)
│   │       ├── tamil_labels.py      # SA/TA/EN label lookup (shared frontend+backend)
│   │       └── llm_narration.py     # Chart JSON → prompt → Tamil/EN narration (cached)
│   ├── tests/
│   │   └── test_calculations.py     # Unit + accuracy regression suite (6 tests)                :1
│   ├── jathagam.db                  # Dev SQLite DB (gitignored in prod)
│   └── requirements.txt             # Python deps                                               :1
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # Root layout + metadata                                    :1
│   │   ├── page.tsx                 # Birth form → chart display (single-page flow)             :1
│   │   ├── porutham/page.tsx        # Porutham matching page                                    :1
│   │   └── globals.css              # Tailwind base + palm-leaf / gold theme
│   ├── components/
│   │   ├── BirthDetailsForm.tsx     # DOB/time/place + intake fields + panchangam/chart selectors
│   │   ├── RasiChart.tsx            # Standard digital Rasi grid
│   │   ├── NavamsaChart.tsx         # Navamsa (D9) grid
│   │   ├── HandwrittenChartCanvas.tsx # Manuscript renderer (rough.js + calligraphy + texture)
│   │   ├── PlanetaryTable.tsx       # 9-planet degree/house/nakshatra table
│   │   ├── DashaTimeline.tsx        # Expandable Vimshottari timeline
│   │   ├── BhavaPredictions.tsx     # 12-house cards
│   │   ├── YogaDoshaList.tsx        # Yogas/doshas with pariharam notes
│   │   ├── AshtakavargaTable.tsx    # Bhinna/Sarva grids
│   │   ├── BabyNameSuggestions.tsx  # Nakshatra-based names
│   │   ├── NarrationPanel.tsx       # AI reading display
│   │   ├── PoruthamForm.tsx / PoruthamResult.tsx
│   │   ├── ShareCard.tsx            # PNG export preview
│   │   └── Header.tsx               # Nav + language toggle (ta/en)
│   ├── lib/
│   │   ├── api.ts                   # Typed fetch wrapper (NEXT_PUBLIC_API_URL)                 :1
│   │   └── types.ts                 # TS interfaces mirroring Pydantic schemas                  :1
│   ├── tailwind.config.ts           # Temple/parchment palette + Tamil fonts                    :1
│   ├── next.config.js
│   └── package.json                 # pnpm, Next 14, roughjs, jspdf, etc.                      :1
├── .agents/skills/jathagam-vedic-astrology/
└── .claude/skills/jathagam-vedic-astrology/SKILL.md  # Reusable domain skill for agents
```

---

## Architecture Overview

### Request flow — chart generation

```
1. Browser: BirthDetailsForm collects DOB / TOB / place (+ panchangam_system, chart_style, output_mode)
        │
2. POST /api/charts/generate  {date_of_birth, time_of_birth, place, panchangam_system, chart_style, output_mode}
        │
3. geocode.resolve_place()        → lat / lon / IANA timezone (timezonefinder, DST-correct)
        │
4. ephemeris.get_julian_day()     → UTC Julian Day  (pytz-localized → swe.julday)
        │
5. ephemeris.compute_planetary_positions()  → Lahiri sidereal longitudes via pyswisseph (SE_EPHE_PATH)
        │   Lagna (swe.houses_ex), 8 bodies (Sun–Saturn + Rahu) + Ketu (Rahu+180°),
        │   nakshatra/pada, Thithi, Vaaram, Nithya Yogam, Karanam, Ayanamsa
        │
6. chart_builder.build_rasi_and_navamsa_kattams()  + calculate_bhava_predictions()
7. dasha_builder.calculate_vimshottari_dasha()      → 9×9 timeline from Moon's nakshatra
8. yoga_dosha.detect_yogas() / detect_doshas()      → BPHS-cited rules, cancellation applied
9. ashtakavarga.calculate_ashtakavarga()             → Bhinna + Sarva (sum=337)
10. baby_names.get_baby_name_suggestions()            → syllable lookup
11. llm_narration.generate_chart_narration()          → chart JSON → Tamil/EN text (cached)
        │
12. Persist: Profile + Chart(chart_json, narration_json)  → SQLite/Postgres
13. Return: ChartResponse (basic_details, planets, rasi_kattam, navamsa_kattam, bhavas,
           vimshottari_dasha, yogas, doshas, ashtakavarga, baby_names, narration)
        │
14. Frontend: RasiChart / NavamsaChart / PlanetaryTable / DashaTimeline / … render same JSON.
    HandwrittenChartCanvas is an alternate renderer — never a separate data source.
```

### Module → Jathagam section map

| Jathagam section | Backend service | PyJHora / classical reference |
|----------------|---------------|-------------------------------|
| Rasi / Navamsa / D2–D60 | `chart_builder.py` | `horoscope/chart/charts.py` |
| Bhava predictions | `chart_builder.py` | `horoscope/chart/house.py` |
| Dasa & Bhukti | `dasha_builder.py` | Vimshottari dasha module |
| Yogas | `yoga_dosha.py` | `horoscope/chart/raja_yoga.py` |
| Doshas | `yoga_dosha.py` | `horoscope/chart/dosha.py` |
| Ashtakavarga | `ashtakavarga.py` | Ashtakavarga module |
| Porutham | `porutham.py` | `horoscope/match/compatibility.py` (Ashta Koota + Tamil 10) |
| Baby names | `baby_names.py` | Custom lookup table (Nakshatra/pada → syllable), not PyJHora |
| Chart style | `chart_style.py` | Rendering-layer only |

---

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node 18+** + **pnpm** (`npm i -g pnpm`)
- Swiss Ephemeris files already in `ephe/` (committed). If missing, see [Ephemeris Data Files](#ephemeris-data-files).

### 1 — Backend

```powershell
# From repo root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

# Point ephemeris (defaults to ./ephe if SE_EPHE_PATH not set)
$env:SE_EPHE_PATH = "$PWD\ephe"
# Or set DATABASE_URL for Postgres:
# $env:DATABASE_URL = "postgresql+psycopg2://user:pass@localhost:5432/jathagam"

# Run API (reload, port 8000, docs at /docs)
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
# Health check
curl http://127.0.0.1:8000/api/health
```

Expected health response:

```json
{"status":"healthy","service":"AI Jathagam Generator","version":"1.0.0","ephemeris_path":"E:\\ai-ja\\ephe"}
```

### 2 — Frontend

```powershell
cd frontend
pnpm install

# Point frontend at backend (defaults to http://127.0.0.1:8000/api)
# Create frontend/.env.local if needed:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm start    # serve production build
```

### 3 — First chart (smoke test)

```powershell
curl -X POST http://127.0.0.1:8000/api/charts/generate `
  -H "Content-Type: application/json" `
  -d '{\"date_of_birth\":\"1996-08-15\",\"time_of_birth\":\"07:00:00\",\"place\":\"Coimbatore, Tamil Nadu, India\",\"panchangam_system\":\"thirukkanitham\",\"chart_style\":\"tamil\",\"output_mode\":\"full\"}'
```

---

## Environment Variables

### Backend (`backend/app/core/config.py:8`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `SE_EPHE_PATH` | `<repo>/ephe` | Absolute path to `.se1` + `sefstars.txt` files; passed to `swe.set_ephe_path()` |
| `DATABASE_URL` | `sqlite:///<repo>/backend/jathagam.db` | SQLAlchemy URL; use `postgresql+psycopg2://…` in staging/prod |
| `OPENAI_API_KEY` | `""` | For LLM narration (OpenAI path) |
| `ANTHROPIC_API_KEY` | `""` | For LLM narration (Claude path) |
| `CORS_ORIGINS` | `localhost:3000, 3001, 127.0.0.1:3000, *` | Allowed frontend origins |

### Frontend

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000/api` | Base URL for all `lib/api.ts` fetches |

> All secrets via env / secret manager — never committed. See `AGENTS.md §3.3 Security`.

---

## Ephemeris Data Files

Full-precision Swiss Ephemeris files (JPL DE431/441-derived, sub-arcsecond) live in `ephe/`. **Do not use Moshier mode** — it saves a small download but does not change the license (AGPL vs commercial applies to the `pyswisseph` code itself either way), so there is no accuracy trade-off worth making.

| File | Covers | Needed for |
|------|--------|-----------|
| `sepl_18.se1` | Planets 1800–2400 | Sun–Saturn |
| `semo_18.se1` | Moon 1800–2400 | Rasi, Nakshatra, Dasha |
| `seas_18.se1` | Asteroids / nodes 1800–2400 | Rahu/Ketu |
| `sefstars.txt` | Fixed star catalog | Star-based yogas if added |

If you need to re-download:

```powershell
mkdir ephe -Force
curl.exe -L -o ephe/sepl_18.se1  https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sepl_18.se1
curl.exe -L -o ephe/semo_18.se1  https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/semo_18.se1
curl.exe -L -o ephe/seas_18.se1  https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/seas_18.se1
curl.exe -L -o ephe/sefstars.txt https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sefstars.txt
```

Set `SE_EPHE_PATH` to the folder containing those four files before starting the backend.

---

## API Reference

Base URL: `http://127.0.0.1:8000/api` (configured via `settings.API_V1_STR` in `backend/app/core/config.py:11`).

Interactive docs when running: `http://127.0.0.1:8000/docs` (Swagger) and `/redoc`.

### Charts

| Method | Path | Purpose | Body / Query | Response |
|--------|------|---------|-------------|----------|
| `POST` | `/api/charts/generate` | Compute a complete Jathagam | `GenerateChartRequest` | `ChartResponse` |
| `GET` | `/api/charts/{id}` | Retrieve a saved chart's full JSON | — | `ChartResponse` |
| `GET` | `/api/charts/{id}/dasha` | Full Dasha-Bhukti-Antara drill-down | — | `{ vimshottari_dasha: [...] }` |
| `GET` | `/api/charts/{id}/yogas-doshas` | Yogas + doshas with descriptions & pariharam | — | `{ yogas, doshas }` |
| `GET` | `/api/charts/{id}/ashtakavarga` | Bhinna + Sarva tables | — | `{ ashtakavarga }` |
| `GET` | `/api/charts/{id}/baby-names` | Nakshatra-based name suggestions | — | `{ baby_names }` |
| `GET` | `/api/health` | Health check | — | `{ status, service, version, ephemeris_path }` |

**`POST /api/charts/generate` — request shape** (`backend/app/models/schemas.py:157`):

```jsonc
{
  "name": "Sharmela",
  "gender": "female",
  "date_of_birth": "2002-08-26",       // YYYY-MM-DD  (required)
  "time_of_birth": "05:05:00",         // HH:MM:SS    (required)
  "place": "Udumalaippettai, Tamil Nadu, India", // (required)
  "latitude": 10.5843,                 // optional — resolved from place if omitted
  "longitude": 77.2458,
  "timezone": "Asia/Kolkata",
  "panchangam_system": "thirukkanitham", // thirukkanitham | vakhyam
  "chart_style": "tamil",              // tamil | kerala | north_indian
  "output_mode": "full",               // full | single_page
  "parent_name": "...",
  "phone": "...",
  "email": "...",
  "personal_details": "...",
  "family_details": "..."
}
```

**Response** (`ChartResponse` in `backend/app/models/schemas.py:175`): `profile_id, name, gender, date_of_birth, time_of_birth, place, latitude, longitude, timezone, panchangam_system, chart_style, output_mode, basic_details, planets[9], rasi_kattam, navamsa_kattam, bhava_predictions[12], vimshottari_dasha[9×9], yogas, doshas, ashtakavarga, baby_names, narration, computed_at`.

### Profiles

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/profiles` | Save a birth+contact profile |
| `GET` | `/api/profiles` | List profiles |
| `GET` | `/api/profiles/{id}` | Retrieve one profile + its chart |

### Porutham (Matching)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/porutham` | Input: two profile IDs **or** direct DOB/TOB/place **or** direct nakshatra+padas → Output: Ashta Koota (36-pt) **and** Tamil 10-Porutham + Rajju/Vedha flags + verdict |

Request accepts three alternative input styles — see `PoruthamRequest` in `backend/app/models/schemas.py:230`.

Example:

```jsonc
// by birth details
{
  "boy_dob": "1996-08-15", "boy_tob": "07:00:00", "boy_place": "Coimbatore, Tamil Nadu, India",
  "girl_dob": "2002-08-26", "girl_tob": "05:05:00", "girl_place": "Udumalaippettai, Tamil Nadu, India"
}
// or by profile IDs
{ "profile_id_boy": 1, "profile_id_girl": 2 }
// or by nakshatra
{ "boy_nakshatra": "Pushya", "boy_pada": 2, "girl_nakshatra": "Ashwini", "girl_pada": 1 }
```

Response: `{ boy_details, girl_details, ashta_koota: {total_points, max_points:36, kutas[8]}, tamil_10_porutham[10], rajju_dosha, rajju_type, vedha_dosha, score_percentage, verdict, verdict_ta, recommendation, recommendation_ta }`.

### Narration

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/narration` | Input: `chart_id` **or** `chart_data` + `language` (`ta`/`en`) → Tamil/English reading |

```jsonc
// POST /api/narration
{ "chart_id": 42, "language": "ta" }
// or
{ "chart_data": { /* ChartResponse JSON */ }, "language": "en" }
```

---

## Frontend Guide

### Pages

- **`/` (`frontend/app/page.tsx:1`)** — Single-page Jathagam flow:
  `BirthDetailsForm` → `POST /api/charts/generate` via `lib/api.ts:5` → render `RasiChart` + `NavamsaChart` side-by-side → `PlanetaryTable` → `DashaTimeline` → `BhavaPredictions` (full mode) → `YogaDoshaList` → `AshtakavargaTable` (full mode) → `BabyNameSuggestions` → `NarrationPanel` → `ShareCard` + Print/PDF button (calls `window.print()`; PDF rasterization via `html2canvas`+`jspdf`).
- **`/porutham` (`frontend/app/porutham/page.tsx:1`)** — Matching flow:
  `PoruthamForm` → `POST /api/porutham` via `lib/api.ts:26` → `PoruthamResult` + `canvas-confetti` on auspicious matches.

### Key components

All in `frontend/components/` — each is a **pure presentational component** driven by the same typed `ChartResponse` JSON. The handwritten view and the plain digital grid are two renderers of one data source.

| Component | Role |
|-----------|------|
| `RasiChart.tsx` | South Indian fixed-sign grid |
| `NavamsaChart.tsx` | D9 grid |
| `HandwrittenChartCanvas.tsx` | Manuscript renderer (rough.js strokes, calligraphy, palm-leaf texture) |
| `PlanetaryTable.tsx` | 9-planet degree/house/nakshatra/status |
| `DashaTimeline.tsx` | Expandable Mahadasha → Bhukti drill-down |
| `BhavaPredictions.tsx` | 12-house signification cards |
| `YogaDoshaList.tsx` | Yogas/doshas + pariharam notes |
| `AshtakavargaTable.tsx` | Bhinna/Sarva matrices |
| `NarrationPanel.tsx` | Tamil/English AI reading |
| `ShareCard.tsx` | Exportable image preview (`html2canvas`) |

### Type sharing

`frontend/lib/types.ts:1` mirrors `backend/app/models/schemas.py:1`. Keep them in sync — either by hand or by generating TS types from the FastAPI OpenAPI schema (`openapi-typescript`) as a build step so frontend and backend never drift on the chart JSON shape.

### Styling

Tailwind theme (`frontend/tailwind.config.ts:11`):
- `parchment.*` (aged-paper scale), `temple.maroon/gold/saffron/emerald/ink`
- Fonts: `tamil` (Noto Sans Tamil), `script` (Kavivanar), `cinzel`, `caveat`
- Layout order on the chart page: header (name/DOB/place/system) → Rasi+Navamsa side-by-side → planetary table → Dasa-Bhukti timeline → dosha panel → narration → action row (Download PDF, Share card, Baby Names, Check Match) — see `jathagam-architecture.md §3.8`.

---

## Data Model

`backend/app/models/db_models.py:1`, `backend/app/db/session.py:1`:

```
Profile                         Chart                              MatchResult
├── id (PK)                     ├── id (PK)                         ├── id (PK)
├── name                        ├── profile_id (FK → Profile)       ├── profile_id_boy (FK)
├── gender                      ├── panchangam_system               ├── profile_id_girl (FK)
├── date_of_birth               ├── chart_style                     ├── result_json (JSON)
├── time_of_birth               ├── output_mode                     └── computed_at
├── place_name                  ├── chart_json (JSON, full output)
├── latitude / longitude / tz   ├── narration_json (JSON, cached)
├── parent_name                 └── computed_at                     └── computed_at
├── personal_details
├── phone / email
├── family_details
└── created_at ──► charts[]
```

- **SQLite** locally via `check_same_thread=False`; swap `DATABASE_URL` to Postgres for staging/prod (no code change).
- Computed `chart_json` and `narration_json` are cached so repeated views never recompute ephemeris or re-call the LLM.

---

## Testing

```powershell
# All tests
pytest -v
# Single file
pytest backend\tests\test_calculations.py -v
# With coverage (if pytest-cov installed)
pytest --cov=backend\app\services backend\tests\ -v
```

**Current suite — `backend/tests/test_calculations.py:1` (6 tests, all passing):**

| Test | What it validates |
|------|-------------------|
| `test_ephemeris_reference_chart_coimbatore` | Geocode (Coimbatore → 11.02/76.96/Asia/Kolkata) + JD range + ayanamsa + Sun in Karkataka Ashlesha + Moon in Simha Magha Pada 3 + basic_details invariants |
| `test_vimshottari_dasha_calculation` | 9 mahadashas, durations (Sat 19y, Mer 17y, Ketu 7y), 9 bhuktis per dasha, from Moon in Pushya |
| `test_ashtakavarga_sum_337` | Sarvashtakavarga sums to exactly **337**, 12 entries per house/sign, 7 Bhinna tables |
| `test_porutham_matching` | Ashta Koota max 36, 8 kutas, Tamil 10 poruthams = 10 items, Rajju mismatch → no dosha, verdict present |
| `test_rajju_dosha_detection` | Same Rajju (e.g. Mrigashirsha + Chitra → Sirasu) correctly flags `rajju_dosha=true` |
| `test_baby_name_lookup` | Pushya Pada 2 → He, Ashwini Pada 1 → Chu, non-empty suggestions |

Accuracy regression runs on every PR touching calculation code — **mismatches block merge** (see `AGENTS.md §3.2 CI/CD Pipeline`).

Lint & type-check (when configured):

```powershell
ruff check backend\         # or ruff / mypy
pnpm --dir frontend lint    # eslint + tsc
```

---

## Tamil Localization & Chart Styles

- **UI language**: Tamil primary, English toggle via `Header` — `next-intl` / `next-i18next` ready; Tamil rendered with Noto Sans Tamil + Kavivanar.
- **Terminology**: every planet/rasi/nakshatra/yoga/dosha carries `name` + `name_ta` + `name_sa` via `backend/app/services/tamil_labels.py` (shared JSON so labels stay consistent across frontend and backend).
- **Panchangam**: `thirukkanitham` (drik-ganita, default, fully verified) vs `vakhyam` — exposed as `panchangam_system` on `POST /api/charts/generate`. They can disagree by ~1 day on tithi/nakshatra boundaries.
- **Chart style**: `tamil` (fixed-sign squares) / `kerala` / `north_indian` (diamond) — **rendering-layer only**, same `rasi_kattam`/`navamsa_kattam` data (see `chart_style.py`). Colour theming follows the style (Tamil: maroon/mustard/deep-green; Kerala: emerald/gold/deep-red; North Indian: saffron/royal-blue/gold).
- **Numerals & dates**: keep Dasa dates and degrees in a clean serif/monospace font even in manuscript mode — handwritten digits erode trust where numbers are the product.
- **Place input**: birth-place autocomplete should handle Tamil Nadu town/village names (including Tamil-script input), not just major cities.

---

## Example Output

A fully worked reference chart ships as **`Sharmela_Jathagam.md`** — Sharmela, 26-08-2002 05:05 IST, Udumalaippettai (10.5843 N, 77.2458 E), Thirukanitham / Lahiri 23.8941°:

- **Lagnam**: Karkataka (Cancer) 21°47′ Pushya Pada 3
- **Rasi**: Meena (Pisces), **Nakshatram**: Uttara Bhadrapada Pada 3
- **Highlights**: Hamsa Yoga (exalted Jupiter in 1st), Bhadra + Budhaditya Yoga (exalted Mercury in 3rd), Neechabhanga Raja Yoga (debilitated Venus cancelled by exalted Mercury), Rajju in 11th — see the file for the full Rasi/Navamsa ASCII kattams, Dasha timeline (Sani → Budha → **Ketu 2025–2032 current**), yogas/doshas with BPHS sources, Ashtakavarga matrix (strongest: Rishabha 40 / weakest: Meena 22), and life-guidance narration.

Use it as a **golden fixture** for frontend rendering tests (plain view vs manuscript view against identical data) and for spot-checking calculation regressions.

---

## Production & Ops Notes

Derived from `AGENTS.md §3` — the full production architecture lives there; this is a quick reference.

| Concern | Guidance |
|---------|----------|
| **Environments** | `local` (ephe + SQLite/Postgres via Docker + dev LLM key) → `staging` (mirrors prod, runs accuracy suite) → `production` (locked secrets, autoscaling, backups). Promote the same Docker image through stages. |
| **CI/CD** | lint/type-check → unit tests → **accuracy regression suite (blocks merge on mismatch)** → integration tests → Docker + Next build → deploy to staging → smoke test → **manual approval** → prod → `GET /api/health` + one real `POST /api/charts/generate` probe. |
| **Security** | Secrets via env/secret manager; strict Pydantic validation before ephemeris layer; rate-limit `/charts/generate` + `/narration` (the expensive paths); treat Profile PII as personal data (encrypt at rest, user-scoped access, support deletion); JWT short-lived access + refresh tokens. |
| **Observability** | Structured logs with request-id/endpoint/latency/`panchangam_system`/`chart_style` (never full PII in plaintext); metrics on latency & error rate per endpoint + LLM latency/cost; **alert on elevated error rate on `/api/charts/generate`** (likely a calculation bug — highest severity); end-to-end tracing: geocode → ephemeris → chart/dasha/yoga/ashtakavarga → narration. |
| **Scaling** | Cache computed `chart_json` per profile (birth data is immutable — ephemeris is the most CPU-expensive step); cache narration per chart; offload PDF/share-card (Playwright/headless browser) to a background worker/queue; Postgres read replicas if needed — computation itself is stateless & horizontally scalable. |
| **Data governance** | Daily automated Postgres backups with tested restore; document retention/deletion policy; keep `LICENSING.md` for the ephemeris AGPL-vs-commercial decision so it survives team changes. |

---

## Important Notes & Gotchas

Read this before modifying calculation or rendering code.

1. **Ephemeris precision is non-negotiable.** Always use the `.se1` files with `swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED` + `swe.set_sid_mode(swe.SIDM_LAHIRI)`. Moshier mode is *not* a licensing shortcut — it only skips the data download. See `jathagam-architecture.md §2.1` and `backend/app/services/ephemeris.py:55`.

2. **Timezone/DST is the #1 silent-error source.** Resolve timezone from *place + date*, not current offset. Use `timezonefinder` + `pytz`/`zoneinfo` and convert local → UTC → Julian Day via `swe.julday` (`ephemeris.py:35`). Test historical dates explicitly.

3. **Ayanamsa is always Lahiri (Chitrapaksha)** unless a future requirement explicitly adds another — record the value (`~23.8°` for mid-1990s) in `basic_details.ayanamsa_value` for traceability (`schemas.py:24`).

4. **Panchangam system is user-selectable but Thirukanitham is primary.** Vakhyam can disagree by ~1 day on boundaries — never silently blend. Default to Thirukanitham when uncertain and flag the ambiguity in the PR (`AGENTS.md §1.6`).

5. **Chart style never forks data.** `tamil`/`kerala`/`north_indian` is a frontend/SVG layout concern only. `chart_style.py` re-lays the same house data; deep Kerala-specific calculation rules are a future refinement and must be an explicit branch with a comment if added (`AGENTS.md §1.7`).

6. **Baby names are a lookup, not an LLM guess.** The Nakshatra/pada → syllable table is fixed tradition; an LLM may suggest names *from* that syllable, but must never invent the syllable rule itself (`jathagam-architecture.md §7`).

7. **Narration is text-only.** The prompt receives only the already-computed chart JSON; it must never be asked to determine positions or dates. Cache the result per chart. If narration contains a number not traceable to the input JSON, that's a prompt bug (`AGENTS.md §1.3`).

8. **Single-page mode is a subset view**, not a separately computed lite chart — both modes derive from the same full computation so they never disagree (`jathagam-architecture.md §7`).

9. **Ashtakavarga invariant:** Sarva sum across 12 signs must be **337**. Use it as a fast sanity check in tests (`test_calculations.py:84`).

10. **Rajju & Vedha doshas are safety-critical for Porutham.** Same Rajju = *do not recommend*; always surface `rajju_dosha`/`vedha_dosha` prominently in the UI and verdict logic (`porutham.py`).

11. **No unrequested scope creep.** Don't add a new yoga/dosha/UI flag that wasn't asked for — an untested addition in this domain is worse than no addition (`AGENTS.md §1.8`).

12. **CORS in dev is permissive** (`CORS_ORIGINS` includes `"*"` in `core/config.py:14`). Tighten to explicit frontend origins before prod.

13. **Database path:** dev SQLite lives at `backend/jathagam.db` and is created via `Base.metadata.create_all` in `app/main.py:12`. In prod set `DATABASE_URL` to Postgres; no code change needed beyond the env var.

14. **Accuracy validation before launch:** spot-check 3–5 known charts against Prokerala's free output and reconcile every discrepancy — a wrong Rasi/Nakshatra/dosha is a credibility-ending bug (`jathagam-architecture.md §8`).

---

## Non-Hallucination Rules

This product's value is *correct* astrological data. These rules from `AGENTS.md §1` apply to every contributor (human or agent) without exception:

1. Never invent, guess, or approximate any chart value — every value must come from the ephemeris/PyJHora layer.
2. If a required rule isn't implemented, say so and stop — don't fabricate a placeholder.
3. LLM narration may only describe values present in its prompt context.
4. Cite the source of every calculation rule (classical text or PyJHora module/function) in a code comment before merging.
5. Validate against the reference chart set before calling a feature done.
6. When panchangam-system-dependent, default to Thirukanitham and flag the ambiguity.
7. Never mix regional conventions silently — explicit branches with comments only.
8. No unrequested scope creep.

A reusable skill encoding these rules + the module map + Tamil label table lives at `.claude/skills/jathagam-vedic-astrology/SKILL.md` and auto-loads in agent sessions.

---

## Contributing & Changelog Discipline

- Follow **Keep a Changelog** + **Semantic Versioning** — every merged change affecting behavior, calculation logic, or the API contract gets an entry in `AGENTS.md §4 Changelog` (not just releases).
- Link each entry to its PR/commit once in real version control.
- Calculation-code PRs must pass the **accuracy regression suite** — a mismatch blocks merge.
- Validate chart-computation features against the 3–5 reference charts cross-checked with Prokerala before marking done.
- Keep `frontend/lib/types.ts` in sync with `backend/app/models/schemas.py` (or generate from OpenAPI).

Current changelog highlights (`AGENTS.md §4`):

- **1.0.0 — 2026-08-31** — Swiss Ephemeris `.se1` files, `jathagam-vedic-astrology` skill, complete FastAPI engine + full test suite, Next.js + `rough.js` manuscript frontend.
- **0.3.0** — Full intake fields, Panchangam/Chart-style selectors, output modes, baby names, share card.
- **0.2.0** — Tamil localization, handwritten-style rendering, narration promoted to core.
- **0.1.0** — Initial architecture (PyJHora-based engine, Profile/Chart/MatchResult model).

---

## License & Attribution

### Swiss Ephemeris / `pyswisseph` licensing

`pyswisseph` wraps the Swiss Ephemeris C library. You must choose one before going closed-source:

- **(a) AGPL** — free, but the network-use clause covers a live web app, so you must release your backend source.
- **(b) Commercial** — one-time fee to Astrodienst (~USD 500 for one project, ~CHF 1,550 unlimited, valid 99 years) to stay closed-source.
- **(c) Third-party Vedic-astrology calculation API** that has already cleared licensing, paid per request.

The `.se1` data files themselves are a free download (JPL-derived); Moshier mode does not change the license. Document your decision in `LICENSING.md` so it survives team changes.

See `jathagam-architecture.md §2` and `AGENTS.md §3.7` for the full discussion.

### Classical sources

Calculation rules cite Brihat Parashara Hora Shastra (BPHS), Phaladeepika, and other classical texts in code comments adjacent to each rule. When adding new logic, cite the text and verse or the specific PyJHora function it wraps.

### References (not copied)

ICS Software and Prokerala.com are references for feature parity and layout conventions; JyothishaDeepthi is the Kerala-tradition reference. Treat their wording/UI as reference only.

---

<p align="center"><sub>ௐ — Built with Swiss Ephemeris • Lahiri Ayanamsha • BPHS &amp; Phaladeepika • Tamil-first • Deterministic by design.</sub></p>
