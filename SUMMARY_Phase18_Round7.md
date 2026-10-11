# SUMMARY — Bug list round 7 (v4.15.0)

## Main change: old features replaced by the new ones

| Removed (route now redirects) | Replaced by |
|---|---|
| Generate Chart `/` | **கணித ஜாதகம்** (`/` now opens it; also `/kalai-report`) |
| Marriage Match `/porutham`, `/match-finder`, `/star-match` | **12 பொருத்தம்** `/kalai-matching` |
| Baby Name `/baby-names` | **பெயர் & நியுமராலஜி** `/kalai-baby-names` |
| Muhurtha `/muhurtha` | **கணித ஜாதகம்** |

**New header** (one line, no dropdown): கணித ஜாதகம் · கே.பி ஜாதகம் · 12 பொருத்தம் · பெயர் & நியுமராலஜி · ராசி பலன் · கருவிகள்.

Everything the new features need is kept: the name bank (including the 10,013 Kalai names), the chart engine (bio data, palan), the birth-details form, place search, charts and fonts. Only the old pages were removed. ராசி பலன் was not on your removal list, so it stays.

## Items

| # | Bug | Status | Fix |
|---|---|---|---|
| 1 | Empty page with a single heading before the charts | ✅ | A heading is now always kept with its content. Charts flow inline, so a heading can no longer be left alone at the bottom of a page. Checked automatically: **0 near-empty pages** in the Kanitha, Porutham, Names and Horary PDFs. |
| 2 | "12" shown as "00" | ✅ | Birth times are now shown in 12-hour form everywhere (**12:32:00 AM**, not 00:32:00), and dates as dd-mm-yyyy. Done on screen and in the designed PDF. |
| 3 | "&amp" above the border | ✅ | The page header text is now escaped correctly, so "&amp;" no longer appears anywhere. The porutham header uses "Girl - Boy". |
| 4 | Porutham first page shows only the girl | ✅ | The cover now lists both the girl's and the boy's details. Page 3 has both side by side. |
| 5 | Name number 0 | ✅ Was wrong, now fixed | Name numerology needs English letters; a name typed in Tamil totalled 0. A Tamil name is now converted to English letters first (குருபிரசாத் → kurupirasaath, name number 6). For an exact match with how the person writes their name in English, type the English spelling. |
| 6 | KP horary designed PDF | ✅ | Horary has its own designed PDF: cover with the horary number, Ascendant with sign/star/sub(/sub-sub) lords, horary chart, planet and cusp tables, significators and dasa. |
| 7 | Headings and details not lined up | ✅ | Detail tables now sit centred under their centred headings in the Kanitha and KP reports. |
| 8 | Preview covers the colour panel | ✅ | The preview now opens below the panel, not over it. Changing the colour, typeface or cover picture refreshes the preview automatically; then download. |
| 9 | 12 Porutham result background differs | ✅ | It now uses the site's panel background; colours and typeface still follow the panel. |
| 10 | Names: display congested; panel not applied on screen | ✅ | Two roomy columns (English · Tamil · total) with larger rows, and the panel's colours and typeface now apply on screen too. |
| 11 | General closing contents on the last page | ✅ | Every designed PDF ends with **மங்கள வாழ்த்துரை & சுப நிறைவு**: daily worship, Navagraha temples, the "ஸர்வே பவந்து ஸுகின:" verse and "சுபமஸ்து — மங்களம் உண்டாகுக" (the text of the manuscript's last page). |
| 12 | Names PDF cover showed "பெயர் : குழந்தை" with empty fields | ✅ | The cover now shows sex, birth date, star, initials and name numbers. |
| 13 | Colour panel: three colours, astrologer colours, no black, light | ✅ | 10 palettes, each with **தலைப்பு (heading) · உரை (body) · சிறப்பு (highlight)** on a light warm paper: குங்குமம் & மஞ்சள், சந்தனம் & செம்பு, அரக்கு & தங்கம், மயில் நீலம், மரகதப் பச்சை, காவி, தாமரை இளஞ்சிவப்பு, நீலமணி, மஞ்சள் பட்டு, காதலி ஊதா. No black is used. The panel shows the three swatches. It applies on screen and in the designed PDF. |

## Checks

- Backend tests **59 / 59**. Frontend type-check **0 errors**.
- Designed PDFs regenerated: Kanitha 44 pages, Porutham 6, Names 12, Horary 8. All have the contents page, the closing page, no near-empty pages and no "&amp;".
- The pages were not opened in a browser here.

## Files

| File | Change |
|---|---|
| `frontend/components/Header.tsx` | New navigation |
| `frontend/app/page.tsx` | Home = கணித ஜாதகம் |
| `frontend/app/{porutham,baby-names,muhurtha,match-finder,star-match}/page.tsx` | Redirect to the new features |
| `frontend/lib/jathagamTheme.tsx`, `frontend/components/JathagamThemePanel.tsx` | 3-colour palettes |
| `frontend/components/kalai/PrintPdfControls.tsx` | Inline auto-refreshing preview; horary |
| `frontend/app/kp-report/page.tsx` | Horary designed PDF |
| `frontend/app/kalai-matching/page.tsx`, `frontend/app/kalai-baby-names/page.tsx` | Backgrounds, spacing, 12-hour times |
| `frontend/components/kalai/KalaiReport.tsx`, `KpReport.tsx` | Centred tables, 12-hour time |
| `frontend/lib/timeFormat.ts` | `to12h`, `toDdMmYyyy` added (existing helpers kept) |
| `backend/app/services/pdf/render.py` | Closing page, covers, CSS-safe header, headings kept with content |
| `backend/app/services/pdf/builders.py` | Horary PDF, 12-hour times, baby cover |
| `backend/app/api/pdf.py` | `POST /api/pdf/kp-horary` |
| `backend/app/services/tamil_latin.py` | **New**: Tamil → English letters for numerology |
| `backend/app/services/kalai_report.py` | Uses it for the name number |
| `backend/tests/test_kalai_parity.py` | +1 test (59) |
| `AGENTS.md` | Changelog 4.15.0 |
