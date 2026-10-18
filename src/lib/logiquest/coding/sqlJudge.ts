import "server-only";
import { Worker } from "node:worker_threads";
import { join } from "node:path";

export type SqlRun = { columns: string[]; rows: string[][] } | { error: string };

/**
 * Runs SQL against a fresh in-memory SQLite database (sql.js, WebAssembly) in a worker thread.
 * Nothing touches the real database or the file system, and runaway queries are stopped after `timeoutMs`.
 */
export function runSql(schema: string, query: string, timeoutMs = 2000): Promise<SqlRun> {
  const wasmDir = join(process.cwd(), "node_modules", "sql.js", "dist");
  const code = `
    const { parentPort, workerData } = require("node:worker_threads");
    const path = require("node:path");
    const initSqlJs = require(path.join(workerData.wasmDir, "sql-wasm.js"));
    initSqlJs({ locateFile: (f) => path.join(workerData.wasmDir, f) }).then((SQL) => {
      const db = new SQL.Database();
      try {
        db.exec(workerData.schema);
        const res = db.exec(workerData.query);
        const last = res[res.length - 1];
        parentPort.postMessage(last ? { columns: last.columns, rows: last.values.map((r) => r.map((v) => (v === null ? "NULL" : String(v)))) } : { columns: [], rows: [] });
      } catch (e) {
        parentPort.postMessage({ error: String(e && e.message || e) });
      } finally { db.close(); }
    }, (e) => parentPort.postMessage({ error: "SQL engine failed to start: " + e }));
  `;
  return new Promise((resolve) => {
    const worker = new Worker(code, { eval: true, workerData: { wasmDir, schema, query }, resourceLimits: { maxOldGenerationSizeMb: 128 } });
    const timer = setTimeout(() => { void worker.terminate(); resolve({ error: `Time limit exceeded (${timeoutMs / 1000} s).` }); }, timeoutMs);
    worker.once("message", (m: SqlRun) => { clearTimeout(timer); void worker.terminate(); resolve(m); });
    worker.once("error", (e) => { clearTimeout(timer); resolve({ error: e.message }); });
  });
}

/** Learner queries may only read: one SELECT/WITH statement. */
export function checkReadOnly(query: string): string | null {
  const q = query.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim().replace(/;\s*$/, "");
  if (!q) return "Write a query first.";
  if (q.includes(";")) return "Submit a single SQL statement.";
  if (!/^(select|with)\b/i.test(q)) return "Only SELECT queries are allowed here.";
  return null;
}

/** Compare two results: same rows (and same order when `ordered`). Column names are ignored. */
export function sameResult(a: { rows: string[][] }, b: { rows: string[][] }, ordered: boolean) {
  const key = (r: string[]) => JSON.stringify(r.map((v) => (/^-?\d+\.\d+$/.test(v) ? String(Number(Number(v).toFixed(4))) : v)));
  const ka = a.rows.map(key), kb = b.rows.map(key);
  if (!ordered) { ka.sort(); kb.sort(); }
  return ka.length === kb.length && ka.every((x, i) => x === kb[i]);
}
