/**
 * Generates expected outputs for LogiQuest coding problems by running each Python reference solution.
 *   npm run lq:coding          regenerate src/lib/logiquest/coding/tests.generated.json
 *   npm run lq:coding -- --check   fail if the JSON is out of date (CI)
 * Expected outputs therefore always come from a working solution.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_PROBLEMS } from "../src/lib/logiquest/coding/problems";
import type { IoTest } from "../src/lib/logiquest/coding/types";

const OUT = join(process.cwd(), "src", "lib", "logiquest", "coding", "tests.generated.json");
const norm = (s: string) => s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");

const result: Record<string, IoTest[]> = {};
const problems: string[] = [];
const slugs = new Set<string>();
const io = ALL_PROBLEMS.flatMap((p) => (p.kind === "io" ? [p] : []));
for (const p of ALL_PROBLEMS) {
  if (slugs.has(p.slug)) problems.push(`duplicate slug ${p.slug}`);
  slugs.add(p.slug);
  if (p.kind !== "io") continue;
  if (p.inputs.length < 3) problems.push(`${p.slug}: needs at least 3 test inputs`);
  if (new Set(p.inputs).size !== p.inputs.length) problems.push(`${p.slug}: duplicate test inputs`);
  if (p.hints.length < 2) problems.push(`${p.slug}: needs at least 2 hints`);
}
// One Python process runs every reference solution (scripts/lq_coding_run.py), which is much faster than one per test.
const run = spawnSync(process.env.PYTHON ?? "python", ["-I", join(__dirname, "lq_coding_run.py")], {
  input: JSON.stringify(io.map((p) => ({ slug: p.slug, ref: p.ref, inputs: p.inputs }))), encoding: "utf8", maxBuffer: 1 << 28,
});
if (run.status !== 0) { console.error(run.stderr || String(run.error)); process.exit(1); }
const outputs = JSON.parse(run.stdout) as Record<string, ({ output: string } | { error: string })[]>;
for (const p of io) {
  result[p.slug] = p.inputs.map((input, i) => {
    const r = outputs[p.slug][i];
    if ("error" in r) { problems.push(`${p.slug}: reference failed on input ${JSON.stringify(input.slice(0, 40))}: ${r.error}`); return { input, output: "" }; }
    const output = norm(r.output);
    if (!output) problems.push(`${p.slug}: reference printed nothing for input ${JSON.stringify(input.slice(0, 40))}`);
    return { input, output };
  });
}
// SQL reference queries must run and return rows on their dataset.
void (async () => {
{
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const initSqlJs = require("sql.js") as (o?: object) => Promise<{ Database: new () => { run(s: string): void; exec(s: string): { values: unknown[][] }[]; close(): void } }>;
  const SQL = await initSqlJs();
  for (const p of ALL_PROBLEMS) {
    if (p.kind !== "sql") continue;
    if (p.hints.length < 1) problems.push(`${p.slug}: needs a hint`);
    try {
      const db = new SQL.Database();
      db.run(p.schema);
      const res = db.exec(p.ref);
      if (!res.length || !res[res.length - 1].values.length) problems.push(`${p.slug}: reference query returned no rows`);
      db.close();
    } catch (e) { problems.push(`${p.slug}: reference query failed: ${(e as Error).message}`); }
  }
}
if (problems.length) {
  console.error(`${problems.length} problem(s):\n - ${problems.join("\n - ")}`);
  process.exit(1);
}
const json = `${JSON.stringify(result, null, 1)}\n`;
if (process.argv.includes("--check")) {
  const current = readFileSync(OUT, "utf8");
  if (current !== json) { console.error("tests.generated.json is out of date: run npm run lq:coding"); process.exit(1); }
  console.log("Coding tests are up to date.");
} else {
  writeFileSync(OUT, json);
  console.log(`Wrote expected outputs for ${Object.keys(result).length} problems (${Object.values(result).reduce((a, t) => a + t.length, 0)} tests).`);
}
})();
