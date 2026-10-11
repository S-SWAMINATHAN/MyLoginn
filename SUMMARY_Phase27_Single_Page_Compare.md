# SUMMARY — Single page compared with the reference (v4.24.0)

**Compared:**
- **Reference:** Kalai `Thirukanitam_single_page.pdf`
- **Yours:** `kanitha-jathagam-…(6).pdf`, made with a heavy bold typeface

| # | Found in your PDF | Reference | Fix |
|---|---|---|---|
| 1 | Long labels ran into their values with the bold font ("நட்சத்திர ஹோரை01:10:09", "சூரிய அஸ்தமனம்06:04:58") | Label, colon, value always separated | Wider label column and a centred colon column. Labels wrap inside their own column instead of overlapping, for every typeface in the panel. |
| 2 | Place printed in full over 4 lines ("Udumalaipettai, Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India"), pushing the rows down | "Udumalaipettai T.N. India" | Place shortened the same way: town + state abbreviation + country |
| 3 | "செவ்வாய்" wrapped in the planet table | One line | Wider planet-name column; table cells never wrap |
| 4 | Bottom lines: colon far from the labels | Colon right after the label column | Label column narrowed; colon centred and close |
| 5 | Lagna not marked in the charts | Diagonal line in the lagna house | Diagonal mark drawn in the lagna house, as in Kalai |
| 6 | No footer line | Publisher line at the bottom | Footer rule with "MyLoginn Astrology" |
| 7 | — | Everything else (Om, invocation, date, both detail columns, udhayadi nazhigai, two planet tables, Rasi / Navamsam, bhava change, dasa balance, current dasa-bhukti, name numbers, star letters, சுபம்) | Already present; checked again |

**Still one A4 page.** Verified with your long place name and a heavy font: 1 page.

**Website and normal PDF.** The same fixes are in the on-screen single page, which the normal PDF button prints on one page.

**Checks:** backend tests **61 / 61**; frontend type-check **0 errors**.

**Files:** `backend/app/services/pdf/render_single.py`, `frontend/components/kalai/KalaiReport.tsx`, `AGENTS.md`. This zip is the **complete project**.
