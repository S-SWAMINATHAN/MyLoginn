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
