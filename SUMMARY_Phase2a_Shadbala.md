# SUMMARY — Phase 2a: Shadbala & Bhava Bala (Kalai Magal parity)

Date: 2026-09-27 · Version 3.1.0

Phase 2 was split to keep each delivery verified. **2a (this delivery): Shadbala, Ishta/Kashta, Bhava bala.** 2b (next): shodasa-varga tables, planet details table, Panchapakshi weekly table, numerology letter check.

## 1. Verification vs REF-001 (rupas, as Kalai prints)

| Component | Result |
|---|---|
| Sthana bala | ✅ 7/7 exact |
| Dig bala | ✅ 7/7 exact |
| Naisargika | ✅ 7/7 exact |
| Kala bala | ✅ 7/7 within 0.005 |
| Drik bala | ✅ 6/7 exact · ⚠️ Moon −0.567 vs −0.657 |
| Cheshta bala | ✅ Sun, Moon, Mars, Jupiter, Venus, Saturn within 0.03 · ⚠️ Mercury 0.818 vs 0.891 |
| Total shadbala | ✅ 5/7 within 0.01 · ⚠️ Moon +0.09 · ⚠️ Mercury −0.07 |
| Percentage / rank | ✅ ranks 7/7 exact; percentages 5/7 exact (Moon 108 vs 106, Mercury 103 vs 104) |
| Ishta / Kashta | ✅ Moon, Mars, Jupiter, Venus, Saturn within 0.01 · ⚠️ Sun ~0.03 · ⚠️ Mercury follows its cheshta gap |
| Bhava dig bala | ✅ 12/12 exact |
| Bhava drik bala | ✅ 9/12 exact · ⚠️ houses 6, 7, 11 open |
| Test suite | ✅ 28/28 passing (2 new) |
| Frontend `tsc` | ✅ 0 errors |

Several kala-bala rules were decoded from this one report and are marked "derived from 1 reference" in code: vara from the civil weekday, the hora starting point, the abda/masa epoch, clock-time natonnata, and two bhava-dig sign classes. The two extra Type D reports you are sending (a day birth and a different weekday) are exactly what confirms or corrects them.

## 2. Files

| File | Status | Change |
|---|---|---|
| `backend/app/services/kalai_shadbala.py` | **New** | Full engine and documented conventions |
| `backend/app/services/shadbala.py` | Modified | Routes to the Kalai engine when birth context is given; legacy path kept |
| `backend/app/api/charts.py` | Modified | Passes jd/lat/lon/date/time/tz to Shadbala |
| `backend/app/models/schemas.py` | Modified | Optional new fields only |
| `backend/app/services/kalai_report.py` | Modified | Section 8 computed |
| `backend/tests/test_kalai_parity.py` | Modified | + Shadbala and Bhava-bala tests |
| `frontend/lib/kalaiApi.ts` | Modified | Shadbala types |
| `frontend/components/kalai/KalaiReport.tsx` | Modified | Shadbala, rank and Bhava-bala tables |
| `frontend/components/manuscript/Chapter5Shadbala.tsx` | Modified | **Removed invented fallback data** and the static Bhava table; shows computed values |
| `AGENTS.md` | Modified | §4.1 rows, §4.2 gaps, changelog 3.1.0 |

## 3. What users will notice

- **The 50-page manuscript's Shadbala pages now show real computed values.** Previously any planet with a 0 value (for example Sun's cheshta) silently received a made-up number, and the 12-house Bhava bala table was identical for every chart.
- **Shadbala totals change for every chart.** The old engine was simplified; for example, Sun in REF-001 went from 4.06 to 6.63 rupas.

## 4. Open items

- Moon drik, Mercury cheshta, and Bhava drik for houses 6, 7 and 11 are waiting on the new reference reports.
- Phase 2b: shodasa-varga tables, planet details table, Panchapakshi weekly table, numerology letter check.
