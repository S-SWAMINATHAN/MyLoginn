# MyLoginn LMS upgrade — audit, gaps and design

Status: Phases 1-3 (inspect, document, design). Written before any LMS code.

## 1. What exists today (verified in the repo)

| Area | Current behaviour | Where |
|---|---|---|
| Stack | Next.js 16.2 App Router, React 19, Prisma 6 + PostgreSQL, Tailwind 4, JWT cookie auth (`myloginn_session`), Razorpay, Gemini / MyBuddy chat | `package.json`, `src/lib/auth.ts` |
| Course row | One flat `Course` table: `price` (whole rupees, `0` = free), `level`, `category`, `syllabus` (JSON string array), no status/validity/expiry | `prisma/schema.prisma` |
| "Free" test | `course.price === 0` is used everywhere as the free flag (learn pages, enroll, certificate, progress, dashboard) | grep `price !== 0` |
| Free-course content | **Code-driven, not DB-driven**: module/topic lists in `lib/freeCourseCurriculum.ts`, lesson text/quiz/challenge generated in `lib/freeCourseTutorial.ts`, authored challenges in `lib/challenge-data/*` and `lib/extra-courses/*` (25 free courses) | `src/lib/` |
| Lesson video | Not a file: a narrated, animated explainer generated from lesson data (`LessonVideo`, `/api/tts`) | `components/courses/LessonVideo.tsx` |
| Code challenges | Run **in the browser** (Pyodide for Python, sql.js for SQL, iframe previews for HTML/CSS). Server re-checks submitted output and derived requirement checks. No server-side sandbox, so no truly hidden tests | `CodeIDE.tsx`, `challengeChecks.ts`, `topics/[topic]/progress/route.ts` |
| Quizzes | Client-side only (answers ship to the browser); not recorded, not scored server-side | `LessonQuiz.tsx` |
| Progress | `CourseTopicProgress` (`challengePassed`), `Enrollment.progress` 0-100 | schema |
| Unlocking | Sequential, computed inline in the learn page | `learn/[topic]/page.tsx` |
| Certificate | Generated on demand by POST `/api/courses/[slug]/certificate` for free courses only; **no certificate record** is stored | `certificate/route.ts`, `createCourseCertificatePdf.ts` |
| Points / streak | `User.points`, `PointsTransaction` (append-only, **no idempotency key**), `DailyActivity`, streak in Asia/Kolkata, milestones hard-coded in `lib/streak.ts` | `lib/streak.ts` |
| Payments | Razorpay **one-time orders**. `create-order` -> checkout.js -> `verify` (HMAC signature) -> `Payment.status=paid` + `Enrollment` upsert. `Payment.status` values used: `created`, `paid`, `failed` | `api/payments/*` |
| Paid-course learning | **Does not exist.** Learn routes 404 for `price !== 0`; paid courses are a syllabus list + checkout only | `learn/*` |
| Admin | `/admin/*` screens driven by `EntityManager` + `entityConfigs`; `requireAdmin()` guard; course CRUD is flat fields only | `components/admin`, `api/admin/courses` |
| Seeded paid courses | `prisma/seed.ts` upserts 10 paid courses (prices 9,999-21,999). The product owner states **2** paid courses exist in production, so the live DB is the source of truth and must be treated as unknown here | `prisma/seed.ts` |
| Tests | None. No test runner configured | - |

## 2. Gaps against the requirements

1. No module / lesson / quiz / assessment / project tables - content cannot be added without code changes.
2. No access-entitlement concept: no validity, expiry, renewal, refunds, pending/cancelled states, webhook.
3. No server-verified quiz or final assessment, so no "60% to unlock the certificate" rule can be enforced today.
4. Certificates are not records (no serial, no verification, no eligibility gate beyond topic count).
5. Points have no dedupe key (a repeated request could double-award in a race); reward values are hard-coded.
6. No badges, no admin audit log, no AI-coach usage accounting, no learning paths, no course status (draft/published/archived).
7. No tests.

## 3. Design

### 3.1 Principle: additive, two engines side by side

* Legacy courses (the 25 code-driven free ones and every existing paid course) keep working **unchanged**.
* New DB-driven courses are flagged `Course.engine = "lms"` (default `"legacy"`). Only `lms` courses use the new tables and routes. A legacy course can be migrated later by an admin importing content for it and flipping the flag; nothing is migrated automatically.
* All schema changes are additive: new tables, plus new columns that are nullable or have defaults. No column is dropped or retyped. `Payment`, `Enrollment`, `CourseTopicProgress`, `PointsTransaction` rows are never rewritten.
* New `Course.status` defaults to `"published"` so every existing course stays visible exactly as now.

### 3.2 Data model (new)

`CourseModule`, `Lesson`, `LessonPrerequisite`, `Quiz`, `QuizQuestion`, `QuizAttempt`, `CodingChallenge`, `ChallengeSubmission`, `CourseAssignment`, `AssignmentSubmission`, `LessonProgress`, `CourseEntitlement`, `Certificate`, `Badge`, `UserBadge`, `LearningPath`, `LearningPathCourse`, `AiCoachUsage`, `AuditLog`, `LmsSetting` (key/value JSON for reward values, AI limits).
Additions to `Course` (all default/nullable): `engine`, `status`, `track`, `accessPolicy`, `validityDays`, `renewalPrice`, `passPercent` (default 60), `aiCoachEnabled`, `audience`, `prerequisitesText`, `objectives` (JSON), `languageTag`, `sequential`, `archivedAt`.
Additions to `Payment`: `kind` (`purchase`/`renewal`), `validityDays`, `failureReason`, `refundedAt`, `verifiedAt`.
Addition to `PointsTransaction`: nullable unique `dedupeKey`.
Payment history stays in `Payment`; access lives in `CourseEntitlement`; learner progress in `LessonProgress`. A course edit never touches those rows (lessons are soft-archived, never hard-deleted once progress exists).

### 3.3 Access rules (pure function `lib/lms/access.ts`)

1. Course must be `published` (admins may preview drafts).
2. Free course (`accessPolicy="free"`): enrolment is enough.
3. Paid course: needs a `CourseEntitlement` with `status="active"` and `expiresAt` null or in the future. Granted only by a server-verified payment (signature **and** a Razorpay API fetch confirming status/amount) or by webhook `payment.captured`, or by an admin grant (audited).
4. Expired -> content locked, progress/certificates kept, reason "Renew your course access".
5. Refunded -> entitlement `revoked`; progress kept.
6. Legacy paid purchases (paid `Payment` row, no entitlement row) are treated as **lifetime** (the current policy has no expiry) and an entitlement is back-filled lazily with `expiresAt = null`. No existing buyer is ever expired retroactively.
7. Razorpay Orders are one-time. There is no auto-debit; "renewal" is a manual re-purchase that extends `expiresAt` from `max(now, current expiry)`. The UI says so.

### 3.4 Progression (pure `lib/lms/progression.ts`)

Lesson state: `locked | available | in_progress | completed`. Default sequential within and across modules. Optional lessons are skipped by the gate. Per-lesson completion rules (admin-chosen): read, video >= threshold, quiz passed (min score), code challenge passed, assignment approved. `LessonPrerequisite` rows add explicit extra prerequisites and `Course.sequential=false` switches to prerequisite-only. Module unlocks when the previous required module is complete. Final assessment unlocks when every required lesson is complete. **Certificate unlocks only when the final assessment score >= `Course.passPercent` (default 60%)** and the other configured requirements hold.

### 3.5 Final assessment and certificate

Final = a `Quiz` with `kind="final"`. Grading is server-side only; correct answers and explanations are never sent before submission. Attempts are limited and have a cooldown (configurable). Pass mark: `score% >= passPercent`, integer percent computed from points, no rounding up. Certificate rows are written by the server inside a transaction guarded by a unique `(userId, courseId)`, so it can't be issued twice, and the PDF route refuses to render unless the row exists.

### 3.6 Points

`awardOnce(userId, dedupeKey, amount, ...)` inserts the ledger row first (unique `dedupeKey`), then increments the cached balance, in one transaction. Duplicate requests hit the unique key and award nothing. Reward values come from `LmsSetting` with documented defaults (lesson 10, quiz 15, challenge 20, module 50, course 100).

### 3.7 AI Coach

Server-only route using the existing Gemini client (`GEMINI_API_KEY` stays server-side). Per-user daily and per-minute limits (configurable). Context is built from the lesson row in the DB, so it follows the approved syllabus; it receives no payment, marks or certificate data and is told not to claim any. Final-assessment content is never supplied to it. On any provider error the route returns a clean 503 and the lesson UI keeps working.

### 3.8 Code challenges - honest limitation

Per the product decision ("same as previous courses"), challenges run in the learner's browser (Pyodide / sql.js / preview) as today, and the server re-validates using output + requirement checks. **Hidden tests that cannot be inspected by the learner require a server-side sandbox (Judge0/Piston), which is not part of this change.** The runner is behind a small interface so a sandbox can be plugged in later; until then, "hidden test cases" are not claimed. Test cases stored for a challenge are split into `visible` and `hidden`; the API never returns `hidden` rows to the client.

### 3.9 Videos

Per the product decision, lessons use the existing generated, narrated explainer; an admin may additionally set `videoUrl` (YouTube/Vimeo/hosted). For a URL video, completion requires reported playback >= `videoMinPercent` (default 90) - reported by the player and capped server-side by elapsed wall-clock time so a single request can't mark it complete.

### 3.10 Migration plan

1. Take a database backup (Prisma Postgres snapshot or `pg_dump`) before deploy.
2. `npm run build` already runs `prisma db push --skip-generate`. The change set is additive, so `db push` applies it without data loss. **Run `prisma db push --dry-run`-equivalent first** (`prisma migrate diff --from-url ... --to-schema-datamodel prisma/schema.prisma --script`) and confirm it contains only `CREATE TABLE` / `ADD COLUMN` / `CREATE INDEX`.
3. Deploy. Existing courses are unaffected (`engine="legacy"`, `status="published"`).
4. Optional: `npm run lms:seed` loads authored course content; `npm run lms:import` imports an admin-exported JSON file.
5. Rollback = redeploy previous build; the new tables/columns are simply unused.
