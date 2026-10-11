# Phase 31 — Bug fixing (Bugs Resoloving.txt, 5 items)

Date: 2026-10-08 · Version 4.28.0 · Backend tests: 119 passed · Frontend: `next build` passes

## What was wrong in the shared PDFs

| PDF | English words found on Tamil pages |
|---|---|
| Full jathagam | `Asia/Kolkata`, `06:13:01 AM`, `06:04:58 PM`, `12:32:00 AM` (cover), `Lahiri (Chitrapaksha)`, `Standard Time (…)`, father / mother names in English |
| Single page | `AM`/`PM`, `(GMT 07.02.00 PM)`, `Standard Time (No Correction)`, `05.30E Indian Standard Time`, `10:34 N`, `077:15 E`, parents' names |
| Names & numerology | initials `C / M`, Tamil column `C.M.சக்கரேஷ்` |
| 12 Porutham | `12:00:00 PM` |
| Full jathagam p.5 | father and mother printed twice (பொது விவரங்கள் and சுய விவரம்) |

## Fixes

### 1. Tamil pages fully in Tamil
- New `backend/app/services/pdf/ta_text.py`: `time_ta` (காலை / மதியம் / மாலை / இரவு + 12-hour clock), `tz_ta`, `dms_dir_ta` (வடக்கு / கிழக்கு …), `ayanamsa_ta`, `initials_prefix_ta`, `value_ta`. Used by `builders.py` (Kanitha, KP, horary, porutham, baby names) and `render_single.py`. Numbers are never changed.
- Frontend `lib/taText.ts` (same rules) for the website report / normal PDF, and `birthForLang()` so parents' and family names typed in English go to the designed PDF in Tamil (`PrintPdfControls`).
- The PDF document title is Tamil on Tamil PDFs.
- Kept on purpose: the English-name column of the baby-names list, the A–Z numerology table, Roman cusp numbers (I–XII) and the "MyLoginn Astrology" brand line.

### 2. Bio-data card in Tamil
- Designed PDF: every bio-data field (father's occupation, kula deivam, native place, phone, address …) now has its Tamil label — previously unknown keys were printed as English title case.
- Website `BioDataCard`: Tamil-only headings, Tamil time, pada / lagna wording per language, names and family fields transliterated on Tamil pages.

### 3. No repetition
- Father / mother names are printed once, in பொது விவரங்கள். The bio-data block (designed PDF) and the bio-data card (website / normal PDF, new `omitParentNames`) leave them out.

### 4. Custom / தனிப்பயன்
- `BirthDetailsForm` has an optional third format button; கணித ஜாதகம் and கே.பி ஜாதகம் show "தனிப்பயன் / Custom".
- Choosing it opens the contents picker (`components/kalai/ReportOptions.tsx` → `SectionPicker`): 20 Kanitha sections or 8 KP sections, select all / clear.
- The website report, the normal PDF and the designed PDF all follow the ticks. Cover, contents, prayer pages and closing page always stay.
- API: `POST /api/pdf/kanitha|kp` with `mode: "custom"`, `sections: [keys]`. Kanitha blocks are tagged with their section key in `_full_kanitha_sections`.

### 5. A4 / A5 sheet
- `PaperPicker` (file icon, A4 210×297 / A5 148×210) in the print panel, shown for full and custom Kanitha / KP before preview and download. The same choice drives the normal "Download PDF (A4/A5)" button.
- Designed PDF: `page_size: "A5"` lays the book out on a 182 × 258.25 mm CSS page (A5 proportions) and WeasyPrint `zoom = 148/182` puts it exactly on A5. A5 rules: charts 6.6 cm (two per row), small charts 4.4 cm (three per row), compact dasa cards, compact 9+-column tables.
- Normal PDF: `exportNodesToPdf(..., { paper: "A5" })` — jsPDF A5 format; margins scale with the sheet.

## Verification
- Rendered with WeasyPrint 70: Kanitha A4 (54 p), Kanitha A5 (65 p, every page 148.0 × 210.0 mm), Kanitha custom A5, KP A4/A5/custom, single page, porutham, baby names. A script listed Latin words left on Tamil pages: none, apart from the intended items above.
- Page images checked: cover, details, planets + charts, bhava, dasa, antharam, ashtakavarga, prasthara, shadbala, varga bala — no overlapping text. A first A5 pass showed dasa names touching dates and planet names breaking mid-word; both fixed and re-checked.
- New test `test_designed_pdf_round_31_tamil_custom_a5`.

## Files
- Backend: `services/pdf/ta_text.py` (new), `services/pdf/builders.py`, `services/pdf/render.py`, `services/pdf/render_single.py`, `services/pdf/schemas.py`, `api/pdf.py`, `tests/test_kalai_parity.py`.
- Frontend: `lib/taText.ts` (new), `components/kalai/ReportOptions.tsx` (new), `components/kalai/PrintPdfControls.tsx`, `components/kalai/KalaiReport.tsx`, `components/kalai/KpReport.tsx`, `components/BioDataCard.tsx`, `components/BirthDetailsForm.tsx`, `lib/pdfExport.ts`, `app/kalai-report/page.tsx`, `app/kp-report/page.tsx`.

## Notes
- Transliteration of English names to Tamil is automatic (`toTamil`), so an unusual spelling can come out slightly different from how the family writes it. Typing the name in Tamil in the form avoids this.
- Free-text bio fields (education, occupation, income, address, e-mail, phone) are printed as typed; they are not translated.
- No calculation code was changed; only labels, layout and export options.

## Follow-up (Bug fixing (1).pdf) — Tamil suggestions in the bio data
- `TamilNameInput` gained `hideIcon`, so it can replace plain fields.
- All 14 free-text bio-data fields in `BirthDetailsForm` (father / mother name and work, gothram, native place, kula deivam, caste, siblings, education, profession, income, height, address) now show the same Tamil suggestion dropdown as the name field when the site is in Tamil. Phone and e-mail stay plain. This form is used by கணித ஜாதகம், கே.பி ஜாதகம் and the horoscope page.
- 12 பொருத்தம்: the girl's and boy's name fields use the same dropdown (previously small chips under the field).
- Suggestions stay optional: what you type is kept unless you pick one (click, or arrow keys + Enter).
