# SUMMARY — Phase 2b: Shodasa Varga, Planet Details, Numerology check

Date: 2026-09-28 · Version 3.2.0

## 1. Verification vs REF-001

| Item | Result |
|---|---|
| Varga-sign lords (16 vargas × 10 points) | ✅ **160/160 exact** |
| Shodasa varga bala values (16 × 10) | ✅ **160/160 exact** |
| Shodasa varga totals and rupas (10 points) | ✅ exact |
| Planet details: bhava, suyam bhava %, lordships, kendra/trikona | ✅ 9/9 planets exact |
| Planet details: dignity, conjunctions, aspects, retro/combust/vargottama, parivartana | ✅ all match the Kalai table |
| Graha yuddha (Mars–Saturn, Saturn wins) | ✅ matches (brightness rule, derived from 1 reference) |
| Shadbala class (பூர்ண / மத்திம / அதம) | ✅ 7/7 (thresholds derived from 1 reference) |
| Numerology letter table and core numbers | ✅ identical, no change needed |
| Tests | ✅ **30/30 passing** (2 new) |
| Frontend `tsc` | ✅ 0 errors |

## 2. Rules decoded from Kalai's output

- **Temporal friendship is judged inside each varga chart.** In every divisional chart, the relationship between a planet and its sign lord uses their positions in *that* chart. This is why a planet can score 22.5 in one varga and 15 in another under the same lord.
- **The Rasi row is different.** It uses natural friendship only, and a debilitated planet gets 1.875.
- **Rahu/Ketu relationships.** Friends are Venus and Saturn, neutral are Mercury and Jupiter, and enemies are Sun, Moon and Mars. This held consistently across all 15 vargas.
- **Lagna.** Its varga score equals the score of the lord of its varga sign in that varga.

## 3. Files

| File | Status | Change |
|---|---|---|
| `backend/app/services/kalai_varga.py` | **New** | Vargas, varga bala, planet details |
| `backend/app/services/kalai_report.py` | Modified | Sections 9 and 10 |
| `backend/tests/test_kalai_parity.py` | Modified | + 2 tests |
| `frontend/lib/kalaiApi.ts` | Modified | Types |
| `frontend/components/kalai/KalaiReport.tsx` | Modified | 16 charts, varga bala, varga lords, planet details |
| `AGENTS.md` | Modified | §4.1 rows, §4.2 gaps, changelog 3.2.0 |

## 4. Panchapakshi (section 13) — why it is still pending

- **Kalai prints two sets of tables.** One is for Shukla paksha (waxing) and one for Krishna paksha (waning). Each set gives the friends, enemies, padu days, ruling birds, and a 7-day × 10-yama activity grid. Yamas start at a fixed 06:00 and last 2 h 24 m each.
- **Our current table is wrong for the Owl.** The existing table in `sampoorana.py` gives Owl friends Crow and Cock, enemies Peacock and Vulture, and padu days Sunday and Tuesday. Kalai gives different values for both pakshas.
- **I can't reconstruct the other four birds.** REF-001 contains only the Owl, and I will not invent tables for the other four (AGENTS.md §1.2).

**To close it:** upload Kalai reports whose birth stars fall under the other four birds, or a scan or photo of the Pancha Pakshi tables from a book you trust.

| Bird | Birth nakshatras |
|---|---|
| Vulture | Ashwini – Mrigashirsha |
| Crow | Uttara Phalguni – Vishakha |
| Cock | Anuradha – Shravana |
| Peacock | Dhanishta – Revati |

## 5. Next

- **Phase 2c:** Panchapakshi, once the tables above are available.
- **Phase 3:** Kalachakra dasa, the KP system, horary.
- **When the 2 new Type D reports arrive:** confirm the "derived from 1 reference" rules.
