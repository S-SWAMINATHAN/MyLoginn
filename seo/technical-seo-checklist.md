# Technical SEO Checklist

Legend: ✅ verified in code/live fetch · 🟡 done in code, verify in production · ❌ not done

| Item | State | Note |
|---|---|---|
| HTTPS + HSTS | ✅ | `next.config.ts` headers |
| Canonical URLs | ✅ | `createPageMetadata` sets `alternates.canonical` |
| robots.txt | ✅ | `src/app/robots.ts`; sitemap referenced; private paths disallowed |
| sitemap.xml | ✅ | Dynamic; 2 new service URLs added; no fake lastmod |
| Unique titles/descriptions | 🟡 | Updated for home + 4 service pages; audit course/other pages |
| One H1 | ✅ new pages / 🟡 others | |
| Organization / WebSite schema | ✅ | Alias "MyLogin" removed |
| Service schema | ✅ | New pages via `serviceStructuredData` |
| FAQ schema | ✅ | Answers visible on page (FaqAccordion) — confirm answers are in initial HTML |
| Article schema | ❌ | No blog yet |
| Course schema | ❌ | Recommended on `/courses/<slug>`, needs real price/provider data |
| Breadcrumb | ✅ | Site-wide, URL-derived |
| OG/Twitter | ✅ | |
| Favicon | ✅ | `icon.png`, `favicon.ico`, `apple-icon.png` |
| Image optimisation / alt | 🟡 | Check large PNGs in `public/about` (8k hero); convert to WebP/AVIF via next/image |
| Core Web Vitals | ❌ | Not measured. Homepage uses many dynamic client sections: run Lighthouse/CrUX |
| www/non-www, trailing slash | ❌ | Not verified; confirm 301 to `https://www.myloginn.com` |
| 404 status code | ❌ | `not-found.tsx` exists; confirm HTTP 404 |
| IndexNow | ✅ code / ❌ run | `public/<key>.txt` + `scripts/indexnow.mjs`; run after deploy |
| hreflang | n/a | Single English site |
| Orphan pages | 🟡 | New pages linked from nav, footer, `/services` |
