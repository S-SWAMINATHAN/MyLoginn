# Phase 33 — The website on every device (phones, tablets, desktops)

Date: 2026-10-09 · Version 4.30.0 · Frontend: `tsc` clean, `next build` passes

## How it was checked
The real site was built and driven in Microsoft Edge (Playwright) on emulated devices: Android 360 px, iPhone SE 375 px, iPhone 390 px, iPad 768 px and a 1366 px laptop, in Tamil and English. For each page the check measured whether the page scrolls sideways and which elements stick out. For Kanitha and KP it filled the birth form, generated the full report and measured every table.

| Check | Before | After |
|---|---|---|
| Pages × devices × languages without sideways scrolling (7 pages) | Utilities overflowed on phones | 70 / 70 |
| Header on a 360–390 px phone | brand name cut by the language toggle | fits |
| Kanitha report on a phone | page scrolled sideways (tables up to 730 px wide) | page fixed; wide tables slide in their own strip |
| Table text on a phone | words broken letter by letter | whole words |
| Normal PDF made on a phone | captured at 360 px wide | A4-width pages, every column |

## What changed
- **Header** (`components/Header.tsx`): on phones, the brand name sits on two lines and the language toggle is compact (த / EN). The ஜாதகம் items come first in the mobile menu. The header keeps clear of the notch (`app/layout.tsx` viewport + safe-area CSS).
- **Tables** (`KalaiReport.tsx`, `KpReport.tsx`, `kalai-matching`, `kalai-baby-names`): each table is wrapped in `.table-scroll`. A table wider than the screen slides by itself; the page never does. On desktop nothing changes. Cells break between words, and phones use slightly tighter cells.
- **Cards**: dasa cards show 1 / 2 / 3 per row on phone / tablet / desktop, and antharam cards the same.
- **Single page**: the details are one label : value column on phones.
- **PDF from a phone** (`lib/pdfExport.ts`): pages narrower than A4 are laid out at A4 width while captured, and the scroll strips and phone-only styles are switched off (`html.pdf-export`).
- **Forms**: the time picker wraps; the format buttons and bio-data header fit; inputs are 16 px on phones so iPhone doesn't zoom in.
- **Speed** (`app/globals.css`, `app/layout.tsx`):
  - no backdrop blur on phones (the biggest cause of scroll jank);
  - off-screen report pages are rendered only when you scroll near them;
  - Google Fonts load in parallel from `<head>` instead of a render-blocking `@import`, with three unused families removed;
  - the logo shown at 44 px is now a 16 KB file instead of 140 KB.

## Notes
- **Adding the site to the main website's Services**: no change was needed for a plain link. The site sends no frame-blocking headers, so it can also be embedded in an `<iframe>` today. To allow only your main domain to embed it, add a `Content-Security-Policy: frame-ancestors 'self' https://<main-domain>` header (`next.config.js` → `headers()`).
- **Your dev server**: during this work my production build overwrote `frontend/.next` while `pnpm dev` was running, so that dev server lost its CSS. Restarting `pnpm dev` fixes it. Later builds went to a separate folder (`NEXT_DIST_DIR=.next-audit`), which has been deleted.
- **Not checked**: real physical devices and Safari's own engine (emulated iPhone/iPad viewports in Edge were used); the 12 Porutham and Names *results* (their forms differ). Their tables use the same scroll strips.
