"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Search, Timer, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

export type NavGroup = { slug: string; title: string; nav: string; subjects: { slug: string; title: string }[] };

/** IndiaBix-style section menu under the site header: one dropdown per group, plus tests, search and progress. */
export function LqNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(null), [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  const activeSubject = pathname.split("/")[2];
  const item = "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors";

  return (
    <div ref={ref} className="sticky top-16 z-40 border-b border-border-soft bg-[var(--glass-nav-bg)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-1.5 sm:px-6">
        <Link href="/logiquest" className="mr-1 shrink-0 text-sm font-extrabold tracking-tight text-story-royal">LogiQuest</Link>
        <nav aria-label="LogiQuest sections" className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {groups.map((g) => {
            const active = g.subjects.some((s) => s.slug === activeSubject);
            return (
              <div key={g.slug} className="relative">
                <button
                  type="button"
                  aria-expanded={open === g.slug}
                  aria-haspopup="menu"
                  onClick={() => setOpen((o) => (o === g.slug ? null : g.slug))}
                  className={cn(item, active || open === g.slug ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}
                >
                  {g.nav}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open === g.slug && "rotate-180")} />
                </button>
              </div>
            );
          })}
          <Link href="/logiquest/online-test" className={cn(item, pathname.startsWith("/logiquest/online-test") ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}><Timer className="h-3.5 w-3.5" />Online Tests</Link>
          <Link href="/logiquest/sudoku" className={cn(item, pathname === "/logiquest/sudoku" ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}>Sudoku</Link>
          <Link href="/logiquest/leaderboard" className={cn(item, pathname === "/logiquest/leaderboard" ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}><Trophy className="h-3.5 w-3.5" />Leaderboard</Link>
        </nav>
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); if (typeof q === "string" && q.trim()) router.push(`/logiquest/search?q=${encodeURIComponent(q.trim())}`); }}
          className="hidden items-center rounded-full border border-border-soft bg-background px-2.5 md:flex"
        >
          <Search className="h-3.5 w-3.5 text-muted" aria-hidden />
          <input name="q" placeholder="Search questions" aria-label="Search questions" className="w-36 bg-transparent px-2 py-1.5 text-[13px] outline-none lg:w-44" />
        </form>
        <Link href="/logiquest/search" aria-label="Search questions" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:text-story-royal md:hidden"><Search className="h-4 w-4" /></Link>
        <Link href="/logiquest/me" aria-label="My progress" className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full hover:text-story-royal", pathname === "/logiquest/me" ? "bg-story-royal/10 text-story-royal" : "text-muted")}><UserRound className="h-4 w-4" /></Link>
      </div>

      {open ? (
        <div role="menu" className="absolute inset-x-0 top-full border-b border-border-soft bg-surface shadow-[var(--shadow-soft)]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {groups.filter((g) => g.slug === open).map((g) => (
              <div key={g.slug}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">{g.title}</p>
                <ul className="grid grid-cols-1 gap-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {g.subjects.map((s) => (
                    <li key={s.slug}>
                      <Link role="menuitem" href={`/logiquest/${s.slug}`} className={cn("block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-story-mist hover:text-story-royal", s.slug === activeSubject && "bg-story-mist text-story-royal")}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
