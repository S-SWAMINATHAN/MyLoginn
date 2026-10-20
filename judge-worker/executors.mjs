/**
 * Execution backends for the MyLoginn competition judge worker.
 *
 *  - piston: the production backend. Piston (https://github.com/engineer-man/piston) runs each program in an
 *    isolated sandbox with no network, process/file/output limits and per-run CPU-time and memory limits.
 *  - local-unsafe: DEVELOPMENT ONLY. Spawns python/node/java directly on this machine with a timeout. There is no
 *    isolation, so it refuses to start unless JUDGE_ALLOW_UNSAFE_LOCAL=1 and NODE_ENV is not "production".
 *
 * Both return per test: { id, status, stdout, stderr, timeMs } with status one of
 * OK | RUNTIME_ERROR | TIME_LIMIT | MEMORY_LIMIT | COMPILE_ERROR | INTERNAL. Comparing output with the expected
 * answer is NOT done here: the worker never receives expected outputs.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const FILES = { python: "main.py", javascript: "main.js", java: "Main.java", cpp: "main.cpp" };
const PISTON_LANG = { python: "python", javascript: "javascript", java: "java", cpp: "c++" };
const OUTPUT_LIMIT = 1_000_000;

// ───────────────────────────── Piston ─────────────────────────────

export function pistonExecutor(baseUrl) {
  const url = baseUrl.replace(/\/+$/, "");
  let runtimes = null;

  async function versionFor(language) {
    if (!runtimes) {
      const res = await fetch(`${url}/api/v2/runtimes`);
      if (!res.ok) throw new Error(`Piston runtimes: HTTP ${res.status}`);
      runtimes = await res.json();
    }
    const name = PISTON_LANG[language];
    const r = runtimes.filter((x) => x.language === name || (x.aliases ?? []).includes(name)).sort((a, b) => (a.version < b.version ? 1 : -1))[0];
    return r?.version ?? null;
  }

  async function languages() {
    const out = [];
    for (const l of Object.keys(PISTON_LANG)) if (await versionFor(l).catch(() => null)) out.push(l);
    return out;
  }

  async function runOne(job, version, test) {
    const res = await fetch(`${url}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: PISTON_LANG[job.language],
        version,
        files: [{ name: FILES[job.language], content: job.source }],
        stdin: test.input,
        compile_timeout: 15_000,
        run_timeout: job.timeLimitMs,
        compile_memory_limit: -1,
        run_memory_limit: job.memoryLimitMb * 1024 * 1024,
      }),
    });
    if (!res.ok) throw new Error(`Piston execute: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }

  function classify(stage, timeLimitMs, memoryLimitMb) {
    // Piston ≥3.1 reports status: RE runtime error, SG signal, TO timeout, OL/EL output/stderr limit, XX internal.
    const s = stage.status;
    if (s === "TO" || (stage.signal === "SIGKILL" && (stage.wall_time ?? 0) >= timeLimitMs)) return "TIME_LIMIT";
    if (s === "XX") return "INTERNAL";
    if (stage.memory && stage.memory >= memoryLimitMb * 1024 * 1024 * 0.98) return "MEMORY_LIMIT";
    if (s === "SG" || s === "RE" || s === "OL" || s === "EL" || stage.code !== 0 || stage.signal) return "RUNTIME_ERROR";
    return "OK";
  }

  return {
    name: "piston",
    languages,
    async execute(job) {
      const version = await versionFor(job.language);
      if (!version) throw new Error(`Language ${job.language} is not installed on this Piston host.`);
      const results = [];
      for (const test of job.tests) {
        const started = Date.now();
        const out = await runOne(job, version, test);
        if (out.compile && (out.compile.code !== 0 || out.compile.signal)) {
          return { compile: { ok: false, output: `${out.compile.stdout ?? ""}${out.compile.stderr ?? ""}`.slice(0, 8000) }, tests: [] };
        }
        const run = out.run ?? {};
        results.push({
          id: test.id,
          status: classify(run, job.timeLimitMs, job.memoryLimitMb),
          stdout: (run.stdout ?? "").slice(0, OUTPUT_LIMIT),
          stderr: (run.stderr ?? "").slice(0, 8000),
          timeMs: Math.round(run.cpu_time ?? run.wall_time ?? Date.now() - started),
        });
      }
      return { compile: { ok: true, output: "" }, tests: results };
    },
  };
}

// ───────────────────────────── Local (development only) ─────────────────────────────

function run(cmd, args, { cwd, input, timeoutMs }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, { cwd, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      if (stdout.length < OUTPUT_LIMIT) stdout += d;
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < 8000) stderr += d;
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: String(e), killed, ms: Date.now() - started, spawnError: true });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, killed, ms: Date.now() - started });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(input ?? "");
  });
}

export function localUnsafeExecutor() {
  if (process.env.NODE_ENV === "production" || process.env.JUDGE_ALLOW_UNSAFE_LOCAL !== "1")
    throw new Error("The local executor runs code without isolation. Set JUDGE_ALLOW_UNSAFE_LOCAL=1 on a development machine only.");
  const python = process.env.JUDGE_PYTHON || (process.platform === "win32" ? "python" : "python3");
  return {
    name: "local-unsafe",
    async languages() {
      const out = ["python", "javascript"];
      const javac = await run("javac", ["-version"], { timeoutMs: 5000 });
      if (javac.code === 0) out.push("java");
      return out;
    },
    async execute(job) {
      const dir = await mkdtemp(path.join(tmpdir(), "mlc-judge-"));
      try {
        await writeFile(path.join(dir, FILES[job.language]), job.source);
        let cmd;
        let args;
        if (job.language === "python") [cmd, args] = [python, ["-I", FILES.python]];
        else if (job.language === "javascript") [cmd, args] = [process.execPath, [FILES.javascript]];
        else if (job.language === "java") {
          const c = await run("javac", ["-J-Xmx256m", FILES.java], { cwd: dir, timeoutMs: 20_000 });
          if (c.code !== 0) return { compile: { ok: false, output: `${c.stdout}${c.stderr}`.slice(0, 8000) }, tests: [] };
          [cmd, args] = ["java", [`-Xmx${job.memoryLimitMb}m`, "-cp", ".", "Main"]];
        } else throw new Error(`Language ${job.language} is not available locally.`);
        if (job.language === "python") {
          const syntax = await run(python, ["-I", "-c", "import ast,sys; ast.parse(open(sys.argv[1],encoding='utf8').read())", FILES.python], { cwd: dir, timeoutMs: 10_000 });
          if (syntax.code !== 0) return { compile: { ok: false, output: syntax.stderr.slice(0, 8000) }, tests: [] };
        }
        const tests = [];
        for (const t of job.tests) {
          // Interpreter start-up is not the candidate's time: allow a fixed margin on top of the limit.
          const r = await run(cmd, args, { cwd: dir, input: t.input, timeoutMs: job.timeLimitMs + 1500 });
          if (r.spawnError) throw new Error(r.stderr);
          tests.push({ id: t.id, status: r.killed ? "TIME_LIMIT" : r.code === 0 ? "OK" : /MemoryError|OutOfMemoryError|heap out of memory/.test(r.stderr) ? "MEMORY_LIMIT" : "RUNTIME_ERROR", stdout: r.stdout, stderr: r.stderr, timeMs: r.ms });
        }
        return { compile: { ok: true, output: "" }, tests };
      } finally {
        await rm(dir, { recursive: true, force: true }).catch(() => {});
      }
    },
  };
}
