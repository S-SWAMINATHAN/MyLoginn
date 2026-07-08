"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedHome } from "@/components/ui/icons/AnimatedHome";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedLayers } from "@/components/ui/icons/AnimatedLayers";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { AnimatedLogout } from "@/components/ui/icons/AnimatedLogout";
import { AnimatedClose } from "@/components/ui/icons/AnimatedClose";
import logo from "@/images/Logos/Logo-trimmed.png";

export type AdminNavUser = { name: string; email: string; avatarColor: string; avatarUrl: string | null };

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: AnimatedHome }],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/courses", label: "Courses", icon: AnimatedGraduation },
      { href: "/admin/categories", label: "Categories", icon: AnimatedLayers },
      { href: "/admin/users", label: "Users", icon: AnimatedUsers },
      { href: "/admin/mentors", label: "Mentors", icon: AnimatedUser },
      { href: "/admin/enrollments", label: "Enrollments", icon: AnimatedBook },
      { href: "/admin/internships", label: "Internships", icon: AnimatedBriefcase },
      { href: "/admin/applications", label: "Applications", icon: AnimatedMail },
      { href: "/admin/projects", label: "Projects", icon: AnimatedFolder },
      { href: "/admin/tutoring", label: "Tutoring", icon: AnimatedCalendar },
      { href: "/admin/leads", label: "Client Requests", icon: AnimatedChat },
    ],
  },
  {
    label: "Finance",
    items: [{ href: "/admin/payments", label: "Payments", icon: AnimatedRupee }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function useActiveItem() {
  const pathname = usePathname();
  return (
    ALL_ITEMS.find((i) => i.href !== "/admin" && pathname.startsWith(i.href)) ??
    ALL_ITEMS.find((i) => i.href === pathname) ??
    ALL_ITEMS[0]
  );
}

/* ── Sidebar content (shared by fixed rail + mobile drawer) ─────────── */

function SidebarContent({ user, onNavigate }: { user: AdminNavUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-5 pb-2 pt-5" onClick={onNavigate}>
        <Image src={logo} alt="MyLoginn" className="h-9 w-auto" preload />
      </Link>

      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-4 first:mt-0">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/25 dark:text-brand-200"
                          : "text-foreground/75 hover:bg-surface-2 hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="admin-active-pill"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full brand-gradient-bg"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <item.icon className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border-soft px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-muted">super admin</p>
          </div>
        </div>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="mt-3 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/75 transition-all duration-200 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
        >
          <AnimatedLogout className="h-5 w-5" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

/* ── Animated hamburger (gradient bars, looping shimmer) ────────────── */

function MenuGlyph({ open }: { open: boolean }) {
  const bars = [0, 1, 2];
  return (
    <span className="relative inline-flex h-5.5 w-5.5 flex-col items-center justify-center gap-[4.5px]">
      {bars.map((i) => (
        <motion.span
          key={i}
          className="block h-[2.4px] w-full rounded-full brand-gradient-bg"
          animate={
            open
              ? i === 0
                ? { rotate: 45, y: 7 }
                : i === 2
                  ? { rotate: -45, y: -7 }
                  : { opacity: 0, scaleX: 0.4 }
              : { rotate: 0, y: 0, opacity: [0.65, 1, 0.65], scaleX: [1, i === 1 ? 0.75 : 1, 1] }
          }
          transition={
            open
              ? { duration: 0.25 }
              : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }
          }
        />
      ))}
    </span>
  );
}

/* ── Quick search (jumps to sections) ───────────────────────────────── */

function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-full border border-border-soft bg-surface-2 px-3.5 py-2 transition-all duration-200 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/30">
        <AnimatedSearch className="h-4.5 w-4.5" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) go(matches[0].href);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Quick search…"
          className="w-44 bg-transparent text-sm outline-none placeholder:text-muted lg:w-56"
        />
      </div>
      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface p-1.5 shadow-[var(--shadow-lift)]"
          >
            {matches.map((m) => (
              <li key={m.href}>
                <button
                  onClick={() => go(m.href)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <m.icon className="h-4.5 w-4.5" />
                  {m.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Shell ──────────────────────────────────────────────────────────── */

export function AdminShell({ user, children }: { user: AdminNavUser; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const active = useActiveItem();

  // Auto-hide the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border-soft bg-surface lg:block">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col border-r border-border-soft bg-surface shadow-[var(--shadow-lift)] lg:hidden"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 cursor-pointer rounded-full p-1.5 transition-transform duration-200 hover:scale-110 active:scale-90"
              >
                <AnimatedClose className="h-5 w-5" />
              </button>
              <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border-soft bg-[var(--glass-nav-bg)] px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer rounded-xl border border-border-soft bg-surface p-2.5 transition-all duration-200 hover:border-brand-400 active:scale-95 lg:hidden"
          >
            <MenuGlyph open={false} />
          </button>

          <h1 className="min-w-0 truncate text-base font-semibold sm:text-lg">{active.label}</h1>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
            <QuickSearch />
            <Link
              href="/"
              target="_blank"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[var(--shadow-soft)]"
            >
              <AnimatedArrow className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
