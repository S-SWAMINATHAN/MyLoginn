import Link from "next/link";
import { ChevronLeft, ChevronRight, Folder } from "lucide-react";
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

/**
 * In-page trail, intentionally rendered as nothing: the site header already shows the breadcrumb for every LogiQuest page,
 * so a second row would only repeat it. Pages may keep calling this; it is a no-op.
 */
export function Breadcrumbs(props: { items: Crumb[] }) {
  void props;
  return null;
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
    <ul className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {items.map((s) => (
        <li key={s.label} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-xs">
          <strong className="text-sm tabular-nums text-story-navy dark:text-foreground">{s.value}</strong>
          <span className="text-muted">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Pagination: Previous / Next pills (disabled at the ends), round page numbers with the current page filled, a slim progress
 * line, and a "Go to page" box that works without JavaScript. On phones the numbers collapse into "Page 3 of 12".
 */
export function Pagination({ page, pages, href, action, hidden }: { page: number; pages: number; href: (p: number) => string; action: string; hidden?: Record<string, string> }) {
  if (pages <= 1) return null;
  const nums = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const list = [...nums].sort((a, b) => a - b);
  const pill = "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors duration-300";
  const live = "border-border-soft text-story-navy hover:border-story-royal hover:bg-story-royal hover:text-white dark:text-foreground";
  const off = "pointer-events-none border-transparent bg-story-mist text-muted/60";
  const num = "grid h-10 w-10 place-items-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-200";
  return (
    <nav aria-label="Pages" className="relative mt-6 overflow-hidden rounded-3xl border border-border-soft bg-surface p-3 pb-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" className={cn(pill, live)}><ChevronLeft className="h-4 w-4" /><span className="hidden min-[420px]:inline">Previous</span><span className="sr-only min-[420px]:hidden">Previous page</span></Link>
          ) : (
            <span aria-disabled="true" className={cn(pill, off)}><ChevronLeft className="h-4 w-4" /><span className="hidden min-[420px]:inline">Previous</span></span>
          )}

          <ol className="hidden items-center gap-1 sm:flex">
            {list.map((p, i) => (
              <li key={p} className="flex items-center gap-1">
                {i > 0 && p - list[i - 1] > 1 ? <span aria-hidden className="px-1 text-muted">…</span> : null}
                {p === page ? (
                  <span aria-current="page" className={cn(num, "bg-story-royal text-white shadow-[0_8px_18px_-8px_rgba(31,86,214,0.8)]")}>{p}</span>
                ) : (
                  <Link href={href(p)} aria-label={`Page ${p}`} className={cn(num, "text-muted hover:bg-story-royal/10 hover:text-story-royal")}>{p}</Link>
                )}
              </li>
            ))}
          </ol>
          <span className="px-2 text-sm font-semibold text-story-navy sm:hidden dark:text-foreground" aria-live="polite">Page {page} of {pages}</span>

          {page < pages ? (
            <Link href={href(page + 1)} rel="next" className={cn(pill, "border-story-royal bg-story-royal text-white hover:border-story-navy hover:bg-story-navy")}><span className="hidden min-[420px]:inline">Next</span><span className="sr-only min-[420px]:hidden">Next page</span><ChevronRight className="h-4 w-4" /></Link>
          ) : (
            <span aria-disabled="true" className={cn(pill, off)}><span className="hidden min-[420px]:inline">Next</span><ChevronRight className="h-4 w-4" /></span>
          )}
        </div>

        <form action={action} className="flex items-center gap-2 text-sm">
          {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <label htmlFor="goto" className="hidden text-muted sm:block">Go to page</label>
          <input id="goto" name="page" type="number" inputMode="numeric" min={1} max={pages} defaultValue={page} aria-label={`Go to page, 1 to ${pages}`} className="h-10 w-16 rounded-full border border-border-soft bg-background px-3 text-center tabular-nums outline-none transition-[border-color,box-shadow] focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.14)]" />
          <span className="text-muted">of {pages}</span>
          <button className="h-10 rounded-full bg-story-mist px-4 font-semibold text-story-royal transition-colors duration-300 hover:bg-story-royal hover:text-white">Go</button>
        </form>
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-story-mist">
        <span className="block h-full bg-story-royal transition-[width] duration-700" style={{ width: `${Math.round((page / pages) * 100)}%` }} />
      </span>
    </nav>
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
