#!/usr/bin/env node
/**
 * MyLoginn competition judge worker. Runs on a sandbox host next to Piston, never on the web server, and never
 * holds database credentials: it pulls jobs from the website over HTTPS with a bearer token, executes them and posts
 * the raw results back. The website compares outputs with the hidden expected answers.
 *
 *   JUDGE_API_URL=https://www.myloginn.com COMPETITION_JUDGE_TOKEN=... PISTON_URL=http://127.0.0.1:2000 node worker.mjs
 *
 * Optional: WORKER_ID (default hostname), CONCURRENCY (default: CPU count), TICK_INTERVAL_MS (default 15000; 0 disables
 * the lifecycle tick from this worker), EXECUTOR=piston|local-unsafe.
 */
import { hostname, cpus } from "node:os";
import { localUnsafeExecutor, pistonExecutor } from "./executors.mjs";

export const VERSION = "1.0.0";

export function createWorker({ apiUrl, token, executor, workerId, concurrency, log = console }) {
  const base = apiUrl.replace(/\/+$/, "");
  let running = 0;
  let stopped = false;
  let languages = [];

  async function call(path, body) {
    const res = await fetch(`${base}/api/coding-competition/judge/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(path === "tick" ? 290_000 : 60_000),
    });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }

  async function handle(job) {
    try {
      const result = await executor.execute(job);
      await call("complete", { workerId, jobId: job.id, result });
    } catch (error) {
      log.error(`[judge] job ${job.id} failed:`, error?.message ?? error);
      await call("fail", { workerId, jobId: job.id, error: String(error?.message ?? error).slice(0, 900) }).catch((e) => log.error("[judge] could not report failure:", e.message));
    } finally {
      running--;
    }
  }

  /** Claims as many jobs as there are free slots. Returns how many were claimed. */
  async function pollOnce() {
    const free = concurrency - running;
    if (free <= 0) return 0;
    const { jobs } = await call("claim", { workerId, version: VERSION, languages, max: free });
    for (const job of jobs) {
      running++;
      handle(job);
    }
    return jobs.length;
  }

  async function start({ tickIntervalMs = 15_000 } = {}) {
    languages = await executor.languages();
    log.info(`[judge] ${workerId} v${VERSION} (${executor.name}) languages=${languages.join(",")} concurrency=${concurrency}`);
    if (tickIntervalMs > 0)
      (async () => {
        while (!stopped) {
          await call("tick").catch((e) => log.error("[judge] tick:", e.message));
          await new Promise((r) => setTimeout(r, tickIntervalMs));
        }
      })();
    let idle = 250;
    while (!stopped) {
      try {
        const n = await pollOnce();
        idle = n ? 50 : Math.min(2000, idle * 1.5);
      } catch (error) {
        log.error("[judge] claim:", error.message);
        idle = 5000;
      }
      await new Promise((r) => setTimeout(r, running >= concurrency ? 50 : idle));
    }
  }

  return { start, pollOnce, stop: () => (stopped = true), get running() { return running; } };
}

const isMain = import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") ?? "");
if (isMain) {
  const apiUrl = process.env.JUDGE_API_URL;
  const token = process.env.COMPETITION_JUDGE_TOKEN;
  if (!apiUrl || !token) {
    console.error("Set JUDGE_API_URL and COMPETITION_JUDGE_TOKEN.");
    process.exit(1);
  }
  const executor = process.env.EXECUTOR === "local-unsafe" ? localUnsafeExecutor() : pistonExecutor(process.env.PISTON_URL || "http://127.0.0.1:2000");
  const worker = createWorker({ apiUrl, token, executor, workerId: process.env.WORKER_ID || hostname(), concurrency: Number(process.env.CONCURRENCY) || cpus().length });
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { worker.stop(); setTimeout(() => process.exit(0), 3000); });
  worker.start({ tickIntervalMs: process.env.TICK_INTERVAL_MS === undefined ? 15_000 : Number(process.env.TICK_INTERVAL_MS) });
}
