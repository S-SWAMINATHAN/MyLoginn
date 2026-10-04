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
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save lesson progress.");
      window.dispatchEvent(new CustomEvent("myloginn:topic-completed", { detail: { ...payload, topicSlug } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save lesson progress.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mb-4" aria-label="Topic progress">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
      <p className="text-xs font-semibold text-foreground">Course progress <span className="ml-1 font-normal text-muted">{completedCount} of {totalTopics} topics · {progress}%</span></p>
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${completed ? "text-emerald-700" : "text-muted"}`} role="status">
        {completed ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
        {completed ? requiresCodeChallenge ? "Challenge passed" : "Lesson completed" : requiresCodeChallenge ? "Pass the challenge to complete this topic" : "Review this lesson to complete the topic"}
      </span>
    </div>
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
    {!requiresCodeChallenge && !completed && <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={markLessonComplete} disabled={saving} className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving progress…" : "Mark lesson complete"}</button>{error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}</div>}
  </section>;
}
