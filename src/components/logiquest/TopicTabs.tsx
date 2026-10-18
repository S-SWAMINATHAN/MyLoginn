"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ListChecks, Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SubjectMeta } from "@/lib/logiquest/catalog";

/** Exercise selector for a topic: Explanation & Formulas, each exercise, and the topic's online test. A pill slides to the active tab. */
export function TopicTabs({ subject, topic, active, hasExplanation, exercises }: { subject: SubjectMeta; topic: string; active: string; hasExplanation: boolean; exercises: { slug: string; title: string; count: number }[] }) {
  const base = `/logiquest/${subject.slug}/${topic}`;
  const tab = (on: boolean) => cn("relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors", on ? "text-white" : "text-muted hover:text-story-royal");
  const pill = <motion.span layoutId={`topic-tab-${subject.slug}-${topic}`} className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />;
  return (
    <nav aria-label="Exercises" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
      {hasExplanation ? (
        <Link href={`${base}/formulas`} className={tab(active === "formulas")} aria-current={active === "formulas" ? "page" : undefined}>
          {active === "formulas" && pill}
          <span className="relative inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{subject.kind === "qa" ? "Introduction" : "Explanation & Formulas"}</span>
        </Link>
      ) : null}
      {exercises.map((e) => (
        <Link key={e.slug} href={e.slug === "general" ? base : `${base}?ex=${e.slug}`} className={tab(active === e.slug)} aria-current={active === e.slug ? "page" : undefined}>
          {active === e.slug && pill}
          <span className="relative inline-flex items-center gap-1.5"><ListChecks className="h-4 w-4" />{e.title}<span className="text-xs opacity-75">({e.count})</span></span>
        </Link>
      ))}
      {subject.kind === "mcq" && exercises.some((e) => e.count) ? (
        <Link href={`/logiquest/online-test/${subject.slug}?topic=${topic}`} className={tab(false)}><span className="relative inline-flex items-center gap-1.5"><Timer className="h-4 w-4" />Online Test</span></Link>
      ) : null}
    </nav>
  );
}
