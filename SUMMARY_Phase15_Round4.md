# SUMMARY — Bug list round 4 (v4.12.0)

## 1. Items

| # | Bug | Status | What was done |
|---|---|---|---|
| 1 | Kanitha: duplicate Thirukanitham / Vakkiyam buttons; panels should come after Generate | ✅ | The separate buttons are removed. The **birth-details form's own buttons** now drive the report: திருக்கணிதம் / வாக்கியம், the chart style (தமிழ் / கேரளா / வட இந்தியா), and முழு ஜாதகம் / ஒரு பக்க ஜாதகம். The colour / Tamil-style panel and the print PDF appear **only after Generate**, above the report. |
| 2 | KP: use the form's buttons | ✅ | In the form, the Thirukanitham slot is now **ஜனன ஜாதகம்**, the Vakkiyam slot is **பிரசன்னம் (Horary)**, the full-report button is **KP All** and the single-page button is **KP Type A**. For Horary, the form's date, time and place are the moment of the question, and the horary number and system (1–249 / 1–2193) appear **inside the form**. |
| 3 | 12 Porutham: panels after generating | ✅ | Chart style, colour / Tamil-style panel and print PDF appear after "Match", above the result. |
| 4 | Names & numerology: same | ✅ | The panel and print PDF appear after "Generate". |
| 5 | Print PDF had only 5 pages; needs the whole jathagam | ✅ | The Kanitha print PDF now contains every section (listed below). The sample birth gives **49 pages**, with charts and rows never split and each section on a new page. The KP print PDF now also has bio data, the KP chart, bhava significators, graha–bhava and graha–graha aspects. |
| 6 | Print PDF must follow the colour / Tamil-style panel, with a preview before download | ✅ | The PDF uses the **current palette and typeface**; the 13 free fonts of the panel are bundled with the backend. **"அச்சு PDF முன்னோட்டம்"** opens a full-screen preview; press **பதிவிறக்கு** to download after checking. All four features. |
| 7 | Vinayagar / Murugan / Om should be real images without pixel breaks | ✅ Ready (needs your images) | The cover now uses **your picture file** from `backend/app/assets/deity/` (`ganesha`, `murugan`, `om` as `.svg`, `.png` or `.jpg`). SVG never pixelates. PNG/JPG at 1200 × 1200 px or more is embedded **unchanged**, which is over 700 dpi at the printed size. I can't make or download a devotional picture for you; please use images you own or are licensed to use. Until a file is placed there, the line-art emblem is shown. |
| 8 | Vakkiyam: dummy details to generate in Kalai | ✅ | See section 3. |

**Full Kanitha print PDF contents:**
- Cover; basic details and bio data.
- Planet table; Rasi, Navamsam and Bhava charts.
- Vimshottari dasa-bhukti and antharam.
- Bhava spudam; ashtakavarga (bindus and pindas); prasthara; shadbala.
- Shodasa varga bala and all **16 varga charts**.
- Planet details; upagraha; Kalachakra with every bhukti; Panchapakshi (both halves); numerology.
- **Bhava, Mahadasa, Guru and Sani gochara palan; yogas.**

## 2. Checks

- Backend tests: **58 / 58**. Frontend type-check: **0 errors**.
- Kanitha (49 pages) and KP (8 pages) print PDFs were generated **with a non-default palette and font** and inspected: themed colours on every page, fonts applied, no overlaps.
- The pages themselves were **not opened in a browser** here. Please try the form buttons, Generate, the panel, and the preview → download flow once.

## 3. Vakkiyam test data for Kalai Magal (item 8)

**Please generate these in Kalai Magal:**
- **Report:** **Vakkiyam (வாக்கியம்)** calculation, Module **Type D**, Tamil.
- **Settings:** Coimbatore T.N. India, 11:00 N, 077:00 E, 05.30E IST, Standard Time (no correction), Male. Keep all other settings as they are now.
- **File name:** save each PDF with the name in the first column.

| Save as | Name | Date | Time |
|---|---|---|---|
| V01.pdf | TEST-V01 | 15/01/1950 | 06:00 AM |
| V02.pdf | TEST-V02 | 20/07/1962 | 11:30 AM |
| V03.pdf | TEST-V03 | 03/03/1975 | 04:45 PM |
| V04.pdf | TEST-V04 | 28/10/1983 | 09:15 PM |
| V05.pdf | TEST-V05 | 12/05/1991 | 02:30 AM |
| V06.pdf | TEST-V06 | 09/09/1999 | 07:50 AM |
| V07.pdf | TEST-V07 | 25/12/2005 | 01:10 PM |
| V08.pdf | TEST-V08 | 14/04/2012 | 06:20 PM |
| V09.pdf | TEST-V09 | 30/08/2019 | 10:40 AM |
| V10.pdf | TEST-V10 | 18/02/2024 | 11:55 PM |

These spread over 74 years, all seasons, day and night, and include a birth just before sunrise (V05) and just before midnight (V10). This is enough to work out Kalai's Vakya Sun, Moon and planets and to verify them. If the Vakkiyam report has a single-page option too, one single-page Vakkiyam printout of V06 would also help.

## 4. Files

| File | Change |
|---|---|
| `frontend/components/BirthDetailsForm.tsx` | Optional `systemLabels`, `outputLabels`, `onModeChange`, `children` (old pages unchanged) |
| `frontend/components/kalai/PrintPdfControls.tsx` | **New**: panel, cover picture, preview dialog, download; sends the theme |
| `frontend/app/kalai-report/page.tsx` | Rewritten |
| `frontend/app/kp-report/page.tsx` | Rewritten |
| `frontend/app/kalai-matching/page.tsx` | Panels and print after generating |
| `frontend/app/kalai-baby-names/page.tsx` | Same |
| `backend/app/services/pdf/schemas.py` | Theme, chart sets, text sections |
| `backend/app/services/pdf/render.py` | Themed CSS, panel fonts, deity image slot, chart sets, text sections |
| `backend/app/services/pdf/builders.py` | Full Kanitha and KP content; theme |
| `backend/app/api/pdf.py` | `theme` accepted on all routes |
| `backend/app/fonts/` | + Catamaran, Mukta Malar, Hind Madurai, Anek Tamil, Arima, Pavanam, Meera Inimai, Noto Serif Tamil, Tiro Tamil, Coiny, Baloo Thambi 2 (all OFL) |
| `backend/app/assets/deity/README.md` | **New**: where to put the cover pictures |
