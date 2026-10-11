# SUMMARY — Kalai Magal (KKC Astro) Package Analysis & Integration Plan

Project: MYLoginn Astrology (Next.js 14 + FastAPI + Swiss Ephemeris/PyJHora)
Input analysed: `winrar-x64-712.zip` → `KkcAstro.rar` (RAR5, 306 entries), `frontend.zip`, `app.zip`

---

## 1. What the package actually contains

| Item | What it is | Usable? |
|---|---|---|
| `KKcAstro.exe`, `KTTTW.EXE`, `MATTT2.EXE` | Compiled Windows (VB6-era) program | Not readable as source. No decompiling. |
| `haspdinst.exe`, `HASPUserSetup.exe`, `HINSTD.DLL` | Sentinel HASP USB-dongle licence protection | Shows the software is licence-locked per key |
| `swedll32.dll` | Swiss Ephemeris | Same engine family we already use |
| `Master.mdb` (21 tables) | Report text database: predictions, yogas, matching text, numerology, Panchapakshi, Guru/Sani transit text, baby-name letters | **Content is encrypted by the vendor** (even the word "Monday" is ciphertext). Will not be decrypted or copied. |
| `CustMaster.mdb` | Settings (`IniSetup`, `ModuleSetup`) + **customer records, accounts, passwords** | Only the two settings tables were read. Customer, account and password tables were not opened. |
| ~190 PDFs named after people | Real customers' generated horoscopes | Not used. They contain personal birth data. |
| `Help.HLP` | Help file with the full menu structure | Used for the feature inventory |

### Ground rules

1. **Features and behaviour: will be replicated.** Features and calculation methods are not copyrightable.
2. **Their encrypted text and database: not copied.** All prediction and palan text will be written originally and grounded in classical sources, per `AGENTS.md`.
3. **Customer data: not used.** Keep this package private. Parity testing uses fresh test births with dummy names.

---

## 2. Kalai Magal calculation settings (from `IniSetup`) vs our engine

| Setting | Kalai Magal default | Our backend (`ephemeris.py`) | Status |
|---|---|---|---|
| Ayanamsa | Lahiri | Lahiri | ✅ Match |
| Ayanamsa options | Lahiri, Ananda, KP, B.V. Raman, Vakya | Lahiri + Surya Siddhanta approx. | ⚠️ Need KP, Raman, Ananda, real Vakya |
| Rahu/Ketu | Mean node | `swe.MEAN_NODE` | ✅ Match |
| Sunrise | Disk centre | `BIT_DISC_CENTER` | ✅ Match |
| House system | Vedic (equal/Sripati) | Vedic | ✅ Verify with test births |
| Uranus / Mandhi in chart | Off / Off | Mandhi computed | ⚙️ Add toggle |
| Chart style | South | Tamil/Kerala/North | ✅ |
| Guru gochara cycles | 10 | Not dated per house | ❌ Add |
| Sani gochara cycles | 4 | Not dated per house | ❌ Add |
| Dasa cycles printed | 3 | 1 | ⚙️ Add setting |
| Language | Tamil / English | Tamil / English | ✅ |

**Conclusion:** the core astronomy already matches Kalai Magal's defaults. The remaining differences are in missing features and options, not in the base maths.

---

## 3. Feature inventory: Kalai Magal vs MYLoginn

### 3.1 Horoscope report modules (`ModuleSetup`)

| Kalai Magal module | MYLoginn today | Action |
|---|---|---|
| General details / Panchangam | ✅ Chapter 2 | Restructure |
| Graha Spudam + Rasi/Amsam | ✅ Chapter 3 | Keep |
| Bhava Spudam + Bhava chart | ⚠️ Partial | Complete |
| Upagraha Spudam | ⚠️ Gulika/Mandhi only | Add all upagrahas |
| Dasa–Bhukti | ✅ | Add 3-cycle option |
| Antharam | ⚠️ Partial | Complete |
| Ashtakavarga + Sarvashtakavarga | ✅ Chapter 6 | Keep |
| **Prasthara Ashtakavarga** | ❌ | **New** |
| Shadbala | ✅ Chapter 5 | Keep |
| Shodasa Varga | ✅ Chapter 4 | Keep |
| Planet details table | ✅ | Keep |
| Numerology | ✅ | Keep |
| **KP Graha table (star/sub lords)** | ❌ | **New** |
| **KP Bhava Spudam (Placidus) + KP chart** | ❌ | **New** |
| **KP Significators** | ❌ | **New** |
| **KP Graha–Bhava aspects** | ❌ | **New** |
| **Kalachakra Dasa** | ❌ | **New** |
| Panchapakshi (+ full table) | ✅ Chapter 13 | Add "All" table |
| Bhava palan | ✅ Chapter 11 | Original text |
| Dasa–Bhukti palan | ⚠️ | Complete |
| **Guru Gochara palan (dated, 10 cycles)** | ❌ | **New** |
| **Sani Gochara palan (dated, 4 cycles)** | ❌ | **New** |
| Yoga palan | ✅ Chapter 8 | Keep |

### 3.2 Report presets (Tamil + English each)

| Preset | Contents | Action |
|---|---|---|
| Type A / KP Type A | Short KP-focused | **New preset selector** |
| Type B | Standard computation report | New |
| Type C | Full computation + KP | New |
| Type D | Full computation + all palan (≈ our 50-page) | Map to manuscript |
| KP All | All KP tables | New |
| Palan | Predictions only | New |
| Single page | Star letters + summary | ✅ Keep |

### 3.3 Other menus (`Help.HLP`)

| Kalai Magal menu | MYLoginn today | Action |
|---|---|---|
| Matching (Porutham) | ✅ | Parity test |
| Baby names + Names Master + Names Report | ✅ names / ❌ admin master + report | Add admin + printable report |
| **Horary (Prasna) 1–249 and 1–2049** | ❌ | **New** |
| **KP Horoscope** | ❌ | **New** |
| Screen Check (on-screen preview) | ✅ (web view) | Keep |
| Time Correction / DST | ⚠️ Partial | Complete (IST war-time rules) |
| **Udhayathi Naligai → Standard Time** | ❌ | **New utility** |
| **Tamil ↔ English date converter** | ❌ | **New utility** |
| Place Master / Time Zone Master | ✅ Geocode | Keep |
| Customer records, Accounts, Backup/Restore, Password, Slogan | ⚠️ Profiles only | Optional (business module) |

---

## 4. Phased delivery plan

Each phase ships full files and its own `SUMMARY_*.md`. Nothing in the UI layer is removed: colour panels, handwritten formats, Tamil/Kerala/North styles, and PDF export all stay.

| Phase | Scope |
|---|---|
| **1. Settings + calculation parity** | Settings panel matching `IniSetup` (5 ayanamsas, node, sunrise, dasa/gochara cycles, Mandhi/Uranus toggles). Real Vakya only if Chandravakya tables are supplied; otherwise shown as unavailable. |
| **2. KP system** | Star/sub lords, Placidus cusps, KP chart, significators, graha–bhava aspects, KP Horoscope page |
| **3. New computations** | Kalachakra dasa, Prasthara ashtakavarga, full Upagrahas, full Antharam, dated Guru/Sani gochara tables |
| **4. Horary (Prasna)** | 1–249 and 1–2049 number horary |
| **5. Report presets** | Type A/B/C/D/KP/Palan × Tamil/English, all rendered through the existing manuscript + PDF pipeline |
| **6. Utilities** | Naligai → ST, Tamil ↔ English date, time correction/DST |
| **7. (Optional) Business module** | Customer register, names master admin, backup |

---

## 5. What's needed from the developer

1. **Test outputs from Kalai Magal.** Generate fresh outputs for 5–8 dummy test births:
   - Type D report and single page for each birth
   - Matching for 3 couples
   - Baby names for 2 stars
   - Horary for 2 numbers
   
   Choose births that stress the edge cases: one born before 1950, one near sunrise, and one with the Moon near a nakshatra boundary.
2. **Screenshots of the Settings (Ini. File Setup) screen**, especially the ayanamsa list. This confirms what "Ananda" ayanamsa is.
3. **Licence confirmation.** Confirm the organisation's Kalai Magal licence and whether the vendor offers an API or methods documentation.
4. **Chandravakya tables**, if genuine Vakya parity is required.
