# SUMMARY — Phase 4: KP System (v4.0.0)

Reference: your Kalai **KP All / KP Type A** report (04-12-1977, 11:25 AM IST, 11:00 N 077:00 E).

## 1. Verification (every table compared)

| Table | Result |
|---|---|
| Ayanamsa "K.P New Comb" 23:32:15 | ✅ exact |
| Planets + Uranus, Neptune, Part of Fortune, Lagna (13 longitudes) | ✅ 13/13 to the second |
| Placidus cusps I–XII | ✅ 12/12 to the second |
| Sign / star / sub / sub-sub lords (12 points + 12 cusps = 96 lords) | ✅ 96/96 |
| Bhava significators, 4 columns × 12 houses | ✅ all (including Kalai's ordering) |
| Planet significators (by star, by sub, aspected by) × 9 | ✅ 9/9 |
| Graha–bhava aspect table (11 × 12) and graha–graha table (11 × 11) | ✅ rows checked exactly |
| KP dasa balance (Venus 5 y 11 m 27 d) and bhukti dates | ✅ exact |
| Tests | ✅ **39 / 39** · frontend `tsc` 0 errors |

## 2. How Kalai computes KP (decoded)

- **Ayanamsa.** K.P New Comb = true Lahiri − 43.7″. This reproduced all 24 planet and cusp positions to the second, but it is derived from one report, so a second KP report would confirm it.
- **Cusps and lords.** Cusps are Placidus. Lords use the standard KP 249-part division: each star is split by Vimshottari years, and each sub is split again the same way.
- **What a planet signifies.** A planet signifies the house it occupies plus the houses whose cusp sign it owns. Rahu and Ketu signify only the house they occupy.
  - "By star" = the planet's own houses + its star lord's houses.
  - "By sub" = the sub lord's houses + the houses of the sub lord's star lord.
- **Aspect tables.** The planet → house figure is measured to the **mid-point** of the house, not to its cusp. Planet → planet is (target − source).
- **Part of Fortune** = Lagna + Moon − Sun.

## 3. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_kp.py` | **New** |
| `backend/app/api/kalai.py` | Modified (`POST /api/kalai/kp`) |
| `backend/tests/test_kalai_parity.py` | Modified (+3 KP tests) |
| `frontend/components/kalai/KpReport.tsx` | **New** |
| `frontend/app/kp-report/page.tsx` | **New** |
| `frontend/lib/kalaiApi.ts` | Modified (KP types and API) |
| `frontend/components/Header.tsx` | Modified ("கே.பி ஜாதகம் / KP Horoscope" link) |
| `AGENTS.md` | Modified |

## 4. Next

1. **Shadbala cheshta and kala bala** for recent births (the open items from v3.4.0).
2. **Horary (1–249, 1–2049):** needs Kalai horary printouts (number, time and place used).
3. **Matching and baby-name parity:** the reports and screenshots are already here.
4. **Optional:** a second KP report (any birth after 2011) to confirm the KP ayanamsa for recent dates.
