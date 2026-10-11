# SUMMARY — Settings screenshots: analysis and what was built (v3.5.0)

## 1. What each screenshot shows, and what it means for the site

| Screenshot | What it shows | Action |
|---|---|---|
| **Ini File Setup** | Sunrise: Disk Centre / Disk Top · Ayanamsa: **Ananda, K.P, Lahiri, Raman, Zero** · Rahu/Ketu: Mean / True · Include Uranus · Include Mandhi · Chart: South / North / East · House: **Vedic / Placidus** · Varga type: Dasa / Shodasa · Guru gochara 10, Sani gochara 4, Dasa Nos 3 · Default place **Coimbatore 11:00 N 077:00 E** | Confirms every default we already use. "Chennai,India" in T001–T06 printed Coimbatore's default coordinates. Settings panel = next phase (ayanamsa switch is needed for KP anyway). |
| **Model Setup** | 26 report modules with page counts (Non-KP 13 + KP 5 + Kalachakra, Panchapakshi 2 or 2+21 pages, 5 palan modules); models **Palan, Type B, Type C, Type D**; Table of Contents; language | **Built:** Model Setup panel on the Kalai report |
| **Utilities menu** | Time Correction, Model Details, Udhayathi Naligai to ST, Tamil to English Date, Accounts, BackUp, Restore, Calculator | **Built:** Naligai→ST, Tamil→English, Tamil date, Time Correction. Accounts/Backup = business module (optional) |
| **Time Zone Master** | Any zone name + offset 0–12 h East/West | Supported since 3.4.0 (`UTC±hh:mm`) |
| **Baby Names** | 7 report types (Single Star Letter; Single Numerology No; Star Letters; Numerology Numbers; Single Star Letter + Numerology; Single Numerology No + Star; Star + Numerology Details) · sex · religion · language · birth date/star · first letter · numerology no · father/grandfather/mother/place initials | Baby-name parity phase (inputs now known) |
| **Matching entry** | Two births with Time Correction (the bride used **Summer Time (DST)**) | **Built:** DST correction reproduces matching.pdf (07:20 IST → 00:50 GMT) |
| **Time from Ghati Pal** | Date, ghati pal, time correction, place, lat/lon, zone → time, sunrise, sunset | **Built** — 5/5 exact against your reports |
| **Tamil → English Date** | Tamil date, month, 60-year name, **Pariviruthi No** | **Built** — 3/3 screenshots exact (incl. years 2983 and 3005) |
| **Drik Data Entry** | Name, parents, gender, DOB + weekday, time, time correction, place, lat/lon, zone, Reg No, details, customer, language, module | Our form already covers these; module picker = Model Setup |

## 2. Decoded Kalai behaviour

- **Tamil → English is not astronomical.** It uses Surya-Siddhanta mean years: Kali epoch + n × 365.258756 days − 2.5 days, plus the SS month lengths. This is why year 2983 gives 30 April, not the astronomical 27 April. Pariviruthi *k* begins in April of 1867 + 60 × (*k* − 24).
- **The horoscope Tamil date is astronomical.** It uses the true Sun ingress: 7 of 10 of your reports match exactly. In the other 3, Kalai starts the month one day later (Aavani and Purattasi 2026, and one DST case). The rule is still open.
- **Udhayathi Naligai → time** = sunrise + nazhigai × 24 min + vinazhigai × 24 s + tharparai × 0.4 s.
- **Time Correction (DST or War Time)** adds 1 hour to the zone.

## 3. Verification

| Check | Result |
|---|---|
| Tamil → English (screenshots) | ✅ 3 / 3 |
| Naligai → time (T001, T02, T03, T05, T07) | ✅ 5 / 5 (T03 within 2 s) |
| Tamil date on reports | ⚠️ 7 / 10 |
| DST (matching.pdf bride): zone and star | ✅ UTC+06:30, Krittika ✓ · Tamil date 23 vs Kalai 24 (the open rule above) |
| Tests | ✅ **36 / 36** · frontend `tsc` 0 errors |

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/kalai_tamil_calendar.py` | **New** |
| `backend/app/api/kalai.py` | Modified (utility endpoints, time_correction) |
| `backend/app/services/ephemeris.py` | Modified (`apply_time_correction`) |
| `backend/app/services/kalai_report.py` | Modified (time correction, Tamil date) |
| `backend/app/api/charts.py` | Modified (time correction) |
| `backend/app/models/schemas.py` | Modified (optional `time_correction`) |
| `backend/tests/test_kalai_parity.py` | Modified (+3 tests) |
| `frontend/app/kalai-utilities/page.tsx` | **New** |
| `frontend/components/kalai/KalaiReport.tsx` | Modified (Model Setup, Tamil date) |
| `frontend/app/kalai-report/page.tsx` | Modified (Time Correction) |
| `frontend/lib/kalaiApi.ts` | Modified |
| `frontend/components/Header.tsx` | Modified (Utilities link) |
| `AGENTS.md` | Modified |

## 5. What would still help (optional)

1. **Tamil to English** for **1 Aavani** and **1 Purattasi** of year Parabhava (2026), and **1 Chithirai** of Sarvadhari (2008). These settle the month-start rule.
2. **Type B, Type C and Palan model contents.** Open Model Setup, pick each model, and screenshot the ticked boxes.
3. **Horoscope → Time Correction dropdown opened**, to see every option besides DST.
