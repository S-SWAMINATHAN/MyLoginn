"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, CheckCircle2, Clock, Lightbulb, Play, RotateCcw, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { DifficultyBadge } from "./ui";

type Example = { input: string; output: string; explanation?: string };
type CaseResult = { label: string; passed: boolean; hidden: boolean; verdict: string; timeMs: number };
type Report = {
  verdict: string; passed: number; total: number; timeMs: number; message: string | null; cases: CaseResult[];
  firstFailure: { input: string; expected: string; actual: string } | null;
  xpAwarded?: number; firstSolve?: boolean; streak?: number; streakBonus?: number; attemptNo?: number;
};
type Solution = {
  explanation?: string; approach?: string; algorithm?: string; timeComplexity?: string; spaceComplexity?: string;
  alternative?: string; edgeCases?: string; code?: Record<string, string>; lineByLine?: Record<string, string[]>;
};
type HistoryRow = { id: string; language: string; verdict: string; passed: number; total: number; timeMs: number | null; attemptNo: number; xpAwarded: number; createdAt: string };

export type WorkspaceProps = {
  slug: string; title: string; difficulty: string; topic: string; subtopic: string | null; style: string | null;
  statement: string; scenario: string | null; constraints: string | null; inputFormat: string | null; outputFormat: string | null;
  notes: string | null; examples: Example[]; estimatedMinutes: number; xp: number; languages: { id: string; label: string }[];
  starterCode: Record<string, string>; drafts: Record<string, string>; hintTotal: number; openedHints: string[];
  hasSolution: boolean; solved: boolean; attempts: number; note: string; bookmarked: boolean; successRate: number | null;
  attemptCount: number; unlockAttempts: number; history: HistoryRow[];
};

const VERDICT_TEXT: Record<string, string> = {
  ACCEPTED: "Accepted", WRONG_ANSWER: "Wrong answer", RUNTIME_ERROR: "Runtime error", TIME_LIMIT: "Time limit exceeded", COMPILE_ERROR: "Compilation error",
};
const TABS = ["Problem", "Hints", "Solution", "Submissions", "Notes"] as const;

async function post(url: string, body?: unknown, method = "POST") {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export function ChallengeWorkspace(p: WorkspaceProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Problem");
  const [lang, setLang] = useState(p.languages[0]?.id ?? "python");
  const [codes, setCodes] = useState<Record<string, string>>(() => ({ ...p.starterCode, ...p.drafts }));
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [report, setReport] = useState<(Report & { kind: "run" | "submit" }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>(p.openedHints);
  const [hintError, setHintError] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [solutionError, setSolutionError] = useState<string | null>(null);
  const [solved, setSolved] = useState(p.solved);
  const [attempts, setAttempts] = useState(p.attempts);
  const [history, setHistory] = useState(p.history);
  const [note, setNote] = useState(p.note);
  const [noteState, setNoteState] = useState<"saved" | "saving" | "idle">("idle");
  const [bookmarked, setBookmarked] = useState(p.bookmarked);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "idle">("idle");
  const [resumed] = useState(() => Object.keys(p.drafts).length > 0);
  const dirty = useRef<NodeJS.Timeout | null>(null);
  const noteTimer = useRef<NodeJS.Timeout | null>(null);

  const code = codes[lang] ?? "";

  // Autosave the draft per language, a moment after the learner stops typing.
  const queueSave = useCallback((language: string, source: string) => {
    if (dirty.current) clearTimeout(dirty.current);
    setSaveState("saving");
    dirty.current = setTimeout(async () => {
      const r = await post(`/api/logiquest/challenges/${p.slug}/save`, { type: "draft", language, source }, "PUT");
      setSaveState(r.ok ? "saved" : "idle");
    }, 1200);
  }, [p.slug]);
  useEffect(() => () => { if (dirty.current) clearTimeout(dirty.current); if (noteTimer.current) clearTimeout(noteTimer.current); }, []);

  function edit(value: string) {
    setCodes((c) => ({ ...c, [lang]: value }));
    queueSave(lang, value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = e.currentTarget;
    const { selectionStart: s, selectionEnd: en, value } = ta;
    const setValue = (v: string, caret: number) => {
      edit(v);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = caret; });
    };
    if (e.key === "Tab") {
      e.preventDefault();
      setValue(`${value.slice(0, s)}    ${value.slice(en)}`, s + 4);
    } else if (e.key === "Enter") {
      // Keep the current line's indentation; add a level after an opening bracket or colon.
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const line = value.slice(lineStart, s);
      const indent = /^\s*/.exec(line)?.[0] ?? "";
      const extra = /[{(\[:]\s*$/.test(line) ? "    " : "";
      const insert = `\n${indent}${extra}`;
      setValue(`${value.slice(0, s)}${insert}${value.slice(en)}`, s + insert.length);
    }
  }

  async function execute(kind: "run" | "submit") {
    setBusy(kind); setError(null);
    const r = await post(`/api/logiquest/challenges/${p.slug}/${kind}`, { language: lang, source: code });
    setBusy(null);
    if (!r.ok) { setReport(null); setError(r.json.error ?? "Your code could not be executed."); return; }
    setReport({ ...(r.json as Report), kind });
    if (kind === "submit") {
      const j = r.json as Report;
      setAttempts((a) => a + 1);
      if (j.verdict === "ACCEPTED") setSolved(true);
      setHistory((h) => [{ id: crypto.randomUUID(), language: lang, verdict: j.verdict, passed: j.passed, total: j.total, timeMs: j.timeMs, attemptNo: j.attemptNo ?? h.length + 1, xpAwarded: j.xpAwarded ?? 0, createdAt: new Date().toISOString() }, ...h]);
    }
  }

  async function showHint() {
    setHintError(null);
    const r = await post(`/api/logiquest/challenges/${p.slug}/hint`, { n: hints.length + 1 });
    if (!r.ok) { setHintError(r.json.error ?? "Could not load the hint."); return; }
    setHints((h) => [...h, r.json.hint as string]);
  }

  async function loadSolution() {
    setSolutionError(null);
    const r = await post(`/api/logiquest/challenges/${p.slug}/solution`);
    if (!r.ok) { setSolutionError(r.json.error ?? "Could not load the solution."); return; }
    setSolution(r.json.solution as Solution);
    setVideoUrl((r.json.videoUrl as string | null) ?? null);
  }

  async function toggleBookmark() {
    const r = await post(`/api/logiquest/challenges/${p.slug}/save`, { type: "bookmark", kind: "SAVED" }, "PUT");
    if (r.ok) setBookmarked(r.json.bookmarked);
  }

  function onNote(value: string) {
    setNote(value); setNoteState("saving");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      const r = await post(`/api/logiquest/challenges/${p.slug}/save`, { type: "note", body: value }, "PUT");
      setNoteState(r.ok ? "saved" : "idle");
    }, 1000);
  }

  function reset() {
    if (!window.confirm("Reset to the starter code? Your current code for this language will be replaced.")) return;
    edit(p.starterCode[lang] ?? "");
  }

  const lines = useMemo(() => Math.max(code.split("\n").length, 18), [code]);
  const solutionLocked = !solved && attempts < p.unlockAttempts;
  const stagePanel = "rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)]";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* LEFT: problem, hints, solution */}
      <section className={cn(stagePanel, "min-w-0 p-0")} aria-label="Problem">
        <div className="border-b border-border-soft p-5">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={p.difficulty} />
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">{p.topic}{p.subtopic ? ` · ${p.subtopic}` : ""}</span>
            {p.style ? <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">{p.style}</span> : null}
            {solved ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" />Solved</span> : null}
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold sm:text-2xl">{p.title}</h1>
            <button onClick={toggleBookmark} aria-pressed={bookmarked} aria-label={bookmarked ? "Remove bookmark" : "Bookmark this challenge"} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
              <Bookmark className={cn("h-5 w-5", bookmarked && "fill-brand-600 text-brand-600")} />
            </button>
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><dt className="sr-only">Estimated time</dt><dd>{p.estimatedMinutes} min</dd></div>
            <div><dt className="inline">XP </dt><dd className="inline font-semibold text-foreground">{p.xp}</dd></div>
            <div><dt className="inline">Attempts </dt><dd className="inline font-semibold text-foreground">{p.attemptCount}</dd></div>
            <div><dt className="inline">Success rate </dt><dd className="inline font-semibold text-foreground">{p.successRate === null ? "—" : `${p.successRate}%`}</dd></div>
          </dl>
        </div>

        <div role="tablist" aria-label="Challenge sections" className="flex gap-1 overflow-x-auto border-b border-border-soft px-3">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500", tab === t ? "border-brand-600 text-brand-700 dark:text-brand-200" : "border-transparent text-muted hover:text-foreground")}>{t}</button>
          ))}
        </div>

        <div role="tabpanel" className="space-y-5 p-5 text-sm leading-6">
          {tab === "Problem" && (<>
            <p className="whitespace-pre-line">{p.statement}</p>
            {p.scenario ? <Block title="Real-world scenario"><p className="whitespace-pre-line">{p.scenario}</p></Block> : null}
            {p.inputFormat ? <Block title="Input format"><p className="whitespace-pre-line">{p.inputFormat}</p></Block> : null}
            {p.outputFormat ? <Block title="Output format"><p className="whitespace-pre-line">{p.outputFormat}</p></Block> : null}
            {p.constraints ? <Block title="Constraints"><p className="whitespace-pre-line font-mono text-[13px]">{p.constraints}</p></Block> : null}
            {p.examples.map((ex, i) => (
              <Block key={i} title={`Example ${i + 1}`}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Pre label="Sample input">{ex.input}</Pre>
                  <Pre label="Sample output">{ex.output}</Pre>
                </div>
                {ex.explanation ? <p className="mt-2 text-muted">{ex.explanation}</p> : null}
              </Block>
            ))}
            {p.notes ? <Block title="Notes & edge cases"><p className="whitespace-pre-line">{p.notes}</p></Block> : null}
          </>)}

          {tab === "Hints" && (<>
            <p className="text-muted">Hints go from a gentle nudge to an implementation outline. Each hint you open reduces the XP for solving this challenge by 10% (up to 30%).</p>
            {hints.map((h, i) => <Block key={i} title={`Hint ${i + 1}`}><p>{h}</p></Block>)}
            {hints.length < p.hintTotal ? (
              <button onClick={showHint} className="inline-flex items-center gap-2 rounded-xl border border-border-soft px-4 py-2 font-semibold hover:bg-surface-2"><Lightbulb className="h-4 w-4" />Show hint {hints.length + 1} of {p.hintTotal}</button>
            ) : p.hintTotal === 0 ? <p className="text-muted">This challenge has no hints.</p> : <p className="text-muted">All hints shown.</p>}
            {hintError ? <p role="alert" className="text-rose-600">{hintError}</p> : null}
          </>)}

          {tab === "Solution" && (<>
            {!p.hasSolution ? <p className="text-muted">The official solution for this challenge is still being reviewed.</p> : solution ? (
              <SolutionView solution={solution} lang={lang} videoUrl={videoUrl} languages={p.languages} />
            ) : (<>
              <p className="text-muted">{solutionLocked ? `Try it first. The official solution unlocks after you solve this challenge or make ${p.unlockAttempts} attempts (${attempts}/${p.unlockAttempts} so far).` : "You can now view the official solution, the line-by-line explanation and the video."}</p>
              <button disabled={solutionLocked} onClick={loadSolution} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">View official solution</button>
              {solutionError ? <p role="alert" className="text-rose-600">{solutionError}</p> : null}
            </>)}
          </>)}

          {tab === "Submissions" && (
            history.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-xs">
                  <thead className="text-muted"><tr><th className="py-2 pr-3">#</th><th className="pr-3">When</th><th className="pr-3">Language</th><th className="pr-3">Result</th><th className="pr-3">Tests</th><th className="pr-3">Time</th><th>XP</th></tr></thead>
                  <tbody className="divide-y divide-border-soft">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 pr-3">{h.attemptNo}</td>
                        <td className="pr-3 whitespace-nowrap">{new Date(h.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                        <td className="pr-3">{p.languages.find((l) => l.id === h.language)?.label ?? h.language}</td>
                        <td className={cn("pr-3 font-semibold", h.verdict === "ACCEPTED" ? "text-emerald-600" : "text-rose-600")}>{VERDICT_TEXT[h.verdict] ?? h.verdict}</td>
                        <td className="pr-3">{h.passed}/{h.total}</td>
                        <td className="pr-3">{h.timeMs ?? "—"} ms</td>
                        <td>{h.xpAwarded ? `+${h.xpAwarded}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-muted">No submissions yet. Write your solution and press Submit.</p>
          )}

          {tab === "Notes" && (<>
            <label htmlFor="lq-note" className="font-semibold">My approach <span className="font-normal text-muted">(private — only you can see this)</span></label>
            <textarea id="lq-note" value={note} onChange={(e) => onNote(e.target.value)} rows={8} maxLength={5000} placeholder="My approach: use a hash map because…" className="w-full rounded-xl border border-border-soft bg-background p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500" />
            <p className="text-xs text-muted" aria-live="polite">{noteState === "saving" ? "Saving…" : noteState === "saved" ? "Saved" : ""}</p>
          </>)}
        </div>
      </section>

      {/* RIGHT: IDE + results */}
      <section className="min-w-0 space-y-4" aria-label="Code editor">
        <div className={cn(stagePanel, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border-soft p-3">
            <label htmlFor="lq-lang" className="sr-only">Language</label>
            <select id="lq-lang" value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-border-soft bg-background px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
              {p.languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <span className="text-xs text-muted" aria-live="polite">{saveState === "saving" ? "Saving draft…" : saveState === "saved" ? "Draft saved" : resumed && code === p.drafts[lang] ? "Continuing where you left off" : ""}</span>
            <div className="ml-auto flex gap-2">
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft px-3 py-2 text-sm font-semibold hover:bg-surface-2"><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span><span className="sr-only sm:hidden">Reset code</span></button>
              <button onClick={() => execute("run")} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft px-3 py-2 text-sm font-semibold hover:bg-surface-2 disabled:opacity-60"><Play className="h-4 w-4" />{busy === "run" ? "Running…" : "Run"}</button>
              <button onClick={() => execute("submit")} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"><Send className="h-4 w-4" />{busy === "submit" ? "Judging…" : "Submit"}</button>
            </div>
          </div>
          <div className="flex bg-surface-2/40 font-mono text-[13px] leading-6">
            <div aria-hidden className="select-none border-r border-border-soft px-3 py-3 text-right text-muted">
              {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              aria-label={`${p.languages.find((l) => l.id === lang)?.label ?? "Code"} editor`}
              value={code} onChange={(e) => edit(e.target.value)} onKeyDown={onKeyDown}
              spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off"
              style={{ height: `${lines * 24 + 24}px`, minHeight: 440, maxHeight: 640 }}
              className="w-full flex-1 resize-none overflow-auto bg-transparent px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <div className={cn(stagePanel, "p-5")} aria-live="polite">
          <h2 className="text-sm font-bold">Test results</h2>
          {busy ? <div className="mt-3 space-y-2" aria-busy><div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" /><div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" /><div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" /></div> : error ? (
            <div role="alert" className="mt-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
              <p className="font-semibold">Your code could not be executed.</p>
              <p className="mt-1">{error}</p>
              <p className="mt-1 text-xs opacity-80">Possible reason: the execution service is busy or you are sending requests too quickly. Wait a moment and retry.</p>
            </div>
          ) : report ? (
            <ReportView report={report} />
          ) : <p className="mt-2 text-sm text-muted">Run executes your code on the examples. Submit judges it on every test, including hidden ones.</p>}
        </div>
      </section>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>{children}</div>;
}
function Pre({ label, children }: { label: string; children: string }) {
  return <div><p className="mb-1 text-xs text-muted">{label}</p><pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-[13px] leading-5">{children}</pre></div>;
}

function ReportView({ report }: { report: Report & { kind: "run" | "submit" } }) {
  const ok = report.verdict === "ACCEPTED";
  return (
    <div className="mt-3 space-y-3">
      <div className={cn("rounded-xl p-4", ok ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20")}>
        <p className={cn("flex items-center gap-2 font-bold", ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
          {ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {report.kind === "run" && ok ? "Examples passed" : VERDICT_TEXT[report.verdict] ?? report.verdict}
        </p>
        <p className="mt-1 text-sm">{report.passed} / {report.total} test cases passed · {report.timeMs} ms</p>
        {report.kind === "submit" && report.firstSolve ? <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">+{report.xpAwarded} XP earned{report.streakBonus ? ` · +${report.streakBonus} streak bonus` : ""}{report.streak ? ` · 🔥 ${report.streak} day streak` : ""}</p> : null}
        {report.kind === "submit" && ok && !report.firstSolve ? <p className="mt-2 text-sm text-muted">Already solved — XP is only awarded for the first solve.</p> : null}
        {report.kind === "run" && ok ? <p className="mt-2 text-sm text-muted">Press Submit to judge against the hidden tests and earn XP.</p> : null}
      </div>
      {report.message ? <pre className="max-h-48 overflow-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-rose-700 dark:text-rose-300">{report.message}</pre> : null}
      {report.firstFailure ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <Pre label="Input">{report.firstFailure.input}</Pre>
          <Pre label="Expected">{report.firstFailure.expected}</Pre>
          <Pre label="Your output">{report.firstFailure.actual || "(no output)"}</Pre>
        </div>
      ) : null}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {report.cases.map((c, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5">{c.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}{c.label}</span>
            <span className="text-muted">{c.timeMs} ms</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolutionView({ solution, lang, videoUrl, languages }: { solution: Solution; lang: string; videoUrl: string | null; languages: { id: string; label: string }[] }) {
  const available = languages.filter((l) => solution.code?.[l.id]);
  const [shown, setShown] = useState(solution.code?.[lang] ? lang : available[0]?.id ?? lang);
  const src = solution.code?.[shown];
  const explained = solution.lineByLine?.[shown];
  return (
    <div className="space-y-5">
      {solution.explanation ? <Block title="Explanation"><p className="whitespace-pre-line">{solution.explanation}</p></Block> : null}
      {solution.approach ? <Block title="Approach"><p className="whitespace-pre-line">{solution.approach}</p></Block> : null}
      {solution.algorithm ? <Block title="Algorithm"><p className="whitespace-pre-line">{solution.algorithm}</p></Block> : null}
      {available.length ? (
        <Block title="Code">
          <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Solution language">
            {available.map((l) => <button key={l.id} role="tab" aria-selected={shown === l.id} onClick={() => setShown(l.id)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", shown === l.id ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "border-border-soft text-muted")}>{l.label}</button>)}
          </div>
          {src ? <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-[13px] leading-6">{src.split("\n").map((l, i) => <div key={i}><span aria-hidden className="mr-3 inline-block w-5 select-none text-right text-muted">{i + 1}</span>{l}</div>)}</pre> : null}
        </Block>
      ) : null}
      {explained?.length ? <Block title="Line-by-line explanation"><ol className="list-decimal space-y-1 pl-5">{explained.map((l, i) => <li key={i}>{l}</li>)}</ol></Block> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {solution.timeComplexity ? <Block title="Time complexity"><p className="font-mono">{solution.timeComplexity}</p></Block> : null}
        {solution.spaceComplexity ? <Block title="Space complexity"><p className="font-mono">{solution.spaceComplexity}</p></Block> : null}
      </div>
      {solution.alternative ? <Block title="Alternative approach"><p className="whitespace-pre-line">{solution.alternative}</p></Block> : null}
      {solution.edgeCases ? <Block title="Edge cases"><p className="whitespace-pre-line">{solution.edgeCases}</p></Block> : null}
      {videoUrl ? <Block title="Video explanation">{/\.(mp4|webm)(\?|$)/i.test(videoUrl) ? <video src={videoUrl} controls preload="none" className="w-full rounded-xl" /> : <Link href={videoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">Watch the video explanation</Link>}</Block> : null}
    </div>
  );
}
