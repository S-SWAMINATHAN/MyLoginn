# MyLoginn SEO Audit

Date: 2026-10-12. Method: source-code review of this repository plus live fetches of `https://www.myloginn.com/` and `/sitemap.xml`.

**Limits (stated plainly):** no PageSpeed/CrUX/Lighthouse run, no Search Console or Bing Webmaster data, no live `site:` queries, no HTTP-level checks of www/non-www redirects, 404 status or response headers. Items below marked *Unverified* need those tools.

## What was already good
- `robots.ts`, `sitemap.ts` (dynamic, includes DB courses/internships), canonical via `createPageMetadata`, `metadataBase`, OG/Twitter, per-page `robots` noindex on login/signup/reset/checkout/dashboard.
- Server-rendered Next.js (App Router); live homepage returns real text, H1 and nav in HTML.
- Organization + WebSite JSON-LD on homepage, site-wide BreadcrumbList, FAQPage JSON-LD on two service pages.
- HSTS and upgrade-insecure-requests headers; favicon/apple-icon/icon present; `llms.txt`.
- Sitemap live: 40 URLs (core pages, 3 services, 28 courses, 1 internship).

## What was wrong
| # | Issue | Severity |
|---|---|---|
| 1 | Positioning was local only ("in Coimbatore, Pollachi, Erode", "in Tamil Nadu") in titles/descriptions/schema. Conflicts with national + international goal. | High |
| 2 | Schema `alternateName` included **"MyLogin"**, which is a different, established product (school SSO). Search for "myloginn" returns only MyLogin results. Declaring it as an alias worsens entity confusion. | High |
| 3 | No service pages for AI/AI agents/Gen AI, or testing/automation, though the homepage describes them. Zero indexable pages for those intents. | High |
| 4 | Homepage H1 "AI-Driven IT Solutions for Modern Businesses" and title did not state the entity type or core services consistently. | Medium |
| 5 | `sameAs` has only Instagram. No LinkedIn/GitHub/YouTube/Google Business verified. | Medium |
| 6 | Sitemap static routes have no `lastmod`; only courses carry it. (Fake dates would be worse; left omitted.) | Low |
| 7 | Footer "AI & AI agents" links to `/#ai` (an anchor), not a crawlable page. | Medium |
| 8 | Sitemap omits `/services/astrology/*` subpages and has one internship; confirm whether the subpages should be indexed. | Low |
| 9 | Site-wide Breadcrumb JSON-LD is derived from URL segments; labels for non-page folders can be wrong. *Partially verified.* | Low |
| 10 | Homepage sections are loaded with `next/dynamic` (client chunks); live fetch showed content, but confirm full SSR in "View source". | Medium, *Unverified* |
| 11 | No blog, FAQ hub, case studies, industries or location pages. Projects page exists (ZiyaKart, Ooty Nigel Travels, Skill Up Now live; RentMitra.app coming soon) but no case-study depth. | Medium |
| 12 | Default meta description mentioned "tutoring, internships" in the lead; diluted entity clarity. | Low |

## Not verified here
www vs non-www redirect, trailing-slash behaviour, 404 status code, Core Web Vitals, image weights (several large PNGs in `public/about` including `hero-illustration-8k.png`), alt text coverage, hreflang (none needed: single-language site).

See `implementation-report.md` for what changed.
