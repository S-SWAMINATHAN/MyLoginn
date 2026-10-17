import Link from "next/link";
import { BookOpen, ListChecks, Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SubjectMeta } from "@/lib/logiquest/catalog";

/** Exercise selector for a topic: Explanation & Formulas, each exercise, and the topic's online test. */
export function TopicTabs({ subject, topic, active, hasExplanation, exercises }: { subject: SubjectMeta; topic: string; active: string; hasExplanation: boolean; exercises: { slug: string; title: string; count: number }[] }) {
  const base = `/logiquest/${subject.slug}/${topic}`;
  const tab = (on: boolean) => cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors", on ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal");
  return (
    <nav aria-label="Exercises" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
      {hasExplanation ? <Link href={`${base}/formulas`} className={tab(active === "formulas")} aria-current={active === "formulas" ? "page" : undefined}><BookOpen className="h-4 w-4" />{subject.kind === "qa" ? "Introduction" : "Explanation & Formulas"}</Link> : null}
      {exercises.map((e) => (
        <Link key={e.slug} href={e.slug === "general" ? base : `${base}?ex=${e.slug}`} className={tab(active === e.slug)} aria-current={active === e.slug ? "page" : undefined}>
          <ListChecks className="h-4 w-4" />{e.title}<span className="text-xs opacity-75">({e.count})</span>
        </Link>
      ))}
      {subject.kind === "mcq" && exercises.some((e) => e.count) ? (
        <Link href={`/logiquest/online-test/${subject.slug}?topic=${topic}`} className={tab(false)}><Timer className="h-4 w-4" />Online Test</Link>
      ) : null}
    </nav>
  );
}
