"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Puzzle, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SUBJECT_ICON } from "./subjectStyle";

export type NavTopic = { slug: string; title: string; count: number; answered?: number };

/**
 * Topic navigator shown beside a topic page: the subject with its progress, then every topic as a numbered tile
 * (a tick once finished). The current topic is highlighted and scrolled into view; long lists get a filter box.
 */
export function TopicNav({ subject, subjectTitle, topics, current, color }: { subject: string; subjectTitle: string; topics: NavTopic[]; current: string; color: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const listRef = useRef<HTMLUListElement>(null);
  const Icon = SUBJECT_ICON[subject] ?? Puzzle;

  const rows = useMemo(() => topics.map((t, n) => ({ t, n })).filter(({ t }) => !q || t.title.toLowerCase().includes(q)), [topics, q]);
  const finished = topics.filter((t) => t.count > 0 && (t.answered ?? 0) >= t.count).length;
  const started = topics.some((t) => (t.answered ?? 0) > 0);
  const pct = topics.length ? Math.round((finished / topics.length) * 100) : 0;

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: "center" });
  }, [current]);

  return (
    <div style={{ "--c": color } as React.CSSProperties} className="rounded-3xl border border-border-soft bg-surface p-3 text-sm lg:sticky lg:top-32">
      <Link href={`/logiquest/${subject}`} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-story-mist">
        <span className="grid h-11 w-11 shrink-0 place-items-center text-story-royal"><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold leading-tight text-story-navy dark:text-foreground">{subjectTitle}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-muted"><ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />All {topics.length} topics</span>
        </span>
      </Link>

      {started ? (
        <div className="mx-2 mb-2 mt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted"><span>{finished} of {topics.length} topics done</span><span className="text-[var(--c)]">{pct}%</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)]"><motion.div className="h-full rounded-full bg-[var(--c)]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} /></div>
        </div>
      ) : null}

      {topics.length > 8 ? (
        <label className="relative mx-1 mb-2 flex items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted" aria-hidden />
          <span className="sr-only">Filter topics</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter topics" className="w-full rounded-full bg-story-mist py-2 pl-9 pr-8 text-[13px] outline-none transition-shadow placeholder:text-muted focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--c)_16%,transparent)]" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2 grid h-5 w-5 place-items-center rounded-full text-muted hover:text-story-royal"><X className="h-3 w-3" /></button> : null}
        </label>
      ) : null}

      <ul ref={listRef} className="max-h-[calc(100vh-17rem)] space-y-0.5 overflow-y-auto pr-0.5">
        {rows.map(({ t, n }) => {
          const on = t.slug === current;
          const done = t.count > 0 && (t.answered ?? 0) >= t.count;
          return (
            <li key={t.slug}>
              <Link href={`/logiquest/${subject}/${t.slug}`} aria-current={on ? "page" : undefined} className={cn("group/row relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors", on ? "bg-[color-mix(in_srgb,var(--c)_12%,transparent)]" : "hover:bg-story-mist")}>
                {on ? <motion.span layoutId="topic-nav-mark" className="absolute inset-y-1.5 -left-0.5 w-1 rounded-full bg-[var(--c)]" /> : null}
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold tabular-nums transition-colors", on || done ? "bg-[var(--c)] text-white" : "bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] group-hover/row:bg-[var(--c)] group-hover/row:text-white")}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : String(n + 1).padStart(2, "0")}
                </span>
                <span className={cn("min-w-0 flex-1 text-[13px] leading-snug", on ? "font-semibold text-[var(--c)]" : "text-muted group-hover/row:text-story-navy dark:group-hover/row:text-foreground")}>{t.title}</span>
                {t.count ? <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted">{t.count}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {!rows.length ? <p className="px-2 py-5 text-center text-xs text-muted">No topic matches “{query}”.</p> : null}
    </div>
  );
}
