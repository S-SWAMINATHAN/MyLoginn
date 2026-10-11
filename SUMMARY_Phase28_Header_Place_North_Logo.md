# SUMMARY — Bug_fixing.docx (v4.25.0)

| # | Bug | Fix |
|---|---|---|
| 1 | Header items overlapping in Tamil and English | The header now starts with one **ஜாதகம் / Jathagam** menu containing **கணித ஜாதகம்** and **கே.பி ஜாதகம்**. It is followed by 12 பொருத்தம், பெயர் & நியுமராலஜி, ராசி பலன், கருவிகள். The logo keeps its space, the "ஜாதகம்" badge next to the brand is removed, and the subtitle shows only on very wide screens, so nothing overlaps. The menu closes when you switch pages. |
| 2 | Place typed in Tamil appears in English in the content and both PDFs | On a Tamil page the place is converted to Tamil before the report is made, using the site's own transliteration. For example, "Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India" becomes **"உடுமலைப்பேட்டை, தமிழ்நாடு, இந்தியா"**. It appears that way in the generated content, the normal PDF and the designed PDF, in Kanitha, KP and 12 Porutham. English pages keep English. |
| 3 | North-Indian chart text overlapping | **Website and normal PDF:** planets are packed in short rows centred in each house, with smaller text when a house is crowded. The chart name no longer sits on the centre crossing; it is printed under the chart. **Designed PDF:** chart lines are drawn as vector graphics and the planet names as proper Tamil text placed at the centre of each house. They wrap inside the house, so nothing overlaps (checked visually). |
| Main | Logo not clear, pixelated when zooming | Your PNG was processed into sharp, **white-background** assets (details below). Large sources shown at small sizes stay crisp on high-resolution screens and when zooming. |

**Logo assets made from your PNG:**

| Asset | Use |
|---|---|
| `frontend/public/logo-mark.png` (512 × 512) | The ML emblem — header and footer |
| `frontend/public/logo-512.png` | General use |
| `frontend/public/logo.png` (1600 px) | The full logo with "MYLOGINN" |
| `frontend/app/icon.png` (512) | Browser tab icon |
| `frontend/app/apple-icon.png` (180) | Phone home-screen icon |
| `backend/app/assets/logo.png` (1200 px full logo) | Designed-PDF cover and single-page footer |

**Checks:**
- Backend tests **61 / 61**; frontend type-check **0 errors**.
- Designed PDFs regenerated with a Tamil place and North charts (55 pages, no near-empty pages); single page is still **1 page**.
- I couldn't open the website in a browser here. Please check the header at 100 % in both languages.

**Files:**
- `frontend/components/Header.tsx`, `frontend/components/Footer.tsx`, `frontend/components/HandwrittenChartCanvas.tsx`
- `frontend/lib/placeLabel.ts` (**new**)
- `frontend/app/kalai-report/page.tsx`, `frontend/app/kp-report/page.tsx`, `frontend/app/kalai-matching/page.tsx`
- logo assets
- `backend/app/services/pdf/render.py`, `backend/app/services/pdf/render_single.py`, `backend/app/assets/logo.png`
- `AGENTS.md`

This zip is the **complete project**.
