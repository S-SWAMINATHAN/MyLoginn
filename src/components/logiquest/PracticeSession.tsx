"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, RotateCcw, Trophy, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DifficultyBadge } from "./ui";

export type PracticeQuestion = { id: string; difficulty: string; topic: string; prompt: string; options: string[]; xp: number; answered: boolean };
type Result = { correct: boolean; correctIndex: number; explanation: string; xpAwarded: number; scored: boolean; streak: number; streakBonus: number };

const EASE = [0.22, 1, 0.36, 1] as const;
const LETTERS = "ABCDEFGH";

/** One question at a time. Grading happens on the server; the correct option is never sent before an answer. */
export function PracticeSession({ questions, categoryLabel }: { questions: PracticeQuestion[]; categoryLabel: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState({ correct: 0, wrong: 0, xp: 0 });
  const [outcomes, setOutcomes] = useState<boolean[]>([]);

  const q = questions[index];
  const done = index >= questions.length;

  async function check() {
    if (selected === null || !q) return;
    setBusy(true); setError(null);
    const res = await fetch(`/api/logiquest/questions/${q.id}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selected }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(json.error ?? "Could not check your answer."); return; }
    setResult(json as Result);
    setOutcomes((o) => [...o, Boolean(json.correct)]);
    setTally((t) => ({ correct: t.correct + (json.correct ? 1 : 0), wrong: t.wrong + (json.correct ? 0 : 1), xp: t.xp + (json.xpAwarded ?? 0) }));
  }
  function next() { setIndex((i) => i + 1); setSelected(null); setResult(null); }

  if (done) {
    const total = tally.correct + tally.wrong;
    const pct = total ? Math.round((tally.correct / total) * 100) : 0;
    const R = 52;
    const C = 2 * Math.PI * R;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASE }} className="rounded-3xl border border-border-soft bg-surface p-6 text-center sm:p-8">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-story-mist" />
            <motion.circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" strokeLinecap="round" stroke="var(--story-royal)" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div><p className="text-3xl font-bold tabular-nums text-story-navy dark:text-foreground">{pct}%</p><p className="text-[11px] font-semibold text-muted">accuracy</p></div>
          </div>
        </div>
        <h2 className="mt-5 flex items-center justify-center gap-2 text-xl font-bold text-story-navy dark:text-foreground"><Trophy className="h-5 w-5 text-amber-500" />Session complete</h2>
        <p className="mt-2 text-muted">{tally.correct} of {total} correct · <span className="font-bold text-story-royal">+{tally.xp} XP</span></p>
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          {outcomes.map((ok, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 400, damping: 16 }} className={cn("h-2.5 w-2.5 rounded-full", ok ? "bg-emerald-500" : "bg-rose-500")} />)}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95"><RotateCcw className="h-4 w-4" />Practice more</button>
          <Link href="/logiquest" className="rounded-full border border-border-soft px-6 py-2.5 text-sm font-semibold transition-all hover:border-story-royal hover:text-story-royal active:scale-95">Back to LogiQuest</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-story-royal/10 px-3 py-1 font-bold text-story-royal">{categoryLabel} · {index + 1} / {questions.length}</span>
        <DifficultyBadge difficulty={q.difficulty} />
        <span>{q.topic}</span>
        <span className="ml-auto inline-flex items-center gap-1 font-semibold">{q.answered ? "Already attempted · no XP" : <><Zap className="h-3.5 w-3.5 text-amber-500" />{q.xp} XP</>}</span>
      </div>

      <div className="mb-6 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} aria-label="Session progress">
        {questions.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-story-mist">
            <motion.span
              className={cn("block h-full rounded-full", outcomes[i] === false ? "bg-rose-500" : outcomes[i] ? "bg-emerald-500" : "bg-story-royal")}
              initial={false}
              animate={{ width: i < outcomes.length ? "100%" : i === index ? "35%" : "0%" }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={index} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.3, ease: EASE }}>
          <p className="whitespace-pre-line text-lg font-bold leading-7 text-story-navy sm:text-xl dark:text-foreground">{q.prompt}</p>
          <fieldset className="mt-5 space-y-2.5" disabled={result !== null || busy}>
            <legend className="sr-only">Answer options</legend>
            {q.options.map((opt, i) => {
              const isCorrect = result && i === result.correctIndex;
              const isWrongPick = result && i === selected && !result.correct;
              const chosen = selected === i && !result;
              return (
                <motion.label
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, x: isWrongPick && !reduced ? [0, -7, 7, -5, 5, 0] : 0 }}
                  transition={{ delay: result ? 0 : i * 0.06, duration: isWrongPick ? 0.4 : 0.3 }}
                  whileHover={result ? undefined : { x: 4 }}
                  whileTap={result ? undefined : { scale: 0.99 }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm transition-colors focus-within:border-story-royal",
                    isCorrect ? "border-emerald-500 bg-emerald-500/10" : isWrongPick ? "border-rose-500 bg-rose-500/10" : chosen ? "border-story-royal bg-story-royal/[0.07]" : "border-border-soft hover:border-story-royal/50",
                    result && !isCorrect && !isWrongPick && "opacity-60"
                  )}
                >
                  <span aria-hidden className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors", isCorrect ? "bg-emerald-500 text-white" : isWrongPick ? "bg-rose-500 text-white" : chosen ? "bg-story-royal text-white" : "bg-story-mist text-story-royal")}>{LETTERS[i] ?? i + 1}</span>
                  <input type="radio" name="option" checked={selected === i} onChange={() => setSelected(i)} className="sr-only" />
                  <span className="flex-1 font-medium">{opt}</span>
                  {isCorrect ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 15 }}><CheckCircle2 aria-label="Correct answer" className="h-5 w-5 text-emerald-600" /></motion.span> : isWrongPick ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 15 }}><XCircle aria-label="Your answer" className="h-5 w-5 text-rose-600" /></motion.span> : null}
                </motion.label>
              );
            })}
          </fieldset>
        </motion.div>
      </AnimatePresence>

      {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <div aria-live="polite">
        <AnimatePresence>
          {result ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
              <div className={cn("mt-5 rounded-2xl p-4 text-sm", result.correct ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                <p className={cn("font-bold", result.correct ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300")}>{result.correct ? "Correct!" : "Not quite."} {result.xpAwarded ? `+${result.xpAwarded} XP` : ""}{result.streakBonus ? ` · +${result.streakBonus} streak bonus` : ""}</p>
                {!result.scored ? <p className="mt-1 text-xs text-muted">You have answered this before, so no XP this time.</p> : null}
                <p className="mt-2 whitespace-pre-line leading-6">{result.explanation}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex justify-end">
        {result ? (
          <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={next} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(31,86,214,0.8)]">{index + 1 === questions.length ? "Finish" : "Next question"}<ArrowRight className="h-4 w-4" /></motion.button>
        ) : (
          <motion.button whileHover={selected === null ? undefined : { y: -2 }} whileTap={{ scale: 0.96 }} onClick={check} disabled={selected === null || busy} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(31,86,214,0.8)] disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Checking…" : "Check answer"}</motion.button>
        )}
      </div>
    </div>
  );
}
