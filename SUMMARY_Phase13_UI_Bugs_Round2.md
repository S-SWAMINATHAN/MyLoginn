# SUMMARY — UI bug fixes, round 2 (v4.10.0)

References used: `Bugs_Resoloving.txt` (6 items), `PDF_Gallery_20260930_113603.pdf` (5 screenshots), and the downloaded PDFs `…-kalai-report (3)/(4).pdf`, `…-kp.pdf`, `guruprasath_mithra-porutham.pdf` and `baby-names-2004-10-06.pdf`.

## Items

| # | Bug | Status | Fix |
|---|---|---|---|
| 1 | 12 Porutham shows names in English on the Tamil page | ✅ Fixed | On a Tamil page, names typed in English are shown in Tamil, using the site's existing transliteration (`lib/tamilTransliterate`). The same applies to the name in the Kalai and KP reports. |
| 2 | Charts show both Kaiyezhuthu and Digital; names overlap inside and outside the chart; the PDF shows the Digital option | ✅ Fixed | Every chart in the new features is drawn with the site's **HandwrittenChartCanvas** only (the canvas Generate Chart and the manuscript use). No Digital toggle, no second title, and the same chart on screen and in the PDF. Applies to the Kalai report (rasi, navamsa, bhava, all 16 varga charts), 12 Porutham and single page. |
| 3 | Names & numerology: place initial shown; father/mother/grandfather should be first letters of their names | ✅ Fixed | The place field and place initial are removed. You now type the **father's, grandfather's and mother's names** (Tamil or English), and the initial used is each name's **first letter**, shown under the box. A Tamil first letter is converted to its English letter for the numerology total (e.g. க → K, ச → S). |
| 4 | Utilities: location list hidden inside the third card; English-date time typed by hand | ✅ Fixed | The place-search list now opens above the next card. The English → Tamil date card uses the site's 12-hour time picker. |
| 5 | Kalai / KP PDFs: charts not handwritten; tables misaligned (labels in one place, values far away) | ✅ Fixed | Charts are handwritten (item 2). Key–value tables keep each value next to its label: general details, the ashtakavarga figures under each planet (ஆதிப்பரல் … ஏக சமூகம்) and KP general details. |
| 6 | Colour and Tamil-style panel in Kanitha, KP, 12 Porutham, Names — must change everything | ✅ Added | The site's own **Jathagam colour/typeface panel** is on all four pages. The report sheets are "theme islands" (the same method as Generate Chart), so ink colours, paper, borders, headings, tables and the canvas charts all change together, and the PDF matches the screen. |

## Also fixed

**v4.9.0 header error.** The v4.9.0 header crash (`kalaiOpen is not defined`) happened because my type-check was not really running. The TypeScript binary could not be executed in my sandbox, and my command hid the error. It now runs as `node node_modules/typescript/bin/tsc`, and the whole frontend reports **0 errors**.

## Files (complete files in the zip)

| File | Change |
|---|---|
| `frontend/components/kalai/KalaiChart.tsx` | HandwrittenChartCanvas only; responsive; themed |
| `frontend/components/kalai/KalaiReport.tsx` | Themed colours, aligned key–value tables, Tamil name, PDF button styling |
| `frontend/components/kalai/KpReport.tsx` | Themed colours, aligned general table, Tamil name |
| `frontend/app/kalai-report/page.tsx` | Theme provider, colour/typeface panel, themed document |
| `frontend/app/kp-report/page.tsx` | Same |
| `frontend/app/kalai-matching/page.tsx` | Same, plus Tamil names |
| `frontend/app/kalai-baby-names/page.tsx` | Same, plus parent-name initials; place removed |
| `frontend/app/kalai-utilities/page.tsx` | Dropdown stacking, 12-hour time picker |
| `AGENTS.md` | Changelog 4.10.0 |

**Checks:** backend tests **57 / 57**; frontend type-check **0 errors** (run properly this time). I could not open the pages in a browser here. Please check each page once in light and dark mode, change the colour panel, and download one PDF.
