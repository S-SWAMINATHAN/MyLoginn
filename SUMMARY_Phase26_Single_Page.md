# SUMMARY — ஒரு பக்க ஜாதகம் = one A4 sheet (v4.23.0)

**Reference:** `Thirukanitam_single_page.pdf` (Kalai Magal).

## What the single page now contains — on ONE A4 sheet

| Part | Content (same order as the reference) |
|---|---|
| Top | ஓம் நமச்சிவாய, the two invocation lines (ஜெனனீ ஜென்ம சௌக்கியானாம் …), and the print date at the right |
| Details, in two columns of label : value | **Left:** பெயர், தந்தை பெயர், தாயார் பெயர், பிறந்த தேதி (with weekday), தமிழ் தேதி, பிறந்த நேரம் (with GMT), நட்சத்திர ஹோரை, அயனாம்சம், சூரிய உதயம், சூரிய அஸ்தமனம், நேர திருத்தம்<br>**Right:** பிறந்த ஊர், அட்சாம்சம், தீர்க்காம்சம், ஜன்ம நட்சத்திரம் (பாதம்), ஜன்ம ராசி, ஜன்ம லக்னம், திதி, யோகம், கரணம், அயனம், நேர மண்டலம்<br>**Full width:** உதயாதி நாழிகை |
| திருக்கணித கிரக ஸ்புடம் (நிராயனம்) | Planets in **two side-by-side tables** (கிரகம், பாகை கலை விகலை, நட்சத்திரம், பாதம்), including மாந்தி and லக்னம் |
| Charts | **ராசி** (with மாந்தி) and **நவாம்சம்** side by side |
| Bottom lines | பாவக மாற்றம், ஜனன கால தசை இருப்பு, நடப்பு தசா புக்தி முடிவு தேதி, நியுமராலஜிப்படி பெயரின் கூட்டு எண், நட்சத்திரப்படி பெயரின் முதல் எழுத்து |
| End | சுபம் |

**Removed from the single page:** the cover, contents page, prayer pages, bio-data page and closing page.

## Where it applies

- **Designed PDF (அச்சு PDF):** a dedicated one-sheet layout, verified to be exactly **1 page** in Tamil and English. It follows the colour / Tamil-style panel.
- **Website and normal PDF:** the on-screen single page uses the same layout. The normal PDF button prints it on **one page**; if it is slightly taller than A4 it is scaled to fit, never split. The bio-data page now appears only in the full jathagam.

The full jathagam (முழு ஜாதகம்) is unchanged.

**Checks:** sample one-page PDFs generated (Tamil with a custom palette and font, and English); backend tests **61 / 61**; frontend type-check **0 errors**.

**Files:**
- `backend/app/services/pdf/render_single.py` (**new**)
- `backend/app/api/pdf.py` (mode single → one sheet)
- `frontend/components/kalai/KalaiReport.tsx` (SinglePage)
- `frontend/lib/pdfExport.ts` (one-page fit)
- `backend/tests/test_kalai_parity.py`
- `AGENTS.md`

This zip is the **complete project**, including all earlier fixes.
