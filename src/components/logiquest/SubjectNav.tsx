"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Puzzle, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { GROUP_COLOR, GROUP_ICON, SUBJECT_ICON } from "./subjectStyle";
import { SectionGlyph } from "./SectionGlyph";

export type SidebarGroup = { slug: string; title: string; subjects: { slug: string; title: string }[] };

/**
 * Subject menu: collapsible, colour-coded sections with a distinct icon per subject and a search box. The section
 * that holds the current subject opens by itself; the rest open on click (or when a search matches inside them).
 */
export function SubjectNav({ groups, current }: { groups: SidebarGroup[]; current?: string }) {
  const home = groups.find((g) => g.subjects.some((s) => s.slug === current))?.slug;
  const [open, setOpen] = useState<Set<string>>(() => new Set(home ? [home] : groups.slice(0, 1).map((g) => g.slug)));
  const [query, setQuery] = useState("");
  const [replay, setReplay] = useState<Record<string, number>>({});
  const bump = (slug: string) => setReplay((r) => ({ ...r, [slug]: (r[slug] ?? 0) + 1 }));
  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () => groups.map((g) => ({ ...g, subjects: q ? g.subjects.filter((s) => s.title.toLowerCase().includes(q)) : g.subjects })).filter((g) => g.subjects.length),
    [groups, q]
  );
  const toggle = (slug: string) => setOpen((o) => { const n = new Set(o); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; });

  return (
    <aside aria-label="All subjects" className="rounded-3xl border border-border-soft bg-surface p-3 text-sm lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
      <label className="relative mb-2 flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" aria-hidden />
        <span className="sr-only">Find a subject</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a subject" className="w-full rounded-full bg-story-mist py-2 pl-10 pr-9 text-[13px] outline-none transition-shadow placeholder:text-muted focus:bg-surface focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]" />
        {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2.5 grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-story-royal/10 hover:text-story-royal"><X className="h-3 w-3" /></button> : null}
      </label>

      <ul>
        {visible.map((g) => {
          const color = GROUP_COLOR[g.slug] ?? "#2563eb";
          const GIcon = GROUP_ICON[g.slug] ?? Puzzle;
          const expanded = Boolean(q) || open.has(g.slug);
          const hasCurrent = g.subjects.some((s) => s.slug === current);
          return (
            <li key={g.slug} style={{ "--c": color } as React.CSSProperties}>
              <button type="button" aria-expanded={expanded} onClick={() => toggle(g.slug)} onPointerEnter={() => bump(g.slug)} className="group flex w-full items-center gap-2.5 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-story-mist">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300", expanded || hasCurrent ? "bg-[var(--c)]" : "bg-[color-mix(in_srgb,var(--c)_13%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--c)_22%,transparent)]")}>
                  <SectionGlyph name={g.slug} color={color} solid={expanded || hasCurrent} replay={replay[g.slug] ?? 0} className="h-[22px] w-[22px]" />
                </span>
                <span className={cn("min-w-0 flex-1 text-[13px] font-semibold leading-tight", hasCurrent ? "text-[var(--c)]" : "text-story-navy dark:text-foreground")}>{g.title}</span>
                <span className="rounded-full bg-story-mist px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted group-hover:bg-surface">{g.subjects.length}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-300", expanded && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.ul key="list" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="ml-[1.1rem] mt-0.5 space-y-0.5 border-l-2 border-border-soft pb-2 pl-2">
                      {g.subjects.map((s) => {
                        const Icon = SUBJECT_ICON[s.slug] ?? GIcon;
                        const on = s.slug === current;
                        return (
                          <li key={s.slug}>
                            <Link href={`/logiquest/${s.slug}`} aria-current={on ? "page" : undefined} className={cn("group/item relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors", on ? "bg-[color-mix(in_srgb,var(--c)_12%,transparent)] font-semibold text-[var(--c)]" : "text-muted hover:bg-story-mist hover:text-story-navy dark:hover:text-foreground")}>
                              {on ? <motion.span layoutId="subject-nav-mark" className="absolute -left-[0.62rem] top-1.5 bottom-1.5 w-1 rounded-full bg-[var(--c)]" /> : null}
                              <Icon className={cn("h-4 w-4 shrink-0 transition-colors", on ? "text-[var(--c)]" : "text-muted group-hover/item:text-[var(--c)]")} strokeWidth={1.8} />
                              <span className="min-w-0 flex-1 truncate">{s.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </div>
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {!visible.length ? <p className="px-2 py-6 text-center text-xs text-muted">No subject matches “{query}”.</p> : null}
    </aside>
  );
}
