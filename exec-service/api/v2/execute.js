const crypto = require("node:crypto");
const { runBatch } = require("../../lib/runner");

const LANGUAGES = new Set(["python", "javascript"]);
const MAX_SOURCE = 30000;
const MAX_STDIN = 2500000;
const MAX_TOTAL_STDIN = 4000000; // Vercel rejects request bodies over 4.5 MB
const MAX_CASES = 30;

function authorized(req) {
  const expected = process.env.EXEC_TOKEN;
  if (!expected) return false; // refuse to run unprotected
  const given = String(req.headers.authorization || "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * POST /api/v2/execute  (shape follows Piston so the main app can use either backend)
 *   single:  { language, files:[{content}], stdin }                -> { run:{stdout,stderr,code,signal} }
 *   batch:   { language, files:[{content}], stdins:[...] }         -> { runs:[{stdout,stderr,code,signal,timeMs}] }
 */
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  if (!authorized(req)) return res.status(401).json({ message: "Unauthorized" });

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const language = body.language === "js" || body.language === "node" ? "javascript" : body.language;
  const source = body.files && body.files[0] && body.files[0].content;
  if (!LANGUAGES.has(language)) return res.status(400).json({ message: `Language '${body.language}' is not supported by this runner.` });
  if (typeof source !== "string" || source.length === 0 || source.length > MAX_SOURCE) return res.status(400).json({ message: "Invalid source." });

  const batch = Array.isArray(body.stdins);
  const stdins = batch ? body.stdins : [typeof body.stdin === "string" ? body.stdin : ""];
  if (stdins.length === 0 || stdins.length > MAX_CASES || stdins.some((s) => typeof s !== "string" || s.length > MAX_STDIN) || stdins.reduce((n, s) => n + s.length, 0) > MAX_TOTAL_STDIN) {
    return res.status(400).json({ message: "Invalid input." });
  }

  const runs = await runBatch(language, source, stdins);
  // Keep the whole response under Vercel's 4.5 MB limit even if every case prints a lot.
  let total = runs.reduce((n, r) => n + r.stdout.length, 0);
  if (total > 4000000) for (const r of runs) r.stdout = r.stdout.slice(0, Math.floor(4000000 / runs.length));
  if (batch) return res.status(200).json({ language, runs });
  const [r] = runs;
  return res.status(200).json({ language, run: { stdout: r.stdout, stderr: r.stderr, code: r.code, signal: r.signal } });
};
