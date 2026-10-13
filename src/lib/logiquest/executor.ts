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
const OUTPUT_CAP = 20_000;

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
