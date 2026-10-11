# Phase 32 — Bug fixing (Bugs Resoloving.txt, 4 items)

Date: 2026-10-09 · Version 4.29.0 · Backend tests: 120 passed · Frontend: `tsc` clean, `next build` passes

No calculation code was changed. Every fix is in presentation: colours, chart artwork, Tamil spelling and place labels.

## 1. White and turmeric page backgrounds in every feature

**What was wrong:** the colour panel only changed ink colours. The page colour came from each palette's own light tint (designed PDF) or the site's white panel (website and normal PDF). There was no way to pick plain white or turmeric.

**Fix:**
- The colour panel has a new row, **பின்னணி வண்ணம் / Page background**, with three choices:
  - **வண்ணத் தொகுப்பின் இயல்பு / Palette default**: the earlier look, unchanged.
  - **வெள்ளை / White**: `#FFFFFF`.
  - **மஞ்சள் / Turmeric (manjal)**: `#FCE38A`, a soft turmeric on which dark inks stay readable.
- The choice replaces the palette's `paper` / `paperCard` in the theme (`lib/jathagamTheme.tsx`), so everything that reads them follows automatically:
  - **Website report pages** (`.kalai-page`, `.single-sheet`) take the colour.
  - **Normal PDF** (`lib/pdfExport.ts`): `pageBackgroundOf()` reads `--jat-page-bg` from the page. The canvas fill and the whole jsPDF sheet, margins included, are painted with it, so a turmeric page is one colour edge to edge.
  - **Designed (print) PDF**: the panel already sent `paper` / `paperCard`, and the backend uses them for the page, cards and cover. Changing the background now also refreshes the inline preview.
- This covers கணித ஜாதகம் (full, single page, custom), கே.பி ஜாதகம் (incl. horary), 12 பொருத்தம் and பெயர் & நியுமராலஜி, because all four use the same panel and theme.

## 2. Premium chart centre in every chart

**What was wrong:** the centre box was a plain double frame with Greek-key corner blocks.

**New centre design**, the same everywhere:
- Ivory-to-gold radial glow.
- Gilded frame: an outer gold rule, a soft-gold band, a maroon rule and an inner gold hairline, with a small gem in the middle of each side.
- Corner flourishes: a maroon gem on each corner, two gold leaves along the frame and a three-petal lotus fan pointing inward.
- A faint lotus mandala (16 outer and 8 inner petals in two rings) behind the chart name, kept light so the name stays clear.
- The chart name gets a white halo on screen and a soft ivory backing in the PDF. WeasyPrint has no `text-shadow`, hence the backing.

**Where it applies:**
- Canvas charts (`HandwrittenChartCanvas`): Kanitha, KP, 12 Porutham, single page.
- DOM grids: ashtakavarga charts and the KP chart.
- Every designed-PDF chart: full, single page, KP, Porutham, and small shodasa-varga charts.

`frontend/lib/chartArt.ts` and `backend/app/services/pdf/chart_art.py` generate the same 47 SVG paths; a script compared them and they are identical. The houses, lines, planet colours and square shape are unchanged.

## 3. Correct Thanglish → Tamil suggestions everywhere

**What was wrong:** typing `c` gave க், and a capital `C`, the first key of a name, was read as an initial and gave **சி**. Other common spellings were also wrong:

| Typed | Before | Now (first suggestion) |
|---|---|---|
| c / C | க் / சி. | ச |
| Celvi | கெல்வி | செல்வி |
| C.M. Prasath | சி..எம்.. பிரசத் | ச.ம. பிரசத் |
| Thanjavur | தஞவூர் | தஞ்சவூர் |
| Mangalam / Bangalore | மஙலம் / பஙலோரே | மங்கலம் / பங்கலோர் |
| Shankar / Panchami | ஷன்கர் / பன்சமி | ஷங்கர் / பஞ்சமி |
| Vijay / Jayanthi | விஜை / ஜைஅந்தி | விஜய் / ஜயந்தி |
| Vignesh | விஞேஷ் | விக்னேஷ் |
| Farook | பரூக் | ஃபரூக் |
| Prakash / Vikas | பிரகஷ் / விகச் | பிரகாஷ் / விகாஸ் |
| Chennai, Madurai, Muthu | first guess wrong | correct spelling now offered in the list |

**Rules** (`lib/tamilTransliterate.ts`):
- c / ch / s = ச; k / g = க; f = ஃப.
- ng, nj + vowel = ங்க, ஞ்ச; nk = ங்க; nch = ஞ்ச; gn = க்ன.
- oi = ஒய்; a final -y = இ; a final s = ஸ்; -ash / -as = ஆஷ் / ஆஸ்.
- An English silent final e is dropped.
- A lone consonant is shown bare (ச). A capital letter counts as an initial only when written as one ("C.", "C Prasath", "CM"; "SRI" stays ஸ்ரீ).
- Initials use the letter's Tamil sound, not the English letter name (4.29.1): C.M. → ச.ம., R.K. → ர.க., S. → ச. This is the same in the suggestion boxes and the designed PDFs (baby-names initials line and names list).
- Less common readings (c = க, nn = ன்ன, medial d = த, th = த்த, …) are still offered further down the list.
- The suggestion search now tries only spellings within a small cost of the conventional one. It is fast per keystroke; the full combination set would have been ~98,000 per key.

This one engine feeds every place Tamil is suggested or converted:
- Name and all 14 bio-data fields (`TamilNameInput`).
- The 12 Porutham names.
- Names on the Kanitha / KP / Porutham reports.
- The baby-name form.
- The Tamil text sent to both PDFs (`lib/taText.ts`).

## 4. Tamil place printed in the PDF = the place shown on screen

**What was wrong:** the place picker shows a curated Tamil name (பாலக்காடு) but keeps the English value for geocoding. When the report and PDFs were built, that English value was transliterated again letter by letter, so the PDF printed a different, wrong word (e.g. பாலகட்டு).

**Fix:**
- `LocationPicker` records the Tamil label it displayed (`rememberPlaceTa`, kept in localStorage). `placeForLang()` prints exactly that name in the website report, the normal PDF and the designed PDF (Kanitha, KP, horary, 12 Porutham).
- New `lib/placeNamesTa.ts`: about 310 English spellings mapped to their standard Tamil names, covering Tamil Nadu districts and towns, Kerala, other Indian cities and diaspora cities. Alternative English spellings are included (Palghat, Trivandrum, Calicut, Tanjore, Udumalpet, …).
  - `tamilPlaceLabel()` and the bio-data native-place field use this table before any transliteration.
- More states and countries now have Tamil names (`STATE_TA`, `COUNTRY_TA`).
- Backend safety net, `ta_text.place_ta()`: if an English place still reaches a Tamil PDF, it is printed with the curated Tamil name from `geocode.KNOWN_LOCATIONS`. This applies only when coordinates are present, so the Tamil text is never geocoded and can never move the chart to the wrong city. Unknown towns are left exactly as typed rather than guessed.

## Verification
- `tsc --noEmit`: clean. `next build`: passes, all 17 routes.
- Backend: `pytest backend/tests`: **120 passed** (new `test_designed_pdf_round_32_place_background_centre`: place_ta, the coordinates-only guard, white and turmeric paper in the PDF stylesheet, the centre ornament layers).
- Transliteration was checked on about 60 names and places (table above).
- Chart centre was rendered with headless Edge: website DOM chart on white and turmeric pages, canvas chart, and the backend PDF chart CSS at full and small size. Corners sit on the frame, the name is readable over the mandala, and charts stay square.
- **Not done here:** WeasyPrint is not installed in this environment, so the designed PDFs were not regenerated as files. The backend chart HTML/CSS was rendered in a browser instead. Please open a print-PDF preview once (Kanitha with the turmeric background) to confirm on your machine.

## Files
- Frontend:
  - New: `lib/placeNamesTa.ts`.
  - Changed: `lib/tamilTransliterate.ts`, `lib/placeLabel.ts`, `lib/taText.ts`, `lib/jathagamTheme.tsx`, `lib/pdfExport.ts`, `lib/chartArt.ts`, `components/JathagamThemePanel.tsx`, `components/LocationPicker.tsx`, `components/HandwrittenChartCanvas.tsx`, `components/BioDataCard.tsx`, `components/kalai/PrintPdfControls.tsx`.
- Backend: `app/services/pdf/chart_art.py`, `app/services/pdf/ta_text.py`, `app/api/pdf.py`, `tests/test_kalai_parity.py`.
- Docs: `AGENTS.md` (changelog 4.29.0), this file.

## Notes
- Transliteration is still a suggestion: what you type is kept unless you pick a suggestion. Unusual spellings can still differ from how a family writes a name; picking the second or third suggestion, or typing in Tamil, avoids that.
- A place not in the table and not chosen from the picker is still transliterated. To get the exact Tamil name, choose the place from the picker list; the PDF then prints what the picker showed.
- The background choice is per page visit, like the ink palette and typeface.

## Follow-up (4.29.2) — designed PDF pages 7–8 and table alignment

**What was wrong** (from the shared 52-page PDF):
- Page 7 ended with the dasa heading and balance line, and the first card started on page 8, leaving a large gap. Cards then flowed in three newspaper columns, and WeasyPrint's column flow (with keep-together cards) moved whole cards on, leaving more empty space.
- In the cards, the end date ran into the வ / மா / நா columns whenever the age had three digits ("05-04-209590", "20-06-205429"). The fixed column widths were too narrow for wider typefaces.
- Table headers split mid-word (பாத|ம், பா|கை, விக|லை, மேஷ|ம்) and numbers split (255.0|0).

**Fix** (`backend/app/services/pdf/render.py`, `builders.py`):
- Dasa and antharam cards are now **rows of three**. A row never splits; rows break between pages. The heading, balance line and first row stay together. A short last row keeps equal card widths.
- Card tables size to their content. The card text size is computed for the chosen typeface from its glyph widths (`dasa_font_pt`), so the widest row fits in every face, A4 and A5. Start and end dates are on separate lines in every card.
- Ordinary tables use auto layout: each column is at least as wide as its longest word, so Tamil words and numbers are not split. Tables with 9+ columns keep a fixed layout, so they are never wider than the page. Their text is scaled to the typeface's width (`width_ratio`). The planet table's விகலை / பாதம் columns were widened.

**Checked** by rendering the same horoscope with WeasyPrint 70 in five typefaces (MLA 105, 130, 133, Kavivanar, Noto), A4 and A5, Kanitha and KP:
- Dasa cards begin under the bhava chart on the same page, and pages fill.
- No overlaps in the cards.
- Planet, bhava and ashtakavarga headers are whole.
- Backend tests: 121 passed.

- In tables with 9+ columns, columns that were given the same width (the 12 sign columns) now share it in proportion to header length (`_share_by_header`). Long names (விருச்சிகம்) get more room, and short names (கன்னி, மேஷம்) keep at least 90 % of theirs. Checked in MLA 105, MLA 133 and Kavivanar: every sign header stays on one line.

**Environment:** WeasyPrint 70 and PyMuPDF were installed into `backend/.venv` to render and check the PDFs (WeasyPrint is already in requirements.txt; PyMuPDF was only used for checking).
