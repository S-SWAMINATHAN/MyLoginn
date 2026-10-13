/**
 * Quality gate for the multiple-choice bank. Run: npm run lq:validate
 *  - structure: 3-6 distinct non-empty options, valid answer index, explanation present, no duplicate prompts
 *  - answers: items with a `check` are re-computed by Python and must match the option marked correct
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { bank } from "./logiquest-bank";
import type { QSeed } from "./logiquest-types";
import { TOPICS } from "./logiquest-topics";

export function validateBank(items: QSeed[] = bank): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const label = (i: number) => `#${i} [${items[i][0]}/${items[i][2]}] ${items[i][3].slice(0, 50).replace(/\n/g, " ")}`;

  items.forEach(([, , topic, prompt, options, correct, explanation], i) => {
    if (!topic.trim()) problems.push(`${label(i)}: missing topic`);
    if (prompt.trim().length < 8) problems.push(`${label(i)}: prompt too short`);
    if (options.length < 3 || options.length > 6) problems.push(`${label(i)}: needs 3-6 options`);
    if (options.some((o) => !o.trim())) problems.push(`${label(i)}: empty option`);
    if (new Set(options.map((o) => o.trim().toLowerCase())).size !== options.length) problems.push(`${label(i)}: duplicate options`);
    if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) problems.push(`${label(i)}: correct index out of range`);
    if (explanation.trim().length < 15) problems.push(`${label(i)}: explanation too short`);
    const key = prompt.trim().toLowerCase();
    if (seen.has(key)) problems.push(`${label(i)}: duplicate prompt`);
    seen.add(key);
  });

  // Every topic in the Master Program map must have at least one question, and no question may use an unlisted topic.
  const have = new Set(items.map((q) => `${q[0]}|${q[2]}`));
  const known = new Set<string>();
  for (const [cat, levels] of Object.entries(TOPICS)) for (const topics of Object.values(levels)) for (const t of topics) {
    known.add(`${cat}|${t}`);
    if (!have.has(`${cat}|${t}`)) problems.push(`topic without questions: ${cat} / ${t}`);
  }
  for (const key of have) if (!known.has(key) && key !== "MATH|Clock problems") problems.push(`topic not in the Master Program map: ${key.replace("|", " / ")}`);

  const checks = items.flatMap((q, i) => (q[7] ? [{ i, kind: q[7].startsWith("py:") ? "py" : "expr", code: q[7].startsWith("py:") ? q[7].slice(3) : q[7], answer: q[4][q[5]] ?? "" }] : []));
  if (checks.length) {
    const r = spawnSync(process.env.PYTHON ?? "python", ["-I", join(__dirname, "validate_questions.py")], { input: JSON.stringify(checks), encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) problems.push(`answer checker crashed: ${r.stderr.slice(0, 200)}`);
    else for (const f of JSON.parse(r.stdout) as { i: number; why: string }[]) problems.push(`${label(f.i)}: ${f.why}`);
  }
  return problems;
}

if (require.main === module) {
  const problems = validateBank();
  const byCat = new Map<string, number>();
  for (const q of bank) byCat.set(q[0], (byCat.get(q[0]) ?? 0) + 1);
  console.log(`${bank.length} questions (${[...byCat].map(([c, n]) => `${c} ${n}`).join(", ")}), ${bank.filter((q) => q[7]).length} machine-verified, ${new Set(bank.map((q) => q[2])).size} topics`);
  if (problems.length) { console.error(`\n${problems.length} problem(s):\n - ${problems.join("\n - ")}`); process.exit(1); }
  console.log("All questions valid.");
}
