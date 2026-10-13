"use client";

/**
 * Browser-side code execution for challenges (the learner's own machine, never the app server).
 * Python uses the bundled Pyodide runtime; JavaScript runs in a throw-away Web Worker with a time limit.
 */

type PythonRuntime = {
  setStdout: (o: { batched: (t: string) => void }) => void;
  setStderr: (o: { batched: (t: string) => void }) => void;
  setStdin: (o: { stdin: () => number | null }) => void;
  runPythonAsync: (s: string) => Promise<unknown>;
};
declare global {
  interface Window { loadMyLoginnPython?: (o: { indexURL: string }) => Promise<PythonRuntime> }
}

let pythonPromise: Promise<PythonRuntime> | null = null;

function loadPython(): Promise<PythonRuntime> {
  if (!pythonPromise) {
    pythonPromise = new Promise<PythonRuntime>((resolve, reject) => {
      const finish = () => {
        if (!window.loadMyLoginnPython) return reject(new Error("The Python runtime did not load."));
        window.loadMyLoginnPython({ indexURL: "/pyodide/" }).then(resolve, reject);
      };
      if (window.loadMyLoginnPython) return finish();
      const script = document.createElement("script");
      script.type = "module";
      script.src = "/python-runtime.js";
      script.onload = finish;
      script.onerror = () => reject(new Error("Could not load the Python runtime."));
      document.head.appendChild(script);
    }).catch((error) => { pythonPromise = null; throw error; });
  }
  return pythonPromise;
}

export async function runPython(source: string, stdin: string): Promise<string> {
  const runtime = await loadPython();
  let out = "";
  runtime.setStdout({ batched: (line) => { out += `${line}\n`; } });
  runtime.setStderr({ batched: (line) => { out += `${line}\n`; } });
  let pos = 0;
  const input = `${stdin}\n`;
  runtime.setStdin({ stdin: () => (pos < input.length ? input.charCodeAt(pos++) : null) });
  try {
    await runtime.runPythonAsync(source);
  } catch (error) {
    out += error instanceof Error ? error.message : String(error);
  }
  return out.trimEnd();
}

/** `print(...)` / `console.log(...)` write output; `readLine()` returns the next stdin line. 5 second limit. */
export function runJavaScript(source: string, stdin: string, timeoutMs = 5000): Promise<string> {
  return new Promise((resolve) => {
    const workerSource = `
      const lines = ${JSON.stringify(stdin)}.split("\\n"); let i = 0; let out = "";
      const write = (...a) => { out += a.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join(" ") + "\\n"; };
      self.console = { log: write, error: write, warn: write, info: write };
      self.print = write; self.readLine = () => (i < lines.length ? lines[i++] : null);
      self.onmessage = (e) => { try { (0, eval)(e.data); } catch (err) { out += String(err && err.message || err) + "\\n"; } self.postMessage(out); };
    `;
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (text: string) => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); resolve(text.trimEnd()); };
    const timer = setTimeout(() => done("Time limit exceeded (5 seconds). Check for an infinite loop."), timeoutMs);
    worker.onmessage = (e: MessageEvent<string>) => done(e.data);
    worker.onerror = (e) => done(String(e.message || "Script error"));
    worker.postMessage(source);
  });
}

export function runCode(language: string, source: string, stdin: string) {
  const lang = language.toLowerCase();
  if (lang === "python") return runPython(source, stdin);
  if (lang === "javascript") return runJavaScript(source, stdin);
  return Promise.reject(new Error(`${language} can't run in the browser yet.`));
}
