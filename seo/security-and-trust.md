# Security and Trust

**Cannot be claimed:** "certified", "verified", "virus-free" or "100% secure" badges. Do not display ISO/SSL-seal/Norton-style badges unless MyLoginn holds them. Real trust signals below.

## Done in code
- Response headers (`next.config.ts`): HSTS, `upgrade-insecure-requests`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` (camera self only, for avatar upload), COOP; `X-Powered-By` removed.
- `/.well-known/security.txt` (contact: contact@myloginn.com; expires 2027-10-12, renew yearly).
- `/privacy` and `/terms` pages (drafts; **need lawyer review**), linked in footer and sitemap.
- Not added: strict `script-src` CSP (needs nonce rollout; would break Next.js inline scripts / Razorpay).

## Found, not fixed — needs your decision
`npm audit --omit=dev`: 11 vulnerabilities (1 critical, 8 high). Critical/high are in **next 16.2.10** (fix: 16.4.0, minor) and its `sharp`/`postcss`; **prisma** (6.12.0 per audit, flagged as major) and transitive axios, nanoid, qs, source-map-js. Not upgraded here because the build was not run. Do: `npm install next@16.4.0 eslint-config-next@16.4.0`, run `next build`, test login/checkout, then `npm audit` again. Review prisma separately.

## Process (owner)
- Keep dependencies patched (Dependabot/`npm audit` in CI); rotate API keys; admin accounts with strong passwords/2FA; Vercel/host WAF; backups.
- Run an external scan (Google Safe Browsing status in Search Console "Security issues", Mozilla Observatory, SSL Labs). Real, citeable trust: Safe Browsing clean, A-grade headers, privacy policy, legal entity details, real reviews.
- "Verified" in the SEO sense = verified Search Console + Bing Webmaster property and Google Business Profile.
