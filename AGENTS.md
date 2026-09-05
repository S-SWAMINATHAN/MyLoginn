# AGENTS.md — AI Jathagam Generator: Agent Operating Guide

This file governs any AI coding agent (Claude Code, Cursor, Copilot, or a human following the same rules) working on this repository. It complements `jathagam-architecture.md`, which covers product features and module design — this file covers **how agents must behave while building it**, the **production/ops architecture**, and the **changelog discipline** for the project.

---

## 1. Non-Hallucination Rules (Mandatory)

This product's entire value is *correct* astrological data. A hallucinated planetary position, dasha date, or dosha is a credibility-ending bug, not a cosmetic one. Any agent working on this repo must follow these rules without exception:

1. **Never invent, guess, or approximate** planetary positions, house placements, nakshatra boundaries, dasha/bhukti dates, yoga/dosha presence, ashtakavarga points, or porutham scores. Every such value **must** come from a call into the ephemeris/PyJHora computation layer — never written directly as text, never "filled in" to make a demo look complete.
2. **If a required astrological rule isn't implemented yet, say so explicitly and stop.** Do not silently fabricate a plausible-looking placeholder value to make a PR/feature look finished.
3. **LLM narration must only describe values it was given in its prompt context.** It must never state a planetary position, date, house, or numeric fact that isn't present in the input chart JSON. If the narration output contains a number not traceable to the input, that's a bug in the prompt, not acceptable behavior.
4. **Cite the source of every calculation rule.** New astrological logic must reference a named classical text, a specific PyJHora module/function, or another verifiable reference implementation in a code comment before merging — "this is roughly how I remember dosha rules working" is not sufficient.
5. **Validate before calling it done.** Any chart-computation feature must be checked against the manual accuracy-validation charts (see `jathagam-architecture.md` §8 MVP Scope & Key Risks — 3–5 known charts cross-checked against Prokerala's free output) before being considered complete.
6. **When uncertain which panchangam system applies** (Thirukanitham vs. Vakhyam) to a specific calculation, default to Thirukanitham and **flag the ambiguity** in the PR description — never silently pick one and move on.
7. **Never mix regional chart-style conventions.** If a calculation is genuinely different between Tamil, Kerala, and North Indian traditions (not just layout), implement it as an explicit branch with a comment — don't quietly apply one region's rule everywhere.
8. **No unrequested scope creep from the agent itself** — e.g. don't add a new "feature" (a new yoga, a new UI flag) that wasn't asked for, since an untested addition in this domain is worse than no addition.

---

## 2. Skill Generation Command

To keep every agent session (not just this one) consistent with the rules above, package the domain knowledge into a reusable Skill rather than relying on this file being re-read carefully every time. Run this with Claude's `skill-creator`:

```
Use skill-creator to create a new skill named "jathagam-vedic-astrology" for this repo.

It should trigger whenever an agent is implementing or modifying: chart computation,
dasha/bhukti logic, yoga/dosha detection, ashtakavarga, porutham/matching, panchangam
system selection (Thirukanitham/Vakhyam), regional chart styles (Tamil/Kerala/North
Indian), or LLM narration prompts in this codebase.

The skill body should encode:
- The non-hallucination rules from AGENTS.md §1, verbatim
- The PyJHora module map from jathagam-architecture.md §3.5 (which module backs which
  Jathagam section)
- The Tamil/Sanskrit/English label table (Rasi, Nakshatra, planet names) so terminology
  stays consistent across every file that renders it
- The rule that chart style (Tamil/Kerala/North Indian) is a rendering-layer concern
  only and must never fork the underlying computed data
- A short "before you mark this done" checklist: cited source, validated against
  reference charts, ambiguity flagged if panchangam-system-dependent

Save it to .claude/skills/jathagam-vedic-astrology/SKILL.md so it loads automatically
in future sessions on this repo.
```

Re-run the skill-creator's optimization loop (`scripts/run_loop.py`, see the skill-creator SKILL.md) whenever the skill's description stops reliably triggering on domain-specific tasks.

---

## 3. Deep-Dive Production Architecture

`jathagam-architecture.md` describes what the system does. This section describes what it takes to run it safely in production.

### 3.1 Environments

| Environment | Purpose | Notes |
|---|---|---|
| `local` | Development | Ephemeris files + local Postgres via Docker Compose; LLM calls hit a real API with a low-volume dev key |
| `staging` | Pre-release verification | Mirrors production config; used to run the accuracy-validation chart set before every release |
| `production` | Live traffic | Locked-down secrets, autoscaling, monitoring, backups enabled |

Keep environment parity high (same Docker image promoted through stages) so "works in staging" reliably means "works in production."

### 3.2 CI/CD Pipeline

1. **Lint & type-check** — `ruff`/`mypy` (backend), `eslint`/`tsc` (frontend).
2. **Unit tests** — chart_builder, dasha_builder, yoga_dosha, ashtakavarga, porutham logic in isolation.
3. **Accuracy regression suite** — the 3–5 known reference charts (§8 in the architecture doc) run automatically on every PR that touches calculation code; a mismatch **blocks merge**, it's not a warning.
4. **Integration tests** — full `/api/charts/generate` request → response shape + spot-checked values.
5. **Build & containerize** — Docker image for the backend; Next.js production build for the frontend.
6. **Deploy to staging** → smoke test → **manual approval gate** → **deploy to production**.
7. **Post-deploy health check** — hit `/api/health` and one real `/api/charts/generate` call before marking the deploy successful.

### 3.3 Security

- **Secrets**: ephemeris commercial license key (if purchased), LLM API key, DB credentials, geocoding API key — all via environment variables/secret manager, never committed.
- **Input validation**: strict Pydantic schemas on all endpoints; reject malformed dates/times/places before they reach the ephemeris layer.
- **Rate limiting**: per-IP and per-user limits on `/api/charts/generate` and `/api/narration` (the LLM call is the expensive, abusable one).
- **PII handling**: profiles contain name, DOB, phone, email, family details — treat this as personal data: encrypt at rest, restrict access by user ownership, support account/data deletion.
- **Auth**: JWT-based; short-lived access tokens + refresh tokens if using the self-rolled option from the architecture doc.

### 3.4 Observability

- **Structured logging** on every request (request id, endpoint, latency, panchangam_system/chart_style params used) — but never log full profile PII in plaintext logs.
- **Metrics**: request latency and error rate per endpoint; LLM call latency/cost separately, since it's the most variable-cost path.
- **Alerting**: alert on elevated error rate on `/api/charts/generate` specifically — a spike there likely means a calculation bug, which is the highest-severity failure mode for this product.
- **Tracing**: trace a request end-to-end through geocode → ephemeris → chart_builder → dasha/yoga/dosha/ashtakavarga → (optional) narration, so slow requests are diagnosable by stage.

### 3.5 Testing Strategy

| Layer | What's tested |
|---|---|
| Unit | Each calculation module in isolation, with fixed known inputs/outputs |
| Accuracy regression | Full chart output vs. the reference chart set — run on every calculation-code PR |
| Integration | API contract — request → full response shape |
| Frontend | Component rendering of chart data (including the handwritten-style renderer against the same fixture data as the plain view, to catch rendering-only regressions) |
| E2E | Full user flow: fill form → view chart → download PDF → share card |

### 3.6 Scaling & Performance

- **Cache computed charts** per profile (already in the data model) — ephemeris computation is the most CPU-expensive step and birth data doesn't change.
- **Cache narration text** per chart — an LLM call is the slowest and most expensive step; never regenerate it on every page view.
- **Offload PDF/share-card rendering** to a background worker/queue if traffic grows — headless-browser rendering (Playwright) is heavier than a typical request and shouldn't block the request thread.
- **Read replicas** for Postgres if saved-profile lookups become a bottleneck; chart computation itself is stateless and horizontally scalable.

### 3.7 Data Governance & Backup

- Daily automated Postgres backups, with tested restore procedure (an untested backup is not a backup).
- Retention policy for saved profiles — decide and document how long user data is kept and how deletion requests are honored.
- Keep the ephemeris `.se1` data files and the AGPL-vs-commercial license decision documented in the repo (e.g. a `LICENSING.md`) so it isn't lost as the team changes.

---

## 4. Changelog

This project maintains a changelog following the [Keep a Changelog](https://keepachangelog.com/) convention and [Semantic Versioning](https://semver.org/). Every merged change that affects behavior, calculation logic, or the API contract gets an entry — not just releases.

### [1.4.0] — 2026-09-05
#### Added
- **சம்பூர்ண ஜாதகம் (12-Page Traditional Sampoorana Jathagam Engine & Manuscript)**: Built complete Shastric computation backend (`backend/app/services/sampoorana.py`) computing traditional 60-year Tamil calendar (`பிரபவ`..`அட்சய`), historical eras (சாலிவாகன, கலியுகாதி, கொல்லம், பசலி, ஹிஜ்ரி), Panchanga micro-metrics (நாழிகை, விநாழிகை, தற்பரை, நேத்திரம், ஜீவன், விவாகச்சக்கரம், வாரசூலை & பரிகாரம், யோகினி வாசம்).
- **பஞ்ச பட்சி & எண் கணிதம் (Pancha Pakshi Sastra & Numerology)**: Full Agathiyar Pancha Pakshi Sastra (birth bird, activities, friends, enemies, Padupakshi alert days) and Chaldean Numerology (birth radical number, destiny number, lucky numbers/dates/colors/stones/deity).
- **விம்சோத்தரி தசா கணிதம் & வெண்பா (Dasha Balance Mathematical Metrics & Classical Verses)**: Classical Paramanazhigai (60 நாழிகை), Sentra Nazhigai, Nindra Nazhigai, and 120-year Vimshottari Mahadasha timeline with reigning dasha lord's classical Tamil verse, deity, temple, grain, cloth, flower, and remedy rituals.
- **பாவக ஸ்புடம் & வர்க்க சக்கரங்கள் (Bhava Sphutam & Varga Chakras)**: Complete Sripati 12-Bhava start, madhya, and end longitudes, planetary occupants, and Shodashavarga placements (D1, D2 Hora, D3 Drekkana, D4 Chaturthamsa, D7, D9, D10 Dasamsa, D12, D16, D30, D60).
- **12-பக்க பாரம்பரிய மஞ்சள் பத்திரம் (12-Page Discrete PDF Export)**: Expanded `HandwrittenManuscript.tsx` with all 12 pages rendered discrete and un-sliced in `HandwrittenPdfButton.tsx` with Rough.js hand-drawn kattams, Kavivanar handwritten calligraphy, and traditional Mangala Slokas.

#### Fixed
- **பக்கம் 6 பலன்கள் சரிசெய்தல் (Page 6 Prediction Render Bug Fix)**: Fixed attribute mismatch (`chart.detailed_predictions` → `chart.rasi_nakshatra_predictions`) and introduced guaranteed client-side fallbacks so Rasi-Nakshatra readings, 108 Pada syllables, and Ayurdaya are never blank.
- **திருமணப் பொருத்தம் சர்வர் பிழை சரிசெய்தல் (/porutham Route 500 Fix)**: Cleared stale Next.js build chunks and restored clean HTTP 200 service for `/porutham` and `/match-finder`.

### [1.3.0] — 2026-09-04
#### Added
- **முழுமையான இலவச இருப்பிட API (Dynamic Free Geocoding Engine)**: Integrated Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) and OpenStreetMap Nominatim for Unicode Tamil script (`backend/app/services/geocode.py`). Users can resolve any village, town, taluk, district, or global diaspora hub dynamically without any API key. Backed by in-memory LRU caching and instant client-side fallback (`frontend/lib/api.ts`).
- **design-1.html பாரம்பரிய கையெழுத்து பாணி வடிவமைப்பு (Warm Handwritten Parchment Aesthetic)**: Re-styled the entire frontend to strictly match `design-1.html` CSS tokens (`--paper: #f0e5cc`, `--ink: #2b2117`, `--ink-soft: #6f6049`, `--red: #b03726`, `--red-deep: #8e2b1c`), SVG fractal noise grain and subtle aging edge vignettes, traditional masthead with **ஸ்ரீ** header and hand-drawn facts box, hand-drawn wobbly cards (`.hand-card`), hand-ruled tables (`.table-hand`), and Kavivanar & Caveat typography.
- **அனைத்துக் கூறுகளும் புதுப்பிக்கப்பட்டன (Full Component Restyling)**: All horoscope and matching cards (`BirthDetailsForm`, `PanchangamDetailsCard`, `PlanetaryTable`, `RasiChart`, `NavamsaChart`, `BhavaPredictions`, `AshtakavargaTable`, `AyurdayaCard`, `DashaTimeline`, `YogaDoshaList`, `BabyNameSuggestions`, `NarrationPanel`, `ShareCard`, `PoruthamForm`, `PoruthamResult`, `StarMatchFinder`) styled to the warm parchment aesthetic while retaining 100% of mathematical computation and features.

### [1.2.0] — 2026-09-04
#### Added
- **ஆயுள் கணிதம் (Ayurdaya / Longevity Determination)**: Classical Parashara/Jaimini Three Pairs mobility method (`backend/app/services/ayurdaya.py`), 8th house lord/sign/occupants analysis, Ayushkaraka Saturn dignity and retrograde status, Maraka (2 & 7) and Badhaka analysis, 8th house Ashtakavarga bindus, and classical remedies (`Maha Mrityunjaya`, `Thirukkadaiyur`, `Ayush Homam`).
- **விரிவான பலன்கள் (Detailed Rasi, Nakshatra & Lagna Predictions)**: Deep astrological readings (`backend/app/services/rasi_nakshatra.py`) citing Phaladeepika, Brihat Jataka, and Jathaka Alankaram for 12 signs, 27 nakshatras, and specific pada effects.
- **குழந்தை பெயர் சூட்டுதல் (Authentic 108 Pada Nama Aksharas)**: Replaced corrupt syllable strings with authentic Tamil & English phonetic initial syllables for all 108 Nakshatra-Padas (`backend/app/services/baby_names.py`).
- **திருமணப் பொருத்த விரிவு (Enhanced 10-Porutham & Match Finder)**: Enriched star match finder with expandable row details showing all 10 Tamil Poruthams and 8 Ashta Koota points, plus quick filter chips (Uthama, Rajju Safe, 8+ Matched, 5-Star).
- **இருப்பிடத் தேர்வு (Searchable Location Picker)**: Complete database of all 38 Tamil Nadu districts, major temple towns, Indian cities, and global diaspora hubs (`frontend/components/LocationPicker.tsx`) with instant search, category tabs, and custom coordinate support.
- **பாரம்பரிய மஞ்சள் பத்திரம் (8-Page Traditional Handwritten Manuscript & PDF)**: Authentic Tamil yellow turmeric parchment layout (`frontend/components/HandwrittenManuscript.tsx`) with **"ஸ்ரீ ராமஜெயம்"** banner, Kavivanar handwriting font, rough.js drawn kattams, and discrete page-by-page rendering in `HandwrittenPdfButton.tsx` completely eliminating text-slicing across PDF page breaks.

### [1.1.0] — 2026-09-01
#### Added
- Enhanced Lagnam (Ascendant) calculations: DMS string formatting, Lagnathipathi (லக்னாதிபதி), Lagna Star (லக்ன நட்சத்திரம்), Star Lord (நட்சத்திராதிபதி), Pada, and Navamsa Lagna
- Full canonical Tamil Panchangam Subha Yoga (சித்த யோகம், அமிர்த யோகம், மரண யோகம்) lookup matrix derived from Vaaram (Day) + Janma Nakshatra
- Complete 27 Nakshatra astrological attributes: Ganam, Yoni (gender + animal), Rajju (5 types), Bootham (Pancha Bhoota), Nadi (3 types), Vriksham (Tree), Pakshi (Bird), and Mirugam (Animal)
- High-precision Swiss Ephemeris JPL DE431/441 sunrise (`swe.CALC_RISE`), sunset (`swe.CALC_SET`), Dinamani (day duration), Ratrimana (night duration), Udhayadhi Nazhigai & Vinazhigai at birth, Rahu Kalam, Yamagandam, and Kuligai Kalam
- Multi-Year automated test suite (`backend/tests/test_accuracy_multiyear.py`) validating charts across 1950, 1985, 1996, 2004, 2015, 2024, and 2026 epochs
- Dedicated `PanchangamDetailsCard` component for rich Section 2 presentation on frontend

#### Fixed
- Fixed critical Tithi string slicing bug in `backend/app/services/ephemeris.py` that produced corrupted outputs like `"aksh பஞ்சமி"`, restoring clean `"வளர்பிறை பஞ்சமி"` / `"தேய்பிறை பஞ்சமி"`

### [1.0.0] — 2026-08-31
#### Added
- Full Swiss Ephemeris data files (`sepl_18.se1`, `semo_18.se1`, `seas_18.se1`, `sefstars.txt`) in `ephe/`
- `jathagam-vedic-astrology` skill registered in `.claude/skills/` and `.agents/skills/`
- Complete FastAPI backend calculation engine (`ephemeris`, `chart_builder`, `dasha_builder`, `yoga_dosha`, `ashtakavarga`, `porutham`, `baby_names`, `chart_style`, `llm_narration`)
- Full test suite in `backend/tests/test_calculations.py` with 100% passing tests
- Next.js TypeScript frontend configured with `pnpm`, `rough.js` manuscript rendering, palm-leaf textures, Tamil/English localization, and full responsive UI

### [0.3.0] — Requirement intake alignment
#### Added
- Full intake fields (name, gender, parent name, personal/family details, phone, email) in the Profile model
- Panchangam system selector (Thirukanitham / Vakhyam)
- Regional chart style selector (Tamil / Kerala / North Indian)
- Output modes (single-page / full)
- Baby name suggestions feature
- Shareable image card export
- MVP Scope & Key Risks section (accuracy validation, timezone/DST, licensing, LLM scope boundaries)

#### Changed
- Corrected ephemeris guidance: use full `.se1` data files, not Moshier mode — licensing is identical either way, so there's no reason to trade away accuracy

### [0.2.0] — Localization & handwritten style
#### Added
- Tamil localization section (UI language, Tamil terminology labels, font requirements)
- Handwritten-style manuscript rendering (`rough.js` + calligraphic fonts + paper texture)
- Narration promoted from optional to a core feature

### [0.1.0] — Initial architecture
#### Added
- FastAPI backend / Next.js TypeScript frontend structure
- PyJHora-based chart engine covering Rasi/Navamsa, Dasha-Bhukti, Yogas/Doshas, Ashtakavarga, Porutham
- Initial data model (Profile, Chart, MatchResult)

---

*When adding a changelog entry, date it and link it to the PR/commit once this lives in real version control — this template omits dates/links since it's tracking design decisions made in planning, not shipped code yet.*
