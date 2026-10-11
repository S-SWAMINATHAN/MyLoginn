# SUMMARY — Bug list round 5 (v4.13.0)

| # | Bug | Status | Fix |
|---|---|---|---|
| 1a | Print PDF always gave the whole jathagam | ✅ | The print PDF follows the button you picked in the form. **ஒரு பக்க ஜாதகம்** gives a cover plus one page (details, planets, Rasi/Navamsam, bhava change, current dasa, name numbers and star letters). **முழு ஜாதகம்** gives everything. **KP Type A** gives the KP tables and dasa; **KP All** adds the full antharam. |
| 1b | Colour / Tamil-style panel not applied inside the print PDF | ✅ | The font and picture paths were built in a Linux-only way and broke on Windows; they are now Windows-safe. Table headers, row tints, borders, headings, paper and typeface all follow the panel. Verified with a teal palette and the Arima font. |
| 2 | Normal PDF button: charts cut across pages | ✅ | When a page is taller than A4, the cut is moved up so it never falls inside a chart, table row or dasa card. |
| 3 | வ / மா / நா not above their numbers | ✅ | Separate aligned columns in the KP dasa blocks and in the print PDF. (Kanitha and Kalachakra were done in 4.11.) |
| 4 | 12 Porutham: UI too small; Tamil suggestion for English names | ✅ | Bigger form (wider cards, larger inputs). Typing a name in English on the Tamil page shows **தமிழ் பரிந்துரை** chips (the site's own transliteration); tap one to use it. |
| 5 | Print PDF shows the drawing, not your images | ✅ | Your files in `backend/app/assets/deity` are now found by name in any upper/lower case, including common names: **vinayagar / ganesha / pillaiyar / ganapathi** → விநாயகர், **murugan / muruga / subramanya** → முருகன், **om / aum** → ஓம். Any of SVG, PNG, JPG, JPEG or WEBP works. The file is embedded **unchanged**, so no pixels are lost (verified: a 1600 × 1600 px test image is embedded at 1600 × 1600). |
| 6 | Names & numerology: UI too small; parent fields should be first letters | ✅ | Bigger form. The three fields are now **தந்தை / பாட்டனார் / தாயார் பெயரின் முதல் எழுத்து**. You can type K or க; a Tamil letter becomes its English letter for the numerology total. |

**Checks:** backend tests **58 / 58**; frontend type-check **0 errors**. Print PDFs were generated for single page (3 pages including the cover), KP Type A (8), KP All (31) and the themed full report, and inspected. I could not open the pages in a browser here. Please try each button once.

**Picture tip:** for the sharpest cover use SVG. For PNG or JPG, use at least 1200 × 1200 px; smaller files are embedded as they are but will look soft when printed.

**Vakkiyam:** waiting for your V01–V10 reports.

## Files

| File | Change |
|---|---|
| `backend/app/services/pdf/render.py` | Windows-safe URIs, deity lookup and aliases, palette on header fills and tints, Y/M/D columns, compact single page |
| `backend/app/services/pdf/builders.py` | `mode` for Kanitha (full / single) and KP (all / type_a) |
| `backend/app/api/pdf.py` | `mode` field |
| `frontend/lib/pdfExport.ts` | Page cuts avoid charts, rows and cards |
| `frontend/components/kalai/KpReport.tsx` | Aligned வ / மா / நா |
| `frontend/app/kalai-report/page.tsx`, `kp-report/page.tsx` | Send the selected mode to the print PDF |
| `frontend/app/kalai-matching/page.tsx` | Bigger form, Tamil name suggestions |
| `frontend/app/kalai-baby-names/page.tsx` | Bigger form, first-letter fields |
| `AGENTS.md` | Changelog 4.13.0 |
