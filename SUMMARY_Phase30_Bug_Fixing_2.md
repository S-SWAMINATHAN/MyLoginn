# SUMMARY — Bug fixing.pdf, second list (v4.27.0)

| # | Bug | Fix |
|---|---|---|
| 1 | Charts: no black border; the text and its colour should follow the colour / Tamil-style panel; charts must be exact squares | All black lines are gone. The grid lines, outer frame, Lagna double stroke and chart name now use the panel's **accent colour**. The planet text uses the panel's **text colour** (Lagna in the accent colour) and the panel's **Tamil typeface**. The chart design itself is unchanged: yellow houses and the framed centre with corner keys. Every chart is now an **exact square** in all features: single page, full jathagam, designed PDF, normal PDF and website, in Tamil, Kerala and North-Indian styles, plus KP, 12 Porutham, Ashtakavarga and the 16 varga charts. A house with many planets shrinks its text instead of stretching the chart. In the small Ashtakavarga charts every title gets the same height, so charts in a row stay aligned in any typeface. |
| 2 | 12 Porutham and Names & Numerology: picture instead of the details on the first page | The cover now shows your picture where the details box was, full width (about 15 cm), sharp, and with no overlap. **12 Porutham:** the white background was removed, so the picture sits directly on the paper colour. **Names & Numerology:** this picture is a full photo, so it is shown with a thin gold frame. The details are still printed on the inner pages. |
| 3 | Single-page designed PDF: more space inside the border at the bottom | The inner bordered sheet now fills the page exactly. Any spare height is shared evenly between the sections, so the space at the bottom matches the top. It is still exactly one A4 page (checked for Thirukanitham and Vakkiyam, South and North, Tamil and English). |
| 4 | Header logo in a box; the site logo shows as a white square | The box around the header logo is removed, and so is the white tile in the footer. The logo files themselves are now transparent: the ML emblem has no white background (`logo-mark.png`, browser-tab `icon.png`), and the full logo (`logo.png`, `logo-512.png`) is transparent too. Sharp at any zoom. |

**Pictures used:** `12Porutham.png` and `Names and Numerology.png` from your Downloads folder, saved as `backend/app/assets/covers/porutham.png` and `names.png`.

**Checks:**
- Backend tests: **118 / 118 passed**, including new tests for the covers and the single-page sheet. The chart test was updated for the panel colours and square shape.
- Frontend: type-check 0 errors; `next build` passes (17 routes).
- I regenerated the designed PDFs and checked them page by page: single page, full jathagam (charts, Ashtakavarga, varga pages), 12 Porutham (cover and charts) and Names (cover).
- I checked the website in Chrome: single page charts, KP chart, header and footer logo.

**Files:**
- `backend/app/services/pdf/chart_art.py`, `render.py`, `render_single.py`
- `backend/app/assets/covers/` (**new**)
- `backend/tests/test_kalai_parity.py`
- `frontend/components/HandwrittenChartCanvas.tsx`, `frontend/lib/chartArt.ts`, `frontend/components/kalai/KalaiReport.tsx`, `frontend/components/kalai/KpReport.tsx`
- `frontend/components/Header.tsx`, `frontend/components/Footer.tsx`
- `frontend/public/logo-mark.png`, `logo-512.png`, `logo.png`, `frontend/app/icon.png`
- `AGENTS.md` (changelog 4.27.0)

**Notes:**
- No calculation changed.
- 12 Porutham Tamil cover: the printed title was removed (as you asked), because the picture already says "திருமணப் பொருத்தம்". English covers keep the title "Marriage Compatibility", because the picture's words are Tamil.
- `app/apple-icon.png` (the iPhone home-screen icon) was left with its background on purpose: iOS shows a transparent icon on black.
