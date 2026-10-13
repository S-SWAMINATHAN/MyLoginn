"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Q = { id: string; type: string; prompt: string; options: { id: string; text: string }[]; points: number };
type Started = { attemptId: string; kind: string; title: string; timeLimitMinutes: number | null; startedAt: string; passPercent: number; questions: Q[] };
type Result = {
  percent: number; passed: boolean; passPercent: number; pointsAwarded: number; message: string; certificateSerial: string | null;
  results: { id: string; correct: boolean; explanation: string | null; correctOptionIds?: string[] }[];
};

type Props = {
  quizId: string;
  label: string;
  /** Short note shown before starting (attempt rules, pass mark). */
  intro?: string;
  bestPercent?: number | null;
  passed?: boolean;
};

export function QuizRunner({ quizId, label, intro, bestPercent, passed }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState<Started | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const submitting = useRef(false);

  const submit = useCallback(async (auto = false) => {
    if (!started || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: started.attemptId, answers }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not submit your answers."); if (res.status === 410) setStarted(null); return; }
      setResult(json as Result);
      setStarted(null);
      router.refresh();
    } finally {
      submitting.current = false;
      setBusy(false);
      if (auto) setSecondsLeft(null);
    }
  }, [started, answers, quizId, router]);

  // Countdown for timed attempts; submits automatically at zero.
  useEffect(() => {
    if (!started?.timeLimitMinutes) { setSecondsLeft(null); return; }
    const end = new Date(started.startedAt).getTime() + started.timeLimitMinutes * 60_000;
    const tick = () => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) void submit(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [started, submit]);

  async function start() {
    setBusy(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}/start`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not start."); return; }
      setAnswers({});
      setStarted(json as Started);
    } finally { setBusy(false); }
  }

  function toggle(q: Q, optionId: string) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.type === "multiple") return { ...prev, [q.id]: current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId] };
      return { ...prev, [q.id]: [optionId] };
    });
  }

  const mm = secondsLeft !== null ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : null;

  if (result) {
    return (
      <section className="rounded-2xl border border-border-soft bg-surface p-5 sm:p-6" aria-live="polite">
        <p className={`text-3xl font-bold ${result.passed ? "text-success" : "text-danger"}`}>{result.percent}%</p>
        <p className="mt-1 font-semibold">{result.message}</p>
        {result.pointsAwarded > 0 && <p className="mt-1 text-sm text-muted">+{result.pointsAwarded} points</p>}
        {result.certificateSerial && <p className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Certificate unlocked. Serial {result.certificateSerial}.</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {result.results.filter((r) => r.explanation).map((r, i) => (
            <li key={r.id} className={`rounded-lg px-3 py-2 ${r.correct ? "bg-success/10" : "bg-danger/10"}`}>
              <span className="font-semibold">{r.correct ? "Correct" : "Review"}: </span>{r.explanation}<span className="sr-only"> (question {i + 1})</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={start} disabled={busy} className="mt-5 rounded-full border border-border-soft px-5 py-2 text-sm font-semibold hover:border-story-royal disabled:opacity-50">
          {result.passed ? "Retake for practice" : "Try again"}
        </button>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="rounded-2xl border border-story-royal/30 bg-story-mist p-5 sm:p-6">
        <h2 className="text-lg font-bold">{label}</h2>
        {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
        {bestPercent !== null && bestPercent !== undefined && <p className="mt-2 text-sm">Best score so far: <strong>{bestPercent}%</strong>{passed ? " (passed)" : ""}</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="button" onClick={start} disabled={busy} className="mt-4 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Starting…" : bestPercent !== null && bestPercent !== undefined ? "Start another attempt" : "Start"}</button>
      </section>
    );
  }

  const answered = started.questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
  return (
    <section className="rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{started.title}</h2>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-story-mist px-3 py-1 text-story-royal">{answered}/{started.questions.length} answered</span>
          {mm && <span className={`rounded-full px-3 py-1 ${secondsLeft! < 60 ? "bg-danger/10 text-danger" : "bg-story-mist text-story-royal"}`} role="timer">{mm}</span>}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">Pass mark {started.passPercent}%.</p>
      <ol className="mt-5 space-y-6">
        {started.questions.map((q, n) => (
          <li key={q.id}>
            <fieldset>
              <legend className="text-sm font-semibold leading-6">{n + 1}. {q.prompt}{q.type === "multiple" && <span className="ml-2 text-xs font-normal text-muted">(select all that apply)</span>}</legend>
              <div className="mt-2 grid gap-2">
                {q.options.map((o) => {
                  const on = (answers[q.id] ?? []).includes(o.id);
                  return (
                    <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${on ? "border-story-royal bg-story-mist" : "border-border-soft hover:border-story-royal/40"}`}>
                      <input type={q.type === "multiple" ? "checkbox" : "radio"} name={q.id} checked={on} onChange={() => toggle(q, o.id)} className="mt-1" />
                      <span>{o.text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      {error && <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <button type="button" onClick={() => submit()} disabled={busy} className="mt-6 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Submitting…" : "Submit answers"}</button>
    </section>
  );
}
