"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, Bell, BookOpen, Briefcase, CalendarDays, ChevronsLeft, CircleUserRound, CreditCard, ExternalLink, FolderKanban, GraduationCap,
  Code2, Inbox, Layers, LayoutDashboard, LogOut, Mail, Menu, Mic2, Search, Settings, Sparkles, Trophy, UserCog, Users, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { useLiveData } from "@/components/admin/useLiveData";

export type AdminNavUser = { name: string; email: string; avatarColor: string; avatarUrl: string | null };

type NavItem = { href: string; label: string; icon: LucideIcon; keywords?: string };
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/analytics", label: "Analytics", icon: BarChart3, keywords: "reports trends funnel" }] },
  {
    label: "Learning",
    items: [
      { href: "/admin/courses", label: "Courses", icon: GraduationCap },
      { href: "/admin/visual-explanations", label: "Visual Explanations", icon: Sparkles },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/enrollments", label: "Enrollments", icon: BookOpen },
      { href: "/admin/logiquest", label: "LogiQuest", icon: Code2, keywords: "challenges questions practice coding" },
      { href: "/admin/practice", label: "Practice", icon: Mic2, keywords: "interview group discussion speaking ai latency" },
      { href: "/admin/rewards", label: "Rewards", icon: Trophy, keywords: "points leaderboard badges streak" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/mentors", label: "Mentors", icon: UserCog },
      { href: "/admin/tutoring", label: "Tutoring", icon: CalendarDays },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { href: "/admin/careers", label: "Careers", icon: Briefcase, keywords: "jobs openings internships hiring resume cv candidates review" },
      { href: "/admin/applications", label: "Applications", icon: Mail, keywords: "resume" },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/requests", label: "Form Requests", icon: Inbox, keywords: "leads enquiries" },
    ],
  },
  { label: "Finance", items: [{ href: "/admin/payments", label: "Payments", icon: CreditCard, keywords: "revenue razorpay" }] },
  { label: "System", items: [{ href: "/admin/settings", label: "Settings", icon: Settings, keywords: "status export profile" }] },
];
const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function useActiveItem() {
  const pathname = usePathname();
  return ALL_ITEMS.find((i) => isActive(pathname, i.href)) ?? ALL_ITEMS[0];
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */

function SidebarContent({ user, collapsed, onNavigate, onToggle }: { user: AdminNavUser; collapsed: boolean; onNavigate?: () => void; onToggle?: () => void }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center px-4 pb-2 pt-5", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/" onClick={onNavigate} className="flex items-center" aria-label="MyLoginn home">
          {collapsed ? <span className="grid h-9 w-9 place-items-center rounded-xl bg-story-royal text-sm font-bold text-white">M</span> : <LogoBadge className="h-9 w-auto" />}
        </Link>
        {onToggle && !collapsed && (
          <button type="button" onClick={onToggle} aria-label="Collapse sidebar" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-story-mist hover:text-story-royal">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {onToggle && collapsed && (
        <button type="button" onClick={onToggle} aria-label="Expand sidebar" className="mx-auto mt-1 grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-story-mist hover:text-story-royal">
          <ChevronsLeft className="h-4 w-4 rotate-180" />
        </button>
      )}

      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-4 first:mt-0">
            {!collapsed && <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{group.label}</p>}
            {collapsed && <span aria-hidden className="mx-auto mb-1 block h-px w-6 bg-border-soft first:hidden" />}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200",
                        collapsed ? "justify-center px-0" : "px-3",
                        active ? "bg-story-royal/10 text-story-royal" : "text-foreground/70 hover:bg-story-mist hover:text-foreground"
                      )}
                    >
                      {active && <motion.span layoutId="admin-active-pill" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                      <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border-soft px-3 py-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={36} className="rounded-full" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-[11px] text-muted">Administrator</p>
            </div>
          )}
        </div>
        <button onClick={signOut} disabled={signingOut} title={collapsed ? "Sign out" : undefined} className={cn("mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-60", collapsed ? "justify-center" : "px-3")}>
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && (signingOut ? "Signing out…" : "Sign out")}
        </button>
      </div>
    </div>
  );
}

/* ── Command palette (Ctrl/Cmd + K) ──────────────────────────────────── */

type Hit = { id: string; group: string; label: string; sub?: string; href: string; icon?: LucideIcon };

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const pages: Hit[] = useMemo(
    () => ALL_ITEMS.filter((i) => !q || `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(q)).map((i) => ({ id: i.href, group: "Go to", label: i.label, href: i.href, icon: i.icon })),
    [q]
  );
  const results = useMemo(() => [...pages, ...remote], [pages, remote]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || q.length < 2) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const json = await res.json();
        setRemote(res.ok ? (json.hits as Hit[]) : []);
      } catch {
        /* aborted or offline */
      }
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, open]);

  const go = useCallback((href: string) => { onClose(); setQuery(""); setRemote([]); router.push(href); }, [onClose, router]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(results.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const h = results[active]; if (h) go(h.href); }
    else if (e.key === "Escape") { onClose(); }
  }

  // Group while keeping a flat index for keyboard navigation.
  const groups: { name: string; items: { hit: Hit; index: number }[] }[] = [];
  results.forEach((hit, index) => {
    let g = groups.find((x) => x.name === hit.group);
    if (!g) { g = { name: hit.group, items: [] }; groups.push(g); }
    g.items.push({ hit, index });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-900/45 px-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-label="Search the admin panel" initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[0_30px_80px_-30px_rgba(11,31,77,0.5)]">
            <div className="flex items-center gap-3 border-b border-border-soft px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKey} placeholder="Search pages, people, courses, enquiries…" aria-label="Search" className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted" />
              <kbd className="hidden rounded-md border border-border-soft px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">Esc</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">No matches for &ldquo;{query}&rdquo;</p>}
              {groups.map((g) => (
                <div key={g.name} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{g.name}</p>
                  {g.items.map(({ hit, index }) => (
                    <button key={hit.id} type="button" onMouseEnter={() => setActive(index)} onClick={() => go(hit.href)} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors", index === active ? "bg-story-royal/10 text-story-royal" : "hover:bg-story-mist")}>
                      {hit.icon ? <hit.icon className="h-4 w-4 shrink-0" /> : <CircleUserRound className="h-4 w-4 shrink-0 text-muted" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{hit.label}</span>
                        {hit.sub && <span className="block truncate text-xs font-normal text-muted">{hit.sub}</span>}
                      </span>
                      {index === active && <span aria-hidden className="text-xs">↵</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Notification bell ───────────────────────────────────────────────── */

type Pulse = { queue: { key: string; label: string; count: number; href: string }[]; total: number };

function NotificationBell() {
  const { data } = useLiveData<Pulse>("/api/admin/pulse", { intervalMs: 30_000 });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const total = data?.total ?? 0;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Notifications${total ? `, ${total} need attention` : ""}`} aria-expanded={open} className="relative grid h-10 w-10 place-items-center rounded-full border border-border-soft bg-surface transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal">
        <Bell className="h-4.5 w-4.5" />
        {total > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{total > 99 ? "99+" : total}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border-soft bg-surface p-2 shadow-[var(--shadow-lift)]">
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Needs your attention</p>
            {(data?.queue ?? []).map((q) => (
              <Link key={q.key} href={q.href} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-story-mist">
                <span className="font-medium">{q.label}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", q.count > 0 ? "bg-rose-500/10 text-rose-600" : "bg-story-mist text-muted")}>{q.count}</span>
              </Link>
            ))}
            {!data && <p className="px-3 py-4 text-sm text-muted">Loading…</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Shell ───────────────────────────────────────────────────────────── */

export function AdminShell({ user, children }: { user: AdminNavUser; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const active = useActiveItem();

  useEffect(() => {
    // Restore the saved sidebar state after mount (reading storage during render would mismatch the server HTML).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setCollapsed(localStorage.getItem("admin-sidebar") === "collapsed"); } catch { /* storage unavailable */ }
  }, []);
  const toggleCollapsed = () => setCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem("admin-sidebar", next ? "collapsed" : "open"); } catch { /* storage unavailable */ }
    return next;
  });

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border-soft bg-surface transition-[width] duration-300 lg:block", collapsed ? "w-[4.75rem]" : "w-64")}>
        <SidebarContent user={user} collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }} className="fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col border-r border-border-soft bg-surface shadow-[var(--shadow-lift)] lg:hidden">
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-rose-600 transition-transform hover:scale-110 hover:bg-rose-500/10 active:scale-90">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent user={user} collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-300", collapsed ? "lg:pl-[4.75rem]" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border-soft bg-[var(--glass-nav-bg)] px-4 py-3 backdrop-blur-xl sm:px-6">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border-soft bg-surface transition-all hover:border-story-royal active:scale-95 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/admin" className="hidden font-medium text-muted transition-colors hover:text-story-royal sm:inline">Admin</Link>
            <span aria-hidden className="hidden text-muted sm:inline">/</span>
            <h1 className="min-w-0 truncate text-base font-bold sm:text-lg">{active.label}</h1>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setPaletteOpen(true)} className="group hidden items-center gap-2 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm text-muted transition-all hover:-translate-y-0.5 hover:border-story-royal md:flex">
              <Search className="h-4 w-4" />
              <span>Search…</span>
              <kbd className="ml-4 rounded-md border border-border-soft px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
            </button>
            <button type="button" onClick={() => setPaletteOpen(true)} aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full border border-border-soft bg-surface transition-all hover:border-story-royal md:hidden">
              <Search className="h-4.5 w-4.5" />
            </button>
            <NotificationBell />
            <Link href="/" target="_blank" className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal">
              <ExternalLink className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">View site</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
