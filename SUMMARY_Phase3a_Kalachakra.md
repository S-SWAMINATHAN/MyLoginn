# SUMMARY — Phase 3a: Kalachakra Dasa

Date: 2026-09-28 · Version 3.3.0

## 1. Result vs REF-001 (Apasavya, Ardra pada 4)

| Item | Result |
|---|---|
| Direction (இட ஓட்டு) and starting dasa (Dhanus, Guru) | ✅ exact |
| Balance 0 y 7 m 21 d | ✅ exact |
| Dasa order (12 dasas) | ✅ 12/12 |
| Bhukti signs (100 rows) | ✅ **100/100** |
| Bhukti start/end dates and ages | ✅ 88/100 exact; 12 are ±1-day edge cases, the same kind as the open antharam gap |
| Tests | ✅ **32/32 passing** (2 new) |
| Frontend `tsc` | ✅ 0 errors |

## 2. How Kalai Magal computes it (decoded)

- **First dasa.** The first dasa is the LAST sign of the 9-sign chain of the Moon's pada. Its balance is the unelapsed part of the pada multiplied by that sign's years.
- **Dasa order.** Each later dasa moves one sign anti-clockwise.
- **Bhukti order.** Each later dasa's bhuktis follow a reversed pada chain. The first uses the birth chain, and each following dasa steps one chain back through S1 S2 S3 S4 A1 A2 A3 A4.
- **Bhukti length.** Bhukti length = dasa years × bhukti-sign years ÷ chain total.
- **Dates.** Same Y/M/D date arithmetic as Vimshottari.

## 3. What is NOT done, and why

| Item | Status | Needed from you |
|---|---|---|
| Kalachakra for **Savya** births (Ashwini, Bharani, Krittika, Punarvasu, Pushya, Ashlesha, Hasta, Chitra, Swati, Moola, Purvashadha, Uttarashadha, Purva Bhadra, Uttara Bhadra, Revati) | Section shows "Savya reference needed" | 1 Kalai Type D report of a Savya-star birth |
| Running bhukti of the first dasa, Apasavya padas 1–3 | Dasa shown; bhukti line marked "verification pending" | Any Apasavya-star report in pada 1, 2 or 3 |
| **KP system** (star/sub lords, KP cusps, significators) | Not started | 1 Kalai **KP** report (Type A or "KP All") |
| **Horary** (1–249, 1–2049) | Not started | 1 Kalai horary printout per range, with the number and time used |

The package contains no KP or horary output. Building them without a reference would mean guessing, which AGENTS.md §1.2 forbids.

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_kalachakra.py` | **New** |
| `backend/app/services/kalai_report.py` | Modified (section 12) |
| `backend/tests/test_kalai_parity.py` | Modified (+2 tests) |
| `frontend/lib/kalaiApi.ts` | Modified (types) |
| `frontend/components/kalai/KalaiReport.tsx` | Modified (Kalachakra pages) |
| `AGENTS.md` | Modified (§4.1 row, §4.2 gaps, changelog 3.3.0) |
