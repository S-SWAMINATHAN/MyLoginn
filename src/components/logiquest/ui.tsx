import Link from "next/link";
import { ChevronLeft, ChevronRight, Folder, Home } from "lucide-react";
import { cn } from "@/lib/cn";
import { GROUPS, subjectsInGroup } from "@/lib/logiquest/catalog";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { SubjectNav } from "./SubjectNav";

export function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-3xl border border-border-soft bg-surface p-4">
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

/** Kept for pages that want an in-page trail. The LogiQuest pages rely on the site breadcrumb instead, to avoid a second one. */
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

/**
 * Page heading used across LogiQuest pages: an optional animated category icon, a small label, an animated
 * headline, an optional description, and room for actions on the right.
 */
export function PageTitle({ title, sub, eyebrow, icon, children }: { title: string; sub?: string; eyebrow?: string; icon?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {icon ? <Reveal scale><span className="grid h-14 w-14 shrink-0 place-items-center sm:h-16 sm:w-16"><ContentIcon keyword={icon} className="h-full w-full" /></span></Reveal> : null}
        <div className="min-w-0">
          {eyebrow ? <Reveal><span className="story-eyebrow">{eyebrow}</span></Reveal> : null}
          <SplitHeadline as="h1" text={title} className={cn("text-2xl font-bold leading-tight tracking-tight text-story-navy sm:text-4xl dark:text-foreground", eyebrow && "mt-2")} />
          {sub ? <Reveal direction="up" delay={0.12}><p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">{sub}</p></Reveal> : null}
        </div>
      </div>
      {children ? <Reveal direction="left" delay={0.1}>{children}</Reveal> : null}
    </div>
  );
}

/** A row of small facts, for example "12 topics · 480 questions". */
export function StatChips({ items }: { items: { label: string; value: string }[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((s) => (
        <li key={s.label} className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-xs">
          <strong className="text-sm tabular-nums text-story-navy dark:text-foreground">{s.value}</strong>
          <span className="text-muted">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Prev · 1 2 … N · Next, plus a "Go to page" box (works without JavaScript). */
export function Pagination({ page, pages, href, action, hidden }: { page: number; pages: number; href: (p: number) => string; action: string; hidden?: Record<string, string> }) {
  if (pages <= 1) return null;
  const nums = new Set([1, pages, page - 1, page, page + 1, page - 2, page + 2].filter((p) => p >= 1 && p <= pages));
  const list = [...nums].sort((a, b) => a - b);
  const cell = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border-soft bg-surface p-3">
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
        <input id="goto" name="page" type="number" min={1} max={pages} defaultValue={page} className="w-16 rounded-full border border-border-soft bg-background px-3 py-1.5 text-center outline-none focus:border-story-royal" />
        <span className="text-muted">of {pages}</span>
        <button className="rounded-full bg-story-mist px-4 py-1.5 font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white">Go</button>
      </form>
    </div>
  );
}

/** Menu of every subject, grouped, with the current one highlighted. */
export function SubjectSidebar({ current }: { current?: string }) {
  return <SubjectNav current={current} groups={GROUPS.map((g) => ({ slug: g.slug, title: g.title, subjects: subjectsInGroup(g.slug).map((s) => ({ slug: s.slug, title: s.title })) }))} />;
}

/** Flat folder tile used in lists. */
export function FolderIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-story-royal/10 text-story-royal transition-colors group-hover:bg-story-royal group-hover:text-white", className)}>
      <Folder className="h-[18px] w-[18px]" />
    </span>
  );
}
