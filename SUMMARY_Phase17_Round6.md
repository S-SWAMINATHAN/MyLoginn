# SUMMARY — Bug list round 6 (v4.14.0)

| # | Bug | Status | Fix |
|---|---|---|---|
| 1 | Designed PDF has no table of contents | ✅ | Page 2 of every designed PDF is now **பொருளடக்கம்**: each section with its real page number, filled in automatically. All four features. |
| 2 | 12 Porutham PDF showed only the girl on page 1 | ✅ | The girl and boy are now side by side on the same page in two columns, each with details and rasi chart. Page 2 has the 12 poruthams and the verdict. |
| 3 | English title on the first page | ✅ Removed | The cover shows only the Tamil title (e.g. மங்கள ஜாதகம்). |
| 4 | General contents missing | ✅ Added | After the contents page every designed PDF has **தமிழ் தாய் வாழ்த்து** and **கடவுள் வாழ்த்து** (விநாயகர், சுப்பிரமணியர், சரஸ்வதி, தட்சிணாமூர்த்தி). Kanitha and KP also have the **நவக்கிரக தியான ஸ்லோகங்கள்** and a **ராசி மண்டலம்** table (12 signs with lord, element and nature). The texts are the same ones your 50-page manuscript uses. |
| 5 | New features look small at 100 % | ✅ | Kanitha and KP: the birth-details form is full width, exactly like **AI ஜாதகம்**. 12 Porutham: one card titled **மணமக்கள் விவரங்கள்** with the girl and boy side by side in a single grid, like the old **திருமணப் பொருத்தம்**; larger inputs and button. |
| 6 | Names: different background; PDF names congested | ✅ | The on-screen result now uses the site's panel background with larger text. In the designed PDF, names are a numbered single list (English, Tamil, total) with comfortable rows that flow onto the next pages. |
| 7 | Pages with only a little content at the top | ✅ | Sections no longer each force a new page. They follow each other, while charts, table rows and dasa blocks are never split. Pages now fill properly: the sample full jathagam went from 49 to 41 pages with the extra opening pages included. |

**Checks:** backend **58 / 58**, frontend type-check **0 errors**. Designed PDFs regenerated and inspected (Kanitha 41 pages with a custom palette and font, 12 Porutham 5, Names 11). The colour / Tamil-style panel and your deity pictures keep working as in 4.13. The pages were not opened in a browser here.

**Vakkiyam:** waiting for V01–V10.

## Files

| File | Change |
|---|---|
| `backend/app/services/pdf/render.py` | Contents page, opening pages, Tamil-only cover, flowing layout, porutham pair layout, names list |
| `frontend/app/kalai-report/page.tsx`, `kp-report/page.tsx` | Full-width form |
| `frontend/app/kalai-matching/page.tsx` | One card, girl and boy side by side, larger |
| `frontend/app/kalai-baby-names/page.tsx` | Site background, larger |
| `AGENTS.md` | Changelog 4.14.0 |
