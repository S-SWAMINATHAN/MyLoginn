# SUMMARY — Bug list round 8 (v4.16.0)

| # | Bug | Status | Fix |
|---|---|---|---|
| 1 | Header icons congested (Tamil and English) | ✅ | Wider spacing between the six items; the small icons show only on very wide screens, so the labels have room on a normal 100 % screen in both languages. |
| 2 | Language switches back to Tamil on the next page | ✅ | The choice is now remembered (saved in the browser and shared by every page): Kanitha, KP, 12 Porutham, Names, Utilities and ராசி பலன். |
| 3 | Bhava spudam not in line; no பாகை / கலை / விகலை | ✅ | Each of ஆரம்பம், மத்தியம், அந்திமம் now has three sub-columns, **பாகை · கலை · விகலை**, under one header, with the house name on the same row. Same on screen and in the designed PDF. |
| 4 | Contents congested on screen | ✅ | The report pages have more padding and line spacing, and tables use the full width. |
| 5 | Text spilling outside tables with some fonts or colours | ✅ | One rule for all report pages: cell text wraps inside the cell, line height suits Tamil handwriting fonts, numbers stay on one line, nothing is cut or truncated. It applies whichever typeface and colour you choose. |
| 6 | KP horary: name shown as the horary number; background different | ✅ | The name is the person's name (e.g. Guruprasath), and **பிரசன்ன எண்** is a separate row, both on screen and on the designed PDF cover. The report uses the site's panel background. |
| 7 | 12 Porutham: headings and content not lined up | ✅ | Each person's details are now a two-column label/value table, so every value starts at the same place. Charts sit below, side by side. |
| 8 | Names: the selected type showed nothing | ✅ | For "ஒரு நட்சத்திர எழுத்து" types you had to pick a first letter, and some letters have no names in the bank. The star's first letter is now **selected automatically**. If a letter really has no names, a clear message says so and suggests another letter or "நட்சத்திரம் + நியுமராலஜி விவரம்". |
| 9 | Tamil names cut | ✅ | Truncation removed in all report components; cells wrap instead of cutting (see item 5). |
| 10 | More colours, Kongu-region favourites | ✅ | A new group **கொங்கு மண்டல வண்ணங்கள்** with 10 palettes: கிளிப்பச்சை & அரக்கு, கொங்கு மஞ்சள் & குங்குமம், மாம்பழ மஞ்சள், பவளம், கத்தரிப்பூ, ராமர் பச்சை, அரளிப் பூ, செம்மண், காவேரி நீலம், தாமிரம். Each has a heading, body and highlight colour on light paper, with no black. Now 20 palettes in all features. |
| 11 | Check the whole website | ✅ | A full **production build** (`next build`) was run: everything compiles, passes the linter and type-check, and all 14 pages build. Backend tests **59 / 59**. The only build warning is that my build machine can't reach Google Fonts; on your PC the fonts load normally. |

## Files

| File | Change |
|---|---|
| `frontend/lib/useLang.ts` | **New**: remembered language |
| `frontend/app/{kalai-report,kp-report,kalai-matching,kalai-baby-names,kalai-utilities,horoscope}/page.tsx` | Use the remembered language |
| `frontend/components/Header.tsx` | Spacing, icons on wide screens only |
| `frontend/components/kalai/KalaiReport.tsx` | Bhava sub-columns, site background, no truncation |
| `frontend/components/kalai/KpReport.tsx` | Site background, horary number row |
| `frontend/app/kalai-matching/page.tsx` | Aligned person table |
| `frontend/app/kalai-baby-names/page.tsx` | Auto first letter, clear empty message |
| `frontend/app/globals.css` | `.kalai-page` overflow-safe rules |
| `frontend/lib/jathagamTheme.tsx`, `frontend/components/JathagamThemePanel.tsx` | Kongu palettes |
| `frontend/lib/kalaiApi.ts`, `backend/app/api/kalai.py` | Horary carries the name |
| `backend/app/services/pdf/builders.py`, `render.py` | Bhava sub-columns, horary name and number on the cover |
| `AGENTS.md` | Changelog 4.16.0 |
