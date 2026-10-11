# SUMMARY — Kalai tables in the handwritten manuscript (v4.7.0)

## 1. What changed in the manuscript

The manuscript now has a new **chapter 15, "கலைமகள் கணித அட்டவணைகள்" (Kalai Magal Computation Tables)**. It is **56 pages**; it was 50.

| Page | Content |
|---|---|
| 51 | **காலச்சக்கிர தசை** — direction, balance at birth, 12 dasas with start and end dates and their bhuktis |
| 52 | **சோடச வர்க்க பலம்** — the 16-varga strength table for the 9 planets and Lagna, totals and rupas |
| 53 | **கிரகங்களின் விவர அட்டவணை** — bhava, own-bhava %, lordship, kendra/trikona, dignity, conjunction, aspects, retro/combust/vargottama, exchange, Shadbala class |
| 54 | **உப கிரக ஸ்புடம்** — 10 upagrahas; **பிரஸ்தார் சுருக்கம்** — bindus per sign for each planet |
| 55 | **பஞ்சபட்சி** — birth bird, both halves of the month, day/night activity grids |
| 56 | **கே.பி அட்டவணைகள்** — KP ayanamsa, planet and cusp star/sub/sub-sub lords, significators |

- **Numbers.** Every value comes from the same Kalai-verified backend used by `/kalai-report` and `/kp-report`.
- **Updated automatically.** The contents page, the page viewer ("Page x of 56") and the PDF button labels.
- **PDF export.** It now waits until chapter 15's data has loaded, up to 25 seconds, so the PDF never shows "Computing…".

## 2. Fix in chapter 13 (Pancha Pakshi & Names)

The name-letter table in chapter 13 had several wrong stars. For example, Moolam showed Kettai's letters, and Visakam and Uttarattathi were wrong. It now uses the same letters Kalai prints; for example Uttarattathi is து - ஞ - ச - ஸ்ரீ.

## 3. Files

| File | Status |
|---|---|
| `frontend/components/manuscript/Chapter15KalaiTables.tsx` | **New** |
| `frontend/components/HandwrittenManuscript.tsx` | Modified (adds chapter 15) |
| `frontend/lib/manuscriptIndex.ts` | Modified (chapter 15, pages 51–56) |
| `frontend/components/manuscript/Chapter13PanchaPakshiNama.tsx` | Modified (Kalai letters) |
| `frontend/lib/pdfExport.ts` | Modified (waits for chapter 15 data) |
| `frontend/app/page.tsx` | Modified (56-page viewer) |
| `frontend/components/HandwrittenPdfButton.tsx` | Modified (56-page labels) |
| `AGENTS.md` | Modified |

No backend changes; tests stay at **56 passed**.
