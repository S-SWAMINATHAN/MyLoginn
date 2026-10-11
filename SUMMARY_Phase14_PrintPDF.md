# SUMMARY — Bug list round 3 + WeasyPrint print-quality PDFs (v4.11.0)

## 1. Bug list

| # | Bug | Status | Fix |
|---|---|---|---|
| 1 | Charts show D1, D2 …; on Tamil pages the labels inside the chart are English | ✅ Fixed | Varga codes are removed from chart titles. On Tamil pages the planets inside every chart print in Tamil (சூரி, சந், செவ், புத, குரு, சுக், சனி, ராகு, கேது, லக்). |
| 2 | Tamil sign names not shown correctly or fully | ✅ Fixed | The Prasthara / Sarvashtaka headers were cut to 4 letters; they now show the full names (கன்னி, துலாம், விருச்சிகம் …). |
| 3 | Dasa-bhukti: "வ மா நா" on one side, numbers on the other | ✅ Fixed | வ, மா and நா are now three separate columns, each directly above its number. Done in the Vimshottari and Kalachakra tables. |
| 4 | Bio-data card not in any Jathagam PDF; not themed | ✅ Fixed | The bio-data card is now a page inside the Kanitha and KP reports. It is part of both PDFs and follows the colour / Tamil-style panel. |
| 5a | Add Thurigai, Kavithai, Rathee Script to the Tamil-style panel | ✅ Added (needs font files) | All three are in the panel on every page that has it. They are licensed fonts that are not freely downloadable, so they can't be bundled. Put your licensed files in `frontend/public/fonts/` (names in `public/fonts/README.md`) and they work at once; until then each entry falls back to the free handwriting face Kavivanar. Anu fonts are often legacy non-Unicode encodings; only Unicode versions will show the site's Tamil correctly. |
| 5b | Downloaded PDF has large gaps and bad alignment | ✅ Fixed | New print-quality PDF (section 2): fixed A4 layout, no stretched gaps, tables with fixed column widths. |

## 2. Print-quality PDF service (WeasyPrint)

**Buttons.** A new **"அச்சு தர PDF (A4)"** button is on Kanitha Jathagam, KP Jathagam, 12 Porutham and Names (Kalai), with a deity choice: விநாயகர் / முருகன் (வேல்) / ஓம். The old on-screen PDF button is still there.

**Design (as you specified)**

- **Page:** A4 with 0.6 in margins and ivory paper (`#FDF6E2`). A double gold border is drawn by the page box itself, so every new page gets it automatically.
- **Colours:** maroon `#800000`, royal navy `#1A365D`, matte gold `#D4AF37`.
- **Cover page:**
  - Deity line art: Ganesha, Murugan's Vel, or Om as fallback. These are simple emblem drawings made for this; they are not detailed illustrations.
  - The bilingual title (e.g. மங்கள ஜாதகம் / COMPREHENSIVE HOROSCOPE).
  - A birth-profile box with name, date, time and place.
- **Inner pages:** running subtitle with a gold rule, and "பக்கம் X / Y" (Page X of Y) at the bottom right.
- **No overlap:** `table-layout: fixed` with percentage columns and wrapping cells. `break-inside: avoid` on charts, table rows, dasa blocks and the matching verdict box. Each major section starts on a new page.

**Feature layouts**

| Feature | Layout |
|---|---|
| கணித ஜாதகம் | Basic-details card, bio data, planet table, Rasi + Navamsam side by side (South grid or North diamond), Vimshottari dasa-bhukti blocks (3 per row, with வ மா நா columns), Kalachakra table |
| கே.பி ஜாதகம் | Planet and cusp tables with Sign / Star / **Sub / Sub-Sub** lords (sub columns tinted), significators, dasa-bhukti |
| 12 பொருத்தம் | Girl and boy cards with charts, 12-row grid (girl, boy, max, obtained, ✔ / ◐ / ✕), total row, Sevvai / Rajju / dasa-sandhi, boxed verdict |
| பெயர் & நியுமராலஜி | Date, destiny and name-count tiles; details; paragraphs on the birth and destiny numbers (the site's own numerology text); letter-value table; names in 3 columns |

**API**

| Route | Input |
|---|---|
| `POST /api/pdf/generate` | The full documented payload: `feature_type`, `god_image`, `language`, `chart_style`, `metadata`, `feature_data` (schemas in `backend/app/services/pdf/schemas.py`) |
| `POST /api/pdf/kanitha`, `/kp` | `{ birth, language, god_image, chart_style }` |
| `POST /api/pdf/porutham` | `{ girl, boy, language, god_image, chart_style }` |
| `POST /api/pdf/baby-names` | `{ form, language, god_image }` |

The four shortcut routes build that same payload on the server from the site's own engines, so the PDF numbers are identical to the screen.

**Check done here:** all four PDFs were generated and the pages inspected. Every page has ivory paper, a gold border and page numbers, and the charts sit side by side. Tamil text is shaped correctly.

## 3. Install notes (important for Windows)

WeasyPrint needs the **GTK3 / Pango runtime** on Windows:

1. Install the **GTK for Windows Runtime** (64-bit): <https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases>. Tick "Set up PATH environment variable".
2. Open a new PowerShell window, then run `pip install -r backend\requirements.txt` (adds `weasyprint`).
3. Restart the backend.

If GTK is missing, the button shows a clear message ("WeasyPrint runtime not available … GTK3 runtime") instead of failing silently. The fonts are bundled in `backend/app/fonts/` (Noto Sans Tamil and Kavivanar, SIL Open Font License), so the PDF does not depend on fonts installed on the PC.

## 4. Files

| File | Status |
|---|---|
| `backend/app/services/pdf/schemas.py` | **New**: payload schemas |
| `backend/app/services/pdf/render.py` | **New**: HTML, CSS and WeasyPrint |
| `backend/app/services/pdf/builders.py` | **New**: payloads from the site's engines |
| `backend/app/api/pdf.py` | **New**: routes |
| `backend/app/fonts/` | **New**: Noto Sans Tamil, Kavivanar, OFL.txt |
| `backend/app/main.py` | PDF router registered |
| `backend/requirements.txt` | + weasyprint |
| `backend/tests/test_kalai_parity.py` | + PDF test (58 total) |
| `frontend/lib/printPdf.ts` | **New**: download helper |
| `frontend/components/kalai/KalaiChart.tsx` | Tamil labels, no D-codes |
| `frontend/components/kalai/KalaiReport.tsx` | வ/மா/நா columns, full sign names, bio-data page |
| `frontend/components/kalai/KpReport.tsx` | Bio-data page |
| `frontend/app/kalai-report/page.tsx`, `kp-report/page.tsx`, `kalai-matching/page.tsx`, `kalai-baby-names/page.tsx` | Print-PDF button and deity choice |
| `frontend/lib/jathagamTheme.tsx`, `frontend/app/globals.css`, `frontend/public/fonts/README.md` | Three new font entries |

**Checks:** backend **58 / 58** tests pass; frontend type-check **0 errors**.
