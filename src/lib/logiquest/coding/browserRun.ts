"use client";

/**
 * Runs learner code in the browser for the MyLoginn IDE (never on the app server).
 * Python: Pyodide inside a dedicated Web Worker, so infinite loops can be stopped by terminating the worker.
 * JavaScript: a throw-away Web Worker per run.
 * TypeScript, Ruby, PHP and Lua: one long-lived worker each (see runtimes.ts), restarted after a time-out.
 */
import { RUNTIME_WORKERS } from "./runtimes";
import type { IoLang } from "./types";

export type RunResult = { output: string; error: string | null; timedOut: boolean; ms: number };

const norm = (s: string) => s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");
export const sameOutput = (a: string, b: string) => norm(a) === norm(b);

// ───────────── Python ─────────────
let pyWorker: Worker | null = null;
let pyReady: Promise<void> | null = null;
let seq = 0;
const pending = new Map<number, (r: { output: string; error: string | null }) => void>();

function pythonWorkerSource(origin: string) {
  return `
    const ready = import(${JSON.stringify(`${origin}/pyodide/pyodide.mjs`)}).then((m) => m.loadPyodide({ indexURL: ${JSON.stringify(`${origin}/pyodide/`)} }));
    self.onmessage = async (e) => {
      const { id, code, input } = e.data;
      let py;
      try { py = await ready; } catch (err) { self.postMessage({ id, output: "", error: "The Python runtime could not load: " + err }); return; }
      if (code === null) { self.postMessage({ id, output: "", error: null }); return; }
      let out = "";
      py.setStdout({ batched: (s) => { out += s + "\\n"; } });
      py.setStderr({ batched: (s) => { out += s + "\\n"; } });
      const data = input + "\\n"; let pos = 0;
      py.setStdin({ stdin: () => (pos < data.length ? data.charCodeAt(pos++) : null) });
      const ns = py.globals.get("dict")();
      try {
        await py.runPythonAsync(code, { globals: ns });
        self.postMessage({ id, output: out, error: null });
      } catch (err) {
        const msg = String(err && err.message || err);
        const lines = msg.trim().split("\\n");
        const userLines = lines.filter((l) => !l.includes("/lib/python") && !l.includes("_pyodide"));
        self.postMessage({ id, output: out, error: userLines.slice(-3).join("\\n") || lines[lines.length - 1] });
      } finally { ns.destroy(); }
    };
  `;
}

function ensurePython(): Promise<void> {
  if (pyWorker && pyReady) return pyReady;
  const url = URL.createObjectURL(new Blob([pythonWorkerSource(window.location.origin)], { type: "text/javascript" }));
  pyWorker = new Worker(url, { type: "module" });
  pyWorker.onmessage = (e: MessageEvent<{ id: number; output: string; error: string | null }>) => {
    const done = pending.get(e.data.id);
    pending.delete(e.data.id);
    done?.({ output: e.data.output, error: e.data.error });
  };
  pyReady = new Promise<void>((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (r) => (r.error ? reject(new Error(r.error)) : resolve()));
    pyWorker!.postMessage({ id, code: null, input: "" });
  }).catch((err) => { killPython(); throw err; });
  return pyReady;
}

function killPython() {
  pyWorker?.terminate();
  pyWorker = null;
  pyReady = null;
  for (const [, done] of pending) done({ output: "", error: "Execution stopped." });
  pending.clear();
}

/** Loads Pyodide ahead of time (a few seconds on the first visit). */
export function warmUpPython() {
  return ensurePython();
}

async function runPython(code: string, input: string, timeoutMs: number): Promise<RunResult> {
  await ensurePython();
  const started = performance.now();
  return new Promise<RunResult>((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      pending.delete(id);
      killPython();
      resolve({ output: "", error: null, timedOut: true, ms: timeoutMs });
    }, timeoutMs);
    pending.set(id, (r) => { clearTimeout(timer); resolve({ ...r, timedOut: false, ms: Math.round(performance.now() - started) }); });
    pyWorker!.postMessage({ id, code, input });
  });
}

// ───────────── JavaScript ─────────────
function runJavaScript(code: string, input: string, timeoutMs: number): Promise<RunResult> {
  const src = `
    const __lines = ${JSON.stringify(input)}.split("\\n"); let __i = 0; let __out = "";
    const __w = (...a) => { __out += a.map((x) => typeof x === "string" ? x : (typeof x === "bigint" ? String(x) : JSON.stringify(x))).join(" ") + "\\n"; };
    self.console = { log: __w, error: __w, warn: __w, info: __w };
    self.print = __w; self.readLine = () => (__i < __lines.length ? __lines[__i++] : null);
    self.onmessage = (e) => {
      try { (0, eval)(e.data); self.postMessage({ output: __out, error: null }); }
      catch (err) { self.postMessage({ output: __out, error: String(err && err.stack ? err.stack.split("\\n")[0] : err) }); }
    };
  `;
  const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
  const worker = new Worker(url);
  const started = performance.now();
  return new Promise((resolve) => {
    const finish = (r: RunResult) => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); resolve(r); };
    const timer = setTimeout(() => finish({ output: "", error: null, timedOut: true, ms: timeoutMs }), timeoutMs);
    worker.onmessage = (e: MessageEvent<{ output: string; error: string | null }>) => finish({ ...e.data, timedOut: false, ms: Math.round(performance.now() - started) });
    worker.onerror = (e) => { e.preventDefault(); finish({ output: "", error: e.message || "Script error", timedOut: false, ms: Math.round(performance.now() - started) }); };
    worker.postMessage(code);
  });
}

// ───────────── TypeScript, Ruby, PHP, Lua ─────────────
type RuntimeLang = keyof typeof RUNTIME_WORKERS;
type Slot = { worker: Worker; ready: Promise<void>; pending: Map<number, (r: { output: string; error: string | null }) => void> };
const slots = new Map<RuntimeLang, Slot>();

function slotFor(lang: RuntimeLang): Slot {
  const existing = slots.get(lang);
  if (existing) return existing;
  const def = RUNTIME_WORKERS[lang];
  const url = URL.createObjectURL(new Blob([def.src], { type: "text/javascript" }));
  const worker = new Worker(url, { type: def.type });
  const pending = new Map<number, (r: { output: string; error: string | null }) => void>();
  worker.onmessage = (e: MessageEvent<{ id: number; output: string; error: string | null }>) => {
    const done = pending.get(e.data.id);
    pending.delete(e.data.id);
    done?.({ output: e.data.output, error: e.data.error });
  };
  worker.onerror = (e) => { e.preventDefault(); for (const [, done] of pending) done({ output: "", error: e.message || "The runtime crashed." }); pending.clear(); };
  const slot: Slot = { worker, pending, ready: Promise.resolve() };
  slot.ready = new Promise<void>((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (r) => (r.error ? reject(new Error(r.error)) : resolve()));
    worker.postMessage({ id, code: null, input: "" });
  }).catch((err) => { killSlot(lang); throw err; });
  slots.set(lang, slot);
  return slot;
}

function killSlot(lang: RuntimeLang) {
  const slot = slots.get(lang);
  if (!slot) return;
  slot.worker.terminate();
  for (const [, done] of slot.pending) done({ output: "", error: "Execution stopped." });
  slot.pending.clear();
  slots.delete(lang);
}

async function runInRuntime(lang: RuntimeLang, code: string, input: string, timeoutMs: number): Promise<RunResult> {
  const slot = slotFor(lang);
  await slot.ready;
  const started = performance.now();
  return new Promise<RunResult>((resolve) => {
    const id = ++seq;
    const timer = setTimeout(() => {
      slot.pending.delete(id);
      killSlot(lang);
      resolve({ output: "", error: null, timedOut: true, ms: timeoutMs });
    }, timeoutMs);
    slot.pending.set(id, (r) => { clearTimeout(timer); resolve({ ...r, timedOut: false, ms: Math.round(performance.now() - started) }); });
    slot.worker.postMessage({ id, code, input });
  });
}

/** Loads a language runtime ahead of time. Heavy runtimes download once and are then cached by the browser. */
export function warmUp(lang: IoLang): Promise<void> {
  if (lang === "python") return ensurePython();
  if (lang === "javascript") return Promise.resolve();
  return slotFor(lang).ready;
}

export function runCode(language: IoLang, code: string, input: string, timeoutMs = 4000) {
  if (language === "python") return runPython(code, input, timeoutMs);
  if (language === "javascript") return runJavaScript(code, input, timeoutMs);
  return runInRuntime(language, code, input, timeoutMs);
}

export type CaseResult = { index: number; input: string; expected: string; output: string; passed: boolean; error: string | null; timedOut: boolean; ms: number };
export type Verdict = "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT";

/** Runs every test case in order and stops at the first failure (like an online judge). */
export async function judge(language: IoLang, code: string, tests: { input: string; output: string }[], onProgress?: (done: number) => void) {
  const cases: CaseResult[] = [];
  let verdict: Verdict = "ACCEPTED";
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const r = await runCode(language, code, t.input);
    const passed = !r.error && !r.timedOut && sameOutput(r.output, t.output);
    cases.push({ index: i, input: t.input, expected: t.output, output: norm(r.output), passed, error: r.error, timedOut: r.timedOut, ms: r.ms });
    onProgress?.(i + 1);
    if (!passed) {
      verdict = r.timedOut ? "TIME_LIMIT" : r.error ? "RUNTIME_ERROR" : "WRONG_ANSWER";
      break;
    }
  }
  return { verdict, passed: cases.filter((c) => c.passed).length, total: tests.length, cases };
}
