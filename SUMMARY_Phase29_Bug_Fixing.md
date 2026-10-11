# SUMMARY — Bug fixing.pdf (v4.26.0)

| # | Bug | Fix |
|---|---|---|
| 1 | God picture has a white background in the designed PDFs | **Ganesha** and **Om** now have transparent backgrounds. The white was removed with soft edges, so there is no white halo, and the pictures were cropped to the figure. **Murugan** was already transparent, but its bottom faded into white; that fade is now transparent too. The pictures sit directly on the paper colour of every palette, at full quality (embedded unchanged). This applies to every feature: Kanitha, KP, KP horary, 12 Porutham and Names. |
| 2 | Cover page is in Tamil but gender shows "male" | The gender is printed in the page language: **ஆண் / பெண்** on Tamil PDFs and **Male / Female** on English PDFs, in every feature. |
| 3 | Logo should be on the last page, not the first | The logo is removed from the cover. It now appears at the bottom of the **last page** (மங்கள வாழ்த்துரை & சுப நிறைவு) at 26 mm, with "MyLoginn Astrology" under it. It has a **transparent background** and comes from the 1600 px source (about 1000 dpi at that size), so it stays sharp when you zoom. |
| 4 | Single-page jathagam (Thirukanitham and Vakkiyam) | **Place:** only the town you typed (e.g. **உடுமலைபேட்டை**), without state or country. **Border:** a double page border in the colour panel's gold, plus a thin inner line in the panel's accent colour. It changes with the palette. **God pictures:** small pictures in both top corners, with no background. Vinayagar is on the left; the deity chosen under "முகப்புப் படம்" is on the right (Murugan when Vinayagar is chosen). **Alignment:** label and value columns are rebalanced so no label wraps or touches its colon. I checked this in 5 typefaces with 5 palettes, and it is still exactly **one A4 page**. The website's single page got the same changes. |
| 5 | Charts should look like the sample, in every feature and style | Every chart now uses the sample design: pale-yellow houses with a soft glow, thick dark lines, a white centre with a maroon double frame and Greek-key corners, the chart name in blue, and **each planet in its own colour**. The Lagna house has the double diagonal stroke. This covers Tamil, Kerala and North-Indian charts in the single page, the full jathagam, the designed PDF, the normal PDF (website), KP, 12 Porutham, Ashtakavarga and the 16 varga charts. The chart colours and the chart typeface are **fixed**: changing the text colour or Tamil style changes the page around the chart, never the chart, so it stays the same and aligned in every style. Crowded houses (up to 6 planets) automatically use smaller text, and long chart names (e.g. திரேக்காணம்) shrink to fit. |
| 6 | Small blue icons beside every detail | The same **cyan-blue** as the header icons (#2F6FED), and the same icon family. Icons appear next to every detail label, every section heading and every contents line in Kanitha (Thirukanitham and Vakkiyam), KP, single page and full jathagam. They are on the website, the normal PDF and the designed PDF. Examples: time ⏱, date 📅, place 📍, sunrise, sunset, star, rasi, lagna, tithi, yogam, karanam, nazhigai, dasa, ayanamsa, numerology, letters, bio data and others. Any detail without a matching icon gets the **star**. Icons are 0.95 × the text size and sit on the text line, so row heights and alignment do not change. The colour panel never recolours them. |

**Planet colours in the charts** (taken from your sample as closely as possible):
Lagna orange · Sun deep red · Moon green · Mars red · Mercury teal · Jupiter amber · Venus rose · Saturn blue · Rahu violet · Ketu dark green · Mandi orange-gold. These can be changed in one place each: `frontend/lib/chartArt.ts` (website) and `backend/app/services/pdf/chart_art.py` (PDF).

**Also fixed while testing:**
- English designed PDFs: the star column of the planet table was empty. It now shows the star name.
- KP chart on Tamil pages: Uranus, Neptune and Fortuna now print in Tamil (யுரே, நெப், அ.பா).

**New / changed picture files:**

| File | Use |
|---|---|
| `backend/app/assets/deity/ganesha.png`, `murugan.png`, `om.png` | Transparent; designed-PDF cover and single-page corners |
| `backend/app/assets/logo.png` | Transparent full logo (1534 px); last page and single-page footer |
| `frontend/public/deity/*.png` (**new**) | Website single page corners (400 px tall) |
| `frontend/public/logo-transparent.png` (**new**) | Website single page footer |

**Checks:**
- Backend tests: **116 / 116 passed**. This includes a new test for this round (transparent images, Tamil gender, logo on the last page, town-only place, corner deities, themed border, fixed chart artwork, icons).
- Frontend: type-check 0 errors; the full `next build` passes (all 17 routes).
- Designed PDFs regenerated and checked page by page: Kanitha full (South and North), single page (Thirukanitham and Vakkiyam, South and North, Tamil and English, 5 typefaces), KP, 12 Porutham and Baby names.
- I opened the website in Chrome and checked the single page, full jathagam (North charts) and KP pages.

**Files:**
- `backend/app/services/pdf/chart_art.py` (**new**), `backend/app/services/pdf/icons.py` (**new**)
- `backend/app/services/pdf/render.py`, `render_single.py`, `builders.py`, `backend/app/api/pdf.py`
- `backend/app/assets/` (pictures and the deity README)
- `backend/tests/test_kalai_parity.py` (+1 test)
- `frontend/lib/chartArt.ts` (**new**), `frontend/lib/detailIcons.tsx` (**new**), `frontend/lib/jathagamTheme.tsx` (comment)
- `frontend/components/HandwrittenChartCanvas.tsx`, `frontend/components/kalai/KalaiReport.tsx`, `frontend/components/kalai/KpReport.tsx`, `frontend/app/kalai-matching/page.tsx`
- `frontend/public/deity/`, `frontend/public/logo-transparent.png`
- `AGENTS.md` (changelog 4.26.0)

**Notes:**
- No calculation changed. Only images, layout, colours and icons.
- On the full-jathagam cover the place is still the full place (town, state, country). Your request was for the single page only; tell me if the cover should also show the town only.
- To change a god picture later, replace the file with a **transparent** PNG or SVG (see `backend/app/assets/deity/README.md`).
