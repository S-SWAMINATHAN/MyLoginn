"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Clock, Loader2, Moon, Play, RotateCcw, Send, Sun, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { judge, warmUpPython, type CaseResult, type Verdict } from "@/lib/logiquest/coding/browserRun";
import type { CodeLang, PublicProblem } from "@/lib/logiquest/coding/types";
import { CodeEditor } from "./CodeEditor";

const LANG_LABEL: Record<CodeLang, string> = { python: "Python 3", javascript: "JavaScript", sql: "SQL (SQLite)" };
const VERDICT_TEXT: Record<Verdict, string> = { ACCEPTED: "Accepted", WRONG_ANSWER: "Wrong Answer", RUNTIME_ERROR: "Runtime Error", TIME_LIMIT: "Time Limit Exceeded" };
type SqlTable = { columns: string[]; rows: string[][] };
type Outcome =
  | { kind: "io"; mode: "run" | "submit" | "custom"; verdict: Verdict | null; passed: number; total: number; cases: CaseResult[]; customOutput?: string; xp?: number; note?: string }
  | { kind: "sql"; mode: "run" | "submit"; verdict: Verdict; result: SqlTable | null; expected: SqlTable | null; error: string | null; xp?: number; note?: string };

const storeKey = (slug: string, lang: string) => `lq-code:${slug}:${lang}`;
function readDraft(slug: string, lang: string): string | null {
  try { return window.localStorage.getItem(storeKey(slug, lang)); } catch { return null; }
}

function SqlResultTable({ t, caption }: { t: SqlTable; caption: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{caption}</p>
      <div className="max-h-56 overflow-auto rounded-lg border border-white/10">
        <table className="w-full min-w-max text-left text-xs">
          <thead className="sticky top-0 bg-white/10"><tr>{t.columns.map((c) => <th key={c} className="px-2.5 py-1.5 font-semibold">{c}</th>)}</tr></thead>
          <tbody>{t.rows.map((r, i) => <tr key={i} className="border-t border-white/5">{r.map((v, j) => <td key={j} className="px-2.5 py-1 font-mono">{v}</td>)}</tr>)}</tbody>
        </table>
        {!t.rows.length ? <p className="px-2.5 py-2 text-xs text-slate-400">No rows.</p> : null}
      </div>
    </div>
  );
}

/** The MyLoginn IDE for a coding problem: edit, run on samples or custom input, and submit against all tests. */
export function IdePane({ problem, loggedIn, drafts, onJudged }: {
  problem: PublicProblem; loggedIn: boolean; drafts: Partial<Record<CodeLang, string>>;
  onJudged: (r: { accepted: boolean; submitted: boolean }) => void;
}) {
  const [lang, setLang] = useState<CodeLang>(() => problem.languages[0]);
  const [code, setCode] = useState(() => readDraft(problem.slug, problem.languages[0]) ?? drafts[problem.languages[0]] ?? problem.starter[problem.languages[0]] ?? "");
  const [light, setLight] = useState(false);
  const [tab, setTab] = useState<"cases" | "result">("cases");
  const [caseIdx, setCaseIdx] = useState(0);
  const [useCustom, setUseCustom] = useState(false);
  const [custom, setCustom] = useState(() => problem.examples[0]?.input ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try { window.localStorage.setItem(storeKey(problem.slug, lang), code); } catch { /* storage unavailable */ }
  }, [problem.slug, lang, code]);

  useEffect(() => {
    // Start loading Python in the background so the first Run is fast.
    if (problem.languages.includes("python")) warmUpPython().catch(() => {});
  }, [problem.languages]);

  function switchLang(next: CodeLang) {
    setLang(next);
    setCode(readDraft(problem.slug, next) ?? drafts[next] ?? problem.starter[next] ?? "");
    setOutcome(null);
  }

  async function runSql(mode: "run" | "submit") {
    setBusy(mode === "run" ? "Running query…" : "Judging…"); setError(null); setTab("result");
    const res = await fetch(`/api/logiquest/coding/${problem.slug}/sql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: code, mode }) }).catch(() => null);
    const j = await res?.json().catch(() => null);
    setBusy(null);
    if (!res?.ok || !j) { setError(j?.error ?? "Could not run the query."); return; }
    setOutcome({ kind: "sql", mode, verdict: j.verdict, result: j.result, expected: j.expected, error: j.error, xp: j.xpAwarded, note: mode === "submit" && !loggedIn ? "Log in to save your progress and earn XP." : undefined });
    if (mode === "submit") onJudged({ accepted: j.verdict === "ACCEPTED", submitted: true });
  }

  async function run() {
    if (busy) return;
    if (lang === "sql") return runSql("run");
    setError(null); setTab("result");
    const tests = useCustom ? [{ input: custom, output: "" }] : problem.examples.map((e) => ({ input: e.input, output: e.output }));
    setBusy(lang === "python" ? "Starting Python…" : "Running…");
    try {
      const r = await judge(lang, code, tests, (n) => setBusy(`Running case ${Math.min(n + 1, tests.length)} of ${tests.length}…`));
      if (useCustom) setOutcome({ kind: "io", mode: "custom", verdict: null, passed: 0, total: 1, cases: r.cases, customOutput: r.cases[0]?.output });
      else setOutcome({ kind: "io", mode: "run", verdict: r.verdict, passed: r.passed, total: r.total, cases: r.cases });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not run your code.");
    }
    setBusy(null);
  }

  async function submit() {
    if (busy) return;
    if (lang === "sql") return runSql("submit");
    setError(null); setTab("result"); setBusy("Loading test cases…");
    const res = await fetch(`/api/logiquest/coding/${problem.slug}/tests`).catch(() => null);
    const j = await res?.json().catch(() => null);
    if (!res?.ok || !j?.tests) { setBusy(null); setError(j?.error ?? "Could not load the test cases."); return; }
    try {
      const r = await judge(lang, code, j.tests, (n) => setBusy(`Judging test ${Math.min(n + 1, j.tests.length)} of ${j.tests.length}…`));
      let xp = 0, note: string | undefined;
      if (loggedIn) {
        const s = await fetch(`/api/logiquest/coding/${problem.slug}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: lang, source: code, verdict: r.verdict, passed: r.passed }) }).catch(() => null);
        const sj = await s?.json().catch(() => null);
        if (s?.ok) xp = sj?.xpAwarded ?? 0; else note = sj?.error ?? "Your result could not be saved.";
      } else note = "Log in to save your progress and earn XP.";
      // Hidden test inputs are not displayed: only the first failing case's details are shown if it is a sample.
      const cases = r.cases.map((c) => (c.index < problem.examples.length ? c : { ...c, input: "(hidden)", expected: "(hidden)", output: c.passed ? c.output : "(hidden)" }));
      setOutcome({ kind: "io", mode: "submit", verdict: r.verdict, passed: r.passed, total: r.total, cases, xp, note });
      onJudged({ accepted: r.verdict === "ACCEPTED", submitted: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not judge your code.");
    }
    setBusy(null);
  }

  const shell = light ? "bg-white text-slate-900 border-slate-200" : "bg-[#0f172a] text-slate-100 border-white/10";
  const chip = (on: boolean) => cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-colors", on ? (light ? "bg-slate-200 text-slate-900" : "bg-white/15 text-white") : (light ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"));
  const verdictColor = (v: Verdict | null) => (v === "ACCEPTED" ? "text-emerald-400" : v ? "text-rose-400" : "text-sky-300");

  return (
    <div className={cn("flex h-full min-h-[38rem] flex-col overflow-hidden rounded-2xl border", shell)}>
      <div className={cn("flex flex-wrap items-center gap-2 border-b px-3 py-2", light ? "border-slate-200" : "border-white/10")}>
        <label className="sr-only" htmlFor="lang">Language</label>
        <select id="lang" value={lang} onChange={(e) => switchLang(e.target.value as CodeLang)} className={cn("rounded-md border px-2 py-1 text-xs font-semibold", light ? "border-slate-300 bg-white" : "border-white/15 bg-white/5 text-white")}>
          {problem.languages.map((l) => <option key={l} value={l} className="text-slate-900">{LANG_LABEL[l]}</option>)}
        </select>
        <span className={cn("hidden text-[11px] sm:inline", light ? "text-slate-500" : "text-slate-400")}>Ctrl + Enter to run</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => { setCode(problem.starter[lang] ?? ""); setOutcome(null); }} className={chip(false)} title="Reset to starter code"><RotateCcw className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setLight((v) => !v)} className={chip(false)} aria-label="Toggle editor theme">{light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}</button>
        </div>
      </div>

      <CodeEditor value={code} onChange={setCode} onRun={run} onSubmit={submit} indent={lang === "python" ? 4 : 2} light={light} label={`${LANG_LABEL[lang]} code editor`} />

      <div className={cn("border-t", light ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0b1220]")}>
        <div className="flex flex-wrap items-center gap-1 px-3 pt-2">
          <button type="button" className={chip(tab === "cases")} onClick={() => setTab("cases")}>{lang === "sql" ? "Schema" : "Test cases"}</button>
          <button type="button" className={chip(tab === "result")} onClick={() => setTab("result")}>Result</button>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={run} disabled={Boolean(busy)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold disabled:opacity-50", light ? "bg-slate-200 text-slate-900 hover:bg-slate-300" : "bg-white/10 text-white hover:bg-white/20")}><Play className="h-4 w-4" />Run</button>
            <button type="button" onClick={submit} disabled={Boolean(busy)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"><Send className="h-4 w-4" />Submit</button>
          </div>
        </div>

        <div className="max-h-72 min-h-40 overflow-auto px-3 py-3 text-sm" aria-live="polite">
          {busy ? <p className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p> : null}
          {!busy && error ? <p role="alert" className="flex items-start gap-2 text-rose-400"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p> : null}

          {!busy && !error && tab === "cases" ? (
            lang === "sql" ? (
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">{problem.schema?.split("\n").filter((l) => /^CREATE/i.test(l)).join("\n")}</pre>
            ) : (
              <div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {problem.examples.map((_, i) => <button key={i} type="button" className={chip(!useCustom && caseIdx === i)} onClick={() => { setUseCustom(false); setCaseIdx(i); }}>Case {i + 1}</button>)}
                  <button type="button" className={chip(useCustom)} onClick={() => setUseCustom(true)}>Custom input</button>
                </div>
                {useCustom ? (
                  <textarea aria-label="Custom input" value={custom} onChange={(e) => setCustom(e.target.value)} rows={4} className={cn("w-full rounded-lg border p-2 font-mono text-xs", light ? "border-slate-300 bg-white" : "border-white/10 bg-white/5 text-slate-100")} />
                ) : problem.examples[caseIdx] ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div><p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Input</p><pre className="overflow-auto rounded-lg bg-white/5 p-2 font-mono text-xs">{problem.examples[caseIdx].input}</pre></div>
                    <div><p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Expected output</p><pre className="overflow-auto rounded-lg bg-white/5 p-2 font-mono text-xs">{problem.examples[caseIdx].output}</pre></div>
                  </div>
                ) : null}
              </div>
            )
          ) : null}

          {!busy && !error && tab === "result" ? (
            !outcome ? <p className="text-slate-400">Run your code to see the result here.</p> :
            outcome.kind === "sql" ? (
              <div className="space-y-3">
                <p className={cn("text-base font-bold", verdictColor(outcome.mode === "run" ? null : outcome.verdict))}>
                  {outcome.mode === "run" ? (outcome.verdict === "ACCEPTED" ? "Your result matches the expected output" : outcome.error ? "Query error" : "Your result differs from the expected output") : VERDICT_TEXT[outcome.verdict]}
                  {outcome.xp ? <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300"><Zap className="h-3 w-3" />+{outcome.xp} XP</span> : null}
                </p>
                {outcome.error ? <pre className="whitespace-pre-wrap rounded-lg bg-rose-500/10 p-2 font-mono text-xs text-rose-300">{outcome.error}</pre> : null}
                <div className="grid gap-3 lg:grid-cols-2">
                  {outcome.result ? <SqlResultTable t={outcome.result} caption="Your output" /> : null}
                  {outcome.expected ? <SqlResultTable t={outcome.expected} caption="Expected output" /> : null}
                </div>
                {outcome.note ? <p className="text-xs text-slate-400">{outcome.note} {!loggedIn ? <Link href={`/login?next=/logiquest/coding/problems/${problem.slug}`} className="font-semibold text-sky-300">Log in</Link> : null}</p> : null}
              </div>
            ) : outcome.mode === "custom" ? (
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Output</p>
                {outcome.cases[0]?.timedOut ? <p className="text-rose-400">Time limit exceeded (4 s). Check for an infinite loop.</p> : null}
                {outcome.cases[0]?.error ? <pre className="mb-2 whitespace-pre-wrap rounded-lg bg-rose-500/10 p-2 font-mono text-xs text-rose-300">{outcome.cases[0].error}</pre> : null}
                <pre className="overflow-auto rounded-lg bg-white/5 p-2 font-mono text-xs">{outcome.customOutput || "(no output)"}</pre>
              </div>
            ) : (
              <div className="space-y-3">
                <p className={cn("flex flex-wrap items-center gap-2 text-base font-bold", verdictColor(outcome.verdict))}>
                  {outcome.verdict === "ACCEPTED" ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
                  {outcome.verdict ? VERDICT_TEXT[outcome.verdict] : ""}
                  <span className="text-sm font-semibold text-slate-400">{outcome.passed} / {outcome.total} {outcome.mode === "submit" ? "test cases passed" : "sample cases passed"}</span>
                  {outcome.xp ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300"><Zap className="h-3 w-3" />+{outcome.xp} XP</span> : null}
                </p>
                {outcome.cases.filter((c) => !c.passed || outcome.mode === "run").slice(0, outcome.mode === "run" ? 10 : 1).map((c) => (
                  <div key={c.index} className="rounded-xl border border-white/10 p-2.5">
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
                      {c.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <CircleAlert className="h-3.5 w-3.5 text-rose-400" />}
                      {outcome.mode === "submit" ? `Test ${c.index + 1}` : `Case ${c.index + 1}`}
                      <span className="ml-auto inline-flex items-center gap-1 text-slate-400"><Clock className="h-3 w-3" />{c.ms} ms</span>
                    </p>
                    {c.timedOut ? <p className="text-xs text-rose-400">Time limit exceeded (4 s).</p> : null}
                    {c.error ? <pre className="mb-2 whitespace-pre-wrap rounded-lg bg-rose-500/10 p-2 font-mono text-xs text-rose-300">{c.error}</pre> : null}
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[["Input", c.input], ["Your output", c.output || "(no output)"], ["Expected", c.expected]].map(([k, v]) => (
                        <div key={k} className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p><pre className="max-h-32 overflow-auto rounded-lg bg-white/5 p-2 font-mono text-xs">{v}</pre></div>
                      ))}
                    </div>
                  </div>
                ))}
                {outcome.note ? <p className="text-xs text-slate-400">{outcome.note} {!loggedIn ? <Link href={`/login?next=/logiquest/coding/problems/${problem.slug}`} className="font-semibold text-sky-300">Log in</Link> : null}</p> : null}
              </div>
            )
          ) : null}
        </div>
      </div>
      <div className={cn("flex items-center justify-end gap-1.5 border-t px-3 py-1.5 opacity-70", light ? "border-slate-200" : "border-white/10")}>
        <Image src="/myloginn-logo.png" alt="" width={16} height={16} className="h-4 w-4 object-contain" />
        <span className="text-[10px] font-semibold">MyLoginn IDE</span>
      </div>
    </div>
  );
}
