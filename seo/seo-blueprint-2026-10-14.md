# MyLoginn SEO Implementation Blueprint (start date 2026-10-14)

Written for: the MyLoginn owner and developers. Builds on the earlier reports in this folder; it does not repeat them.

**Method.** Source review of this repo plus live `curl` checks of `https://www.myloginn.com` on 2026-10-14. **Not available:** Search Console, CrUX/Lighthouse, backlink tools, search-volume data. Items needing those are marked *Unverified*. No ranking is guaranteed.

## 0. Findings that change the plan

1. **The homepage `<title>` had no brand in it** (`AI, Web, Mobile & Software Development Company`). The root layout's `%s | MyLoginn` template does not apply to a page in the same segment as the layout. **Fixed today** (see section 12).
2. **The homepage H1 contained six rotating tagline sentences.** The hidden ones were `aria-hidden` but still inside `<h1>`. **Fixed today:** H1 is now `MyLoginn`; the rotating tagline is a `<p>`.
3. **Two of your terms belong to another entity.** "My Login", "mylogin" and "my login" are the established MyLogin school single sign-on product. Earlier work found that Google auto-corrects `myloginn` to `mylogin`. Your brief asks to "naturally mention" these variants. I recommend **not** doing that: it cannot be done naturally, it would mislead people looking for MyLogin, and it risks the spam treatment you want to avoid. Targeted: `MyLoginn`, `My Loginn`, `MyLoginn Tech`, `MyLoginn Tech Private Limited`, `myloginn.com`. The About-page FAQ ("Is MyLoginn the same as MyLogin?") is the legitimate way to capture confused searchers.
4. **Keep the existing service URLs.** Your example tree uses `/services/web-development` and `/services/app-web-development`-style splits, but the live pages are `/services/app-web-development`, `/ai-development`, `/testing-automation`, `/digital-marketing`. They are indexed and in the sitemap; renaming them means 301s and lost signals for no gain. Split only when a sub-page has distinct content (section 3).

## 1. Domain configuration (verified live)

| Check | Result |
|---|---|
| `http://myloginn.com` | 308 to `https://myloginn.com`, then 308 to `https://www.myloginn.com` |
| `http://www.myloginn.com` | 308 to `https://www.myloginn.com` |
| `https://myloginn.com` | 308 to `https://www.myloginn.com` |
| `/about/` | 308 to `/about` (consistent no-trailing-slash policy) |
| `/About` (casing) | 404, correct |
| Unknown URL | HTTP 404, correct |
| `?utm_source=...` | 200, self-canonical removes the parameter |
| robots.txt, sitemap.xml | 200, consistent `www` host |

- **Preferred canonical: `https://www.myloginn.com`.** Keep it. `siteUrl` in `src/lib/site.ts` feeds metadata, schema, robots and sitemap, so all four agree.
- 308 is treated like 301 by Google. The only imperfection is the two-hop chain from `http://myloginn.com` (Vercel does HTTP to HTTPS first). Impact is negligible; P3. In Vercel > Domains, make sure `myloginn.com` is set to redirect to `www.myloginn.com` (it is).
- Canonical tags and redirects are both in place and not confused: redirects move users, canonicals consolidate duplicates (query strings).
- Homepage canonical is `https://www.myloginn.com` (no slash). Browsers and Google treat it as the same URL as `/`. No change.

## 2. Page hierarchy (existing, indexable) and titles

| URL | Title (live after today's deploy) | Status |
|---|---|---|
| `/` | `MyLoginn` | Fixed today |
| `/about` | `About MyLoginn` | Fixed today |
| `/contact` | `Contact MyLoginn` | Fixed today |
| `/services` | Web, Mobile, AI & Software Services \| MyLoginn | Keep; spec wants `Services \| MyLoginn`, but the current title carries real intent. Recommend keeping it. |
| `/services/app-web-development` | Web, Mobile App & Custom Software Development \| MyLoginn | Keep |
| `/services/ai-development` | AI Development & AI Agent Development Services \| MyLoginn | Keep |
| `/services/testing-automation` | Software Testing & Test Automation Services \| MyLoginn | Keep |
| `/services/digital-marketing` | Digital Marketing & SEO Services \| MyLoginn | Keep |
| `/courses` | AI, Technology & Full-Stack Courses in India \| MyLoginn | Keep (59 chars, fine) |
| `/courses/<slug>` | per course, 28 pages | Keep; Course schema present |
| `/projects` | Student Projects & Portfolio \| MyLoginn | **Review:** says "Student", but this is also the company portfolio. Retitle to `Projects & Portfolio` once case studies exist |
| `/internships`, `/locations/tamil-nadu`, `/privacy`, `/terms` | unique | Keep |

Rule going forward: brand-first only on Home/About/Contact (entity pages); everything else `Topic | MyLoginn`. Titles under about 60 characters, matched to the visible H1 intent.

**Meta descriptions:** one per page, 120 to 160 characters, a plain sentence that starts with what the page offers. The homepage description currently ends "including Coimbatore and Tamil Nadu"; fine for now, trim if you want a purely national lead.

**H1/H2:** one H1 per page (verified: every audited page has exactly one). H2s describe sections (process, benefits, FAQ), no keyword repetition.

## 3. Future URL architecture (build only when real content exists)

```
/services/app-web-development            (exists; covers web + mobile + custom software)
  -> /services/web-development           split only with its own portfolio, process and pricing guidance
  -> /services/mobile-app-development    same condition
/services/ai-development                 (exists; includes automation)
/services/testing-automation             (exists)
/services/digital-marketing              (exists)
  -> /services/digital-marketing/seo     only when you have SEO case studies
  -> .../google-ads, .../meta-ads        only if you actually run paid campaigns for clients
/services/ui-ux-design                   not created: no verified proof of the service yet
/blog/<slug>, /case-studies/<slug>       new sections (section 8)
/locations/coimbatore                    one page, only with unique local content (section 7)
```

When a split page ships: 301 nothing (the parent remains), link parent to child, add breadcrumb, add to sitemap. Do not create `/services/digital-software-solutions/...` as a parallel tree; it would duplicate `app-web-development` and `ai-development` and cannibalize them.

## 4. Brand keyword strategy

- One entity: **MyLoginn = MyLoginn Tech Private Limited = myloginn.com.**
- Sentence pattern used once or twice per key page: "MyLoginn, operated by MyLoginn Tech Private Limited, is an India-based technology company...". Already on About and in schema.
- Allowed aliases in schema: `My Loginn`, `MyLoginn Tech`. Never `MyLogin`.
- No pages per spelling (also in `cannibalization-report.md`).
- Footer: legal line "MyLoginn Tech Private Limited" plus the registered address and CIN once you publish them (only if real).

## 5. Keyword-to-page map

The full 931-row list is in `keyword-map.csv`; current page-level map in `page-keyword-map.md`. Add three columns the old map lacks: **Index status** (from Search Console), **Content status**, **Internal links in/out**. One primary keyword per page; the 4 service pages already follow that.

## 6. Structured data (current state and gaps)

| Schema | State | Action |
|---|---|---|
| Organization (`#organization`, legalName, logo, contactPoint, OfferCatalog, disambiguatingDescription) | Live on home | Add `sameAs` entries as profiles are created (only Instagram today). Add `address` / `foundingDate` / `taxID` only with real values |
| WebSite (`#website`, name `MyLoginn`) | Live | No SearchAction: the site has no public site search; do not add one |
| BreadcrumbList | Live site-wide, derived from URL | OK; verify labels on `/services/*` and `/courses/<slug>` (slug-derived). Course pages should use the course name as the last label |
| Service | Live on AI, testing, app/web pages | Add to `/services/digital-marketing` (it has FAQ and breadcrumb only) |
| Course | Live on `/courses/<slug>` | Verify no fabricated `rating` / `studentsCount` is exposed (see `outrank-plan.md` item 6) |
| FAQPage | Live on About, Contact, Courses, Internships, services | Fine. Google now shows FAQ rich results rarely; keep because answers are visible on-page |
| Article | None | Add with the blog |

Logo: `myloginn-logo.png` is referenced; confirm it is square-ish and at least 112 px (it is the file Google reads for the knowledge panel/logo).

## 7. robots.txt, sitemap, indexing (audited)

- **robots.txt:** correct. Allows all, blocks `/admin`, `/api`, `/dashboard`, `/courses/*/checkout`. Does not block CSS/JS/images. Sitemap line present. One consideration: `/api` is blocked, so nothing under it is crawled; fine since no public API pages need indexing. **No change.**
- **sitemap.xml:** dynamic, consistent `www` host, only public pages plus published courses and internships. Gaps: no `lastmod` on static pages (leave blank rather than invent dates, or take real file dates at build time); `/courses/*/learn`, assessment, login, signup are correctly excluded and are `noindex`. `force-dynamic` means every request hits the database; add `revalidate = 3600` when convenient. P3.
- **Indexing checklist per page** (do monthly): status 200, canonical self-referencing, no `noindex`, linked from nav/footer/parent, in sitemap, one H1, unique title/description, schema valid in the Rich Results Test.
- **Search Console:** add a **Domain property** for `myloginn.com` (DNS TXT) so www/non-www/http are all covered; submit `sitemap.xml`; use URL Inspection > Request indexing for `/`, `/about`, the 4 service pages and any new page, once each. A Google verification file or `GOOGLE_SITE_VERIFICATION` env var already supported in `layout.tsx`.
- Bing Webmaster Tools: import from Search Console; IndexNow script exists (`scripts/indexnow.mjs`), run it after each deploy that adds pages.

## 8. Content strategy (genuine value only)

Start with 6 to 8 articles, each written or reviewed by someone who does the work, with real examples:
1. What is custom software development, and what does a project cost? (use your real price ranges)
2. How to choose a software development company
3. AI agents for business workflows: what is realistic
4. Google Ads vs Meta Ads for small businesses
5. SEO for small businesses: first 90 days
6. Playwright vs Selenium: what we use and why
7. Case studies: ZiyaKart, Ooty Nigel Travels, Skill Up Now (problem, stack, outcome; owner-confirmed facts only)

Publish about 2 per month, not a batch of 30. Each links up to its service page and across to one related page. Do not publish unreviewed AI-written bulk content.

## 9. Trust and E-E-A-T

Present: Privacy, Terms (marked as drafts, **have them legally reviewed**), security.txt, contact phones and email. Missing: team page with real names and roles, registered address and CIN, testimonials/reviews (only genuine), refund policy for paid courses (needed for Razorpay and for trust), published case studies. None may be fabricated.

## 10. Local SEO

- Not fake city pages. The existing `/locations/tamil-nadu` stands; add **one** `/locations/coimbatore` only if it holds unique local facts (address, projects delivered there, local clients with permission).
- Create/verify **Google Business Profile** only if you have a physical office clients/students can visit or a staffed service area; NAP must match the site exactly (name `MyLoginn Tech Private Limited`, real address, +91 96555 60555).
- Add `LocalBusiness`/`PostalAddress` schema only after the address is public on Contact.

## 11. Backlinks and brand authority (slow, legitimate)

Priority order: (1) own profiles: LinkedIn company page, GitHub org, YouTube, Facebook, X; each links to myloginn.com and uses identical name/description, then add to `sameAs`; (2) Clutch, GoodFirms, DesignRush, Crunchbase, YourStory/Inc42 submissions; (3) Indian directories: Justdial, Sulekha, IndiaMART only if relevant; (4) student/alumni and college partner pages; (5) guest posts and local business news in Coimbatore/Tamil Nadu; (6) open-source repos or tools linking back. Reject bulk packages, PBNs, comment/forum spam.

Brand-search growth: the real driver is people typing "MyLoginn" or "MyLoginn Tech". Put the exact name on certificates, email signatures, social bios, student project credits, WhatsApp/Instagram. A small Google Ads brand campaign (see `brand-serp-plan.md`) protects the sponsored slot meanwhile; it does not affect organic ranking.

## 12. Changes made today (2026-10-14)

| File | Change |
|---|---|
| `src/lib/seo.ts` | `createPageMetadata` accepts `absoluteTitle` to skip the `| MyLoginn` suffix |
| `src/app/page.tsx` | Title `MyLoginn` (absolute) |
| `src/app/about/page.tsx` | Title `About MyLoginn` |
| `src/app/contact/page.tsx` | Title `Contact MyLoginn` |
| `src/app/layout.tsx` | Default/OG/Twitter fallback title `MyLoginn` |
| `src/components/sections/Hero.tsx` | `<h1>MyLoginn</h1>` plus rotating tagline as `<p>` |

`npx tsc --noEmit` passes. Not run: `next build`, visual check of the hero (the new H1 adds one short line above the tagline; please eyeball desktop and mobile), live verification after deploy.

## 13. Technical, Core Web Vitals, mobile checklists

| Item | State |
|---|---|
| HTTPS, HSTS, 404 status, redirects | Verified OK |
| Homepage loads 9 sections via `next/dynamic` | *Unverified* LCP/INP; run Lighthouse + PageSpeed on `/`, `/services`, one course |
| `public/about/hero-illustration-8k.png` (about 12.8 MB, unused in `src`) | **Delete** (P1) |
| Other `*-8k.png` assets | Confirm use; serve via `next/image` (AVIF/WebP) |
| Fonts | 3 Google fonts with `display: swap`; consider dropping to 2 |
| Heavy libraries (three, gsap, pyodide, jspdf) | Keep off public marketing routes; check bundle per route with `next build` output |
| CLS | Hero reserves fixed height; verify after today's H1 change |
| Mobile | Verify nav, forms, tap targets on iPhone and Android; MobileBottomNav exists |
| Alt text | *Unverified*; audit with a crawl |
| Security | `npm audit` flagged a critical advisory in next 16.2.10 (see `security-and-trust.md`); upgrade |

## 14. 30 / 60 / 90 days (from 2026-10-14)

**Days 1 to 30 (foundation, brand)**
- Deploy today's changes; Search Console Domain property; submit sitemap; request indexing of `/`, `/about`, `/contact`, 4 service pages.
- Create LinkedIn, YouTube, GitHub, Facebook; add to `sameAs`; same logo and description everywhere.
- Delete the 12.8 MB image; Lighthouse baseline; fix top 3 LCP issues.
- Publish team, address/CIN (real), refund policy; have legal review privacy/terms.
- Add Service schema to digital-marketing page.

**Days 31 to 60 (authority)**
- Two case studies live; 2 blog posts; Clutch and GoodFirms profiles; ask real clients for reviews.
- Google Business Profile (if eligible); `/locations/coimbatore` only if real content exists.
- Weekly Search Console review begins to inform titles/descriptions (CTR).

**Days 61 to 90 (expansion)**
- 4 more articles; split `app-web-development` into web and mobile pages only if traffic/content justify.
- 5 to 10 quality backlinks (directories, partners, local press).
- Refresh titles and descriptions for pages with impressions but low CTR; internal-link audit.

## 15. Monitoring cadence

Daily (5 min): uptime, Search Console alerts. Weekly: queries, impressions, clicks, CTR, position, newly indexed and excluded pages, brand queries (`myloginn`, `my loginn`, `myloginn tech`). Monthly: full crawl (Screaming Frog free), schema validation, internal links, backlink review, Core Web Vitals, content refresh list. Do not change titles repeatedly; wait about 4 weeks between edits to the same page.

## 16. Competitor framework

For each of 5 to 8 Indian service competitors (see `competitor-analysis.md`): positioning, service-page depth, case-study count, review sites present, backlinks (Ahrefs/Semrush free tiers), SERP features for the same 10 queries, content gaps. Output one sheet; act only on gaps where MyLoginn has real experience.

## 17. Prioritised list

| P | Item |
|---|---|
| **P0** | Homepage title/H1 fixed (done today); deploy and request indexing; Search Console Domain property and sitemap submission |
| **P1** | Real social/profile `sameAs`; delete 8k image; Lighthouse baseline; case studies; address/CIN/team/refund policy; Next.js security upgrade |
| **P2** | Service schema on digital marketing; `/projects` retitle; Coimbatore page (if real); blog start; directories and reviews; sitemap `revalidate` |
| **P3** | `lastmod` on static sitemap entries; two-hop http redirect; split service pages; hreflang (not needed, single language) |

## 18. Realistic milestones

| When | Realistic expectation |
|---|---|
| Weeks 1 to 4 | Homepage and core pages indexed with the new title; site name `MyLoginn` in results; branded query impressions appear in Search Console |
| Months 2 to 3 | `myloginn.com` appears for exact `MyLoginn Tech` / `MyLoginn Tech Private Limited` queries; sitelinks may appear (Google decides) |
| Months 3 to 6 | Rank for exact `myloginn` depends on whether Google stops auto-correcting to `mylogin`, which depends on real search and click volume; possible, not promised |
| Months 6 to 12 | Non-brand service queries (e.g. "AI agent development company India") are highly competitive; expect page-2 to page-1 movement only with case studies, reviews and backlinks |

`mylogin` and `my login` should not be a goal: another product legitimately owns those searches.
