/**
 * Quality gate for LogiQuest content. Run: npm run lq:validate [subject ...]
 *  - every catalog topic has content, and content has no unknown topics
 *  - structure: 2-6 distinct options, valid answer, explanation present, no duplicate prompts in a topic
 *  - answers with a `check` are recomputed: Python expression / Python program output / Java, C and C++ program output
 *    (C and C++ need a Python with the `ziglang` package: LQ_ZIG_PYTHON, or node_modules/.cache/lq-tools/venv; otherwise skipped)
 * Exit code 1 when anything fails. Topics with fewer than MIN questions are listed as warnings.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SUBJECTS } from "../src/lib/logiquest/catalog";
import { LOADERS } from "../src/lib/logiquest/content";
import { finalizeSubject } from "../src/lib/logiquest/content/build";
import type { Question } from "../src/lib/logiquest/types";

const MIN = 5;
/** Scratch space for compiled checks: on the project drive, inside node_modules (git-ignored). */
const WORK = join(process.cwd(), "node_modules", ".cache", "lq-tools");
const LOCAL_ZIG = join(WORK, "venv", "Scripts", "python.exe");

async function main() {
  const only = process.argv.slice(2);
  const problems: string[] = [];
  const warnings: string[] = [];
  const all: Question[] = [];
  const perSubject: string[] = [];

  for (const s of SUBJECTS) {
    if (only.length && !only.includes(s.slug)) continue;
    if (!LOADERS[s.slug]) { problems.push(`${s.slug}: no content loader`); continue; }
    const content = finalizeSubject(s.slug, (await LOADERS[s.slug]()).default);
    let count = 0;
    for (const t of s.topics) {
      const tc = content[t.slug];
      const n = tc?.exercises.reduce((a, e) => a + e.questions.length, 0) ?? 0;
      count += n;
      if (!tc) warnings.push(`${s.slug}/${t.slug}: no content`);
      else if (n < MIN) warnings.push(`${s.slug}/${t.slug}: only ${n} question(s)`);
      if (tc && s.kind === "mcq" && !tc.intro && !tc.formulas?.length) warnings.push(`${s.slug}/${t.slug}: no explanation`);
    }
    for (const slug of Object.keys(content)) if (!s.topics.some((t) => t.slug === slug)) problems.push(`${s.slug}: content for unknown topic "${slug}"`);
    perSubject.push(`${s.title.padEnd(34)} ${String(count).padStart(5)}`);

    for (const [topic, tc] of Object.entries(content)) {
      const prompts = new Set<string>();
      for (const e of tc.exercises) for (const q of e.questions) {
        const where = `${q.id} "${q.q.slice(0, 60).replace(/\n/g, " ")}"`;
        all.push(q);
        const key = `${q.passage ?? ""}|${q.media ? JSON.stringify(q.media) : ""}|${q.q.trim().toLowerCase()}|${[...q.o].sort().join("|").toLowerCase()}`;
        if (prompts.has(key)) problems.push(`${where}: duplicate prompt in ${s.slug}/${topic}`);
        prompts.add(key);
        if (q.q.trim().length < 3) problems.push(`${where}: prompt too short`);
        if (q.kind === "qa") {
          if (!q.ans?.trim()) problems.push(`${where}: missing model answer`);
          continue;
        }
        const figs = q.media?.type === "figs" ? q.media.options : undefined;
        if (figs && figs.length !== q.o.length) problems.push(`${where}: ${figs.length} figure options but ${q.o.length} option labels`);
        if (q.o.length < 2 || q.o.length > 6) problems.push(`${where}: needs 2-6 options`);
        if (q.o.some((o) => !o.trim())) problems.push(`${where}: empty option`);
        if (!figs && new Set(q.o.map((o) => o.trim())).size !== q.o.length) problems.push(`${where}: duplicate options`);
        if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.o.length) problems.push(`${where}: answer index out of range`);
        if (q.e.trim().length < 10) problems.push(`${where}: explanation missing or too short`);
      }
    }
  }

  // Machine checks
  const py: { i: number; kind: string; code: string; answer: string }[] = [];
  const java: { i: number; code: string; answer: string }[] = [];
  const native: { i: number; lang: "c" | "cpp"; code: string; answer: string }[] = [];
  all.forEach((q, i) => {
    if (!q.check) return;
    const answer = q.o[q.a] ?? "";
    if (q.check.startsWith("java:")) java.push({ i, code: q.check.slice(5), answer });
    else if (q.check.startsWith("c:")) native.push({ i, lang: "c", code: q.check.slice(2), answer });
    else if (q.check.startsWith("cpp:")) native.push({ i, lang: "cpp", code: q.check.slice(4), answer });
    else if (q.check.startsWith("py:")) py.push({ i, kind: "py", code: q.check.slice(3), answer });
    else py.push({ i, kind: "expr", code: q.check, answer });
  });
  const label = (i: number) => `${all[i].id} "${all[i].q.slice(0, 60).replace(/\n/g, " ")}"`;
  if (py.length) {
    const r = spawnSync(process.env.PYTHON ?? "python", ["-I", join(__dirname, "lq_check.py")], { input: JSON.stringify(py), encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) problems.push(`python checker crashed: ${r.stderr.slice(0, 300)}`);
    else for (const f of JSON.parse(r.stdout) as { i: number; why: string }[]) problems.push(`${label(f.i)}: ${f.why}`);
  }
  if (java.length) {
    const dir = (mkdirSync(WORK, { recursive: true }), mkdtempSync(join(WORK, "java-")));
    try {
      for (const j of java) {
        const file = join(dir, "Main.java");
        writeFileSync(file, j.code);
        const r = spawnSync("java", [file], { encoding: "utf8", timeout: 30000 });
        const out = (r.stdout ?? "").replace(/\r\n/g, "\n").trim();
        if (r.status !== 0) problems.push(`${label(j.i)}: java failed: ${(r.stderr ?? "").trim().split("\n")[0]}`);
        else if (out !== j.answer.trim()) problems.push(`${label(j.i)}: java prints ${JSON.stringify(out)}, option says ${JSON.stringify(j.answer)}`);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  // C and C++ are compiled with zig's bundled clang (pip package `ziglang`); skipped when it is not configured.
  const zig = process.env.LQ_ZIG_PYTHON ?? (existsSync(LOCAL_ZIG) ? LOCAL_ZIG : undefined);
  const zigEnv = { ...process.env, ZIG_GLOBAL_CACHE_DIR: join(WORK, "zig-cache"), ZIG_LOCAL_CACHE_DIR: join(WORK, "zig-cache") };
  if (native.length && !zig) warnings.push(`${native.length} C/C++ output check(s) skipped: set LQ_ZIG_PYTHON to a Python with the ziglang package`);
  if (native.length && zig) {
    const dir = (mkdirSync(WORK, { recursive: true }), mkdtempSync(join(WORK, "native-")));
    try {
      native.forEach((n, k) => {
        const src = join(dir, `p${k}.${n.lang === "c" ? "c" : "cpp"}`), exe = join(dir, `p${k}.exe`);
        writeFileSync(src, n.code);
        const c = spawnSync(zig, ["-m", "ziglang", n.lang === "c" ? "cc" : "c++", "-w", "-O0", src, "-o", exe], { encoding: "utf8", timeout: 120000, env: zigEnv });
        if (c.status !== 0) {
          problems.push(`${label(n.i)}: ${n.lang} compile failed: ${(c.stderr ?? "").split("\n").find((l) => l.includes("error")) ?? (c.stderr ?? "").slice(0, 200)}`);
          return;
        }
        const run = spawnSync(exe, [], { encoding: "utf8", timeout: 10000 });
        const out = (run.stdout ?? "").replace(/\r\n/g, "\n").trim();
        if (out !== n.answer.trim()) problems.push(`${label(n.i)}: ${n.lang} prints ${JSON.stringify(out)}, option says ${JSON.stringify(n.answer)}`);
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log(perSubject.join("\n"));
  console.log(`\n${all.length} questions, ${py.length + java.length + (zig ? native.length : 0)} machine-checked (${java.length} Java, ${zig ? native.length : 0} C/C++).`);
  if (warnings.length) console.log(`\n${warnings.length} warning(s):\n - ${warnings.slice(0, 200).join("\n - ")}${warnings.length > 200 ? "\n - …" : ""}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):\n - ${problems.join("\n - ")}`);
    process.exit(1);
  }
  console.log("\nAll questions valid.");
}

main().catch((e) => { console.error(e); process.exit(1); });
