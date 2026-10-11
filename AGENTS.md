# AGENTS.md — MYLoginn Astrology (AI Jathagam): Agent Operating Guide

This file governs any AI coding agent (Claude Code, Cursor, Copilot, or a human following the same rules) working on this repository. It complements `jathagam-architecture.md`, which covers product features and module design — this file covers **how agents must behave while building it**, the **production/ops architecture**, and the **changelog discipline** for the project.

---

## 1. Non-Hallucination Rules (Mandatory)

**Reference standard (since 3.0.0): Kalai Magal (KKC Astro).** Every calculation this site shares with Kalai Magal must reproduce Kalai Magal's printed output for the same birth data. Where Kalai Magal and another source disagree, Kalai Magal wins, and the difference is documented in §4.

This product's entire value is *correct* astrological data. A hallucinated planetary position, dasha date, or dosha is a credibility-ending bug, not a cosmetic one. Any agent working on this repo must follow these rules without exception:

1. **Never invent, guess, or approximate** planetary positions, house placements, nakshatra boundaries, dasha/bhukti dates, yoga/dosha presence, ashtakavarga points, or porutham scores. Every such value **must** come from a call into the ephemeris/PyJHora computation layer — never written directly as text, never "filled in" to make a demo look complete.
2. **If a required astrological rule isn't implemented yet, say so explicitly and stop.** Do not silently fabricate a plausible-looking placeholder value to make a PR/feature look finished.
3. **LLM narration must only describe values it was given in its prompt context.** It must never state a planetary position, date, house, or numeric fact that isn't present in the input chart JSON. If the narration output contains a number not traceable to the input, that's a bug in the prompt, not acceptable behavior.
4. **Cite the source of every calculation rule.** New astrological logic must reference a named classical text, a specific PyJHora module/function, or the **Kalai Magal reference report it was verified against** (method decoded from printed output, see §4) in a code comment before merging — "this is roughly how I remember dosha rules working" is not sufficient.
5. **Validate before calling it done.** Any chart-computation feature must be checked against the **Kalai Magal reference reports** (anonymised fixtures in `backend/tests/test_kalai_parity.py`) before being considered complete. Prokerala remains a secondary sanity check only. Tolerances: longitudes ±1″, dates exact, tables exact.
6. **When uncertain which panchangam system applies** (Thirukanitham vs. Vakhyam) to a specific calculation, default to Thirukanitham (Kalai Magal's own reports are Thirukanitham) and **flag the ambiguity** in the PR description — never silently pick one and move on.
7. **Never mix regional chart-style conventions.** If a calculation is genuinely different between Tamil, Kerala, and North Indian traditions (not just layout), implement it as an explicit branch with a comment — don't quietly apply one region's rule everywhere.
8. **No unrequested scope creep from the agent itself** — e.g. don't add a new "feature" (a new yoga, a new UI flag) that wasn't asked for, since an untested addition in this domain is worse than no addition. Kalai Magal features listed in §4.3 are *requested* scope.
9. **Kalai Magal source-material rules.**
   - Match Kalai Magal by **comparing outputs** only. Never decompile its executables, never decrypt `Master.mdb` / `CustMaster.mdb`, never copy its prediction/palan text. All prose is written originally.
   - Customer reports and the customer database are **personal data**. Never commit them, never paste them into issues/PRs, never log them. Test fixtures keep only birth date/time/coordinates, with names and family details removed (`REF-001`, `REF-002`, …).
   - A Kalai-derived rule that was decoded from a single report is marked "derived from 1 reference" in its code comment until a second report confirms it.
10. **Parity tests are law.** A failing test in `test_kalai_parity.py` blocks merge. Never edit an expected number to make a test pass; fix the calculation or document a proven Kalai Magal inconsistency in §4.

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

## 4. Kalai Magal Parity Standard

### 4.1 Decoded conventions (verified against REF-001, a Kalai Magal Type-D report)

| Item | Kalai Magal convention | Code |
|---|---|---|
| Ayanamsa | Lahiri; printed value is the true ayanamsa (with nutation) | `ephemeris.py` |
| Rahu/Ketu | Mean node | `ephemeris.py` |
| Sunrise/sunset | Disc centre, **no refraction** (`BIT_DISC_CENTER | BIT_NO_REFRACTION`) | `ephemeris.py` |
| Udhayathi nazhigai | From the civil birth date's sunrise, wrapped for pre-sunrise births; printed to tharparai (0.4 s) | `ephemeris.py` |
| Nakshatra horai | Local sidereal time at birth | `ephemeris.py` |
| Mandi | Lagna at fixed ghatis after sunrise/sunset scaled to actual day/night length (day Su26 Mo22 Tu18 We14 Th10 Fr6 Sa2; night Su10 Mo6 Tu2 We26 Th22 Fr18 Sa14) | `ephemeris.py` |
| Bhava spudam | Sripati: Asc/IC/Desc/MC madhyas, trisected quadrants, sandhis at midpoints | `kalai_report.py` |
| Dasa/bhukti/antharam | Ends anchored to birth date: cumulative years → Y/M/D (12 × 30-day months, floored) → added with 30-day day-carry. Printed age = calendar difference with 30-day borrow. Running dasa lists only periods ending after birth | `dasha_builder.py` |
| Ashtakavarga rules | BPHS table with Mars→Venus = 3,5,6,9,11,12 | `ashtakavarga.py` |
| Trikona shodhana | Kalai keeps the minimum of each trikona group | `kalai_report.py` |
| Ekadhipatya | Unequal pair → both smaller; equal pair → 0 only if both signs occupied (Lagna counts) — derived from 1 reference | `kalai_report.py` |
| Pindas | Rasi/graha gunakaram (BPHS 70); guna samooham = BAV + trikona + ekadhi totals; eka samooham = shuddha pindam + guna samooham | `kalai_report.py` |
| Shadbala — sthana | Uchcha = arc from debilitation / 3; saptavargaja D1 D2 D3 D7 D9 D12 D30 (MT 45 in D1 only, compound 22.5/15/7.5/3.75/1.875); kendradi by sign-house | `kalai_shadbala.py` |
| Shadbala — dig | Arc from the weak point (IC/MC/Desc/Asc) / 3 | `kalai_shadbala.py` |
| Shadbala — kala | Natonnata from clock time vs 00:00; paksha (Moon doubled); tribhaga; abda/masa by Kali ahargana; vara = civil weekday lord; hora sequence starts with civil weekday lord, hours since birth-date sunrise (wrapped); ayana from sayana kranti (ε ± k)/2ε × 60, Sun doubled; no yuddha — several derived from 1 reference | `kalai_shadbala.py` |
| Shadbala — cheshta | Mean-element cheshta kendra; Sun and Moon printed 0 | `kalai_shadbala.py` |
| Shadbala — drik | BPHS drishti; special aspects full 60; Mercury malefic when with Sun/Mars/Saturn; sum / 4 | `kalai_shadbala.py` |
| Shodasa varga charts | BPHS schemes for D1 D2 D3 D4 D7 D9 D10 D12 D16 D20 D24 D27 D30 D40 D45 D60 (see `kalai_varga.py` docstring); varga lords 160/160 exact | `kalai_varga.py` |
| Shodasa varga bala | Own 30; compound 22.5/15/7.5/3.75/1.875 with the TEMPORAL relation taken inside each varga chart; Rasi row natural relation only, debilitated 1.875; Rahu/Ketu friends Venus/Saturn, neutral Mercury/Jupiter, enemies Sun/Moon/Mars; Lagna value = varga value of its varga-sign lord; 160/160 exact | `kalai_varga.py` |
| Planet details | Bhava = Sripati bhava; suyam bhava bala % = position between sandhi and madhya; aspects by sign (Mars 4/7/8, Jupiter 5/7/9, Saturn 3/7/10, Rahu/Ketu 7 only, others 7); combust limits Moon 12 Mars 17 Mercury 14 (12 R) Jupiter 11 Venus 10 (8 R) Saturn 15; war winner = brighter planet [1 ref]; class poorna ≥120 %, mathima ≥100 % [1 ref] | `kalai_varga.py` |
| Kalachakra dasa | First dasa = Moon navamsa sign (Savya) or its mirror (7−n) (Apasavya); balance = unelapsed pada × sign years; Savya forward / Apasavya backward; bhukti chain fixed by (direction, dasa sign); verified on 10 reports (signs 100 %, dates 94 %) | `kalai_kalachakra.py` |
| Ephemeris backend | Kalai ships swedll32.dll without .se1 data files → Moshier. `KALAI_EPHEMERIS=moshier` (default) points Swiss Ephemeris at an empty folder; `files` uses `ephe/`. Never set the `SE_EPHE_PATH` environment variable — Swiss Ephemeris lets it override the configured path | `core/config.py` |
| Delta-T | Kalai's old Swiss Ephemeris: modern table before 2011, then ΔT = 0.03524t² − 0.18934t + 64.28915 s (t = year − 2000; ≈84 s in 2026). Applied to every chart via `kalai_ephemeris()` | `ephemeris.py` |
| Time zone | Any fixed offset accepted (`UTC±hh:mm`), as Kalai allows | `ephemeris.get_tz` |
| Time correction | Kalai list: none · DST (+1 h) · 2DST (+2 h) · War Time (+1 h) · DST + War Time (+2 h) | `ephemeris.apply_time_correction` |
| Tamil date (horoscope + converter, 4.4.0) | Surya-Siddhanta TRUE Sun (Kali epoch, 365.258756-d year, 14° epicycle, apogee 79.4°, shift −0.28 d); day 1 when the ingress is before 18:30 IST — 28/28 Kalai dates | `kalai_tamil_calendar.py` |
| Tamil date (old, superseded) | Sun's sidereal ingress; ingress before sunset = day 1; pre-sunrise births belong to the previous day; year cycle from Prabhava = 1987 — 7/10 reports (Aavani/Purattasi 2026 and one DST case start a day later in Kalai: open) | `kalai_tamil_calendar.py` |
| Tamil → English utility | Surya-Siddhanta mean arithmetic: Kali epoch + n × 365.258756 d − 2.5 d, SS month lengths; Pariviruthi k starts 1867 + 60(k − 24) — 3/3 screenshots | `kalai_tamil_calendar.py` |
| KP ayanamsa ("K.P New Comb") | MEAN Lahiri − 41.76″ − 0.0615″/yr (from 2000); 1977, 2019, 2026 prints exact. "KP-Old" = Swiss SIDM_KRISHNAMURTI | `kalai_kp.py` |
| KP cusps / lords | Placidus sidereal cusps; standard 249-sub Vimshottari star/sub/sub-sub lords; house = cusp to next cusp | `kalai_kp.py` |
| KP significators | sig(P) = occupied house + houses whose cusp sign P owns (nodes: occupied only); "by star" = sig(P) ∪ sig(star lord); "by sub" = sig(sub lord) ∪ sig(its star lord); aspects by sign (7th, Mars 4/8, Jupiter 5/9, Saturn 3/10) | `kalai_kp.py` |
| Shadbala — paksha / kala lords (4.1.0) | Paksha benefics: Jupiter, Venus; Moon only in Shukla; Mercury unless with Sun/Mars/Saturn. Ahargana epoch 588466 + 11 days for abda/masa (9 refs). Cheshta: Kalai mean longitudes = J2000 elements + (Mars −1.03°, Mercury +13.10°, Jupiter +1.08°, Venus +3.74°, Saturn −2.36° at J2000, small drift) | `kalai_shadbala.py` |
| Panchapakshi | Birth bird: shukla 1–5 Vulture, 6–11 Owl, 12–16 Crow, 17–21 Cock, 22–27 Peacock; krishna 1–5 Peacock, 6–11 Cock, 12–16 Crow, 17–21 Owl, 22–27 Vulture. Bird tables from 9 reports; Peacock derived (the five birds always do five different activities). Detailed pages: activity cycle + minutes per (paksha, day/night); result = f(main, sub, relation) — relation from the BIRTH paksha's friend list; 500/500 rows | `kalai_panchapakshi.py` |
| Upagraha spudam | Dhuma = Sun + 133°20′ … Upaketu = Indrachapa + 16°40′; Gulika = Mandi; Kala/Mrityu/Ardhaprahara/Yamaghantaka = Mandi ghati table shifted −1/−3/+3/+2 weekdays; 68/68 values | `kalai_upagraha.py` |
| Mandi / neighbouring night (4.3.0) | Night before sunrise = (birth-date sunset − 1 day) → birth-date sunrise; night after sunset = sunset → (birth-date sunrise + 1 day). Mandi now 9/9 reports | `ephemeris.py` |
| Prasthara ashtakavarga | Rows = donors from the planet itself (Sun…Saturn, Lagna cyclic), columns = signs from the planet's sign; 7/7 column-total rows exact | `kalai_report.py` |
| Matching (12 poruthams) | Graded points out of 37 (Dinam 3, Ganam 4, Mahendram 2, Stree Deergham 2, Yoni 4, Rasi 3, Rasi Adhipathi 4, Vasiyam 3, Rajju 5, Vedhai 4, Nadi 2, Varnam 1); ≥ 50 % = பொருத்தம் உண்டு; Sevvai = Mars 2/4/7/8/12 from Lagna (+ cancellations → பரிகார); dasa sandhi = future mahadasa ends < 1 year apart — 3/3 Kalai printouts exact; each row flags [verified] vs [classical] | `kalai_matching.py` |
| Baby names | Chaldean totals (2987/2988 printed names reproduce); date number = digital root of the day, destiny = digital root of the full date; allowed name numbers = Kalai table keyed by (date, destiny) — 9 pairs seen; star letters = classical Tamil nama-nakshatra letters + Kalai bracket extras; "INITIAL.NAME" listed when the total with initials qualifies | `kalai_baby_names.py` |
| KP horary 1–2193 | Sub-sub division: 243 × 9 + 6 sign-boundary splits = 2193 (count reproduced) | `kalai_kp.py` |
| KP horary 1–249 | Standard KP (KP Reader VI): 243 star-subs split at sign boundaries = 249; Ascendant = start of the sub, Placidus cusps from that ARMC, planets at query time — NOT Kalai-verified (no printout) | `kalai_kp.py` |
| KP aspect tables | planet → bhava = (house mid-point − planet) mod 360; planet → planet = (target − source) mod 360; 1 decimal | `kalai_kp.py` |
| Naligai → Standard Time | sunrise (disc centre, no refraction) + nazhigai × 24 min + vinazhigai × 24 s + tharparai × 0.4 s — 5/5 reports | `kalai_tamil_calendar.py` |
| Numerology | Chaldean letter table identical to Kalai; birth number, destiny number and ruling planet match | `numerology.py` |
| Bhava bala | Drik: Jupiter & Mercury aspects full, others ¼; dig by sign class of the bhava madhya (Kumbha jalachara, Simha nara — derived from 1 reference); + bhavadhipati shadbala | `kalai_shadbala.py` |

### 4.2 Known open parity gaps
- Antharam: 558/567 dates exact; 9 are one day late. Cause not yet found — do not paper over it.
- Shadbala: sthana, dig, naisargika exact; kala within 0.005 rupa; drik exact except Moon (−0.567 vs −0.657); cheshta within 0.03 except Mercury (0.818 vs 0.891, mean-element difference); ishta/kashta for Sun ~0.03 off. Planet ranks 7/7 exact.
- Bhava bala: dig 12/12; drik 9/12 exact (houses 6, 7, 11 open).
- Rahu/Ketu dignity in the Rasi row treats Saturn as enemy (Ketu in Kumbha = பகை in REF-001) — derived from 1 reference.
- Panchapakshi: done (4.3.0). Kalai's 2-page summary for Cock in krishna paksha prints the shukla ruling days; the detailed pages (used here) show the consistent values. The old `sampoorana.py` Owl table is unchanged (it is not used by the Kalai report).
- Kalachakra: dates 94 % exact over 1,038 rows; the rest are ±1-day edges.
- Shadbala after 4.1.0 (T001–T08): cheshta 49/56 exact (T04 1945 differs: Kalai's mean Sun ~10° off for that era; Venus 1.3 virupa on 2 reports); kala bala 26/56 exact and every value within 0.42 virupa (0.007 rupa, ayana-bala rounding); drik 35/56. Dig/naisargika 100 %, sthana 93 %.
- Rasi row of varga bala and the planet-details dignity use a Tamil friendship table that differs from BPHS for some pairs (e.g. Jupiter in Mercury's sign = friend; Rahu/Ketu friendly with Mercury/Jupiter). Needs the full table (screenshot/book) or more reports.
- Mandi: 9/9 reports exact since 4.3.0.
- KP: verified on 1 Kalai KP report (every table exact); more KP reports will confirm the ayanamsa offset over time.
- Horary: standard KP 1–249 implemented and labelled "not Kalai-verified". Kalai's 1–2049 horary is not implemented — its scheme is Kalai-specific and no printout exists.
- Matching: 9/9 printouts exact (108 rows). Rules now fixed by samples: gana (Deva girl/Rakshasa boy = 2), yoni (girl-male & boy-female = 1 even for the same animal), rasi counts 2/5/6/7/8/11, vasiyam (girl's list only, mutual = 2), varna by the Moon's RASI, Sevvai (friendly sign is not a cancellation), dasa sandhi over the next 3 mahadasa changes. Still unseen: rasi counts 1/3/4/9/10/12, Deva/Manushya mixes, same animal with correct genders, enemy yonis, varna of Dhanus/Makara/Meena.
- Previous matching note: Branches never seen in a sample are computed by the classical rule and marked `verified: false` (e.g. same gana, same yoni animal, enemy yonis, vedha pairs, mutual vasya, rasi counts other than 6/11, varna for 21 nakshatras, full Sevvai dosham without cancellation).
- Baby-name numerology lists: need 3–4 more printouts.

### 4.3 Kalai Magal feature scope (requested)
Report sections 1–13 (see `kalai_report.py`), report presets (Type A/B/C/D, KP, Palan × Tamil/English), KP system, Horary 1–249 and 1–2049, Guru/Sani gochara palan, utilities (Udhayathi naligai → standard time, Tamil ↔ English date, time correction/DST), matching and baby-name parity.

---

## 5. Changelog

This project maintains a changelog following the [Keep a Changelog](https://keepachangelog.com/) convention and [Semantic Versioning](https://semver.org/). Every merged change that affects behavior, calculation logic, or the API contract gets an entry — not just releases.

### [4.30.0] — 2026-10-09 (all devices: phones, tablets, desktops)
- Header fits a 360 px phone: brand on two lines and a compact த / EN toggle below 640 px (they overlapped before); mobile menu lists ஜாதகம் items first; header respects iPhone notch / Android cut-out (`viewportFit: cover`, safe-area padding).
- Report tables (Kanitha 50, KP 7, 12 Porutham, Names) sit in `.table-scroll` strips: on a narrow screen a wide table slides on its own and the page never scrolls sideways. Cells wrap between words only (no more சந்|தி|ர|ன்); tighter cells on phones. Dasa cards 1 / 2 / 3 per row (phone / tablet / desktop), antharam cards 1 / 2 / 3.
- Single-page jathagam: details block is one column on phones (two columns elsewhere, in the PDF and in print).
- Normal PDF made on a phone or tablet: pages are laid out at A4 width while captured (`html.pdf-export`), scroll strips and phone-only styles switched off, so it matches a desktop PDF.
- Forms: AM / PM row wraps (Utilities overflowed); format buttons and bio-data header fit 360 px; inputs 16 px on phones (no iOS zoom-in); no tap delay.
- Smoother: no 20 px backdrop blur on phones/touch devices; off-screen report pages are not rendered until near (`content-visibility`, off while exporting); Google Fonts via a `<head>` link instead of a render-blocking `@import` (unused Cinzel / Noto Serif Tamil / Baloo Thambi 2 dropped); header/footer logo 16 KB instead of 140 KB.
- `next.config.js`: optional `NEXT_DIST_DIR` for a separate build folder (default `.next`).
- Verified with Playwright + Edge on Android 360, iPhone SE 375, iPhone 390, iPad 768, laptop 1366 (Tamil and English): every page and both generated reports have no sideways page scroll; `tsc` and `next build` pass.

### [4.29.2] — 2026-10-09 (designed PDF: dasa pages, table alignment)
- Dasa / antharam cards (Kanitha, KP, A4 and A5) are rows of three instead of a 3-column flow: WeasyPrint's column flow pushed cards to the next page and left half-empty pages (p. 7–8). Rows break between pages, so pages fill from the top and the first row stays with the heading and the dasa-balance line.
- Card tables are sized to their content (no fixed column widths) and the card text size is chosen per typeface (`render.dasa_font_pt`, glyph advances via fontTools): the end date never runs into வ / மா / நா (e.g. "05-04-209590"). Start and end are on two lines in every card.
- Tables: auto layout with `overflow-wrap: break-word` — headers such as பாதம், விகலை, மேஷம் and numbers such as 255.00 are no longer split mid-word; tables with 9+ columns stay fixed (never wider than the page) with a face scaled to the typeface (`render.width_ratio`). Planet table column widths rebalanced.
- Verified by rendering (WeasyPrint 70) in MLA 105, MLA 130, MLA 133, Kavivanar and Noto, A4 and A5, Kanitha and KP. Test +1 (121 passed). In 9+-column tables, columns given the same width share it by header length (`render._share_by_header`), so விருச்சிகம் and கன்னி both stay whole.

### [4.29.1] — 2026-10-09 (initials by sound)
- Initials on Tamil pages use the letter's Tamil sound, like the rest of the Thanglish rules (c = ச): "C.M. Prasath" → ச.ம. பிரசாத், "R.K." → ர.க., "C Prasath" → ச. — no longer the English letter names சி.எம். / ஆர்.கே. Same table in the suggestion boxes (`lib/tamilTransliterate.ts`) and the designed PDFs (`pdf/ta_text.py` LETTER_TA: baby-names initials line and names list). Test expectation updated (`initials_prefix_ta("C.M.சரண்") == "ச.ம.சரண்"`); 120 passed.

### [4.29.0] — 2026-10-09 (Bugs Resoloving.txt — background, chart centre, Thanglish, Tamil place in PDFs)
- Colour panel: new "பின்னணி வண்ணம் / Page background" — Palette default (unchanged look), White (#FFFFFF), Turmeric / மஞ்சள் (#FCE38A). It replaces the palette's paper, so the website report pages, the normal PDF (whole sheet painted, margins included) and the designed PDF (theme.paper / paperCard) all take it, in Kanitha, KP (incl. horary), 12 Porutham and Names. `--jat-page-bg` on the document island tells `pdfExport` the sheet colour.
- Chart centre (every chart: canvas, DOM grids, designed PDF full / single / KP / Porutham): premium ornament — ivory-gold glow, gilded gold / maroon / gold frame with a gem on each side, lotus-fan corner flourishes, faint 16 + 8 petal lotus mandala behind the chart name (white halo on screen, ivory backing in the PDF). TS (`lib/chartArt.ts`) and Python (`pdf/chart_art.py`) build the identical 47 paths.
- Thanglish → Tamil (`lib/tamilTransliterate.ts`, used by every name / bio-data suggestion box, Porutham names, report names and PDFs): c = ச (was க), a lone capital "C" = ச (was the initial சி; initials still work for "C.", "C Prasath", "CM"), no doubled dot in "C.M."; ng / nj / nk / nch + vowel = ங்க / ஞ்ச; f = ஃப; "ay" no longer ஐ (Vijay = விஜய்); oi = ஒய் ; final -y = இ; final s = ஸ்; -ash = ஆஷ்; English silent final e dropped; gn = க்ன. Alternatives (c = க, nn = ன்ன, medial d = த, th = த்த …) stay in the list. Search bounded to cost ≤ 5 (fast per keystroke).
- Tamil place in PDFs: the place picker records the Tamil name it showed (`lib/placeLabel.ts`, localStorage) and `placeForLang` prints that; new `lib/placeNamesTa.ts` (≈310 English spellings — Tamil Nadu, Kerala, India, diaspora) is used before any transliteration (Palakkad → பாலக்காடு, not பாலகட்டு). Bio-data native place uses the same table. Backend safety net `ta_text.place_ta` (curated KNOWN_LOCATIONS only) on Tamil PDF requests that carry coordinates.
- Test +1 (`test_designed_pdf_round_32_place_background_centre`, 120 passed); `next build` passes. No calculation code changed.

### [4.28.0] — 2026-10-08 (Bugs Resoloving.txt — Tamil-only PDFs, no repeats, Custom, A4/A5)
- Tamil designed PDFs print no English words: times as காலை / மதியம் / மாலை / இரவு, time zone "இந்திய திட்ட நேரம் (+05:30)", N/E as வடக்கு / கிழக்கு, ayanamsa "லஹரி (சித்ரபக்ஷம்)", "திட்ட நேரம் (திருத்தம் இல்லை)", initials சி.எம். in the names list, Tamil PDF title (new `services/pdf/ta_text.py`, frontend `lib/taText.ts`). Parents' / family names typed in English are sent in Tamil on Tamil pages. Numbers unchanged.
- Bio data: every form field has a Tamil label (was title-cased English); website card labels Tamil-only; father / mother printed once (general details), not again in சுய விவரம்.
- Custom / தனிப்பயன் format for கணித ஜாதகம் and கே.பி ஜாதகம்: tick the sections; the website report, normal PDF and designed PDF follow the ticks (cover, contents, prayers, closing page stay). API: `mode: "custom"`, `sections: [...]`.
- A4 / A5 sheet picker for full and custom Kanitha / KP, both PDFs. Designed A5 = layout on a 182 × 258.25 mm CSS page zoomed to 148 × 210 mm (charts two per row, compact dasa cards and wide tables); normal A5 = same captured pages on A5. API: `page_size: "A4" | "A5"`. Verified by rendering (A5 pages exactly 148.0 × 210.0 mm).
- Dasa card columns rebalanced (3-digit ages no longer touch). Tests +1 (119 passed); `next build` passes.
- Tamil suggestion dropdown (TamilNameInput) on all 14 free-text bio-data fields and on the 12 Porutham name fields.

### [4.27.0] — 2026-10-07 (Bug fixing.pdf, 2nd list — charts, covers, single-page spacing, logo)
- Charts (all features, website + both PDFs): no black lines — grid lines, outer frame, Lagna stroke and chart name use the panel's accent; planet text uses the panel's ink (Lagna in accent) and the panel's Tamil typeface. The yellow houses and the framed centre are unchanged. Every chart is an exact square (fixed grid height = width; crowded houses shrink their text instead of growing the row). Small-chart titles get a fixed two-line height so a row of charts lines up in every typeface. PDF north-chart lines take the theme through a ContextVar (`chart_art.use_chart_theme`), safe for concurrent requests.
- 12 Porutham and Names & Numerology designed PDFs: the cover shows the owner's picture (`backend/app/assets/covers/porutham.png` — white background removed; `names.png` — framed) instead of the details box. The Tamil 12 Porutham cover prints no separate title (the picture carries it); English keeps "Marriage Compatibility".
- Single-page designed PDF: the bordered sheet fills the page height exactly (274 mm) and spare space is shared between the blocks, so the inner space at the bottom equals the top.
- Logo: header and footer show the transparent ML emblem with no white box; `public/logo-mark.png`, `logo-512.png`, `logo.png`, `app/icon.png` are transparent.
- Tests +2 (118 passed); `next build` passes.

### [4.26.0] — 2026-10-07 (Bug fixing.pdf — images, gender, logo, single page, charts, icons)
- Deity pictures (Ganesha, Om) and the PDF logo are transparent PNGs now (white background removed with soft, halo-free edges, cropped); Murugan's white fade made transparent. No white box on any palette's paper.
- Cover: gender printed in the page language (ஆண் / பெண்; Male / Female). The logo moved from the cover to the LAST page (closing page, 26 mm, ≈1000 dpi source).
- Single-page designed PDF: place = only the typed town (no state / country); double page border in the panel's gold + inner accent line; small Ganesha (left) and the chosen deity (right; Murugan when Ganesha is chosen) in the top corners; chart style (South / North) honoured; label columns rebalanced so nothing wraps or touches its colon in any typeface — still one A4 sheet. Same on the website single page.
- Charts everywhere (designed PDF full + single, KP, 12 Porutham, website canvas, ashtakavarga and KP grids): the owner's sample artwork — glowing pale-yellow houses, thick charcoal lines, white centre with maroon double frame and Greek-key corners, chart name in blue, a fixed colour per planet, Lagna double stroke. Chart colours and face are fixed (not themed), so charts look and align the same in every palette and typeface. New: `backend/app/services/pdf/chart_art.py`, `frontend/lib/chartArt.ts`; canvas painted at 2×.
- Cyan-blue (#2F6FED, header blue) Lucide icons beside every detail label, section heading and contents line — Kanitha (Thirukanitham / Vakkiyam), KP, single page, full jathagam, designed PDFs; star icon when no related icon. New: `backend/app/services/pdf/icons.py`, `frontend/lib/detailIcons.tsx` (same rules, same order).
- English designed PDFs: planet-table star names were blank (rows carry Tamil names only) — now read from the same longitude; KP Uranus / Neptune / Fortuna get Tamil short names on Tamil pages.
- Test +1 (`test_designed_pdf_bug_fixes_round_29`); backend 116 passed; `next build` passes.

### [4.25.0] — 2026-10-06 (Bug_fixing.docx)
- Header: first item is a "ஜாதகம் / Jathagam" menu with கணித ஜாதகம் and கே.பி ஜாதகம்; then 12 பொருத்தம், பெயர் & நியுமராலஜி, ராசி பலன், கருவிகள். Subtitle only on very wide screens; no overlap in Tamil or English.
- Place in Tamil on Tamil pages (lib/placeLabel.ts): town transliterated + state + country in Tamil; sent to the report, normal PDF and designed PDF (Kanitha, KP, 12 Porutham).
- North-Indian charts: website canvas packs planets in rows inside each house (smaller text when crowded), title moved off the centre crossing; designed PDF draws labels as HTML over SVG lines at each house centroid (proper Tamil shaping, wrapping, no overlap).
- Logo: owner's PNG processed into crisp white-background assets — public/logo-mark.png (512 px emblem), logo-512.png, logo.png (1600 px full logo), app/icon.png, app/apple-icon.png; backend/app/assets/logo.png (designed-PDF cover and single-page footer).

### [4.24.0] — 2026-10-05 (single page — comparison fixes)
- Labels never run into values (wider label column, centred colon) for every typeface; place shortened like the reference ("Udumalaipettai T.N. India"); planet-name column wider (செவ்வாய் no longer wraps); bottom lines with the colon close to the label; lagna cell marked with Kalai's diagonal line; charts 82 mm; footer line with the site name. Same on the website / normal PDF.

### [4.23.0] — 2026-10-04 (single-page jathagam = one A4 sheet)
- Designed PDF (mode=single): new services/pdf/render_single.py — exactly ONE A4 page in Kalai's single-page layout: ஓம் நமச்சிவாய + invocation and date; details in two label : value columns (name, parents, date, Tamil date, time with GMT, nakshatra horai, ayanamsa, sunrise, sunset, time correction | place, latitude, longitude, star+pada, rasi, lagna, tithi, yogam, karanam, ayanam, time zone), udhayadi nazhigai; planets in two side-by-side tables; Rasi (with Mandi) and Navamsam side by side; bhava change, dasa balance, current dasa-bhukti, name numbers, star letters; சுபம். No cover, contents, prayer, bio-data or closing pages. Theme colours/typeface applied.
- Website + normal PDF: SinglePage component rebuilt in the same layout; bio-data page only in full mode; a `.single-sheet` always prints on one page (fitOnePage).
- Test +1 (61).

### [4.22.0] — 2026-10-02 (shodasa varga charts)
- Designed PDF: the 16 shodasa varga charts are printed two per row at full size (8.0 cm), as many pages as needed; chart cells grow with content, so no text overlaps. Regular charts 8.0 cm, 16 pt gap below each.

### [4.21.0] — 2026-10-02 (charts, dasa spacing, contents)
- Square (South) charts: columns minmax(0,1fr), rows minmax(…, auto) — a crowded house makes the chart taller instead of spilling; 4+ planets use smaller text; centre shows only the short note (e.g. "மொத்தம் 48"), the title stays above the chart → no chart overlaps its neighbour. Small charts 3 per row (5.05 cm). North charts: smaller text in crowded houses.
- Dasa / antharam cards: 3-column newspaper flow (column-count) — pages fill to the bottom, 12 pt space between cards, roomier rows.
- Contents page lists exactly the reference's 20 main sections (first heading of each); sub-tables, prayers and closing page are not listed.

### [4.20.0] — 2026-10-02 (designed PDF ↔ reference gap audit)
- Added to the Kanitha designed PDF (gaps vs Thirukanitam_refernce.pdf): பட்சம், அயனம், நேர திருத்தம், தந்தை / தாயார் பெயர் in general details; planet table with separate பாகை/கலை/விகலை + ராசியில் பாகை/கலை/விகலை (two-row header); bhava chart moved beside bhava spudam (two-row header); antharam as compact per-bhukti cards; per-planet ashtakavarga charts + Sarvashtakavarga chart; per-planet prasthara matrices (donor × sign); சட்பல கணிதம் (6 balas), கிரக சட்பலம் (பூர்ண பலம், சதவிகிதம், வரிசை, இஷ்ட, கஷ்ட), பாவ சட்பலம்; சோடச வர்க்கம் title, கிரககுணம் table, வர்காதிபதி table, ரூபங்கள் row; upagraha நட்சத்திரம் / பாதம்; Kalachakra per-dasa blocks "வல வோட்டு / இட வோட்டு … தசா N வருடம் (இருப்பு …)"; numerology letter table.
- Renderer: SimpleTable.group_header (two-row headers), "antharam" block kind, inline-block dasa cards (3 per row, never split).

### [4.19.0] — 2026-10-01 (palan as paragraphs, Kalai order)
- Guru / Sani gochara: Kalai-style paragraph blocks, no tables — heading "<ராசி> ராசியில் குரு சஞ்சரிக்கும் காலம் — ஆரம்பம் … முடிவு … (வயது N)", then a long paragraph (house from the natal Moon, dignity in that sign, house name, detailed effects), the planet's own ashtakavarga bindus, Sade Sati phase. Jupiter 7 y, Saturn 12 y ahead. New palan/long_text.py (24 long transit texts).
- Yogas: + Sunapha, Anapha, Durudhura, Vesi, Vasi, Ubhayachari, Vasumathi, Amala, Adhi, Lakshmi, Saraswati, Neecha-bhanga, Parivartana — each "reason … ஏற்பட்டுள்ளது. இந்த யோகம் உள்ளவர்கள் …"; longer texts for the existing ones.
- Designed PDF sections now follow the reference contents order exactly: general, graha spudam, bhava spudam, dasa-bhukti, antharam, ashtakavarga, prasthara, shadbala, shodasa varga, planet details, numerology, upagraha, kalachakra, panchapakshi, bhava / mahadasa / guru / sani palan, yoga-avayoga.

### [4.18.0] — 2026-10-01 (Palan — original text, all five sections)
- backend/app/services/palan/: bhava_text.py (12 house meanings + 144 lord-in-house), planet_text.py (108 planet-in-house, 9 mahadasa natures, 12 Guru + 12 Sani transit texts), compose.py (chart-specific composition). Original writing for this site, Tamil + English; classical BPHS principles.
- Kalai report carries palan_ta / palan_en: பாவக பலன் (meaning, lord placement, dignity/retro/combust/benefic aspects, occupants, SAV strength), மகாதிசை பலன் (nature, placement, lordships, every bhukti with end date, relation and position), குரு / சனி கோச்சார (dated periods: Jupiter 12 y, Saturn 30 y, Sade Sati/Ashtama marks), யோக அவயோகங்கள் (Gaja Kesari, Budha-Aditya, Chandra-Mangala, Pancha Mahapurusha, Viparita Raja, Dharma-Karmadhipati, Kemadruma, Shakata, Guru-Chandala, Grahana).
- Screen sections 16–20 and the designed PDF use it (sample Tamil PDF 57 pages, no near-empty pages). Test +1 (60).

### [4.17.0] — 2026-10-01 (charts centre, Vakkiyam analysis)
- HandwrittenChartCanvas: in Tamil/Kerala charts the middle grid lines stop at the 2×2 centre box (no lines crossing the centre). Applies to every chart in every feature.
- Vakkiyam measured against Kalai V01–V10 (9 reports): Sun = Surya-Siddhanta true Sun (≤ 2.2′, one report 58′), Rahu = SS node + linear fit (≤ 1.3′), Moon = SS Moon best fit ≤ 12′ (Kalai uses Vararuci-type Chandra-vakyas), Mars–Saturn off by degrees (Kalai Vakya planetary tables). Not enabled: dasa balance / pada would be wrong. Data + experiment in backend/docs/vakkiyam/.

### [4.16.0] — 2026-10-01 (bug list round 8)
- Language choice persists across pages (lib/useLang.ts, localStorage + event).
- Header: icons only on very wide screens, more spacing — no congestion in Tamil or English.
- Bhava spudam: ஆரம்பம் / மத்தியம் / அந்திமம் each with பாகை · கலை · விகலை sub-columns (screen and designed PDF).
- Report pages (Kanitha, KP, Porutham, Names) on the site panel background; `.kalai-page` CSS keeps text inside cells for every Tamil typeface (wrapping, line-height, no truncation).
- KP horary: the person's name is the name; the horary number is its own row (screen + PDF cover).
- 12 Porutham person cards: label / value table, aligned.
- Names: the star's first letter is pre-selected for the single-letter types; clear message when the name bank has no match.
- Colour panel: 10 Kongu-region palettes added (group "கொங்கு மண்டல வண்ணங்கள்").
- Full `next build` passes (compile, lint, types, all 14 routes).

### [4.15.0] — 2026-10-01 (bug list round 7)
#### Navigation
- Old Generate Chart, Baby Name, Muhurtha and Marriage Match pages removed; their routes redirect to the new features. Header: கணித ஜாதகம், கே.பி ஜாதகம், 12 பொருத்தம், பெயர் & நியுமராலஜி, ராசி பலன், கருவிகள். "/" shows Kanitha Jathagam. Shared engines/components (name bank, chart engine, forms) are kept.
#### Colour panel
- 10 three-colour astrologer palettes (heading · body · highlight), light warm papers, no black.
#### Designed PDF
- Closing page (daily worship, Navagraha temples, Mangalam) — same text as the manuscript's last page.
- No lone headings (charts inline-block, heading kept with content); no "&amp;" in the running header (CSS-escaped).
- 12-hour times (12:32:00 AM, not 00:32:00), dd-mm-yyyy dates.
- 12 Porutham cover lists both girl and boy; Names cover shows sex, birth date, star, initials, name numbers.
- KP horary designed PDF (/api/pdf/kp-horary).
#### Other
- Numerology: a Tamil name is transliterated (tamil_latin.py) before the Chaldean total — no more name number 0.
- Print preview is shown inline under the panel and refreshes when the colour / typeface / cover picture changes.
- 12 Porutham and Names results on the site panel background, themed by the panel; Names list roomier.

### [4.14.0] — 2026-09-30 (bug list round 6)
#### Print PDF
- Contents page (page 2) with real page numbers (WeasyPrint target-counter) in all four features.
- Opening pages from the site's manuscript: தமிழ் தாய் வாழ்த்து, கடவுள் வாழ்த்து (4 stutis); for Kanitha/KP also Navagraha dhyana slokas and the ராசி மண்டலம் table.
- Cover shows the Tamil title only.
- Flowing layout: sections follow each other (rows/charts never split), so pages are filled instead of half empty.
- 12 Porutham: girl and boy side by side on the same page (two-column table, charts sized to fit).
- Baby names: one airy numbered list (English | Tamil | total) flowing over pages.
#### UI
- Kanitha / KP forms full width like Generate Chart; 12 Porutham inputs in one card with girl | boy columns like the old Thirumana Porutham; Names results on the site's panel background.

### [4.13.0] — 2026-09-30 (bug list round 5)
#### Fixed
- Print PDF follows the selected report: Kanitha full / single page, KP All / KP Type A (KP All adds antharam).
- Print PDF theming: Windows-safe file URIs for fonts and pictures (Path.as_uri), table-header fills and row tints follow the palette.
- Cover pictures: any file in backend/app/assets/deity whose name matches the choice or an alias (vinayagar/ganesha/pillaiyar…, murugan/muruga…, om/aum), any case, SVG/PNG/JPG/WEBP…; embedded unchanged.
- On-screen PDF: page cuts never fall inside a chart, table row or card.
- வ / மா / நா aligned columns in KP dasa and in the print PDF dasa blocks.
- 12 Porutham: larger form, Tamil name suggestions (tap to use).
- Names & numerology: larger form; father / grandfather / mother fields take the first letter (Tamil letter converted).

### [4.12.0] — 2026-09-30 (bug list round 4)
#### Changed
- Kanitha / KP use the birth-details form's own buttons (no duplicates): Kanitha — திருக்கணிதம்/வாக்கியம், chart style, முழு/ஒரு பக்க; KP — ஜனன ஜாதகம் (Thirukanitham slot) / பிரசன்னம் (Vakyam slot, horary number + system inside the form), KP All / KP Type A. BirthDetailsForm gained optional systemLabels / outputLabels / onModeChange / children (defaults unchanged for the old pages).
- Colour/Tamil-style panel, chart style, cover picture and print PDF appear only after generating, above the results (all 4 features).
- Print PDF: preview dialog before download; uses the current palette and typeface (13 bundled OFL Tamil fonts); full Kanitha content (bhava, antharam, ashtakavarga + pindas, prasthara, shadbala, varga bala + 16 varga charts, planet details, upagraha, Kalachakra with bhuktis, Panchapakshi, numerology, bhava/dasa/gochara palan, yogas — 49 pages for the sample); KP adds bio data, KP chart, bhava significators, graha-bhava and graha-graha aspects.
- Cover: owner-supplied deity picture (SVG / high-res PNG / JPG) from backend/app/assets/deity/, embedded unchanged; line-art emblem when absent.

### [4.11.0] — 2026-09-30 (bug list round 3 + WeasyPrint print PDFs)
#### Added
- `backend/app/services/pdf/` (schemas, render, builders) + `backend/app/api/pdf.py`: WeasyPrint A4 PDFs — ivory paper, double gold page border on every page, running subtitle, "Page X of Y", cover page with deity line art (Ganesha / Murugan Vel / Om), bilingual title and birth-profile box; fixed-layout wrapping tables, break-inside: avoid on charts/rows/dasa blocks/verdict, break-before for sections. Routes: /api/pdf/generate (documented payload), /api/pdf/kanitha, /kp, /porutham, /baby-names. Bundled OFL fonts: Noto Sans Tamil, Kavivanar.
- "அச்சு தர PDF (A4)" button + deity choice on Kanitha, KP, 12 Porutham, Names (Kalai).
- Tamil-style panel: Thurigai, Kavithai, Rathee Script entries (@font-face from public/fonts; falls back to Kavivanar until the licensed files are added).
#### Fixed
- Charts: no D1/D2 codes; Tamil planet labels on Tamil pages.
- Full Tamil sign names in Prasthara/Sarvashtaka headers (no truncation).
- Dasa-bhukti and Kalachakra: separate வ / மா / நா columns aligned with their numbers.
- Bio-data card is now a page inside the Kanitha and KP reports (in the PDF and themed).

### [4.10.0] — 2026-09-30 (bug list round 2, 6 items)
#### Fixed
- Names shown in Tamil on Tamil pages (12 Porutham, Kalai report, KP) via lib/tamilTransliterate.
- Charts in every Kalai feature now draw with HandwrittenChartCanvas only: no Kaiyezhuthu/Digital toggle, no duplicate title, same chart on screen and in the PDF; themed ink.
- Names & numerology: initials are the first letter of the father's / grandfather's / mother's NAME (Tamil or English); place initial removed.
- Utilities: place-search dropdown no longer hidden under the next card; English→Tamil date uses the 12-hour time picker.
- PDF/table alignment: key–value tables keep the value next to its label (general details, ashtakavarga figures, KP general).
- Jathagam ink-colour + Tamil-typeface panel on Kalai report, KP, 12 Porutham and Names (Kalai); the documents are theme islands, so colours and typeface change across all text, tables and charts (and the PDF).
- Frontend type-check now run with `node node_modules/typescript/bin/tsc` (the .bin shim was not executable in the build sandbox, which hid the 4.9.0 Header error).

### [4.9.0] — 2026-09-30 (UI bug list "Bugs_Resoloving.txt", 18 items)
#### Fixed
- Header: Kalai features grouped in one "கலைமகள் கணிதம் / Kalai Magal" menu — one line at 100 % in Tamil and English.
- All Kalai pages use the Generate-Chart layout (max-w-7xl, site cards, site buttons, dark-mode-safe panels); report sheets are full-width white documents (readable in dark mode), no horizontal-scroll boxes, so everything prints to PDF.
- Charts in Kalai report and 12-Porutham use the site's RasiChart: Tamil / Kerala / North-Indian buttons on top.
- கணித ஜாதகம்: outside buttons Thirukanitham/Vakyam, முழு ஜாதகம் / ஒரு பக்க ஜாதகம் (single-page layout from Thirukanitam_single_page.pdf); Model Setup and time correction removed; bio-data card added; numerology section rebuilt (nothing hidden); sections 16–20 added (பாவக பலன், மகாதிசை பலன், குரு/சனி கோச்சார பலன், யோக அவயோகங்கள்) from the site's own chart engine.
- KP: same layout, KP All / Type A as outside buttons, bio-data card; Horary uses place search (lat/lon/time zone automatic) and no time correction.
- 12 Porutham, Utilities: place search + 12-hour time, no time correction, site styling.
- Baby names (Kalai): each report type applies its own filter (validation for star / letter / number); first letter chosen from the star's letters; Kalai-exact first-letter (grapheme) matching; import button removed; initials father / grandfather / mother + place initial taken from the place search.
- Backend: `single_page` block in the Kalai report (bhava change, current dasa-bhukti, name numbers, star letters); `GET /api/kalai/star-letters/{n}`.
#### Not changed
- Vakyam: button present but switched off with an explanation — only one Kalai Vakyam report exists, so values cannot be verified.

### [4.8.0] — 2026-09-30 (KALAI_ASTRO archive: 136 reports)
#### Verified on the archive (95 Thirukanitham horoscopes, 36 baby-name, 4 matching, 1 Vakyam)
- Planets 635/635 · Vimshottari bhukti dates 1,531/1,531 · Tamil date 94/95 · Upagraha 104/104 · Kalachakra 1,498/1,648 (rest ±1 day) · printed name totals 39,109/39,113.
- Shadbala (16 full reports): dig, naisargika 112/112 · sthana 109/112 · cheshta 97/112 · drik 75/112 · kala 25/112 exact (all within 0.4 virupa).
#### Fixed / added
- Tamil calendar refit on 84 Kalai dates (83 exact); Kalai's spellings of 7 year names (பிரசோற்பத்தி, வெகுதாணிய, விசு, பார்திப, சர்வசித்து, விசுவாசுவ, விரோதிகிருது).
- Matching: dinam uses the Tamil count list (2,4,6,8,9,11,13,15,18,20,24,26); Mars in Rishaba/Thula is a Sevvai cancellation. 11 Kalai couples reproduce.
- Baby names: allowed name numbers for 56 of 81 (date, destiny) pairs (was 9); Kalai star letters for 10 stars; 10,013 Kalai names (5,728 boy, 4,285 girl) in the seed file.
- No repeated names: Kalai names are never added when the name already exists for that gender; existing duplicates removed at start-up; name lists de-duplicated.
#### Not done
- Vakyam system: only 1 Vakyam horoscope in the archive; Kalai's Vakya Sun agrees with our Surya-Siddhanta Sun within 31″, but Moon and planets cannot be derived from one sample.
- Master.mdb / CustMaster.mdb: not decrypted or read.

### [4.7.0] — 2026-09-29 (Manuscript integration)
#### Added
- Handwritten manuscript chapter 15 "கலைமகள் கணித அட்டவணைகள்" (pages 51–56): Kalachakra dasa, Shodasa varga bala, planet details, Upagraha + Prasthara summary, Panchapakshi, KP tables — data from `/api/kalai/report` and `/api/kalai/kp` for the same birth.
- Manuscript is now 56 pages (index, contents page, viewer, PDF labels).
- PDF export waits (max 25 s) until chapter 15 data has loaded.
#### Fixed
- Chapter 13 name letters now use the Kalai-verified nama-nakshatra table (several stars were wrong: e.g. Moolam = Kettai, Visakam, Uttarattathi).

### [4.6.0] — 2026-09-29 (Kalai names, chart styles)
#### Added
- `kalai_name_import.py` + `app/data/kalai_names.json`: 2,738 names (2,608 boy, 130 girl) taken from the owner's Kalai baby-name printouts, seeded at start-up (source='kalai'); `POST /api/kalai/import-names` adds names from any further Kalai printout; `GET /api/kalai/name-bank-stats`. Kalai's encrypted Master.mdb is not decrypted or read.
- TAB-font Tamil repair for ர்/ரி ligatures (£¢, ா¢, ா¤ …).
- `/kalai-baby-names`: "Add names from a Kalai PDF" button.
- Kalai report: South / North / East chart styles (all charts, incl. varga and ashtakavarga charts).
- requirements: pdfplumber, open-tamil.
- Test: Kalai names seed + printout parser (56 total).

### [4.5.0] — 2026-09-29 (Phase 8 — Baby names, Horary 1–2193)
#### Added
- `kalai_baby_names.py`, `POST /api/kalai/baby-names`: Kalai's 7 report types, date/destiny numbers, allowed name numbers, star letters, initials handling; names from this site's own name bank.
- Frontend `/kalai-baby-names` (Kalai form, printout-style sheet, PDF), nav link "பெயர் (கலைமகள்)".
- KP horary 1–2193 (`system: "2193"`), selectable on `/kp-report`.
- Tests: baby numbers/totals/letters/filters, horary 2193 table (55 total).

### [4.4.0] — 2026-09-29 (second printout batch)
#### Fixed / changed
- Matching: 6 new printouts decoded; all 9 Kalai printouts reproduce (rows, totals, Sevvai, dasa sandhi).
- Tamil calendar: Surya-Siddhanta true Sun (28/28 Kalai dates; was 7/10).
- KP New Comb ayanamsa: mean-Lahiri model (E1 2019 and the 2026 horary prints exact); KP-Old option.
- Time correction: 2DST and DST + War Time added.
- Model Setup presets Type B, Type C, Palan (from screenshots).
#### Verified (no change needed)
- Shadbala on D1–D3 (1960, 1975, 1985): every component exact.

### [4.3.0] — 2026-09-28 (Phase 6 — Panchapakshi, Upagraha, Prasthara)
#### Added
- `kalai_panchapakshi.py`: 5 birds × 2 pakshas (padu days, name letters, colour, direction, ruling days, friends/enemies, 7×10 activity grid) and the detailed "2+21 pages" (sub-periods with times, relation, result).
- `kalai_upagraha.py`: 10 upagrahas.
- Prasthara ashtakavarga (7 planets).
- Kalai report sections 13 (Panchapakshi), 14 (Panchapakshi detailed), 15 (Upagraha), 16 (Prasthara); Model Setup preset "Type D + Panchapakshi 2+21".
- Tests: Panchapakshi (REF-001, T01), Upagraha + Prasthara (T04), Mandi night edge (T02, T03).
#### Fixed
- Mandi for births just before sunrise or after sunset (T02, T03, T06): Kalai's neighbouring-night rule.

### [4.2.1] — 2026-09-28 (Ephemeris backend fix)
#### Fixed
- On machines with Swiss `.se1` files in `ephe/`, the Moon moved by up to ~1″ versus Kalai (which uses Moshier), flipping a dasa date by one day (`test_matching_sevvai_and_sandhi`: 19-09-2040 vs Kalai 18-09-2040). The engine now uses Moshier by default (`KALAI_EPHEMERIS`), reproduced and verified with the data files present.
#### Added
- `test_kalai_uses_moshier_ephemeris`.

### [4.2.0] — 2026-09-28 (Phase 5 — Marriage matching)
#### Added
- `backend/app/services/kalai_matching.py`, `POST /api/kalai/matching`: 12 poruthams with Kalai's graded points and verdicts, percentage verdict, Sevvai dosham (none / parihara / dosham), Rajju, dasa sandhi, per-person summary (star, rasi, lagna, Tamil date, tithi, ayanamsa, charts, bhava change, dasa balance, current dasa-bhukti).
- Frontend `/kalai-matching` (two-person entry with time correction, Kalai-style printout, PDF export), nav link.
- 2 matching tests (3 printouts).

### [4.1.0] — 2026-09-28 (Shadbala parity + KP horary)
#### Fixed
- Shadbala cheshta: Kalai mean-longitude corrections (cheshta 16/56 → 49/56 on the 2026 test births).
- Kala bala: Moon's paksha as malefic in Krishna paksha; Mercury's paksha follows its conjunction with malefics; abda/masa ahargana epoch (+11 days). Kala 22/56 → 26/56 exact and all within 0.42 virupa.
#### Added
- KP horary 1–249 (`POST /api/kalai/kp-horary`), Horary mode on `/kp-report`.
- Tests: T02 shadbala (2026 birth), KP horary table.

### [4.0.0] — 2026-09-28 (Phase 4 — KP system)
#### Added
- `backend/app/services/kalai_kp.py`, `POST /api/kalai/kp`: KP New Comb ayanamsa, Placidus cusps, star/sub/sub-sub lords (planets, Uranus, Neptune, Part of Fortune, cusps), bhava and planet significators, aspecting planets, graha-bhava and graha-graha aspect tables, KP chart, Vimshottari dasa/bhukti/antharam on the KP Moon.
- Frontend `/kp-report` (KP Type A / KP All models, PDF export), `components/kalai/KpReport.tsx`, nav link.
- 3 KP parity tests.

### [3.5.0] — 2026-09-28 (Settings screenshots → Utilities, Model Setup, Time Correction)
#### Added
- `kalai_tamil_calendar.py`; API `/api/kalai/utilities/*` (Tamil → English date, Naligai → time, Tamil date, calendar names).
- `time_correction` on chart and Kalai-report requests (none / dst / war).
- Tamil date in Kalai report General Details.
- Frontend: `/kalai-utilities` page; Model Setup panel on `/kalai-report` (section checkboxes, built-in and user-saved models, Table of Contents toggle); Time Correction selector; nav link.

### [3.4.0] — 2026-09-28 (Validation against T001–T08)
#### Changed
- Kalachakra rewritten with the general Kalai rule (Savya + Apasavya, all padas).
- Kalai Delta-T emulation for births from 2011 on (Moon now within 0.5″ of Kalai on all 9 test reports; was ~8″ off for 2026 births).
- Fixed-offset time zones (`UTC-06:30` etc.).
- Varga bala Rasi row: exalted planet = 22.5 (takes precedence over own sign).
#### Verified
- Planets within 1″ on 9/9 reports; Vimshottari bhukti dates 709/711 exact.

### [3.3.0] — 2026-09-28 (Phase 3a — Kalachakra dasa)
#### Added
- `backend/app/services/kalai_kalachakra.py` and Kalai report section 12 (Apasavya births); UI Kalachakra pages.
- Parity tests for Kalachakra (REF-001) and the Savya `pending` path.

### [3.2.0] — 2026-09-28 (Phase 2b — Shodasa varga & planet details)
#### Added
- `backend/app/services/kalai_varga.py`: 16 varga charts, varga-lord table, Shodasa varga bala, Planet details table (bhava, suyam bhava bala %, lordships, kendra/trikona, dignity, conjunction, aspects, retro/combust/vargottama, parivartana, graha yuddha, shadbala class).
- Kalai report sections 9 and 10 computed; UI shows the 16 charts, varga bala table, varga-lord table and planet details table.
- Parity tests for Shodasa varga and planet details (REF-001).
#### Verified (no code change)
- Numerology letter table, birth number, destiny number and ruling planet match Kalai.

### [3.1.0] — 2026-09-27 (Phase 2a — Shadbala)
#### Added
- `backend/app/services/kalai_shadbala.py`: full BPHS Shadbala + Ishta/Kashta + Bhava bala with Kalai Magal conventions.
- Kalai report section 8 (Shadbala) is now computed; Kalai report UI shows the Shadbala, percentage/rank and Bhava bala tables.
#### Changed
- `shadbala.calculate_shadbala()` routes to the Kalai engine when birth context (jd, lat, lon, date, time, tz) is passed; `charts.py` now passes it. Output schema unchanged, with new optional fields (`ishta_phala`, `kashta_phala`, `percentage`, `rank`, `bhavas`, `context`, extra kala parts).
- `schemas.py`: `ShadbalaResult` / `PlanetShadbala` / `KaalaBalaSub` extended (optional fields only).
#### Fixed (AGENTS §1.2 violations)
- `Chapter5Shadbala.tsx`: removed the hard-coded fallback Shadbala table (it silently replaced any 0 value, e.g. Sun's cheshta, with invented numbers) and the static 12-house Bhava bala table; both now show computed values only.

### [3.0.0] — 2026-09-27
#### Changed (breaking — calculation outputs change)
- Reference standard switched to Kalai Magal (AGENTS.md §1, §4).
- Sunrise/sunset now disc centre without refraction (a few minutes' shift; affects nazhigai, Rahu kalam, Yamagandam, Kuligai, Mandi).
- Weekday for Rahu kalam/Yamagandam/Kuligai now uses the civil local date (was UT date — wrong for births 00:00–05:30 IST).
- Mandi now uses the day/night ghati method (previous method was wrong for night births).
- Vimshottari dasa/bhukti/antharam rewritten to Kalai Magal date arithmetic; the running first dasa now lists only periods ending after birth.
- Ashtakavarga: Mars→Venus bindu row corrected (3,5,6,9,11,12).
#### Added
- `backend/app/services/kalai_report.py`, `POST /api/kalai/report` — Kalai-structured computation report (sections 1–7, 11; others flagged pending).
- Sripati bhava table and bhava chart; Kalai trikona/ekadhipatya reductions and pindas; true-ayanamsa display; nakshatra horai; nazhigai to tharparai.
- `backend/tests/test_kalai_parity.py` (REF-001).
- Frontend `/kalai-report` page, `components/kalai/KalaiReport.tsx`, `lib/kalaiApi.ts`, nav link.

### [2.0.0] — 2026-09-09
#### Added
- **50-பக்க சம்பூர்ண ஜாதக மகா காண்டம் (50-Page Vedic Jathaga Grand Volume & Manuscript)**:
  - Built an exhaustive 50-page traditional A4 manuscript book (`frontend/components/HandwrittenManuscript.tsx` and 14 chapter modules in `frontend/components/manuscript/`) with zero text overlapping, precise 794px × 1123px discrete page wrappers, and sequential PDF export.
  - **தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து (Invocations)**: Full authentic Tamil Thai Vazhthu poem (Manonmaniam Sundaranar), Lord Ganesha Stuti (Thirumandiram), Lord Muruga Stuti (Nalvazhi), Goddess Saraswati Vandanam, and Sri Dakshinamurthy Stotram on Pages 1–3.
  - **குஜ (செவ்வாய்) தோஷ மகா ஆய்வு & 14 சாஸ்திர விதிவிலக்குகள் (Kuja Dosha 14 Cancellation Rules Audit)**: Exhaustive 3-page treatise (Pages 28–30) computing Mars placement from Lagna, Moon, and Venus, severity percentages (100%, 50%, 25%, 0%), and a comprehensive 14 classical South Indian cancellation rules audit matrix with automated conditional verification (`backend/app/services/yoga_dosha.py`).
  - **அஷ்டகவர்க்க மகா காண்டம் & சோத்ய பிண்ட கணிதம் (Ashtakavarga Master Reductions & Pindas)**: 7-page chapter (Pages 21–27) featuring the 337-point Sarvashtakavarga Chakra, 8-donor Bhinnashtakavarga tables for all 7 planets and Lagna, Trikona Shodhana, Ekadhipatya Shodhana, and Rasi Pinda, Graha Pinda, and Shodhya Pinda with classical multipliers from BPHS Ch. 67–73 (`backend/app/services/ashtakavarga.py`).
  - **16 வர்க்க சக்கரங்கள் & பாவக சலிதம் (Complete 16 Shodashavarga Chakras & Bhava Chalit)**: 7-page chapter (Pages 11–17) computing and rendering all 16 divisional charts (D1 Rasi, D2 Hora, D3 Drekkana, D4 Chaturthamsa, D7 Saptamsa, D9 Navamsa, D10 Dasamsa, D12 Dvadasamsa, D16 Sodasamsa, D20 Vimsamsa, D24 Chaturvimsamsa, D27 Saptavimsamsa, D30 Trimsamsa, D40 Khavedamsa, D45 Akshavedamsa, D60 Shashtiamsa) plus Sripati Bhava Chalit, Vargottama, and Vaisheshikamsa dignity (`backend/app/services/sampoorana.py`).
  - **வாக்கியம் & திருக்கணிதம் இருமுறை இயக்கம் (Dual System Support)**: Seamless selection and distinct mathematical rendering for both வாக்கிய பஞ்சாங்கம் (Surya Siddhanta) and திருக்கணித பஞ்சாங்கம் (Chitrapaksha Lahiri) with 6 historical eras and dynamic Nazhigai/Vinazhigai metrics.
  - **ஊடாடும் பக்க வழிசெலுத்தல் & உயர்ரக PDF (Interactive 50-Page Navigator & Export)**: Interactive 14-chapter jump bar, page dropdown selector (Pages 1–50), Previous/Next controls, live crisp preview, and 50-page continuous high-res A4 PDF generator (`frontend/components/HandwrittenPdfButton.tsx`).

### [1.5.0] — 2026-09-08
#### Added
- **வாக்கிய பஞ்சாங்கம் முழுப் பக்கம் (Complete Full-Page Traditional Vakhyam Panchangam Engine & Manuscript)**:
  - Enabled authentic `swe.SIDM_SURYASIDDHANTA` sidereal mode in `backend/app/services/ephemeris.py` when `panchangam_system == "vakhyam"`, correctly aligning with Surya Siddhantic classical tables and Pambu Panchangam tradition.
  - Implemented traditional Jenana Vakhyam classical prose inscription in `backend/app/services/sampoorana.py` citing the 6 historical eras: Kali Yuga (கலியுகாதி), Salivahana Saka (சாலிவாகன சகாப்தம்), Vikrama Samvat (விக்ரம ஆண்டு), Kollam Era (கொல்லம் ஆண்டு), Pasali (பசலி ஆண்டு), and Hijri (ஹிஜ்ரி ஆண்டு).
  - Added Nazhigai/Vinazhigai metrics for all 5 Panchanga angas (Tithi, Nakshatra, Yoga, Karana, Vaaram) including Nazhigai elapsed (சென்ற நாழிகை) and balance (நின்ற நாழிகை).
  - Designed dedicated, rich full-page web card (`frontend/components/VakhyamCompleteCard.tsx`) with parchment styling, gold insignia, traditional inscriptions, and Surya Siddhanta comparative notes.
  - Redesigned Page 2 of `HandwrittenManuscript.tsx` into a discrete, un-sliced 1123px full traditional Vakhyam manuscript with palm-leaf borders, handwritten Kavivanar typography, and classical Venba verses.
- **பெற்றோர் & ஜாதக பயோடேட்டா (Comprehensive Parents & Matrimonial Horoscope Bio-Data)**:
  - Added `ParentsBioData` model across backend schemas (`backend/app/models/schemas.py`) and frontend interfaces (`frontend/lib/types.ts`).
  - Added comprehensive fields: Father Name & Occupation, Mother Name & Occupation, Gothram, Kula Deivam & Temple, Native Place, Caste/Sub-caste, Siblings, Candidate Education, Profession, Income, Height, Primary/Alternate Phone, and Address.
  - Redesigned `frontend/components/BirthDetailsForm.tsx` with a dedicated collapsible section for quick or comprehensive bio-data entry.
  - Added dedicated `BioDataCard.tsx` component in the main horoscope report, an authentic Bio-Data parchment plaque on Page 1 of `HandwrittenManuscript.tsx`, and a bio-data strip in `SinglePageReport.tsx`.

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
