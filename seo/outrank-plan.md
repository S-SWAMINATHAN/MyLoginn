# Plan to out-compete similar and competing names

Ranking higher is never guaranteed. These are the levers, split by who can pull them.

## Done in code
- Distinct entity: Organization schema now has `disambiguatingDescription` (not MyLogin), a service catalog linking all service pages, accurate aliases only.
- Course schema on every course page (name, description, provider, online mode, real price/currency from DB; **no rating/review fields**).
- Four service pages' worth of intent coverage (web/mobile/software, AI, testing, marketing) with Service + FAQ schema; competitor-style depth (RAG, multi-agent, CRM/ERP, NDA/IP).
- Homepage H1 first phrase aligned to the title ("AI, Web & Mobile Solutions for Modern Businesses").
- Trust: privacy/terms, security headers, security.txt.

## Needs you (biggest remaining gaps vs competitors)
1. Clutch, GoodFirms, DesignRush profiles with real client reviews (competitors' main authority source).
2. LinkedIn, YouTube, GitHub, Google Business Profile, Facebook page URL; then add to `sameAs`.
3. Real case studies (ZiyaKart, Ooty Nigel Travels, Skill Up Now): problem, stack, outcome, with owner-confirmed facts only.
4. Own pricing ranges for cost guides (competitors win cost queries).
5. Customers/students searching and clicking "MyLoginn Tech" and the full company name: this is what makes Google stop auto-correcting to "MyLogin".
6. Verify course `rating` (default 4.8) and `studentsCount` values in the database are real before showing them anywhere; fabricated ratings violate Google's rules.
7. Delete unused `public/about/hero-illustration-8k.png` (12.8 MB, not referenced in `src`).
