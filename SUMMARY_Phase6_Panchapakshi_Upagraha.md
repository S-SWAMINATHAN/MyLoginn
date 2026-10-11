# SUMMARY — Phase 6: Panchapakshi, Upagraha Spudam, Prasthara Ashtakavarga (v4.3.0)

Reference data: the Panchapakshi, Upagraha and Prasthara pages of REF-001 and T001–T08, including T01's detailed "2+21 pages".

## 1. Verification

| Item | Result |
|---|---|
| Birth bird (star × paksha) | ✅ 9 / 9 reports |
| Panchapakshi activity grids (weekday × 10 yamas) | ✅ **126 / 126 rows** |
| Bird attributes (padu days, letters, colour, direction, ruling days, friends/enemies) | ✅ match Kalai, including the Peacock values derived below |
| Detailed pages: bird, sub-activity, start–end time, relation, result | ✅ **500 / 500 rows** |
| Upagraha spudam, 10 points | ✅ **68 / 68 values** within 1″ |
| Mandi | ✅ **9 / 9 reports** (was 6 / 9) |
| Prasthara ashtakavarga, 7 planets | ✅ all column totals and matrices checked exact |
| Tests | ✅ **48 / 48** · frontend `tsc` 0 errors |

## 2. How the Peacock tables were obtained (no guessing)

None of your reports has the Peacock as a birth bird.

- **Activity grid.** In every yama the five birds do five different activities. This holds on all 140 cells of the other four birds. So the Peacock's activity is the one left over in each cell.
- **Padu days, name letters, colour and direction.** Each is the value left over among the five birds.
- **Check.** Kalai's detailed pages name the Peacock where these rules predict it: Wednesday padu bird, Saturday ruling bird and others.

## 3. Rules decoded

**Birth bird.** Waxing half: stars 1–5 Vulture · 6–11 Owl · 12–16 Crow · 17–21 Cock · 22–27 Peacock. Waning half: the reverse order.

**Detailed sub-periods.**
- **Sub-period order.** Each yama splits into 5 sub-periods that follow a fixed activity cycle, starting from the birth bird's own activity. Each sub-period belongs to the bird doing that activity.
- **Lengths.** Sub-period minutes depend on paksha and day/night. Waxing day: Eat 30, Walk 36, Rule 48, Sleep 18, Death 12.
- **Result.** The result (Very Good … Very Bad) follows from three things: the main activity, the sub-activity, and whether that bird is Self, Friend or Enemy. Kalai uses the **birth paksha's** friend list in both halves.

**Upagrahas.**
- **Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu:** from the Sun, using the classical formulas.
- **Gulika:** the same value as Mandi.
- **Kala, Mrityu, Ardhaprahara, Yamaghantaka:** Mandi's ghati table, shifted by −1, −3, +3 and +2 weekdays.

**Neighbouring-night rule.** This fixed Mandi and the time-based upagrahas. Kalai measures the night before sunrise from the birth-date sunset minus one day, and the night after sunset to the birth-date sunrise plus one day. It does not use the true previous sunset or next sunrise.

## 4. Noted Kalai inconsistency

For the **Cock in the waning half**, Kalai's 2-page summary prints the waxing ruling days (Friday day; Monday/Wednesday night). Its detailed pages show Sunday/Tuesday day and Monday/Saturday night, and those agree with every other bird. We use the detailed-page values.

## 5. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_panchapakshi.py` | **New** |
| `backend/app/services/kalai_upagraha.py` | **New** |
| `backend/app/services/kalai_report.py` | Modified (sections 13–16, prasthara) |
| `backend/app/services/ephemeris.py` | Modified (Mandi neighbouring-night rule) |
| `backend/tests/test_kalai_parity.py` | Modified (+4 tests) |
| `frontend/components/kalai/KalaiReport.tsx` | Modified (Panchapakshi, detailed pages, Upagraha, Prasthara; new model preset) |
| `frontend/lib/kalaiApi.ts` | Modified |
| `AGENTS.md` | Modified |
