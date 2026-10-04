"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

export function LessonNextLink({ href, label, courseSlug, topicSlug, requiresCodeChallenge, initiallyUnlocked, initiallyCompleted }: { href: string; label: string; courseSlug: string; topicSlug: string; requiresCodeChallenge: boolean; initiallyUnlocked: boolean; initiallyCompleted: boolean }) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const unlock = (event: Event) => {
      const detail = (event as CustomEvent<{ topicSlug?: string; completed?: boolean }>).detail;
      if (detail?.topicSlug === topicSlug && detail.completed !== false) setCompleted(true);
      if (detail?.topicSlug === topicSlug) setUnlocked(true);
    };
    window.addEventListener("myloginn:topic-completed", unlock);
    return () => window.removeEventListener("myloginn:topic-completed", unlock);
  }, [topicSlug]);

  async function continueLesson(event: MouseEvent<HTMLAnchorElement>) {
    if (requiresCodeChallenge || completed) return;
    event.preventDefault();
    if (saving) return;
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
      router.push(href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save lesson progress.");
    } finally {
      setSaving(false);
    }
  }

  if (requiresCodeChallenge && !unlocked) return <span title="Pass the code challenge to unlock the next topic" aria-disabled="true" className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-3 text-sm font-semibold text-muted"><LockKeyhole className="h-4 w-4"/>Pass challenge to unlock</span>;
  return <div className="flex flex-col items-end gap-1"><Link href={href} onClick={continueLesson} aria-disabled={saving} className={`inline-flex items-center gap-2 rounded-full brand-gradient-bg px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] ${saving ? "cursor-wait opacity-70" : ""}`}>{saving ? "Saving progress…" : label}{saving ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <ArrowRight className="h-4 w-4"/>}</Link>{error && <p role="alert" className="max-w-64 text-right text-xs text-danger">{error}</p>}</div>;
}
