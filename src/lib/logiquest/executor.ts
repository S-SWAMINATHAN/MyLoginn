import { LANGUAGES } from "./constants";

/**
 * Talks to an isolated code-execution service that speaks the Piston HTTP API
 * (https://github.com/engineer-man/piston). The service runs each program in its own sandbox with CPU, memory,
 * process, file-system and network limits. Learner code is NEVER run inside this Next.js process.
 *
 * Configure with LQ_EXEC_URL (e.g. http://127.0.0.1:2000) and optionally LQ_EXEC_TOKEN.
 */
export type ExecResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  compileError: boolean;
  timeMs: number;
};

export class ExecutorUnavailable extends Error {}

export function executorConfigured() {
  return Boolean(process.env.LQ_EXEC_URL);
}

const RUN_TIMEOUT_MS = 3000;
const COMPILE_TIMEOUT_MS = 10000;
const MEMORY_LIMIT_BYTES = 256 * 1024 * 1024;
const OUTPUT_CAP = 600_000;

export async function executeOnce(language: string, source: string, stdin: string): Promise<ExecResult> {
  const base = process.env.LQ_EXEC_URL;
  const lang = LANGUAGES[language];
  if (!base || !lang) throw new ExecutorUnavailable("Code execution is not available right now.");

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, "")}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.LQ_EXEC_TOKEN ? { Authorization: process.env.LQ_EXEC_TOKEN } : {}) },
      body: JSON.stringify({
        language: lang.piston,
        version: "*",
        files: [{ name: lang.file, content: source }],
        stdin,
        compile_timeout: COMPILE_TIMEOUT_MS,
        run_timeout: RUN_TIMEOUT_MS,
        compile_memory_limit: MEMORY_LIMIT_BYTES,
        run_memory_limit: MEMORY_LIMIT_BYTES,
      }),
      signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS + RUN_TIMEOUT_MS + 5000),
      cache: "no-store",
    });
  } catch {
    throw new ExecutorUnavailable("Code execution is not available right now.");
  }
  if (!res.ok) throw new ExecutorUnavailable("Code execution is not available right now.");

  const data = (await res.json().catch(() => null)) as {
    compile?: { stdout?: string; stderr?: string; code?: number | null };
    run?: { stdout?: string; stderr?: string; code?: number | null; signal?: string | null };
  } | null;
  if (!data?.run) throw new ExecutorUnavailable("Code execution is not available right now.");

  const compileError = Boolean(data.compile && data.compile.code != null && data.compile.code !== 0);
  const timeMs = Date.now() - started;
  const timedOut = data.run.signal === "SIGKILL" && !compileError && timeMs >= RUN_TIMEOUT_MS;
  const stdout = (data.run.stdout ?? "").slice(0, OUTPUT_CAP);
  const stderr = ((compileError ? data.compile?.stderr || data.compile?.stdout : data.run.stderr) ?? "").slice(0, OUTPUT_CAP);
  return { ok: !compileError && !timedOut && data.run.code === 0, stdout, stderr, exitCode: data.run.code ?? null, timedOut, compileError, timeMs };
}

/**
 * Languages this deployment can actually run. The free self-owned runner (exec-service) supports Python and
 * JavaScript only; set LQ_EXEC_LANGUAGES (comma separated) to match whatever backend you configured. With a full
 * Piston server leave it unset to offer every language the platform knows.
 */
export function availableLanguages(): string[] {
  const configured = process.env.LQ_EXEC_LANGUAGES?.split(",").map((s) => s.trim()).filter((s) => LANGUAGES[s]);
  return configured?.length ? configured : Object.keys(LANGUAGES);
}

/**
 * Runs one program against many inputs. With LQ_EXEC_BATCH=1 (the exec-service) this is a single request, so the
 * interpreter starts once per submission; otherwise each input is its own request (Piston).
 */
export async function executeMany(language: string, source: string, stdins: string[]): Promise<ExecResult[]> {
  if (process.env.LQ_EXEC_BATCH !== "1") {
    const results: ExecResult[] = [];
    const CONCURRENCY = 4;
    for (let i = 0; i < stdins.length; i += CONCURRENCY) {
      results.push(...(await Promise.all(stdins.slice(i, i + CONCURRENCY).map((s) => executeOnce(language, source, s)))));
      const last = results[results.length - 1];
      // A compile error repeats identically for every input.
      if (last?.compileError) { while (results.length < stdins.length) results.push(last); break; }
    }
    return results;
  }

  const base = process.env.LQ_EXEC_URL;
  if (!base || !LANGUAGES[language]) throw new ExecutorUnavailable("Code execution is not available right now.");
  const send = () => fetch(`${base.replace(/\/$/, "")}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.LQ_EXEC_TOKEN ? { Authorization: process.env.LQ_EXEC_TOKEN } : {}) },
    body: JSON.stringify({ language: LANGUAGES[language].piston, files: [{ name: LANGUAGES[language].file, content: source }], stdins }),
    signal: AbortSignal.timeout(55_000),
    cache: "no-store",
  });
  let res: Response;
  try {
    // Running a program is side-effect free, so one retry covers a keep-alive connection the server just closed.
    res = await send().catch(() => send());
  } catch {
    throw new ExecutorUnavailable("Code execution is not available right now.");
  }
  if (!res.ok) throw new ExecutorUnavailable("Code execution is not available right now.");
  const data = (await res.json().catch(() => null)) as { runs?: { stdout: string; stderr: string; code: number | null; signal: string | null; timeMs: number }[] } | null;
  if (!data?.runs || data.runs.length !== stdins.length) throw new ExecutorUnavailable("Code execution is not available right now.");
  return data.runs.map((r) => ({
    ok: r.code === 0 && !r.signal,
    stdout: (r.stdout ?? "").slice(0, OUTPUT_CAP),
    stderr: (r.stderr ?? "").slice(0, OUTPUT_CAP),
    exitCode: r.code,
    timedOut: r.signal === "SIGKILL",
    compileError: false,
    timeMs: r.timeMs ?? 0,
  }));
}
