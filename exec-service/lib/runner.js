const { Worker } = require("node:worker_threads");
const path = require("node:path");

const LOAD_LIMIT_MS = 25000; // Pyodide start-up
const RUN_LIMIT_MS = 4500; // per test case; Pyodide on a shared 1 vCPU runs ~2x slower than a desktop

/**
 * Runs `source` once per entry of `stdins` inside a throw-away worker thread.
 *  - `env: {}` : the worker cannot read this service's environment variables (including the access token)
 *  - `workerData` carries only the program and its inputs
 *  - a hung program is killed with worker.terminate(), which also interrupts WebAssembly loops
 * Resolves with one result per stdin; cases that never ran (after a timeout/crash) are marked as such.
 */
function runBatch(language, source, stdins) {
  return new Promise((resolve) => {
    const results = new Array(stdins.length).fill(null);
    const started = new Array(stdins.length).fill(0);
    let timer = null;
    let settled = false;

    const worker = new Worker(path.join(__dirname, "worker.js"), {
      workerData: { language, source, stdins },
      env: {},
      stdout: true,
      stderr: true,
      resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 32, stackSizeMb: 4 },
    });
    worker.stdout.resume();
    worker.stderr.resume();

    const finish = (reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      for (let i = 0; i < results.length; i++) {
        if (results[i]) continue;
        const ranButNeverFinished = started[i] > 0;
        results[i] = {
          stdout: "", stderr: ranButNeverFinished ? "" : "Not run.", code: null,
          signal: ranButNeverFinished && reason === "timeout" ? "SIGKILL" : "SKIPPED", timeMs: ranButNeverFinished ? Date.now() - started[i] : 0,
        };
      }
      resolve(results);
    };

    timer = setTimeout(() => finish("timeout"), LOAD_LIMIT_MS);

    worker.on("message", (m) => {
      if (m.type === "ready") { clearTimeout(timer); }
      else if (m.type === "start") {
        started[m.i] = Date.now();
        clearTimeout(timer);
        timer = setTimeout(() => finish("timeout"), RUN_LIMIT_MS);
      } else if (m.type === "done") {
        clearTimeout(timer);
        results[m.i] = { stdout: m.stdout, stderr: m.stderr, code: m.code, signal: null, timeMs: Date.now() - started[m.i] };
      } else if (m.type === "finished") finish("done");
      else if (m.type === "crash") finish("crash");
    });
    worker.on("error", () => finish("crash"));
    worker.on("exit", () => finish("exit"));
  });
}

module.exports = { runBatch };
