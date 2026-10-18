/**
 * Precomputes question counts per subject/topic into src/lib/logiquest/content/counts.generated.json.
 * Counting otherwise means importing and finalizing every subject's generators (~1 s of CPU on a cold server),
 * which the LogiQuest home, subject and progress pages paid on every new instance.
 *   npm run lq:totals            regenerate
 *   npm run lq:totals -- --check exit 1 when the file is stale (run by lq:validate)
 * The build regenerates it, so a stale file can never reach production.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SUBJECTS } from "../src/lib/logiquest/catalog";
import { LOADERS } from "../src/lib/logiquest/content";
import { finalizeSubject } from "../src/lib/logiquest/content/build";

const OUT = join(process.cwd(), "src", "lib", "logiquest", "content", "counts.generated.json");

export async function computeCounts() {
  const counts: Record<string, Record<string, number>> = {};
  for (const s of SUBJECTS) {
    const loader = LOADERS[s.slug];
    if (!loader) continue;
    const content = finalizeSubject(s.slug, (await loader()).default);
    counts[s.slug] = Object.fromEntries(Object.entries(content).map(([slug, t]) => [slug, t.exercises.reduce((n, e) => n + e.questions.length, 0)]));
  }
  return `${JSON.stringify(counts, null, 1)}\n`;
}

async function main() {
  const next = await computeCounts();
  if (process.argv.includes("--check")) {
    let current = "";
    try { current = readFileSync(OUT, "utf8"); } catch { /* missing counts as stale */ }
    if (current.replace(/\r\n/g, "\n") !== next) {
      console.error("counts.generated.json is stale: run npm run lq:totals");
      process.exit(1);
    }
    console.log("Question counts are up to date.");
    return;
  }
  writeFileSync(OUT, next);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
