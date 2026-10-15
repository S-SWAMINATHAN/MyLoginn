"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Search, X } from "lucide-react";

export type ModuleTopic = { title: string; slug: string; number: number; done: boolean };

const PREVIEW = 12;

/**
 * Topic list for one module. Long modules show a preview with a "Show all" control and a search box; every topic is a
 * card that nudges and reveals an arrow on hover. `nextSlug` is the one topic to take next across the whole course (so only
 * one module shows "Next up"), and `locked` shows the topics as a read-only outline until the learner is enrolled.
 */
export function ModuleTopics({ courseSlug, topics, nextSlug, locked = false }: { courseSlug: string; topics: ModuleTopic[]; nextSlug?: string; locked?: boolean }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => (q ? topics.filter((t) => t.title.toLowerCase().includes(q)) : topics), [topics, q]);
  const long = topics.length > PREVIEW;
  const visible = q || expanded || !long ? filtered : filtered.slice(0, PREVIEW);
  const hidden = filtered.length - visible.length;

  return (
    <div className="p-3 pt-1 sm:p-4 sm:pt-2">
      {long && (
        <label className="relative mb-4 flex items-center">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${topics.length} topics…`}
            aria-label="Search topics in this module"
            className="w-full rounded-full bg-story-mist py-2.5 pl-10 pr-10 text-sm outline-none transition-shadow duration-200 placeholder:text-muted focus:bg-surface focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16),0_8px_20px_-12px_rgba(31,86,214,0.45)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-story-royal/10 hover:text-story-royal">
              <X className="h-3 w-3" />
            </button>
          )}
        </label>
      )}

      <motion.ul layout className="flex flex-wrap gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((t, i) => {
            const next = !locked && t.slug === nextSlug;
            const tone = t.done
              ? "bg-story-royal/12 text-story-royal hover:bg-story-royal hover:text-white"
              : next
                ? "bg-story-royal text-white shadow-[0_10px_20px_-12px_rgba(31,86,214,0.9)] hover:brightness-110"
                : "bg-story-mist hover:bg-story-royal hover:text-white";
            const badge = t.done ? "bg-story-royal text-white group-hover:bg-white group-hover:text-story-royal" : next ? "bg-white/25 text-white" : "bg-surface text-muted group-hover:bg-white/25 group-hover:text-white";
            return (
              <motion.li
                key={t.slug}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 380, damping: 26, delay: Math.min(i, 14) * 0.02 }}
              >
                {locked ? (
                  <span
                    title="Enroll to open this lesson"
                    style={{ color: "var(--foreground)" }}
                    className="inline-flex cursor-default items-center gap-2 rounded-full bg-story-mist py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium opacity-80"
                  >
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-surface px-1 text-[10px] font-bold text-muted">{t.number}</span>
                    <span>{t.title}</span>
                    <Lock aria-label="Locked" className="h-3.5 w-3.5 text-muted" />
                  </span>
                ) : (
                  <Link
                    href={`/courses/${courseSlug}/learn/${t.slug}`}
                    style={next ? undefined : { color: "var(--foreground)" }}
                    className={`group inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${tone}`}
                  >
                    <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[10px] font-bold transition-colors ${badge}`}>{t.done ? "✓" : t.number}</span>
                    <span>{t.title}</span>
                    {next && <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-story-royal">Next up</span>}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted">No topics match &ldquo;{query}&rdquo;.</p>}

      {long && !q && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-story-mist px-4 py-2 text-xs font-semibold text-story-royal transition-all hover:-translate-y-0.5 hover:bg-story-royal hover:text-white active:scale-95">
          {expanded ? "Show fewer topics" : `Show all ${topics.length} topics${hidden > 0 ? ` (+${hidden})` : ""}`}
        </button>
      )}
    </div>
  );
}
