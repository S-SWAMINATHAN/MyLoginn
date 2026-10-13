"use client";

import { useRef, useState } from "react";

const ACTIONS: { mode: string; label: string; needsText?: boolean }[] = [
  { mode: "explain", label: "Explain simply" },
  { mode: "example", label: "Show an example" },
  { mode: "practice", label: "Practice questions" },
  { mode: "quiz", label: "Practice quiz" },
  { mode: "interview", label: "Interview questions" },
  { mode: "next", label: "What next?" },
  { mode: "ask", label: "Ask a question", needsText: true },
  { mode: "hint", label: "Give me a hint", needsText: true },
  { mode: "debug", label: "Debug my code", needsText: true },
  { mode: "why_wrong", label: "Why is this wrong?", needsText: true },
  { mode: "walkthrough", label: "Explain this code", needsText: true },
];

/** AI Teaching Coach. Fully optional: if the service fails the lesson keeps working. */
export function CoachPanel({ courseSlug, lessonId }: { courseSlug: string; lessonId: string }) {
  void courseSlug;
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [level, setLevel] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  async function ask(mode: string, needsText?: boolean) {
    if (needsText && !message.trim() && !code.trim()) { setError("Type your question or paste your code first."); return; }
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true); setError(null); setAnswer("");
    try {
      const res = await fetch("/api/lms/coach", {
        method: "POST", signal: abort.current.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, mode, message, code, language, level: level || undefined }),
      });
      if (!res.ok || !res.body) { const json = await res.json().catch(() => ({})); setError(json.error ?? "The AI Coach is unavailable right now."); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) { const { done, value } = await reader.read(); if (done) break; setAnswer((a) => a + decoder.decode(value, { stream: true })); }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("The AI Coach is unavailable right now. Your lessons and quizzes still work.");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-story-royal/30 bg-story-mist p-5 sm:p-6" aria-labelledby="coach-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="coach-title" className="text-lg font-bold">AI Teaching Coach</h2>
        <div className="flex items-center gap-2 text-xs">
          <label className="sr-only" htmlFor="coach-lang">Language</label>
          <select id="coach-lang" value={language} onChange={(e) => setLanguage(e.target.value as "en" | "ta")} className="rounded-lg border border-border-soft bg-background px-2 py-1">
            <option value="en">English</option><option value="ta">தமிழ் (Tamil)</option>
          </select>
          <label className="sr-only" htmlFor="coach-level">Level</label>
          <select id="coach-level" value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-lg border border-border-soft bg-background px-2 py-1">
            <option value="">Course level</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">It explains from this lesson only. It can&apos;t see your marks or payments, and gives hints before answers.</p>
      <label htmlFor="coach-q" className="mt-4 block text-sm font-semibold">Your question or answer</label>
      <textarea id="coach-q" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={1500} className="mt-1 w-full rounded-xl border border-border-soft bg-background p-3 text-sm outline-none focus:border-story-royal" />
      <label htmlFor="coach-code" className="mt-3 block text-sm font-semibold">Code (optional)</label>
      <textarea id="coach-code" value={code} onChange={(e) => setCode(e.target.value)} rows={4} maxLength={4000} spellCheck={false} className="mt-1 w-full rounded-xl border border-border-soft bg-background p-3 font-mono text-xs outline-none focus:border-story-royal" />
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map((a) => <button key={a.mode} type="button" disabled={busy} onClick={() => ask(a.mode, a.needsText)} className="rounded-full border border-story-royal/40 bg-background px-3.5 py-1.5 text-xs font-semibold text-story-royal hover:bg-story-mist disabled:opacity-50">{a.label}</button>)}
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {(answer || busy) && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-background p-4 text-sm leading-6" aria-live="polite">{answer || "Thinking…"}</div>}
    </section>
  );
}
