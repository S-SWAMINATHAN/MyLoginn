"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runCode } from "@/lib/lms/clientRunner";
import { normalizeOutput } from "@/lib/lms/challenge";

type PublicTest = { index: number; input: string; expected: string };
type Props = {
  challengeId: string;
  title: string;
  language: string;
  difficulty: string;
  statement: string;
  starterCode: string;
  tests: PublicTest[];
  hints: string[];
  points: number;
  alreadyPassed: boolean;
};

type Submitted = { passed: boolean; feedback: string; pointsAwarded: number; hiddenTestsEvaluated: boolean; solutionCode?: string | null; solutionExplanation?: string | null };

export function ChallengeRunner({ challengeId, title, language, difficulty, statement, starterCode, tests, hints, points, alreadyPassed }: Props) {
  const router = useRouter();
  const [source, setSource] = useState(starterCode);
  const [runs, setRuns] = useState<{ index: number; output: string; ok: boolean }[]>([]);
  const [ranSource, setRanSource] = useState<string | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState<Submitted | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy("run"); setError(null); setResult(null);
    try {
      const collected: { index: number; output: string; ok: boolean }[] = [];
      for (const t of tests) {
        const output = await runCode(language, source, t.input);
        collected.push({ index: t.index, output, ok: normalizeOutput(output) === normalizeOutput(t.expected) });
      }
      setRuns(collected);
      setRanSource(source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run your code.");
    } finally { setBusy(null); }
  }

  async function submit() {
    if (ranSource !== source) { setError("Run your code first, then submit."); return; }
    setBusy("submit"); setError(null);
    try {
      const res = await fetch(`/api/lms/challenges/${challengeId}/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, results: runs.map((r) => ({ index: r.index, output: r.output })) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not submit."); return; }
      setResult(json as Submitted);
      if (json.passed) router.refresh();
    } finally { setBusy(null); }
  }

  const allPass = runs.length > 0 && runs.every((r) => r.ok);
  return (
    <section className="rounded-2xl border border-border-soft bg-surface p-5 sm:p-6" aria-labelledby={`ch-${challengeId}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={`ch-${challengeId}`} className="text-lg font-bold">{title}</h2>
        <span className="rounded-full bg-story-mist px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-story-royal">{difficulty}</span>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted ring-1 ring-border-soft">{language}</span>
        <span className="ml-auto text-xs font-semibold text-muted">{alreadyPassed ? "Completed" : `${points} points`}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{statement}</p>

      <div className="mt-4 grid gap-2">
        {tests.map((t) => (
          <div key={t.index} className="rounded-xl border border-border-soft bg-background/60 p-3 text-xs">
            <p className="font-semibold text-muted">Sample test {tests.indexOf(t) + 1}</p>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <div><p className="text-muted">Input</p><pre className="mt-0.5 whitespace-pre-wrap font-mono">{t.input || "(none)"}</pre></div>
              <div><p className="text-muted">Expected output</p><pre className="mt-0.5 whitespace-pre-wrap font-mono">{t.expected}</pre></div>
            </div>
          </div>
        ))}
      </div>

      <label htmlFor={`code-${challengeId}`} className="mt-4 block text-sm font-semibold">Your code</label>
      <textarea
        id={`code-${challengeId}`} value={source} onChange={(e) => setSource(e.target.value)} spellCheck={false} rows={12}
        className="mt-1 w-full rounded-xl border border-border-soft bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none focus:border-story-royal"
        onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget; const s = t.selectionStart; setSource(source.slice(0, s) + "    " + source.slice(t.selectionEnd)); requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; }); } }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={run} disabled={busy !== null} className="rounded-full border border-story-royal px-5 py-2 text-sm font-semibold text-story-royal disabled:opacity-50">{busy === "run" ? "Running…" : "Run code"}</button>
        <button type="button" onClick={submit} disabled={busy !== null || !allPass} className="rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy === "submit" ? "Submitting…" : "Submit solution"}</button>
        {hints.length > 0 && hintsShown < hints.length && <button type="button" onClick={() => setHintsShown((n) => n + 1)} className="text-sm font-semibold text-story-royal underline underline-offset-2">Show hint {hintsShown + 1} of {hints.length}</button>}
      </div>

      {hintsShown > 0 && <ol className="mt-3 space-y-1.5 text-sm">{hints.slice(0, hintsShown).map((h, i) => <li key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Hint {i + 1}: {h}</li>)}</ol>}

      {runs.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm" aria-live="polite">
          {runs.map((r, i) => (
            <li key={r.index} className={`rounded-lg px-3 py-2 ${r.ok ? "bg-success/10" : "bg-danger/10"}`}>
              <span className="font-semibold">Test {i + 1}: {r.ok ? "passed" : "failed"}</span>
              {!r.ok && <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">Your output: {r.output || "(no output)"}</pre>}
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {result && (
        <div className={`mt-4 rounded-xl p-4 text-sm ${result.passed ? "bg-success/10" : "bg-danger/10"}`} aria-live="polite">
          <p className="font-semibold">{result.passed ? "Challenge passed." : "Not quite yet."} {result.feedback}</p>
          {result.pointsAwarded > 0 && <p className="mt-1">+{result.pointsAwarded} points</p>}
          {result.solutionExplanation && <p className="mt-2 leading-6">{result.solutionExplanation}</p>}
          {result.solutionCode && <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-100">{result.solutionCode}</pre>}
          <p className="mt-2 text-xs text-muted">Checked against the visible tests and requirements. Code runs in your browser.</p>
        </div>
      )}
    </section>
  );
}
