"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, CodeXml, Search, Timer, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { ContentIcon } from "@/components/ui/ContentIcon";

export type NavGroup = { slug: string; title: string; nav: string; desc?: string; icon?: string; subjects: { slug: string; title: string }[] };

/** Section menu under the site header: one animated mega-menu per group, plus tests, search and progress. */
export function LqNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so navigating closes it without an effect.
  const [menu, setMenu] = useState<{ slug: string; path: string } | null>(null);
  const open = menu && menu.path === pathname ? menu.slug : null;
  const setOpen = (next: string | null | ((cur: string | null) => string | null)) =>
    setMenu((m) => {
      const cur = m && m.path === pathname ? m.slug : null;
      const slug = typeof next === "function" ? next(cur) : next;
      return slug ? { slug, path: pathname } : null;
    });
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  const activeSubject = pathname.split("/")[2];
  const activeGroup = groups.find((g) => g.subjects.some((s) => s.slug === activeSubject))?.slug;
  const staticActive = pathname.startsWith("/logiquest/coding") ? "coding" : pathname.startsWith("/logiquest/online-test") ? "tests" : pathname === "/logiquest/sudoku" ? "sudoku" : pathname === "/logiquest/leaderboard" ? "board" : null;
  // The highlighted pill: the open menu wins, otherwise the page you are on.
  const lit = open ?? staticActive ?? activeGroup ?? null;
  const item = "relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors";
  const pill = <motion.span layoutId="lq-nav-pill" className="absolute inset-0 rounded-full bg-story-royal/10" transition={{ type: "spring", stiffness: 420, damping: 34 }} />;
  const openGroup = groups.find((g) => g.slug === open);

  return (
    <div ref={ref} className="sticky top-16 z-40 border-b border-border-soft bg-[var(--glass-nav-bg)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-1.5 sm:px-6">
        <Link href="/logiquest" className="mr-1 shrink-0 text-sm font-extrabold tracking-tight text-story-royal">LogiQuest</Link>
        <nav aria-label="LogiQuest sections" className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.slug}
              type="button"
              aria-expanded={open === g.slug}
              aria-haspopup="menu"
              onClick={() => setOpen((o) => (o === g.slug ? null : g.slug))}
              className={cn(item, lit === g.slug ? "text-story-royal" : "text-muted hover:text-story-royal")}
            >
              {lit === g.slug && pill}
              <span className="relative">{g.nav}</span>
              <ChevronDown className={cn("relative h-3.5 w-3.5 transition-transform duration-300", open === g.slug && "rotate-180")} />
            </button>
          ))}
          <Link href="/logiquest/coding" className={cn(item, lit === "coding" ? "text-story-royal" : "text-muted hover:text-story-royal")}>{lit === "coding" && pill}<CodeXml className="relative h-3.5 w-3.5" /><span className="relative">Coding</span></Link>
          <Link href="/logiquest/online-test" className={cn(item, lit === "tests" ? "text-story-royal" : "text-muted hover:text-story-royal")}>{lit === "tests" && pill}<Timer className="relative h-3.5 w-3.5" /><span className="relative">Online Tests</span></Link>
          <Link href="/logiquest/sudoku" className={cn(item, lit === "sudoku" ? "text-story-royal" : "text-muted hover:text-story-royal")}>{lit === "sudoku" && pill}<span className="relative">Sudoku</span></Link>
          <Link href="/logiquest/leaderboard" className={cn(item, lit === "board" ? "text-story-royal" : "text-muted hover:text-story-royal")}>{lit === "board" && pill}<Trophy className="relative h-3.5 w-3.5" /><span className="relative">Leaderboard</span></Link>
        </nav>
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); if (typeof q === "string" && q.trim()) router.push(`/logiquest/search?q=${encodeURIComponent(q.trim())}`); }}
          className="hidden items-center rounded-full border border-border-soft bg-background px-3 transition-[border-color,box-shadow] focus-within:border-story-royal focus-within:shadow-[0_0_0_3px_rgba(31,86,214,0.12)] md:flex"
        >
          <Search className="h-3.5 w-3.5 text-muted" aria-hidden />
          <input name="q" placeholder="Search questions" aria-label="Search questions" className="w-36 bg-transparent px-2 py-1.5 text-[13px] outline-none lg:w-44" />
        </form>
        <Link href="/logiquest/search" aria-label="Search questions" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:text-story-royal md:hidden"><Search className="h-4 w-4" /></Link>
        <Link href="/logiquest/me" aria-label="My progress" className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:text-story-royal", pathname === "/logiquest/me" ? "bg-story-royal/10 text-story-royal" : "text-muted")}><UserRound className="h-4 w-4" /></Link>
      </div>

      <AnimatePresence>
        {openGroup ? (
          <motion.div
            key="mega"
            role="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full border-b border-border-soft bg-surface shadow-[var(--shadow-soft)]"
          >
            <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[17rem_1fr]">
              <div className="flex gap-3 lg:block">
                {openGroup.icon ? <span className="grid h-12 w-12 shrink-0 place-items-center"><ContentIcon keyword={openGroup.icon} className="h-full w-full" /></span> : null}
                <div>
                  <p className="text-base font-bold text-story-navy dark:text-foreground lg:mt-3">{openGroup.title}</p>
                  {openGroup.desc ? <p className="mt-1 text-xs leading-5 text-muted">{openGroup.desc}</p> : null}
                  <Link href={`/logiquest/${openGroup.subjects[0]?.slug ?? ""}`} className="mt-3 hidden items-center gap-1 text-xs font-semibold text-story-royal hover:underline lg:inline-flex">Start with {openGroup.subjects[0]?.title}<ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {openGroup.subjects.map((s, i) => (
                  <motion.li key={s.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.025, duration: 0.2 }}>
                    <Link role="menuitem" href={`/logiquest/${s.slug}`} className={cn("group flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition-colors", s.slug === activeSubject ? "border-story-royal/40 bg-story-royal/10 text-story-royal" : "border-transparent bg-story-mist/60 hover:border-story-royal/30 hover:bg-story-mist hover:text-story-royal")}>
                      <span className="min-w-0 truncate">{s.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
