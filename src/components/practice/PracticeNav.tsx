"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  Mic2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type PracticeItem = {
  href: string;
  label: string;
  exact?: boolean;
  Icon: LucideIcon;
};

const ITEMS: PracticeItem[] = [
  { href: "/practice", label: "Dashboard", exact: true, Icon: LayoutDashboard },
  { href: "/practice/interview", label: "AI Interview", Icon: Mic2 },
  { href: "/practice/gd", label: "Group Discussion", Icon: Users },
  { href: "/practice/speaking", label: "Speaking Lab", Icon: AudioLines },
  { href: "/practice/reports", label: "My Reports", Icon: FileText },
];

function isActive(pathname: string, item: PracticeItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function PracticeLinks({
  pathname,
  onNavigate,
  collapsed = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <nav aria-label="Practice sections" className="space-y-1">
      {ITEMS.map(({ href, label, Icon, ...item }) => {
        const active = isActive(pathname, { href, label, Icon, ...item });
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal focus-visible:ring-offset-2",
              collapsed && "justify-center",
              active
                ? "bg-story-royal text-white shadow-[0_8px_20px_rgba(31,86,214,0.2)]"
                : "text-muted hover:bg-story-mist hover:text-story-royal",
            )}
          >
            <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
            <span className={cn("min-w-0 truncate", collapsed && "lg:hidden")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PracticeNav() {
  const pathname = usePathname();
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileOpen = mobilePath === pathname;
  const activeItem = ITEMS.find((item) => isActive(pathname, item)) ?? ITEMS[0];

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobilePath(null);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobileNav = () => {
    setMobilePath(null);
    triggerRef.current?.focus();
  };

  return (
    <>
      <aside className={cn(
        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 border-r border-border-soft bg-surface transition-[width] duration-200 lg:block",
        desktopExpanded ? "w-60" : "w-[4.75rem]",
      )}>
        <div className={cn("flex h-full flex-col py-5", desktopExpanded ? "px-4" : "items-center px-2")}>
          <div className={cn("mb-7 flex w-full items-center", desktopExpanded ? "justify-between gap-2" : "flex-col gap-3")}>
            <Link
              href="/practice"
              aria-label={desktopExpanded ? undefined : "Practice home"}
              title={desktopExpanded ? undefined : "Practice home"}
              className={cn(
                "flex min-w-0 items-center rounded-xl text-story-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal",
                desktopExpanded ? "gap-3 px-2 py-1" : "justify-center",
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-story-royal text-white">
                <Mic2 aria-hidden className="h-5 w-5" />
              </span>
              <span className={cn("min-w-0", !desktopExpanded && "lg:hidden")}>
                <span className="block text-base font-bold">Practice</span>
                <span className="mt-0.5 block text-xs text-muted">Build confidence by doing</span>
              </span>
            </Link>
            <button
              type="button"
              aria-label={desktopExpanded ? "Collapse practice sidebar" : "Expand practice sidebar"}
              aria-expanded={desktopExpanded}
              onClick={() => setDesktopExpanded((expanded) => !expanded)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-story-mist hover:text-story-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal"
            >
              {desktopExpanded ? <ChevronLeft aria-hidden className="h-5 w-5" /> : <ChevronRight aria-hidden className="h-5 w-5" />}
            </button>
          </div>
          <div className="w-full">
            <PracticeLinks pathname={pathname} collapsed={!desktopExpanded} />
          </div>
        </div>
      </aside>

      <div className="sticky top-16 z-40 flex min-h-14 w-full items-center border-b border-border-soft bg-[var(--glass-nav-bg)] px-4 backdrop-blur-md lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={mobileOpen ? "practice-mobile-nav" : undefined}
          aria-label="Practice navigation"
          onClick={() => setMobilePath(pathname)}
          className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-story-navy transition-colors hover:bg-story-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal"
        >
          <Menu aria-hidden className="h-5 w-5" />
          <span>Practice</span>
        </button>
        <span aria-hidden className="mx-3 h-5 w-px bg-border-soft" />
        <span className="min-w-0 truncate text-sm font-semibold text-muted">{activeItem.label}</span>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMobileNav();
          }}
        >
          <aside
            ref={drawerRef}
            id="practice-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="practice-mobile-title"
            tabIndex={-1}
            className="flex h-full w-[19rem] max-w-[85vw] flex-col border-r border-border-soft bg-surface px-4 py-6 shadow-[var(--shadow-lift)]"
          >
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <h2 id="practice-mobile-title" className="text-lg font-bold text-story-navy">
                  Practice
                </h2>
                <p className="mt-1 text-sm text-muted">Build confidence by doing</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close practice navigation"
                onClick={closeMobileNav}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-story-mist hover:text-story-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <PracticeLinks pathname={pathname} onNavigate={closeMobileNav} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
