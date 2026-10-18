"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, CheckCircle2, Lightbulb, Lock, ScrollText } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CodeLang, PublicProblem } from "@/lib/logiquest/coding/types";
import { RichText } from "../RichText";

const IdePane = dynamic(() => import("./IdePane").then((m) => m.IdePane), {
  ssr: false,
  loading: () => <div className="grid min-h-[38rem] place-items-center rounded-2xl bg-[#0f172a] text-sm text-slate-400">Loading the MyLoginn IDE…</div>,
});

const DIFF: Record<string, string> = { Easy: "text-emerald-600 bg-emerald-500/10", Medium: "text-amber-600 bg-amber-500/10", Hard: "text-rose-600 bg-rose-500/10" };
export type SqlPreview = { name: string; columns: string[]; rows: string[][] };

/** Problem statement (left) and the MyLoginn IDE (right), LeetCode style. */
export function CodingWorkspace({ problem, loggedIn, solved: solvedInitially, attempts: attemptsInitially, drafts, tables }: {
  problem: PublicProblem; loggedIn: boolean; solved: boolean; attempts: number; drafts: Partial<Record<CodeLang, string>>; tables?: SqlPreview[];
}) {
  const [tab, setTab] = useState<"desc" | "hints" | "solution">("desc");
  const [solved, setSolved] = useState(solvedInitially);
  const [attempts, setAttempts] = useState(attemptsInitially);
  const [shownHints, setShownHints] = useState(1);
  const unlocked = solved || attempts >= 3;
  const tabBtn = (on: boolean) => cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors", on ? "bg-story-royal text-white" : "text-muted hover:text-story-royal");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="flex min-h-[38rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="flex flex-wrap gap-1 border-b border-border-soft p-2">
          <button type="button" className={tabBtn(tab === "desc")} onClick={() => setTab("desc")}><BookOpen className="h-4 w-4" />Description</button>
          <button type="button" className={tabBtn(tab === "hints")} onClick={() => setTab("hints")}><Lightbulb className="h-4 w-4" />Hints</button>
          <button type="button" className={tabBtn(tab === "solution")} onClick={() => setTab("solution")}>{unlocked ? <ScrollText className="h-4 w-4" /> : <Lock className="h-4 w-4" />}Solution</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5 text-[15px]">
          {tab === "desc" ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", DIFF[problem.difficulty])}>{problem.difficulty}</span>
                {solved ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Solved</span> : null}
                {problem.tags.map((t) => <span key={t} className="rounded-full bg-story-mist px-2.5 py-0.5 text-xs font-semibold text-muted">{t}</span>)}
              </div>
              <RichText text={problem.statement} className="mt-4" />
              {problem.kind === "sql" && tables?.length ? (
                <div className="mt-4 space-y-4">
                  {tables.map((t) => (
                    <div key={t.name}>
                      <p className="mb-1 font-mono text-sm font-bold">{t.name}</p>
                      <div className="overflow-x-auto rounded-xl border border-border-soft">
                        <table className="w-full min-w-max text-left text-xs">
                          <thead className="bg-story-mist"><tr>{t.columns.map((c) => <th key={c} className="px-2.5 py-1.5 font-semibold">{c}</th>)}</tr></thead>
                          <tbody>{t.rows.map((r, i) => <tr key={i} className="border-t border-border-soft">{r.map((v, j) => <td key={j} className="px-2.5 py-1 font-mono">{v}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted">Your query runs on a fresh copy of these tables (SQLite). Column names in your result do not need to match.</p>
                </div>
              ) : null}
              {problem.kind === "io" ? (
                <>
                  <h3 className="mt-5 font-bold">Input format</h3><RichText text={problem.inputFormat ?? ""} className="mt-1 text-sm" />
                  <h3 className="mt-4 font-bold">Output format</h3><RichText text={problem.outputFormat ?? ""} className="mt-1 text-sm" />
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="mt-4">
                      <h3 className="font-bold">Example {i + 1}</h3>
                      <div className="mt-1 rounded-xl border-l-4 border-story-royal/40 bg-story-mist p-3 font-mono text-[13px]">
                        <p className="font-sans text-xs font-bold text-muted">Input</p><pre className="whitespace-pre-wrap">{ex.input}</pre>
                        <p className="mt-2 font-sans text-xs font-bold text-muted">Output</p><pre className="whitespace-pre-wrap">{ex.output}</pre>
                        {ex.explanation ? <p className="mt-2 font-sans text-sm"><span className="font-bold">Explanation: </span>{ex.explanation}</p> : null}
                      </div>
                    </div>
                  ))}
                  <h3 className="mt-5 font-bold">Constraints</h3><RichText text={problem.constraints ?? ""} className="mt-1 text-sm" />
                  <p className="mt-4 text-xs text-muted">Read input from standard input and print the answer to standard output. Your code is judged against {problem.testCount} test cases, most of them hidden.</p>
                </>
              ) : null}
            </div>
          ) : tab === "hints" ? (
            <ol className="space-y-3">
              {problem.hints.slice(0, shownHints).map((h, i) => <li key={i} className="rounded-xl bg-story-mist p-3"><span className="mr-2 font-bold text-story-royal">Hint {i + 1}.</span>{h}</li>)}
              {shownHints < problem.hints.length ? <button type="button" onClick={() => setShownHints((n) => n + 1)} className="rounded-full border border-border-soft px-4 py-1.5 text-sm font-semibold hover:border-story-royal hover:text-story-royal">Show next hint</button> : null}
            </ol>
          ) : unlocked ? (
            <div>
              <h3 className="font-bold">Approach</h3>
              <RichText text={problem.editorial} className="mt-1" />
              {Object.entries(problem.solution).map(([lang, src]) => (
                <div key={lang} className="mt-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{lang === "sql" ? "SQL" : lang === "python" ? "Python 3" : "JavaScript"} reference solution</p>
                  <pre className="overflow-x-auto rounded-xl bg-[#0b1220] p-4 font-mono text-[13px] leading-6 text-slate-100">{src}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-16 text-center">
              <Lock className="h-8 w-8 text-muted" />
              <p className="mt-3 font-semibold">The solution unlocks after you solve the problem or make 3 submissions.</p>
              <p className="mt-1 text-sm text-muted">Try the hints first — you will learn more by getting there yourself.</p>
            </div>
          )}
        </div>
      </section>

      <IdePane problem={problem} loggedIn={loggedIn} drafts={drafts} onJudged={(r) => { if (r.submitted) setAttempts((a) => a + 1); if (r.accepted) setSolved(true); }} />
    </div>
  );
}
