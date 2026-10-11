# SUMMARY — Phase 8: Baby Names (Kalai report types) + Horary 1–2193 (v4.5.0)

Reference: BN1–BN4, `baby_names.pdf`, the package baby report, and the numerology pages of REF-001, T04 and `single_page.pdf`.

## 1. Verification

| Item | Result |
|---|---|
| Name totals (Chaldean) for every name printed by Kalai | ✅ **2,987 / 2,988** (the 1 miss is a Kalai spelling: MAHANANDIN printed 33, letters give 34) |
| Date number / destiny number | ✅ all printouts |
| Allowed name numbers | ✅ the 9 (date, destiny) pairs seen are reproduced exactly |
| Star letters | ✅ Uttarattathi, Punarpoosam, Aayilyam as printed; other 24 stars use the classical Tamil table |
| Initial rule ("R.AAKASH 15": with initial; "AALOK 14": plain) | ✅ same behaviour |
| Horary 1–2193 table | ✅ exactly 2,193 divisions |
| Tests | ✅ **55 / 55** · frontend `tsc` 0 errors |

## 2. How Kalai builds a baby-name list

1. **Date number** = digit sum of the day (29 → 2). **Destiny** = digit sum of the whole date.
2. **Allowed name numbers.** Kalai uses its own table keyed by (date number, destiny). For example (7, 2) → 15-24-33-42-51-69-38-47.
3. **Name total.** Each name is totalled with the Chaldean letter values. If the total **with the initials** is allowed, Kalai prints "D.NAME total". If the name alone is allowed, it prints "NAME total".
4. **Star letters.** The name must start with one of the star's letters (types that use the star).

The 7 report types combine these filters:

| Report type | Filter |
|---|---|
| Single Star Letter Only | a chosen first letter |
| Single Numerology No Only | a chosen total |
| Star Letters Only | the star's letters |
| Numerology Numbers Only | allowed totals |
| Single Star Letter + Numerology | a chosen letter + allowed totals |
| Single Numerology No + Star | the star's letters + a chosen total |
| Star + Numerology Details | the star's letters + allowed totals |

## 3. Limits (honest)

- **Allowed-number table.** Kalai's table has 81 (date, destiny) pairs and 9 are known. For the others the site combines Kalai's root groups for the two numbers and marks the list with an asterisk (\*). **Each baby-name printout on a new birth date adds one pair** — any date works.
- **Names.** The names come from **your own name bank**. Kalai's name database is its data and is not copied. So the list is built the same way, but it holds your names, not Kalai's.
- **Horary 1–2193.** The numbering is the standard KP sub-sub division. Your printouts only used number 1, which is 0° in every scheme. A printout with any other number (e.g. 500) would confirm it.

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_baby_names.py` | **New** |
| `backend/app/services/kalai_kp.py` | Modified (1–2193 table, `level`) |
| `backend/app/api/kalai.py` | Modified (`/baby-names`, horary `system`) |
| `backend/tests/test_kalai_parity.py` | Modified (+3 tests) |
| `frontend/app/kalai-baby-names/page.tsx` | **New** |
| `frontend/app/kp-report/page.tsx` | Modified (horary system 1–249 / 1–2193) |
| `frontend/lib/kalaiApi.ts`, `frontend/components/Header.tsx` | Modified |
| `AGENTS.md` | Modified |
