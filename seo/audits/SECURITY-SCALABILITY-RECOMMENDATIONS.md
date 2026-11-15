# Security and Scalability Recommendations - 2026-11-06

## Read-only security findings

| Severity | Area | Finding | Recommended safe action |
|---|---|---|---|
| CRITICAL | Dependency | `package.json` declares Next.js 16.2.10 and npm audit findings identify advisories affecting the resolved release range. | Obtain approval to upgrade Next.js and regenerate lockfiles; no direct modification performed under the read-only request. |
| HIGH | Third-party script | `src/components/layout/AiAgentWidget.tsx` loads Puter.js remotely without integrity verification. | Obtain approval to vendor/pin an reviewed immutable script or replace it with a trusted integration and CSP coverage. |
| HIGH | Dependency | Production audit reported additional vulnerable transitive packages, including Axios in the installed dependency graph. | Review the complete audit after dependencies are restored; upgrade only with approval. |

## Public configuration observations

- Canonical host configuration is fixed in `src/lib/site.ts`.
- Secrets and environment files were not inspected or modified.
- Protected auth, middleware, payment, database schema, migrations, and security configuration were not modified.

## Scalability recommendations

- Keep the sitemap resilient when the database is unavailable.
- Restrict sitemap database queries to published public records.
- Consider caching the static sitemap component and monitoring dynamic database query latency.
- Keep public sitemap route counts under control to avoid oversized sitemap files.
- Review root-layout authenticated-user lookup cost only through an approved performance workstream; preserve its protected behavior.
- Split large public JavaScript bundles only where verified as safe and measurable.
