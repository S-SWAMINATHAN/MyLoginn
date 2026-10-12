# Search Engine Strategy

Rankings are not guaranteed; this maximises eligibility.

**Google:** keep content SSR; sitemap in Search Console; monitor Pages/Performance weekly; add `GOOGLE_SITE_VERIFICATION` env var (already supported in `layout.tsx`). Inspect `/`, each service page after deploy.
**Bing / Copilot:** verify in Bing Webmaster Tools (import from GSC), submit sitemap, run `node scripts/indexnow.mjs` after each content deploy (key file `public/d1694b67995b4f958c5e35c01b651ca2.txt`). Do not submit unchanged URLs.
**Brave:** has an independent index; relies on crawlable HTML and external links/mentions. No special submission; ensure no noindex on public pages and earn genuine mentions.
**AI search:** `llms.txt` updated (not a ranking factor; harmless). Real levers: clear entity statement, FAQs, case studies, third-party mentions.
**Monitoring after deploy:** `site:myloginn.com`, "MyLoginn", "MyLoginn Tech", "MyLoginn services" on Google/Bing/Brave; record in a dated log. Not run in this session.
**Brand queries:** expect a long period where "mylogin" queries belong to another product; do not chase them.
