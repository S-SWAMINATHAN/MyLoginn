# SUMMARY — Validation against your Kalai test reports (v3.4.0)

Date: 2026-09-28 · Reports used: T001, T01–T08 (Type D), plus REF-001

## 1. Results after this update

| Item | Result |
|---|---|
| Planet longitudes, 9 reports | ✅ all within 1″ (Mandi excepted, below) |
| Vimshottari bhukti end dates | ✅ **709 / 711 exact** |
| Kalachakra bhukti signs | ✅ **1,038 / 1,038** (both Savya and Apasavya, all 4 padas) |
| Kalachakra dates and ages | ✅ 972 / 1,038 exact (94 %); the rest are ±1-day edges |
| Dig bala / Naisargika bala | ✅ 56 / 56 each |
| Sthana bala | ✅ 52 / 56 |
| Shodasa varga totals | ✅ 79 / 90 (was 72; exaltation rule fixed) |
| Shadbala on the 2011 birth (T01) | ✅ every component exact |
| Tests | ✅ **33 / 33 passing** · frontend `tsc` 0 errors |

## 2. Three discoveries from the new reports

1. **Kalai's Delta-T.** Kalai uses an old Swiss Ephemeris whose ΔT keeps growing after 2011 (≈84 s in 2026 instead of the real ≈69 s). As a result, Kalai's Moon for recent births sits about 8″ ahead of true astronomy, which shifts dasa dates by a day or so. We now emulate this, calibrated on 18 Kalai printouts from 1973 to 2026.
2. **The general Kalachakra rule.**
   - **First dasa:** the Moon's navamsa sign. Apasavya stars use its mirror sign instead.
   - **Balance:** the unelapsed part of the pada multiplied by that sign's years.
   - **Bhukti order:** fixed by the direction and the dasa sign. The same table held on all 10 reports.
3. **Time zones.** Kalai accepts any offset. T08 used GMT −6:30 for Iowa, which we now support.

## 3. Still open (next work)

| Gap | Cause found | Next step |
|---|---|---|
| Cheshta bala (29 %) and Kala bala (39 %) for 2026 births | Kalai's mean-planet elements and some year/month/hora lords differ from ours outside ~2011 | Fit Kalai's mean elements from the 9 reports; re-derive abda/masa/hora |
| Drik bala (63 %) | Follows the cheshta and dignity issues | Re-check after the above |
| Rasi-row varga bala and planet-details dignity | Kalai uses a Tamil friendship table, e.g. Jupiter treats Mercury's sign as friendly, and Rahu/Ketu are friendly with Mercury and Jupiter | Needs the full table (the settings screenshots may show it) |
| Mandi on 3 reports | Birth near sunrise / weekday edge | Analyse T02, T03, T06 in detail |
| **KP system** | KP reports received (`Kp_all`, `Kp_type_a`) | **Next phase:** KP New Comb ayanamsa, Placidus cusps, star/sub/sub-sub lords, significators, KP dasa |
| Matching, single page, baby names | Reports received | Parity phases after KP |

## 4. Files changed

| File | Status |
|---|---|
| `backend/app/services/ephemeris.py` | Modified (ΔT emulation, `get_tz`) |
| `backend/app/services/kalai_kalachakra.py` | Rewritten |
| `backend/app/services/kalai_report.py` | Modified (Kalai ΔT) |
| `backend/app/services/kalai_varga.py` | Modified (exaltation rule) |
| `backend/app/services/kalai_shadbala.py` | Modified (fixed-offset time zones) |
| `backend/app/services/gochara.py` | Modified (fixed-offset time zones) |
| `backend/app/api/charts.py` | Modified (whole chart uses Kalai ΔT) |
| `backend/tests/test_kalai_parity.py` | Modified (Savya, ΔT and time-zone tests) |
| `frontend/lib/kalaiApi.ts` | Modified |
| `frontend/components/kalai/KalaiReport.tsx` | Modified (direction-aware Kalachakra) |
| `AGENTS.md` | Modified |

**User-visible change:** for births from 2011 on, planet positions now follow Kalai Magal, which is up to ~8″ different from true astronomy for the Moon. This is intentional for parity. It can be switched off with `KALAI_DELTA_T_ENABLED = False` in `ephemeris.py`.
