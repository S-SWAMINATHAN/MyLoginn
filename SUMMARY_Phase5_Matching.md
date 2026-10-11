# SUMMARY — Phase 5: Marriage matching, 12 poruthams (v4.2.0)

Reference printouts: `matching.pdf`, `Match.pdf`, `Match_1.pdf` (3 couples).

## 1. Verification

| Check | Result |
|---|---|
| All 12 porutham rows (points and verdict) × 3 couples | ✅ **36 / 36** |
| Totals and percentages (13/37 35.14 %, 18/37 48.65 %, 19/37 51.35 %) | ✅ 3 / 3 |
| "பொருத்தம் உண்டு / இல்லை" (≥ 50 %) | ✅ 3 / 3 |
| Sevvai dosham, 6 people (பரிகார / இல்லை) and the match verdict | ✅ 6 / 6, 3 / 3 |
| Rajju verdict | ✅ 3 / 3 |
| Dasa sandhi (incl. "Sun dasa 06-04-2041 / Guru dasa 18-09-2040") | ✅ 3 / 3 |
| Per person: star, pada, dasa balance, bhava change (பாவக மாற்றம்) | ✅ 6 / 6 (the DST case included) |
| Current dasa-bhukti end date | ✅ 5 / 6 (1 is one day off; also depends on the print date) |
| Tests | ✅ **43 / 43** · frontend `tsc` 0 errors |

## 2. Kalai's rules (decoded)

Counts run from the girl's star or rasi to the boy's.

| Porutham | Max | Kalai rule |
|---|---|---|
| Dinam | 3 | count mod 9 ∈ {2, 4, 6, 8, 0} |
| Ganam | 4 | girl Rakshasa, boy not → 0 |
| Mahendram | 2 | count 4, 7, 10 … 25 |
| Stree Deergham | 2 | > 13 → 2 · 7–13 → 1 |
| Yoni | 4 | different, non-enemy animals → 2, but **1 if the girl's yoni is male and the boy's is female**. Tamil genders: Chitra tiger male, Vishakha tiger female. |
| Rasi | 3 | count 11 → 3 · count 6 → 1 |
| Rasi Adhipathi | 4 | enemy + neutral → 1 · enemy + enemy → 0 |
| Vasiyam | 3 | only the **girl's** vasya list counts: it holds the boy's rasi → 2. Tamil vasya table (Vrischika → Kataka, Kanni; Thula → Kanni, Makara). |
| Rajju / Vedhai / Nadi | 5 / 4 / 2 | different → full points |
| Varnam | 1 | boy's varna ≥ girl's |
| Sevvai | — | Mars in 2, 4, 7, 8, 12 **from Lagna only**. With a cancellation → பரிகார செவ்வாய். Match when both have none, or both have one. |
| Dasa sandhi | — | any future mahadasa end of the girl within 1 year of one of the boy's |

## 3. What the 3 samples could not show

Rows that fall on these branches are computed by the classical rule. They are shown with an asterisk (\*) in the app and `"verified": false` in the API:

- **Ganam:** same gana, girl Deva / boy Manusha, boy Rakshasa.
- **Yoni:** same animal, enemy animals.
- **Rasi:** counts other than 6 and 11.
- **Rasi Adhipathi:** friend pairs.
- **Vasiyam:** mutual vasya.
- **Vedhai:** a vedha pair.
- **Varnam:** 21 of the 27 stars. Kalai uses its own star → varna table; so far seen: Krittika Vaisya, Pooram Kshatriya, Uttaram Sudra, Hastham Sudra, Visakham Kshatriya, Kettai Brahmana.
- **Sevvai:** a full dosham with no cancellation.

**To close these gaps, 5 more matching printouts would help, ideally with:**
- **Same gana** (e.g. both Deva stars).
- **Same yoni animal** (e.g. Ashwini girl with a Sathayam boy).
- **A vedha pair** (e.g. Ashwini girl with a Kettai boy).
- **Rasi counts 2, 7 and 8** from the girl to the boy.
- **Stars not yet seen,** for the varna table.

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_matching.py` | **New** |
| `backend/app/api/kalai.py` | Modified (`POST /api/kalai/matching`) |
| `backend/tests/test_kalai_parity.py` | Modified (+2 tests) |
| `frontend/app/kalai-matching/page.tsx` | **New** |
| `frontend/lib/kalaiApi.ts` | Modified |
| `frontend/components/Header.tsx` | Modified ("12 பொருத்தம்" link) |
| `AGENTS.md` | Modified |

The existing `/porutham` page is unchanged; the Kalai version lives at `/kalai-matching`.
