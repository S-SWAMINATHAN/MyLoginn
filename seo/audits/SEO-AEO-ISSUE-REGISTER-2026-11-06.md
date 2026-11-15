# SEO and AEO Issue Register - 2026-11-06

| ID | Severity | Area | Finding | Status |
|---|---|---|---|---|
| SEO-001 | Medium | Canonicalization | Canonical host could be changed by an environment variable. | Fixed |
| SEO-002 | Medium | Sitemap eligibility | Internship records should be reviewed against publicly available statuses; draft records are excluded. | Documented / implementation pending |
| SEO-003 | Medium | Route inventory | Private routes require explicit route-level noindex coverage. | Audit complete |
| SEO-004 | Medium | Analytics | GA4/GTM integration could not be claimed without verified IDs. | Blocked by external account |
| SEO-005 | Low | External trust | LinkedIn and YouTube URLs are placeholders and intentionally excluded from Organization `sameAs`. | Manual update required |
| SEO-006 | Low | Local data | A precise street address is not verified in project data, so LocalBusiness address markup should not be invented. | Documented |
| AEO-001 | Medium | Entity consistency | Organization descriptions and brand aliases are present but should stay synchronized with visible copy. | In progress |
| AEO-002 | Medium | FAQ markup | FAQ schema should be emitted only for genuine visible FAQ sections. | Review required |
| PERF-001 | Medium | Public rendering | Shared root layout performs authenticated-user lookup. | Protected behavior preserved |
| SEC-001 | High | Deployment | Read-only dependency review and advisories require explicit review. | Pending phase 9 |
