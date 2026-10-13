/**
 * Imports authored course content (content/courses/*.ts) into the database. Idempotent: re-running
 * updates courses in place and never deletes learner data.
 *
 *   npm run lms:seed                 validate + import as DRAFT (safe default)
 *   npm run lms:seed -- --publish    publish every course that passes all publish rules
 *   npm run lms:seed -- --only=slug  import a single course
 *   npm run lms:seed -- --dry-run    validate only, no database writes
 *   --yes                            required when DATABASE_URL is not a local database
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseCourseContent, publishProblems } from "../src/lib/lms/content";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];

async function main() {
  const dir = path.join(process.cwd(), "content", "courses");
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.startsWith("_") && f !== "index.ts").sort();

  // Expansions (content/expansions/<slug>.ts) append extra modules and final-assessment questions to a base course,
  // so a course can grow to a full syllabus without editing the original file.
  const expDir = path.join(process.cwd(), "content", "expansions");
  const expFiles = existsSync(expDir) ? readdirSync(expDir).filter((f) => f.endsWith(".ts") && !f.startsWith("_")) : [];
  const expansions = new Map<string, { modules?: unknown[]; finalQuestions?: unknown[]; finalDraw?: number; weeks?: number; objectives?: string[] }>();
  for (const f of expFiles) {
    const m = (await import(pathToFileURL(path.join(expDir, f)).href)) as { default: { slug: string } & Record<string, never> };
    expansions.set(m.default.slug, m.default as never);
  }

  const courses: { file: string; data: ReturnType<typeof parseCourseContent> }[] = [];
  for (const file of files) {
    const mod = (await import(pathToFileURL(path.join(dir, file)).href)) as { default: Record<string, unknown> };
    const base = mod.default as { slug: string; modules: unknown[]; finalAssessment?: { questions: unknown[]; questionCount?: number }; durationWeeks?: number; objectives?: string[] };
    const exp = expansions.get(base.slug);
    if (exp) {
      base.modules = [...base.modules, ...(exp.modules ?? [])];
      if (base.finalAssessment) {
        base.finalAssessment.questions = [...base.finalAssessment.questions, ...(exp.finalQuestions ?? [])];
        if (exp.finalDraw) base.finalAssessment.questionCount = exp.finalDraw;
      }
      if (exp.weeks) base.durationWeeks = exp.weeks;
      if (exp.objectives) base.objectives = [...(base.objectives ?? []), ...exp.objectives];
    }
    courses.push({ file, data: parseCourseContent(base) });
  }

  let failed = 0;
  for (const c of courses) {
    if (!c.data.ok) { failed += 1; console.error(`✖ ${c.file}: invalid\n   ${c.data.errors.join("\n   ")}`); }
  }
  if (failed) { console.error(`\n${failed} file(s) failed schema validation. Nothing imported.`); process.exit(1); }

  const selected = courses.filter((c) => c.data.ok && (!only || c.data.data.slug === only));
  if (flag("dry-run")) {
    for (const c of selected) {
      if (!c.data.ok) continue;
      const problems = publishProblems(c.data.data);
      console.log(`${problems.length ? "•" : "✔"} ${c.data.data.slug}: ${c.data.data.modules.flatMap((m) => m.lessons).length} lessons, ${problems.length ? `${problems.length} publish problem(s)` : "ready to publish"}`);
      problems.slice(0, 10).forEach((p) => console.log(`    - ${p}`));
    }
    return;
  }

  const url = process.env.DATABASE_URL ?? "";
  const host = (() => { try { return new URL(url).host; } catch { return "(unparseable)"; } })();
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  console.log(`Database host: ${host}`);
  if (!isLocal && !flag("yes")) {
    console.error("This is not a local database. Take a backup first, then re-run with --yes to confirm.");
    process.exit(1);
  }

  const { importCourse } = await import("../src/lib/lms/importer");
  const { ensureDefaultBadges } = await import("../src/lib/lms/badges");
  const { prisma } = await import("../src/lib/prisma");
  await ensureDefaultBadges();
  for (const c of selected) {
    if (!c.data.ok) continue;
    const r = await importCourse(c.data.data, { publish: flag("publish") });
    console.log(`${r.status === "published" ? "✔" : "•"} ${r.slug}: ${r.status}, ${r.lessons} lessons, ${r.questions} questions${r.created ? " (new)" : " (updated)"}`);
    if (flag("publish") && r.status !== "published") r.problems.slice(0, 8).forEach((p) => console.log(`    - ${p}`));
  }
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exit(1); });
