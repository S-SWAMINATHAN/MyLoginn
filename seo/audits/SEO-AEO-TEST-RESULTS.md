# SEO and AEO Test Results - 2026-11-06

| Check | Result | Evidence |
|---|---|---|
| Feature branch active | PASS | Branch `seo-aeo-optimization-2026` |
| Git diff check | PASS | `git diff --check` exited successfully |
| Canonical host fixed | PASS | `src/lib/site.ts` now uses `https://www.myloginn.com` |
| Protected files changed | PASS | No auth, database, migration, middleware, environment, secret, or payment files changed |
| TypeScript | FAIL / environment | Local dependencies were unavailable to `npx`; package resolution failed before compilation |
| ESLint | FAIL / environment | Local ESLint package was unavailable |
| npm production audit | FAIL / dependency findings | Vulnerabilities reported; Next.js and Axios were among findings |
| Production build | NOT RUN | Build script includes Prisma database changes and the task prohibits it |
| Database operations | NOT RUN | No database mutation commands executed |
| Production deployment | NOT RUN | Explicit approval required |
