"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";

type Props = {
  courseSlug: string;
  topicSlug: string;
  requiresCodeChallenge: boolean;
  initialCompleted: boolean;
  initialProgress: number;
  initialCount: number;
  totalTopics: number;
};

export function TopicProgressControl({ courseSlug, topicSlug, requiresCodeChallenge, initialCompleted, initialProgress, initialCount, totalTopics }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [progress, setProgress] = useState(initialProgress);
  const [completedCount, setCompletedCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function onTopicCompleted(event: Event) {
      const detail = (event as CustomEvent<{ topicSlug?: string; completed?: boolean; progress?: number; completedTopics?: number }>).detail;
      if (detail?.topicSlug !== topicSlug) return;
      setCompleted(detail.completed ?? true);
      if (typeof detail.progress === "number") setProgress(detail.progress);
      if (typeof detail.completedTopics === "number") setCompletedCount(detail.completedTopics);
    }
    window.addEventListener("myloginn:topic-completed", onTopicCompleted);
    return () => window.removeEventListener("myloginn:topic-completed", onTopicCompleted);
  }, [topicSlug]);

  async function markLessonComplete() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/topics/${encodeURIComponent(topicSlug)}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonComplete: true }),
      });
      const payload = await response.json().catch(() => ({} as Record<string, any>));
      if (!response.ok) throw new Error(payload.error || "Could not save lesson progress.");
      window.dispatchEvent(new CustomEvent("myloginn:topic-completed", { detail: { ...payload, topicSlug } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save lesson progress.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mb-4 rounded-2xl border border-border-soft bg-gradient-to-br from-surface to-brand-50/40 p-4 shadow-sm dark:to-brand-900/10 sm:rounded-none sm:border-0 sm:bg-none sm:p-0 sm:shadow-none" aria-label="Topic progress">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-1.5">
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:hidden">Course progress</p>
          <p className="text-sm font-bold leading-5 text-foreground sm:text-xs sm:font-semibold"><span className="hidden sm:inline">Course progress </span><span className="sm:ml-1 sm:font-normal sm:text-muted">{completedCount} of {totalTopics} topics<span className="hidden sm:inline"> · {progress}%</span></span></p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white sm:hidden">{progress}%</span>
      </div>
      <span className={`inline-flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium leading-5 sm:items-center sm:rounded-none sm:bg-transparent sm:p-0 ${completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10" : "bg-surface-2 text-muted"}`} role="status">
        {completed ? <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 sm:mt-0" /> : <Circle className="mt-[3px] h-3.5 w-3.5 shrink-0 sm:mt-0" />}
        {completed ? requiresCodeChallenge ? "Challenge passed" : "Lesson completed" : requiresCodeChallenge ? "Pass the challenge to complete this topic" : "Review this lesson to complete the topic"}
      </span>
    </div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2 sm:mt-2 sm:h-1"><div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
    {!requiresCodeChallenge && !completed && <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={markLessonComplete} disabled={saving} className="w-full rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold sm:w-auto sm:py-2 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving progress…" : "Mark lesson complete"}</button>{error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}</div>}
  </section>;
}
