"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ListChecks, Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SubjectMeta } from "@/lib/logiquest/catalog";

/** Exercise selector for a topic: Explanation & Formulas, each exercise, and the topic's online test. A pill slides to the active tab. */
export function TopicTabs({ subject, topic, active, hasExplanation, exercises }: { subject: SubjectMeta; topic: string; active: string; hasExplanation: boolean; exercises: { slug: string; title: string; count: number }[] }) {
  const base = `/logiquest/${subject.slug}/${topic}`;
  const navRef = useRef<HTMLElement>(null);
  // On narrow screens the tabs scroll sideways: keep the active one in view.
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el && navRef.current && navRef.current.scrollWidth > navRef.current.clientWidth) navRef.current.scrollTo({ left: el.offsetLeft - 24, behavior: "smooth" });
  }, [active]);
  const tab = (on: boolean) => cn("relative inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors", on ? "text-white" : "text-muted hover:text-story-royal");
  const pill = <motion.span layoutId={`topic-tab-${subject.slug}-${topic}`} className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />;
  return (
    <nav ref={navRef} aria-label="Exercises" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto scroll-smooth rounded-full bg-story-mist p-1 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-28px),transparent)] max-sm:px-3">
      {hasExplanation ? (
        <Link href={`${base}/formulas`} className={tab(active === "formulas")} aria-current={active === "formulas" ? "page" : undefined}>
          {active === "formulas" && pill}
          <span className="relative inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{subject.kind === "qa" ? "Introduction" : <><span className="sm:hidden">Formulas</span><span className="hidden sm:inline">Explanation &amp; Formulas</span></>}</span>
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
