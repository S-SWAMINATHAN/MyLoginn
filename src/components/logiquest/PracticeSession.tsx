"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { DifficultyBadge } from "./ui";

export type PracticeQuestion = { id: string; difficulty: string; topic: string; prompt: string; options: string[]; xp: number; answered: boolean };
type Result = { correct: boolean; correctIndex: number; explanation: string; xpAwarded: number; scored: boolean; streak: number; streakBonus: number };

/** One question at a time. Grading happens on the server; the correct option is never sent before an answer. */
export function PracticeSession({ questions, categoryLabel }: { questions: PracticeQuestion[]; categoryLabel: string }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState({ correct: 0, wrong: 0, xp: 0 });

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
    setTally((t) => ({ correct: t.correct + (json.correct ? 1 : 0), wrong: t.wrong + (json.correct ? 0 : 1), xp: t.xp + (json.xpAwarded ?? 0) }));
  }
  function next() { setIndex((i) => i + 1); setSelected(null); setResult(null); }

  if (done) {
    const total = tally.correct + tally.wrong;
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-center">
        <h2 className="text-xl font-bold">Session complete</h2>
        <p className="mt-2 text-muted">{tally.correct} of {total} correct{total ? ` · ${Math.round((tally.correct / total) * 100)}% accuracy` : ""} · +{tally.xp} XP</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Practice more</Link>
          <Link href="/logiquest" className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold">Back to LogiQuest</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="font-semibold">{categoryLabel} · Question {index + 1} of {questions.length}</span>
        <DifficultyBadge difficulty={q.difficulty} />
        <span>{q.topic}</span>
        <span className="ml-auto">{q.answered ? "Already attempted — no XP" : `${q.xp} XP`}</span>
      </div>
      <progress className="mb-5 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-surface-2 [&::-webkit-progress-value]:bg-brand-600" value={index} max={questions.length} aria-label="Session progress" />
      <p className="whitespace-pre-line text-lg font-semibold leading-7">{q.prompt}</p>
      <fieldset className="mt-5 space-y-2.5" disabled={result !== null || busy}>
        <legend className="sr-only">Answer options</legend>
        {q.options.map((opt, i) => {
          const isCorrect = result && i === result.correctIndex;
          const isWrongPick = result && i === selected && !result.correct;
          return (
            <label key={i} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition focus-within:outline focus-within:outline-2 focus-within:outline-brand-500",
              isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : isWrongPick ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20" : selected === i ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-border-soft hover:bg-surface-2")}>
              <input type="radio" name="option" checked={selected === i} onChange={() => setSelected(i)} className="mt-1 accent-[var(--brand-600)]" />
              <span className="flex-1">{opt}</span>
              {isCorrect ? <CheckCircle2 aria-label="Correct answer" className="h-5 w-5 text-emerald-600" /> : isWrongPick ? <XCircle aria-label="Your answer" className="h-5 w-5 text-rose-600" /> : null}
            </label>
          );
        })}
      </fieldset>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <div aria-live="polite">
        {result ? (
          <div className={cn("mt-5 rounded-xl p-4 text-sm", result.correct ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20")}>
            <p className="font-bold">{result.correct ? "Correct!" : "Not quite."} {result.xpAwarded ? `+${result.xpAwarded} XP` : ""}{result.streakBonus ? ` · +${result.streakBonus} streak bonus` : ""}</p>
            {!result.scored ? <p className="mt-1 text-xs text-muted">You have answered this before, so no XP this time.</p> : null}
            <p className="mt-2 whitespace-pre-line leading-6">{result.explanation}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex justify-end">
        {result ? <button onClick={next} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">{index + 1 === questions.length ? "Finish" : "Next question"}</button>
          : <button onClick={check} disabled={selected === null || busy} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">{busy ? "Checking…" : "Check answer"}</button>}
      </div>
    </div>
  );
}
