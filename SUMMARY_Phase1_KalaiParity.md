# SUMMARY — Phase 1: Kalai Magal Calculation Parity

Date: 2026-09-27 · Version: 3.0.0 (breaking: calculation outputs change)

## 1. How parity was measured

The Kalai Magal package itself cannot be read as source: the program is compiled, licence-locked with a HASP dongle, and its text database is encrypted. So parity was measured by **comparing outputs**.

A 54-page Kalai Magal "Type D" customer report was chosen as the reference. Its Tamil text was stored in the old TAB font encoding and was decoded to Unicode. The same birth data (anonymised as **REF-001**) was then run through our engine and compared number by number. No customer names or family details were used or stored.

## 2. Verification results (REF-001)

| Section | Result |
|---|---|
| Planet longitudes (9 grahas + Lagna) | ✅ within 1″ |
| Mandi | ✅ 270°37′12″ vs 270°37′11″ (previously wrong: 15°37′) |
| Sunrise / sunset | ✅ 06:19:58 AM / 06:28:17 PM exact |
| Ayanamsa display | ✅ 23°49′51″ exact |
| Nakshatra horai | ✅ 13:46:49 exact (new) |
| Udhayathi nazhigai | ✅ 47-30-05 vs 47-30-06 (0.4 s) |
| Bhava spudam (Sripati, 36 values) | ✅ exact |
| Dasa balance | ✅ Rahu 0 y 3 m 14 d exact |
| Bhukti end dates | ✅ **73 / 73 exact**, printed ages exact |
| Antharam end dates | ⚠️ **558 / 567 exact**; 9 are one day late (open item) |
| Bhinnashtakavarga, 7 planets | ✅ all 84 values exact |
| Trikona / ekadhipatya charts | ✅ all 7 planets exact |
| Pindas (8 figures × 7 planets) | ✅ all 56 exact |
| Sarvashtakavarga | ✅ all 12 signs exact (previously 2 wrong) |
| Test suite | ✅ 26 / 26 passing (5 new parity tests) |
| Frontend `tsc --noEmit` | ✅ 0 errors |

## 3. Files

| File | Status | What changed |
|---|---|---|
| `AGENTS.md` | Modified | Kalai Magal made the reference standard; rules §1.9–1.10 added; new §4 "Kalai Magal Parity Standard" (decoded conventions, open gaps, requested scope); changelog 3.0.0 |
| `backend/app/services/ephemeris.py` | Modified | Sunrise/sunset without refraction; Mandi by day/night ghati method; weekday bug fix for 00:00–05:30 births (was UT date); true-ayanamsa display; nakshatra horai; nazhigai to tharparai; new `basic_details` keys |
| `backend/app/services/dasha_builder.py` | Rewritten | Kalai date arithmetic; running dasa lists only periods ending after birth; new fields `end_date_display`, `age_ymd`, `running_at_birth`, `kalai_ta`; old keys kept |
| `backend/app/services/ashtakavarga.py` | Modified | Mars→Venus row corrected to 3,5,6,9,11,12 |
| `backend/app/services/kalai_report.py` | **New** | 13-section Kalai report: Sripati bhava and bhava chart; Kalai trikona/ekadhipatya; pindas |
| `backend/app/api/kalai.py` | **New** | `POST /api/kalai/report` |
| `backend/app/main.py` | Modified | Registers the Kalai router |
| `backend/tests/test_kalai_parity.py` | **New** | REF-001 regression tests |
| `backend/tests/test_calculations.py` | Modified | First dasa may now have fewer than 9 bhuktis |
| `backend/tests/test_accuracy_multiyear.py` | Modified | Sunrise 06:40 → 06:43 and sunset 06:09 → 06:06 (no-refraction convention) |
| `frontend/lib/kalaiApi.ts` | **New** | Types + API client (`types.ts` and `api.ts` untouched) |
| `frontend/components/kalai/KalaiReport.tsx` | **New** | Kalai-order report in the manuscript theme; South charts; A4 pages; PDF export via the existing `pdfExport.ts` |
| `frontend/app/kalai-report/page.tsx` | **New** | Page reusing `BirthDetailsForm` |
| `frontend/components/Header.tsx` | Modified | Adds a "கணித ஜாதகம் / Computation Report" nav link |

Nothing was removed.

## 4. What users will notice

- **Sunrise and sunset times shift by 2–4 minutes.** This is the Kalai convention (no refraction). Rahu kalam, Yamagandam and Kuligai move with them.
- **Dasa dates change by a few days.** They are now Kalai-exact.
- **Mandi changes substantially for night births.**
- **The existing 50-page manuscript and single-page report pick all of this up automatically,** because they read the same services.

## 5. Install

```powershell
# Backend: copy the files over the existing ones, then
cd backend
python -m pytest -q tests
uvicorn backend.app.main:app --reload

# Frontend: copy the files, then
cd frontend
pnpm tsc --noEmit
pnpm dev   # open /kalai-report
```

No new dependencies are required.

## 6. Open items → next phases

- **Antharam:** 9 dates off by one day. The cause is not yet identified; three rounding and anchoring variants were tested and ruled out.
- **Ekadhipatya rule:** derived from one report. Needs 1–2 more reports to confirm the "equal pair, both occupied → 0" branch.
- **Phase 2:** shadbala rewrite to Kalai values (current engine is simplified; Sun 4.06 vs 6.63 rupas); shodasa-varga tables (guna, bala, adhipati); planet details table; Panchapakshi weekly table; numerology letter table check (Kalai: A1 B2 C3 D4 E5 F8 G3 H5 I1 J1 K2 L3 M4 N5 O7 P8 Q1 R2 S3 T4 U6 V6 W6 X5 Y1 Z7).
- **Phase 3:** Kalachakra dasa, KP system, horary.
- **Later phases:** report presets, gochara palan, utilities, matching and baby-name parity.

To close the two uncertain items fastest, please export 2 more Kalai reports (Type D) — one day birth and one from a different weekday — and upload them. They are used only as anonymised fixtures.
