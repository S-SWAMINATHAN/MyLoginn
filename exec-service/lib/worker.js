// Runs inside a worker thread with an EMPTY environment (see runner.js). One worker serves one request, so a learner's
// program can never leave state behind for anyone else's. Each test case gets a fresh interpreter namespace.
const { parentPort, workerData } = require("node:worker_threads");
const vm = require("node:vm");

const OUTPUT_CAP = 600000; // stdout per test case (legitimate answers can be large)
const ERROR_CAP = 20000;
const { language, source, stdins } = workerData;
const cap = (s, n = OUTPUT_CAP) => (s.length > n ? s.slice(0, n) : s);

async function runPython() {
  const { loadPyodide } = await import("pyodide");
  const py = await loadPyodide();
  parentPort.postMessage({ type: "ready" });
  for (let i = 0; i < stdins.length; i++) {
    parentPort.postMessage({ type: "start", i });
    let out = "";
    let err = "";
    // Raw bytes, not the line-based handler: that one silently truncates lines at 8192 characters.
    const data = new TextEncoder().encode(stdins[i]);
    let pos = 0;
    py.setStdout({ batched: (s) => { if (out.length < OUTPUT_CAP) out += s + "\n"; } });
    py.setStderr({ batched: (s) => { if (err.length < ERROR_CAP) err += s + "\n"; } });
    py.setStdin({ read: (buf) => { const n = Math.min(buf.length, data.length - pos); buf.set(data.subarray(pos, pos + n)); pos += n; return n; } });
    let code = 0;
    const globals = py.globals.get("dict")();
    try {
      await py.runPythonAsync(source, { globals });
    } catch (e) {
      code = 1;
      // Keep only the Python traceback tail, never host paths.
      err += String(e && e.message ? e.message : e).split("\n").slice(-6).join("\n");
    } finally {
      globals.destroy();
    }
    parentPort.postMessage({ type: "done", i, stdout: cap(out), stderr: cap(err, ERROR_CAP), code });
  }
}

function runJavaScript() {
  parentPort.postMessage({ type: "ready" });
  for (let i = 0; i < stdins.length; i++) {
    parentPort.postMessage({ type: "start", i });
    let out = "";
    let err = "";
    const stdin = stdins[i];
    const fmt = (args) => args.map((a) => (typeof a === "string" ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })())).join(" ");
    const sandbox = {
      console: {
        log: (...a) => { if (out.length < OUTPUT_CAP) out += fmt(a) + "\n"; },
        error: (...a) => { if (err.length < ERROR_CAP) err += fmt(a) + "\n"; },
      },
      process: { stdout: { write: (s) => { if (out.length < OUTPUT_CAP) out += String(s); return true; } } },
      // `require("fs").readFileSync(0, "utf8")` is the one thing starter programs need; nothing else is available.
      require: (name) => {
        if (name === "fs") return { readFileSync: () => stdin };
        throw new Error(`Module '${name}' is not available`);
      },
    };
    let code = 0;
    try {
      vm.runInNewContext(source, sandbox, { timeout: 2500, displayErrors: false });
    } catch (e) {
      code = 1;
      err += String(e && e.stack ? e.stack.split("\n").slice(0, 4).join("\n") : e);
    }
    parentPort.postMessage({ type: "done", i, stdout: cap(out), stderr: cap(err, ERROR_CAP), code });
  }
}

(language === "python" ? runPython() : Promise.resolve(runJavaScript()))
  .then(() => parentPort.postMessage({ type: "finished" }))
  .catch((e) => parentPort.postMessage({ type: "crash", message: String(e && e.message ? e.message : e) }));
