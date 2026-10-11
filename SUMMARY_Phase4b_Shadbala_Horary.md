# SUMMARY — Phase 4b: Shadbala parity for recent births + KP Horary (v4.1.0)

## 1. Shadbala: what was wrong and what changed

Measured on the eight Type D test reports (T001–T08; 56 planet values per component).

| Component | Before (4.0.0) | Now (4.1.0) | Fix |
|---|---|---|---|
| Cheshta bala | 16 / 56 | **49 / 56** | Kalai's "mean planets" differ from modern J2000 elements by near-constant amounts: Mars −1.0°, Mercury +13.1°, Jupiter +1.1°, Venus +3.7°, Saturn −2.4°. Measured from 9 reports. |
| Kala bala | 22 / 56 | **26 / 56 exact, 56 / 56 within 0.007 rupa** | Moon counts as malefic in Krishna paksha. Mercury is malefic for paksha when it shares a sign with Sun, Mars or Saturn. Kalai's year and month lords (abda/masa) start 11 days later. |
| Dig, Naisargika | 56 / 56 | 56 / 56 | — |
| Sthana | 52 / 56 | 52 / 56 | — |
| Drik | 35 / 56 | 35 / 56 | Open (small aspect-strength differences) |

**Still open**
- **Kala bala:** the remaining ≤ 0.42 virupa differences come from rounding in the ayana part. Six formula variants were tested, and none closes it.
- **1945 report (T04):** Kalai's mean Sun for that era is about 10° away from ours. More pre-1990 reports are needed to model it.
- **Cheshta, Venus:** off by 1.3 virupa on 2 reports.

## 2. KP Horary (Prasna) 1–249

- **Standard KP method (KP Reader VI).** The 243 star-subs split at sign boundaries = 249 numbers. The number fixes the Ascendant at the start of its sub. The other cusps are Placidus for the query place. Planets are taken at the query moment. Output is the full KP report: lords, significators, aspects and dasa.
- **Table checked:** 1 = 0°00′ Ketu/Ketu, 2 = 0°46′40″, 3 = 3°00′00″, 249 = 357°53′20″ Mercury/Saturn. These are the published KP horary table values.
- **Clearly labelled** in the app as "standard KP, not yet compared with a Kalai printout".
- **Kalai's 1–2049 horary is not built.** That numbering is Kalai-specific; with no printout, building it would be guessing.

## 3. Matching and baby names — why they are not started

| Feature | What we have | What is needed |
|---|---|---|
| Matching | One couple: 12 poruthams with graded points (e.g. Stree Deergham 1/2, Yoni 2/4, Rasi Adhipathi 1/4), total 13/37 = 35.14 %, plus Sevvai, Rajju and Dasa-sandhi verdicts | **5–6 more matching printouts** covering different star pairs (one sample cannot fix the grading rules) |
| Baby-name numbers | Allowed name totals from 5 printouts (e.g. date 1 / total 2 → 15-24-33-42-69) | **3–4 more** baby-name printouts on different birth dates, to derive the rule |

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_shadbala.py` | Modified (mean-element corrections, paksha rules, ahargana epoch) |
| `backend/app/services/kalai_kp.py` | Modified (horary table, `compute_kp_horary`, cusp override) |
| `backend/app/api/kalai.py` | Modified (`POST /api/kalai/kp-horary`) |
| `backend/tests/test_kalai_parity.py` | Modified (+2 tests) |
| `frontend/app/kp-report/page.tsx` | Modified (Birth chart / Horary modes) |
| `frontend/lib/kalaiApi.ts` | Modified |
| `AGENTS.md` | Modified |

Tests: **41 / 41 passing** · frontend `tsc` 0 errors.
