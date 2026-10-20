/** Times every starter-bank reference solution on all of its tests (dev only; needs JUDGE_ALLOW_UNSAFE_LOCAL=1). */
import { localUnsafeExecutor } from "../judge-worker/executors.mjs";
import { STARTER_BANK } from "./cc-starter-bank";

async function main() {
  const ex = localUnsafeExecutor();
  const rows: [string, number][] = [];
  for (const p of STARTER_BANK) {
    const inputs = [...p.samples, ...p.hidden];
    const r = await ex.execute({ id: p.family, kind: "VERIFY", language: "python", source: p.reference, timeLimitMs: 8000, memoryLimitMb: 512, tests: inputs.map((input, i) => ({ id: String(i), input })) });
    rows.push([p.family, Math.max(...r.tests.map((t: { timeMs: number }) => t.timeMs))]);
  }
  rows.sort((a, b) => b[1] - a[1]);
  console.log(rows.slice(0, 12).map(([f, ms]) => `${String(ms).padStart(6)} ms  ${f}`).join("\n"));
}
main();
