# SUMMARY — Second printout batch (v4.4.0)

Files used: BN1–BN4, M1–M6, D1–D3, E1, H1, horary1–4, and the screenshots (Tamil→English, Model Setup, Time Correction).

## 1. Results

| Area | Before | Now |
|---|---|---|
| **Matching** (9 Kalai printouts) | 3 couples exact | ✅ **all 9 exact**: 108/108 rows, totals, Sevvai, Rajju, dasa sandhi |
| **Tamil date / Tamil→English** | 7 of 10 | ✅ **28 of 28** Kalai dates (10 horoscopes, 12 matching natives, 6 converter screenshots) |
| **KP ayanamsa** | 1977 only | ✅ 1977, 2019 (E1) and 2026 (horary) all exact |
| **KP horary** (planets, dasa balance) | not compared | ✅ planets exact, balance exact; cusps within 4″ |
| **Shadbala, old births** (1960, 1975, 1985) | unknown | ✅ **every component exact**, no change needed |
| **Time correction list** | 3 options | ✅ all 5 Kalai options |
| **Model Setup presets** | Type D only | ✅ Type B, Type C, Type D, Palan |
| Tests | 48 | ✅ **52 / 52** · frontend `tsc` 0 errors |

## 2. What the new printouts revealed

- **Matching.**
  - **Varna goes by the Moon's rasi, not the star.** Visakam pada 2 (Thulam) is Kshatriya; Visakam pada 4 (Vrischikam) is Brahmana.
  - **Rasi porutham.** Counted from the girl to the boy: count 7 scores 0 (not good), and count 5 scores 0.
  - **Vasiyam.** Mutual vasiyam still scores 2, not 3.
  - **Ganam.** Deva girl + Rakshasa boy scores 2.
  - **Yoni.** A male-yoni girl with a female-yoni boy scores 1, even for the same animal (horse / mare). Kalai makes Thiruvathirai's dog male.
  - **Sevvai.** Mars in a merely friendly sign is **not** a cancellation (M2 prints full "Dosha").
  - **Dasa sandhi.** Only the next **3** mahadasa changes are compared (the Ini "Dasa Nos = 3" setting).
- **Tamil calendar.** Kalai uses a Surya-Siddhanta (Vakya-style) true Sun for Tamil months, both in horoscopes and in the converter. This is why Aavani and Purattasi 2026 start on the 18th.
- **KP New Comb.** Kalai's KP ayanamsa follows the *mean* Lahiri minus about 42″. That explains why a fixed offset from the true value failed on the 2019 report.
- **KP-Old** (shown on horary1/2) is the standard Swiss "Krishnamurti" ayanamsa (24:08:11 in 2026, exact).
- **Time correction options:** Standard · DST · Double Summer Time (2DST) · War Time · DST + War Time.
- **Model presets.** Type C also ticks Prasthara, Upagraha and the 2+21 Panchapakshi. Type B uses the 2-page Panchapakshi and omits Prasthara and Upagraha.

## 3. Not done in this update (next)

| Item | Status |
|---|---|
| **Baby names** (BN1–BN4) | Decoded next: letter rule, allowed name numbers, report types |
| **Horary 1–2193** | Likely the sub-sub division (243 × 9 + 6 sign splits = 2193). Only number 1 was printed, and every scheme gives 0° for it, so it's implemented next with a note. |
| **Ananda ayanamsa** | One point (1985: 23:31:01, i.e. mean Lahiri − 7′55″). One more Ananda report, any birth after 2010, would fix its rate. |
| **Palan text** | Waiting for your decision (original text recommended) |

## 4. Files changed

| File | Change |
|---|---|
| `backend/app/services/kalai_matching.py` | Rules updated from 9 printouts |
| `backend/app/services/kalai_tamil_calendar.py` | Surya-Siddhanta true-Sun months |
| `backend/app/services/kalai_kp.py` | Mean-based KP New Comb, KP-Old |
| `backend/app/services/ephemeris.py` | 2DST and DST + War Time |
| `backend/tests/test_kalai_parity.py` | +5 tests (52 total) |
| `frontend/lib/kalaiApi.ts` | Time correction types |
| `frontend/components/kalai/KalaiReport.tsx` | Type B, Type C, Palan presets |
| `frontend/app/kalai-report/page.tsx`, `kalai-utilities/page.tsx`, `kalai-matching/page.tsx` | New time-correction options |
| `AGENTS.md` | Rules and changelog 4.4.0 |
