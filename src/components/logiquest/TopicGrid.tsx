"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ListChecks, Search, Timer, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type TopicRow = { slug: string; title: string; count: number; answered?: number; correct?: number };

/** Progress ring: the share of the topic answered, or the question count while it is still new. */
function Ring({ pct, count, started, done }: { pct: number; count: number; started: boolean; done: boolean }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-[color-mix(in_srgb,var(--c)_14%,transparent)]" />
        <motion.circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" strokeLinecap="round" stroke="var(--c)" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ duration: 1, ease: "easeOut", delay: 0.15 }} />
      </svg>
      {done ? (
        <Check className="relative h-5 w-5 text-[var(--c)]" strokeWidth={3} />
      ) : started ? (
        <span className="relative text-[11px] font-bold tabular-nums text-[var(--c)]">{pct}%</span>
      ) : (
        <span className="relative text-center leading-none"><span className="block text-sm font-bold tabular-nums text-story-navy dark:text-foreground">{count}</span><span className="block text-[8px] font-bold uppercase tracking-wider text-muted">Qs</span></span>
      )}
    </span>
  );
}

/**
 * Filterable grid of topic cards. The whole card opens the practice questions; MCQ subjects also get a "Test" shortcut
 * into that topic's timed test. A ring shows progress, and the first unfinished topic is tagged "Next up".
 */
export function TopicGrid({ subject, topics, extra, color = "#2563eb", showTest = false }: { subject: string; topics: TopicRow[]; extra?: { href: string; title: string; note: string }[]; color?: string; showTest?: boolean }) {
  const [filter, setFilter] = useState("");
  const f = filter.trim().toLowerCase();
  const started = topics.some((t) => (t.answered ?? 0) > 0);
  const nextSlug = started ? topics.find((t) => t.count > 0 && (t.answered ?? 0) < t.count)?.slug : undefined;
  const shown = useMemo(() => topics.map((t, n) => ({ t, n })).filter(({ t }) => !f || t.title.toLowerCase().includes(f)), [f, topics]);
  const extras = useMemo(() => (extra ?? []).filter((x) => !f || x.title.toLowerCase().includes(f)), [extra, f]);

  return (
    <div style={{ "--c": color } as React.CSSProperties}>
      <label className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden />
        <span className="sr-only">Filter topics</span>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`Filter ${topics.length} topics…`} className="w-full rounded-full border border-border-soft bg-surface py-3 pl-11 pr-11 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-[var(--c)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--c)_14%,transparent)]" />
        {filter ? (
          <button type="button" onClick={() => setFilter("")} aria-label="Clear filter" className="absolute right-3 grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-story-mist hover:text-story-royal"><X className="h-3.5 w-3.5" /></button>
        ) : null}
      </label>

      <motion.ul layout className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map(({ t, n }, i) => {
            const pct = t.count && t.answered ? Math.min(100, Math.round((t.answered / t.count) * 100)) : 0;
            const done = pct >= 100;
            const begun = (t.answered ?? 0) > 0;
            const next = t.slug === nextSlug;
            const label = String(n + 1).padStart(2, "0");
            return (
              <motion.li key={t.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.03 }}>
                <div className={cn("group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface p-5 transition-colors duration-300", next ? "border-[color-mix(in_srgb,var(--c)_55%,transparent)]" : "border-border-soft hover:border-[color-mix(in_srgb,var(--c)_45%,transparent)]")}>
                  <Link href={`/logiquest/${subject}/${t.slug}`} aria-label={`${t.title}: practice questions`} className="absolute inset-0 z-0 rounded-3xl" />
                  <span aria-hidden className="pointer-events-none absolute -right-2 -top-4 select-none text-[6rem] font-black leading-none tracking-tighter text-[color-mix(in_srgb,var(--c)_7%,transparent)] transition-colors duration-300 group-hover:text-[color-mix(in_srgb,var(--c)_13%,transparent)]">{label}</span>
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--c)] transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="pointer-events-none relative flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--c)_13%,transparent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--c)]">Topic {label}</span>
                        {next ? <span className="rounded-full bg-[var(--c)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Next up</span> : null}
                        {done ? <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Completed</span> : null}
                      </div>
                      <h3 className="mt-2.5 text-[17px] font-bold leading-snug text-story-navy transition-colors duration-300 group-hover:text-[var(--c)] dark:text-foreground">{t.title}</h3>
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted"><ListChecks className="h-3.5 w-3.5" />{t.count ? `${t.count} questions` : "Explanation only"}{begun && !done ? <span className="font-semibold text-[var(--c)]"> · {t.answered} done</span> : null}</p>
                    </div>
                  </div>

                  <div className="relative mt-5 flex items-center gap-2">
                    <span className="pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)] px-3.5 py-1.5 text-xs font-bold text-[var(--c)] transition-colors duration-300 group-hover:bg-[var(--c)] group-hover:text-white">
                      {done ? "Review" : begun ? "Continue" : "Practice"}<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                    {showTest && t.count ? (
                      <Link href={`/logiquest/online-test/${subject}?topic=${t.slug}`} className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-1.5 text-xs font-bold text-muted transition-colors duration-300 hover:border-[var(--c)] hover:text-[var(--c)]">
                        <Timer className="h-3.5 w-3.5" />Test
                      </Link>
                    ) : null}
                    {t.count ? <span className="pointer-events-none ml-auto"><Ring pct={pct} count={t.count} started={begun} done={done} /></span> : null}
                  </div>
                </div>
              </motion.li>
            );
          })}
          {extras.map((x) => (
            <motion.li key={x.href} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
              <Link href={x.href} className="group flex h-full items-center gap-4 rounded-3xl border border-border-soft bg-surface p-5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--c)_45%,transparent)]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--c)] text-lg font-bold text-white">▦</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-bold text-story-navy group-hover:text-[var(--c)] dark:text-foreground">{x.title}</span>
                  <span className="block text-xs text-muted">{x.note}</span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--c)]" />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!shown.length && !extras.length ? <p className="py-10 text-center text-sm text-muted">No topic matches “{filter}”.</p> : null}
    </div>
  );
}
