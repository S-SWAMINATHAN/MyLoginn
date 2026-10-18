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
for (const p of ALL_PROBLEMS) {
  if (slugs.has(p.slug)) problems.push(`duplicate slug ${p.slug}`);
  slugs.add(p.slug);
  if (p.kind !== "io") continue;
  if (p.inputs.length < 3) problems.push(`${p.slug}: needs at least 3 test inputs`);
  if (p.hints.length < 2) problems.push(`${p.slug}: needs at least 2 hints`);
  result[p.slug] = p.inputs.map((input) => {
    const r = spawnSync(process.env.PYTHON ?? "python", ["-I", "-c", p.ref], { input: `${input}\n`, encoding: "utf8", timeout: 30000, maxBuffer: 1 << 26 });
    if (r.status !== 0) problems.push(`${p.slug}: reference failed on input ${JSON.stringify(input.slice(0, 40))}: ${(r.stderr || String(r.error)).trim().split("\n").pop()}`);
    const output = norm(r.stdout ?? "");
    if (!output) problems.push(`${p.slug}: reference printed nothing for input ${JSON.stringify(input.slice(0, 40))}`);
    return { input, output };
  });
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
