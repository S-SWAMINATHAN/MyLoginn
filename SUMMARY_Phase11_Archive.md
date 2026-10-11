# SUMMARY — KALAI_ASTRO archive check and fixes (v4.8.0)

The archive holds **136 Kalai reports**:
- 95 Thirukanitham horoscopes (20 full reports of 10+ pages, 75 single-page)
- 36 baby-name reports
- 4 matching reports (3 Thirukanitham, 1 Vakyam)
- 1 Vakyam horoscope

There are **no KP, numerology-only or horary reports** in it; KP and horary were checked earlier with your separate printouts. Every report was compared with the website automatically.

## 1. What already matched (no change needed)

| Check | Result |
|---|---|
| Planet longitudes incl. Lagna and Mandi (95 horoscopes) | ✅ **635 / 635** within 1″ |
| Vimshottari bhukti end dates | ✅ **1,531 / 1,531** |
| Upagraha positions (13 full reports) | ✅ **104 / 104** |
| Name totals (Chaldean) printed in 36 baby-name reports | ✅ **39,109 / 39,113** (4 are Kalai spelling variants) |
| Shadbala dig and naisargika | ✅ 112 / 112 each |

## 2. What was wrong and is now fixed

| Area | Problem found | Fix | Result |
|---|---|---|---|
| **Tamil date** | 22 reports differed | Kalai spells 7 year names differently (பிரசோற்பத்தி, வெகுதாணிய, விசு, பார்திப, சர்வசித்து, விசுவாசுவ, விரோதிகிருது); calendar model refitted on 84 Kalai dates | **94 / 95** (1 is a single day) |
| **Matching: தினம்** | Count 17 was scored good | Kalai uses the Tamil list 2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26 | new couple exact |
| **Matching: Sevvai** | Mars in Thulam in the 2nd was scored full dosham | Mars in Rishabam/Thulam is a cancellation (பரிகார) | **11 Kalai couples** reproduce |
| **Baby names: allowed name numbers** | 9 of 81 (date, destiny) pairs known | Read the pairs from all archive reports | **56 of 81** known exactly |
| **Baby names: star letters** | 3 stars confirmed | Kalai's letters taken for 10 stars (e.g. மகம் "ம - மி - மு - மெ - ( மா - மீ - மூ )") | 10 stars exact |
| **Kalai name bank** | 2,738 names | All names printed in the archive added | **10,013 names** (5,728 boy, 4,285 girl) |
| **Repeated names** | 366 names appeared twice | A name is never added twice for the same gender; duplicates removed at start-up; lists de-duplicated | **0 repeats** |

## 3. Still open (honest)

| Item | Status |
|---|---|
| **Vakyam** | The archive has only **one** Vakyam horoscope. Kalai's Vakya Sun agrees with our Surya-Siddhanta Sun within 31″. The Moon and other planets can't be worked out from one sample, so there's no Vakyam report on the site yet. Needed: about 10 Vakyam horoscopes on different dates. |
| **Shadbala across the 16 full reports** | sthana 109/112, cheshta 97/112, drik 75/112. Kala is exact on 25/112, but every value is within 0.4 virupa (rounding in one part). Recurring differences to investigate next: Moon drik (−5.4 virupa), Saturn sthana (−15 virupa in 3 charts), Jupiter cheshta in 2 charts. |
| **Kalachakra** | 1,498 / 1,648 bhukti rows exact; the rest are one-day edges. |
| **25 (date, destiny) pairs** | Still not seen in any printout; the site marks them with an asterisk (\*). |
| **Master.mdb / CustMaster.mdb** | **Not opened.** They are password-protected, and I won't bypass that protection. Everything above comes from the reports themselves, and nothing was invented. |

## 4. Files changed

| File | Change |
|---|---|
| `backend/app/services/kalai_tamil_calendar.py` | Refit + Kalai year-name spellings |
| `backend/app/services/kalai_matching.py` | Dinam list, Sevvai cancellation |
| `backend/app/services/kalai_baby_names.py` | 56 allowed-number pairs, 10 stars' letters, no repeated names |
| `backend/app/services/kalai_name_import.py` | Duplicate-free import and clean-up |
| `backend/app/data/kalai_names.json` | 10,013 names |
| `backend/tests/test_kalai_parity.py` | +1 test (57 total) |
| `AGENTS.md` | Changelog 4.8.0 |
