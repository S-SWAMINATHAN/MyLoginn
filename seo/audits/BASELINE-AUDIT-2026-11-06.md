# SEO and AEO Baseline Audit - 2026-11-06

## Scope

Audited the Next.js App Router public routes, SEO helpers, metadata, sitemap, robots rules, structured data, public assets, keyword map, and SEO documentation in the repository.

## Repository baseline

- Framework: Next.js 16 App Router, React 19, TypeScript.
- Canonical production domain: https://www.myloginn.com
- Existing shared SEO implementation: `src/lib/seo.ts`
- Existing schema implementation: `src/lib/structuredData.ts`
- Existing sitemap and robots implementations: `src/app/sitemap.ts`, `src/app/robots.ts`
- Existing keyword maps and technical SEO documentation are present under `seo/`.

## Confirmed strengths

- Public marketing and service routes use a shared metadata helper with canonical, social, and robots support.
- Organization and WebSite structured data is implemented on the homepage.
- Service schema support is available and used on service pages.
- Public sitemap includes static marketing routes, approved database courses, internships, projects, and legitimate learning routes.
- Draft courses are excluded from the public sitemap.
- Robots rules leave indexable account routes crawlable so noindex directives can be observed.
- Reduced-motion support and a metadata/social image implementation exist.

## Confirmed defects and risks

1. Medium: `NEXT_PUBLIC_SITE_URL` could override the required production canonical domain, creating different canonical, sitemap, and robots hosts across deployments.
2. Medium: sitemap internships include every status except `draft`, rather than proving that only `open` and other currently available public records are eligible.
3. Medium: no dedicated route-level noindex inventory was initially documented.
4. Low: analytics provider integration is not currently implemented in visible application source.
5. Low: production account consent, GA4, Google Tag Manager, Search Console, and Bing Webmaster identifiers require external account evidence and are not safely inventable.

## Implemented baseline fix

- Canonical site URL is now a fixed production value; preview and deployment hostnames cannot replace it.

## External verification required

- Production HTTP status, canonical headers, sitemap delivery, robots delivery, and rendered metadata require deployment or local server verification.
- Lighthouse/PageSpeed results require external network and browser tooling.
- Search Console, GA4, Google Business Profile, Bing Places, and consent requirements require account access.
