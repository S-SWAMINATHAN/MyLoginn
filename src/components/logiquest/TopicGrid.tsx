"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { FolderIcon } from "./ui";

export type TopicRow = { slug: string; title: string; count: number; answered?: number; correct?: number };

/** Filterable two-column list of topic folders, as on an IndiaBix subject page. */
export function TopicGrid({ subject, topics, extra }: { subject: string; topics: TopicRow[]; extra?: { href: string; title: string; note: string }[] }) {
  const [filter, setFilter] = useState("");
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? topics.filter((t) => t.title.toLowerCase().includes(f)) : topics;
  }, [filter, topics]);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-3 shadow-[var(--shadow-soft)] sm:p-4">
      <label className="flex items-center gap-2 rounded-xl border border-border-soft bg-background px-3 focus-within:border-story-royal">
        <Filter className="h-4 w-4 text-muted" aria-hidden />
        <span className="sr-only">Filter topics</span>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter" className="w-full bg-transparent py-2.5 text-sm outline-none" />
      </label>
      <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
        {shown.map((t) => {
          const pct = t.count && t.answered ? Math.round((t.answered / t.count) * 100) : 0;
          return (
            <li key={t.slug}>
              <Link href={`/logiquest/${subject}/${t.slug}`} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-story-mist">
                <FolderIcon />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium group-hover:text-story-royal">{t.title}</span>
                  {t.answered ? (
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1 w-20 overflow-hidden rounded-full bg-story-mist"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} /></span>
                      <span className="text-[11px] text-muted">{t.answered}/{t.count} done</span>
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">{t.count ? `${t.count} Qs` : ""}</span>
              </Link>
            </li>
          );
        })}
        {extra?.filter((x) => !filter.trim() || x.title.toLowerCase().includes(filter.trim().toLowerCase())).map((x) => (
          <li key={x.href}>
            <Link href={x.href} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-story-mist">
              <FolderIcon />
              <span className="flex-1 text-[15px] font-medium group-hover:text-story-royal">{x.title}</span>
              <span className="text-xs text-muted">{x.note}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!shown.length ? <p className="py-6 text-center text-sm text-muted">No topic matches “{filter}”.</p> : null}
    </div>
  );
}
