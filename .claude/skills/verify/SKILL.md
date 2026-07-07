---
name: verify
description: How to build, launch, and drive this Next.js app to verify UI changes at runtime.
---

# Verifying MyLoginn (Next.js 16 + Tailwind v4 + framer-motion)

## Launch
- Dev server: `npm run dev` (port 3000). Check first — it is often already running: `Get-NetTCPConnection -LocalPort 3000 -State Listen`. Dev server hot-reloads, no restart needed after edits.

## Drive (GUI surface)
- Playwright is a devDependency but scripts outside the repo must require it by absolute path: `require("e:/MyLoginn/node_modules/playwright")`.
- Mobile testing: `viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true`.
- The mobile hamburger is `button[aria-label="Toggle menu"]` with `aria-expanded` reflecting state.
- Gotcha: desktop nav links exist in the DOM but are hidden on mobile — `text=Internships` matches the hidden desktop link first. Scope selectors with `:visible`, e.g. `page.locator('a[href="/internships"]:visible')`.
- Wait ~900ms after opening the menu for the spring + stagger animations to settle before screenshotting.

## Theme
- The app **forces light theme**: `ThemeProvider.tsx` sets `forcedTheme="light"`. Dark-mode CSS exists but is unreachable at runtime — don't try to verify dark mode via `colorScheme` emulation or localStorage; it won't apply.

## Other gotchas
- lucide-react is v1.x: old alias names were removed (`Home` → `House`, `Code2` → `CodeXml`). Check `node_modules/lucide-react/dist/lucide-react.d.ts` when adding icons.
- This Next.js version differs from public docs — see `node_modules/next/dist/docs/` (e.g. `next/image` uses `preload`, not `priority`).
