"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, ListChecks, Loader2, RotateCcw, Send, ShieldCheck, Trophy, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TestQuestion } from "@/lib/logiquest/bank";
import type { TestResult } from "@/lib/logiquest/tests";
import { FigTile } from "./Figure";
import { MediaView } from "./MediaView";
import { RichText } from "./RichText";
import { LETTERS } from "./QuestionCard";
import { TEST_MINUTES, TEST_SIZE } from "@/lib/logiquest/constants";

type Started = { token: string; minutes: number; startedAt: number; questions: TestQuestion[] };

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Countdown as a ring that drains, with the time left beside it. It turns amber, then red, as time runs low. */
function TimerRing({ left, total }: { left: number; total: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const frac = total ? Math.max(0, Math.min(1, left / total)) : 0;
  const color = left < 60 ? "#e11d48" : left < 300 ? "#d97706" : "var(--story-royal)";
  return (
    <span className="inline-flex items-center gap-2" role="timer" aria-live="off">
      <span className="relative grid h-10 w-10 place-items-center">
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" className="stroke-story-mist" />
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }} />
        </svg>
        <Clock className="relative h-4 w-4" style={{ color }} />
      </span>
      <span className={cn("font-mono text-lg font-bold tabular-nums", left < 60 ? "text-rose-600" : left < 300 ? "text-amber-600" : "text-story-navy dark:text-foreground")}>{mmss(left)}</span>
    </span>
  );
}

/** A timed online test: start → answer with a question palette → submit (or auto-submit) → score and review. */
export function TestRunner({ subject, topic, title, loggedIn, backHref }: { subject: string; topic: string | null; title: string; loggedIn: boolean; backHref: string }) {
  const [phase, setPhase] = useState<"intro" | "loading" | "running" | "submitting" | "done">("intro");
  const [test, setTest] = useState<Started | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [confirm, setConfirm] = useState(false);
  const submitted = useRef(false);

  async function start() {
    setPhase("loading"); setError(null);
    const r = await fetch("/api/logiquest/tests/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, topic }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (!r?.ok || !j) { setError(j?.error ?? "Could not start the test."); setPhase("intro"); return; }
    setTest(j); setAnswers(j.questions.map(() => -1)); setMarked(j.questions.map(() => false)); setCurrent(0);
    setLeft(j.minutes * 60); submitted.current = false; setResult(null); setPhase("running");
  }

  const submit = useCallback(async (finalAnswers: number[]) => {
    if (!test || submitted.current) return;
    submitted.current = true;
    setPhase("submitting"); setConfirm(false);
    const r = await fetch("/api/logiquest/tests/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: test.token, answers: finalAnswers }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (!r?.ok || !j) { submitted.current = false; setError(j?.error ?? "Could not submit. Check your connection and try again."); setPhase("running"); return; }
    setResult(j); setPhase("done"); window.scrollTo({ top: 0, behavior: "smooth" });
  }, [test]);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    if (phase !== "running" || !test) return;
    const deadline = test.startedAt + test.minutes * 60_000;
    const tick = () => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) void submit(answersRef.current);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, test, submit]);

  useEffect(() => {
    if (phase !== "running") return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  if (phase === "intro" || phase === "loading") {
    return (
      <div className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { Icon: ListChecks, k: `Up to ${TEST_SIZE}`, v: "random questions", c: "#2563eb" },
            { Icon: Clock, k: `${TEST_MINUTES} minutes`, v: "auto-submits at zero", c: "#d97706" },
            { Icon: ShieldCheck, k: "No negative", v: "marking", c: "#059669" },
          ].map(({ Icon, k, v, c }, i) => (
            <motion.div key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex items-center gap-3 rounded-2xl bg-story-mist p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c }}><Icon className="h-5 w-5" /></span>
              <span><span className="block text-base font-bold text-story-navy dark:text-foreground">{k}</span><span className="block text-xs text-muted">{v}</span></span>
            </motion.div>
          ))}
        </div>
        <h2 className="mt-6 text-lg font-bold">Instructions</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
          {[
            <>The test has up to <strong className="text-foreground">20 questions</strong> picked at random{topic ? " from this topic" : " from across the subject"}. You get <strong className="text-foreground">30 minutes</strong> (less for shorter tests).</>,
            <>Each correct answer scores 1 mark. There is no negative marking.</>,
            <>Use the question palette to jump between questions, and <em>Mark for review</em> to come back later.</>,
            <>The test submits automatically when the timer reaches zero.</>,
            <>After submitting you get your score, the correct answers and explanations for every question.</>,
            !loggedIn ? <>You are not logged in, so your result will not be saved and no XP is awarded.</> : <>Your result is saved to your history; your first test of the day on this {topic ? "topic" : "subject"} earns XP.</>,
          ].map((line, i) => (
            <li key={i} className="flex gap-2.5"><span aria-hidden className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-story-royal text-[9px] font-bold text-white">✓</span><span>{line}</span></li>
          ))}
        </ul>
        {error ? <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={start} disabled={phase === "loading"} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-7 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {phase === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}Start Test
          </button>
          {!loggedIn ? <Link href={`/login?next=${encodeURIComponent(backHref)}`} className="btn-sweep rounded-full border border-border-soft px-6 py-3 text-sm font-semibold">Log in first</Link> : null}
        </div>
      </div>
    );
  }

  if (phase === "done" && result) return <TestReport result={result} title={title} onRetake={start} backHref={backHref} />;
  if (!test) return null;

  const q = test.questions[current];
  const figOptions = q.media?.type === "figs" ? q.media.options : undefined;
  const answeredCount = answers.filter((a) => a >= 0).length;
  const setAnswer = (i: number) => setAnswers((a) => a.map((x, k) => (k === current ? (x === i ? -1 : i) : x)));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0 rounded-3xl border border-border-soft bg-surface p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-story-royal/10 px-3.5 py-1.5 font-bold text-story-royal">Question {current + 1} of {test.questions.length}</span>
          <span className="ml-auto"><TimerRing left={left} total={test.minutes * 60} /></span>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-story-mist" role="progressbar" aria-valuemin={0} aria-valuemax={test.questions.length} aria-valuenow={answeredCount} aria-label="Questions answered">
          <motion.div className="h-full rounded-full bg-story-royal" initial={false} animate={{ width: `${(answeredCount / test.questions.length) * 100}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            {q.passage ? <div className="mb-4 rounded-2xl bg-story-mist p-4 text-sm"><RichText text={q.passage} /></div> : null}
            {q.media && q.media.type !== "figs" ? <MediaView media={q.media} /> : null}
            <RichText text={q.q} className="text-base font-medium text-story-navy dark:text-foreground" />
            {q.media?.type === "figs" ? <MediaView media={q.media} /> : null}

            <div role="radiogroup" aria-label="Options" className={cn("mt-4", figOptions ? "flex flex-wrap gap-3" : "grid gap-2")}>
              {(figOptions ?? q.o).map((opt, i) => {
                const on = answers[current] === i;
                return (
                  <motion.button key={i} role="radio" aria-checked={on} onClick={() => setAnswer(i)} whileTap={{ scale: 0.99 }} className={cn("flex items-start gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-sm transition-colors", on ? "border-story-royal bg-story-royal/[0.07]" : "border-border-soft hover:border-story-royal/50")}>
                    {typeof opt === "string" ? (
                      <>
                        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors", on ? "bg-story-royal text-white" : "bg-story-mist text-story-royal")}>{LETTERS[i]}</span>
                        <span className="min-w-0 flex-1 pt-0.5"><RichText text={opt} className="leading-6" /></span>
                      </>
                    ) : <FigTile fig={opt} label={LETTERS[i]} size={72} />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-sweep inline-flex items-center gap-1 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
          <button onClick={() => setMarked((m) => m.map((x, k) => (k === current ? !x : x)))} className={cn("inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors", marked[current] ? "bg-violet-500/15 text-violet-700 dark:text-violet-300" : "border border-border-soft hover:border-violet-400 hover:text-violet-600")}><Flag className="h-4 w-4" />{marked[current] ? "Marked" : "Mark for review"}</button>
          {current < test.questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="ml-auto inline-flex items-center gap-1 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white">Next<ChevronRight className="h-4 w-4" /></button>
          ) : (
            <button onClick={() => setConfirm(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"><Send className="h-4 w-4" />Submit test</button>
          )}
        </div>
      </div>

      <aside className="h-max rounded-3xl border border-border-soft bg-surface p-4 lg:sticky lg:top-32">
        <p className="text-sm font-bold">Question palette</p>
        <p className="mt-0.5 text-xs text-muted">{answeredCount} of {test.questions.length} answered</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {test.questions.map((_, i) => (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => setCurrent(i)} aria-label={`Question ${i + 1}${answers[i] >= 0 ? ", answered" : ""}${marked[i] ? ", marked" : ""}`} className={cn("relative grid h-9 place-items-center rounded-xl text-xs font-bold transition-colors", i === current && "ring-2 ring-story-royal ring-offset-1 ring-offset-surface", answers[i] >= 0 ? "bg-emerald-500 text-white" : "bg-story-mist text-muted hover:text-story-royal")}>
              {i + 1}
              {marked[i] ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-violet-500" /> : null}
            </motion.button>
          ))}
        </div>
        <ul className="mt-3 space-y-1 text-[11px] text-muted">
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500" />Answered</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-story-mist ring-1 ring-border-soft" />Not answered</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500" />Marked for review</li>
        </ul>
        <button onClick={() => setConfirm(true)} disabled={phase === "submitting"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60">
          {phase === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Submit test
        </button>
      </aside>

      <AnimatePresence>
        {confirm ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={() => setConfirm(false)}>
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }} className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-[var(--shadow-lift)]" onClick={(e) => e.stopPropagation()}>
              <h3 id="confirm-title" className="flex items-center gap-2 text-lg font-bold"><AlertTriangle className="h-5 w-5 text-amber-500" />Submit the test?</h3>
              <p className="mt-2 text-sm text-muted">You have answered {answeredCount} of {test.questions.length} questions{marked.some(Boolean) ? ` and marked ${marked.filter(Boolean).length} for review` : ""}. You cannot change answers after submitting.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirm(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-story-royal">Keep going</button>
                <button onClick={() => submit(answers)} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TestReport({ result, title, onRetake, backHref }: { result: TestResult; title: string; onRetake: () => void; backHref: string }) {
  const [filter, setFilter] = useState<"all" | "wrong" | "skipped" | "correct">("all");
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const shown = useMemo(() => result.items.map((it, i) => ({ it, i })).filter(({ it }) => filter === "all" || (filter === "correct" ? it.correct : filter === "wrong" ? it.selected >= 0 && !it.correct : it.selected < 0)), [result, filter]);
  const R = 52, C = 2 * Math.PI * R;
  const verdict = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good work" : pct >= 40 ? "Keep practising" : "Revise and retry";

  return (
    <div>
      <div className="grid gap-6 rounded-3xl border border-border-soft bg-surface p-6 sm:grid-cols-[auto_1fr] sm:p-8">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-story-mist" />
            <motion.circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" strokeLinecap="round" stroke="var(--story-royal)" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 1.1, ease: "easeOut" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div><p className="text-3xl font-bold tabular-nums">{result.correct}/{result.total}</p><p className="text-xs font-semibold text-muted">{pct}%</p></div>
          </div>
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-500" />{verdict}</h2>
          <p className="mt-1 text-sm text-muted">{title} · time taken {mmss(result.timeTakenS)}</p>
          {result.late ? <p className="mt-2 text-sm text-rose-600">This test was submitted after the time limit, so answers were not counted.</p> : null}
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-emerald-500/10 p-3"><dt className="text-xs text-muted">Correct</dt><dd className="text-xl font-bold text-emerald-600">{result.correct}</dd></div>
            <div className="rounded-2xl bg-rose-500/10 p-3"><dt className="text-xs text-muted">Wrong</dt><dd className="text-xl font-bold text-rose-600">{result.wrong}</dd></div>
            <div className="rounded-2xl bg-story-mist p-3"><dt className="text-xs text-muted">Not answered</dt><dd className="text-xl font-bold">{result.unanswered}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            {result.xpAwarded ? <span className="mr-2 inline-flex items-center gap-1 font-semibold text-amber-600"><Zap className="h-3.5 w-3.5" />+{result.xpAwarded} XP</span> : null}
            {result.saved ? "Saved to your test history." : "Log in to save results and earn XP."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onRetake} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white"><RotateCcw className="h-4 w-4" />Take another test</button>
            <Link href={backHref} className="rounded-full border border-border-soft px-5 py-2 text-sm font-semibold hover:border-story-royal hover:text-story-royal">Back to topics</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-lg font-bold">Review answers</h3>
        {(["all", "wrong", "skipped", "correct"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize", filter === f ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal")}>{f === "skipped" ? "Not answered" : f}</button>
        ))}
      </div>
      <ol className="mt-4 space-y-4">
        {shown.map(({ it, i }) => {
          const figOptions = it.media?.type === "figs" ? it.media.options : undefined;
          return (
            <li key={it.id} className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                <span className="text-story-royal">Q{i + 1}.</span>
                {it.correct ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" />Correct</span> : it.selected < 0 ? <span className="text-muted">Not answered</span> : <span className="inline-flex items-center gap-1 text-rose-600"><XCircle className="h-4 w-4" />Wrong</span>}
                <Link href={`/logiquest/q/${it.id}`} className="ml-auto font-semibold text-story-royal hover:underline">Discuss</Link>
              </div>
              {it.passage ? <div className="mb-3 rounded-xl bg-story-mist p-3 text-sm"><RichText text={it.passage} /></div> : null}
              {it.media && it.media.type !== "figs" ? <MediaView media={it.media} /> : null}
              <RichText text={it.q} className="font-medium" />
              {it.media?.type === "figs" ? <MediaView media={it.media} /> : null}
              {figOptions ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {figOptions.map((f, k) => <div key={k} className={cn("rounded-xl border-2 p-1", k === it.a ? "border-emerald-500" : k === it.selected ? "border-rose-500" : "border-transparent")}><FigTile fig={f} label={LETTERS[k]} size={64} /></div>)}
                </div>
              ) : (
                <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                  {it.o.map((o, k) => (
                    <li key={k} className={cn("flex gap-2 rounded-lg border px-3 py-2", k === it.a ? "border-emerald-500 bg-emerald-500/10" : k === it.selected ? "border-rose-500 bg-rose-500/10" : "border-border-soft")}>
                      <span className="font-bold">{LETTERS[k]}.</span><RichText text={o} className="leading-6" />
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-3 rounded-xl bg-story-mist/70 p-3 text-sm">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Answer: Option {LETTERS[it.a]}{it.selected >= 0 && !it.correct ? <span className="ml-2 font-semibold text-rose-600">· You chose {LETTERS[it.selected]}</span> : null}</p>
                {it.e ? <><p className="mt-2 font-bold">Explanation:</p><RichText text={it.e} /></> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
