import Link from "next/link";
import { ChevronLeft, ChevronRight, Folder, Home } from "lucide-react";
import { cn } from "@/lib/cn";
import { GROUPS, subjectsInGroup } from "@/lib/logiquest/catalog";

export function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border-soft px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/logiquest" className="inline-flex items-center gap-1 hover:text-story-royal"><Home className="h-3.5 w-3.5" />LogiQuest</Link></li>
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            {c.href ? <Link href={c.href} className="hover:text-story-royal">{c.label}</Link> : <span aria-current="page" className="font-semibold text-story-navy dark:text-foreground">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Page heading used across LogiQuest pages. */
export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">{title}</h1>
        {sub ? <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Prev · 1 2 … N · Next, plus a "Go to page" box (works without JavaScript). */
export function Pagination({ page, pages, href, action, hidden }: { page: number; pages: number; href: (p: number) => string; action: string; hidden?: Record<string, string> }) {
  if (pages <= 1) return null;
  const nums = new Set([1, pages, page - 1, page, page + 1, page - 2, page + 2].filter((p) => p >= 1 && p <= pages));
  const list = [...nums].sort((a, b) => a - b);
  const cell = "grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Pages" className="flex flex-wrap items-center gap-1">
        {page > 1 ? <Link href={href(page - 1)} className={cn(cell, "text-muted hover:bg-story-mist hover:text-story-royal")}><ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous</span></Link> : null}
        {list.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && p - list[i - 1] > 1 ? <span className="px-1 text-muted">…</span> : null}
            {p === page ? <span aria-current="page" className={cn(cell, "bg-story-royal text-white")}>{p}</span> : <Link href={href(p)} className={cn(cell, "text-muted hover:bg-story-mist hover:text-story-royal")}>{p}</Link>}
          </span>
        ))}
        {page < pages ? <Link href={href(page + 1)} className={cn(cell, "text-muted hover:bg-story-mist hover:text-story-royal")}><span className="mr-1">Next</span><ChevronRight className="h-4 w-4" /></Link> : null}
      </nav>
      <form action={action} className="flex items-center gap-2 text-sm">
        {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <label htmlFor="goto" className="text-muted">Page</label>
        <input id="goto" name="page" type="number" min={1} max={pages} defaultValue={page} className="w-16 rounded-full border border-border-soft bg-background px-3 py-1.5 text-center" />
        <span className="text-muted">of {pages}</span>
        <button className="rounded-full bg-story-mist px-3 py-1.5 font-semibold text-story-royal hover:bg-story-royal hover:text-white">Go</button>
      </form>
    </div>
  );
}

/** Right-hand menu of every subject, grouped (as on IndiaBix). */
export function SubjectSidebar({ current }: { current?: string }) {
  return (
    <aside className="rounded-2xl border border-border-soft bg-surface p-4 text-sm">
      {GROUPS.map((g) => (
        <div key={g.slug} className="mb-3 last:mb-0">
          <p className="mb-1 font-bold text-story-royal">{g.title}</p>
          <ul>
            {subjectsInGroup(g.slug).map((s) => (
              <li key={s.slug}>
                <Link href={`/logiquest/${s.slug}`} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] transition-colors hover:bg-story-mist hover:text-story-royal", s.slug === current ? "bg-story-mist font-semibold text-story-royal" : "text-muted")}>
                  <ChevronRight className="h-3 w-3 shrink-0" />{s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

export function FolderIcon({ className }: { className?: string }) {
  return <Folder className={cn("h-5 w-5 shrink-0 fill-amber-400 text-amber-500", className)} aria-hidden />;
}
