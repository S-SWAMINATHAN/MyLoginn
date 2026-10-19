"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, GraduationCap, House, LayoutGrid, LogIn, Mail, User, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { ProfileUser } from "@/components/layout/ProfileMenu";
import { DuoIcon, type MenuIconKey } from "@/components/ui/icons/DuoIcon";
import { cn } from "@/lib/cn";

type IconComponent = LucideIcon;

type TabItem = {
  key: string;
  label: string;
  icon: IconComponent;
  href?: string;
  /** The signed-in person: their avatar replaces the icon. */
  avatar?: ProfileUser;
  isActive: (pathname: string) => boolean;
};

const servicesPopupLinks: { href: string; label: string; desc: string; icon: MenuIconKey }[] = [
  { href: "/services/app-web-development", label: "App & Web Development", desc: "Websites, mobile and desktop apps", icon: "web" },
  { href: "/services/ai-development", label: "AI Development", desc: "AI agents & intelligent automation", icon: "ai" },
  { href: "/services/digital-marketing", label: "Digital Marketing", desc: "AI-driven growth campaigns", icon: "marketing" },
  { href: "/services/testing-automation", label: "Testing & Automation", desc: "QA, API and Playwright testing", icon: "testing" },
  { href: "/projects", label: "Projects", desc: "Our live client work", icon: "projects" },
  { href: "/careers", label: "Careers", desc: "Join the MyLoginn team", icon: "careers" },
];

const learnPopupLinks: { href: string; label: string; desc: string; icon: MenuIconKey }[] = [
  { href: "/courses", label: "Courses", desc: "Learn job-ready skills", icon: "courses" },
  { href: "/practice", label: "Practice", desc: "AI mock interviews, group discussion & speaking", icon: "practice" },
  { href: "/logiquest", label: "LogiQuest", desc: "Aptitude, reasoning, programming & interview Q&A", icon: "logiquest" },
  { href: "/logiquest/leaderboard", label: "Leaderboard", desc: "Top LogiQuest learners", icon: "leaderboard" },
];

const isLearnPath = (p: string) => p.startsWith("/courses") || p.startsWith("/logiquest") || p.startsWith("/practice") || p === "/tutoring";
const isServicesPath = (p: string) => p.startsWith("/services") || p.startsWith("/projects") || p.startsWith("/careers");

export function MobileBottomNav({ user = null }: { user?: ProfileUser | null }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"learn" | "services" | null>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const tabs: TabItem[] = [
    { key: "home", label: "Home", icon: House, href: "/", isActive: (p) => p === "/" },
    { key: "services", label: "Services", icon: LayoutGrid, isActive: isServicesPath },
    { key: "learn", label: "Learn", icon: GraduationCap, isActive: isLearnPath },
    { key: "contact", label: "Contact Us", icon: Mail, href: "/contact", isActive: (p) => p === "/contact" },
    user
      ? { key: "profile", label: "Profile", icon: User, href: "/profile", avatar: user, isActive: (p) => p.startsWith("/profile") || p.startsWith("/dashboard") }
      : { key: "login", label: "Log in", icon: LogIn, href: "/login", isActive: (p) => p === "/login" || p === "/signup" },
  ];

  return (
    <>
      {/* Spacer so page content and footer aren't hidden behind the fixed bar */}
      <div className="h-[4.5rem] lg:hidden" aria-hidden />

      {/* Grouped navigation popup */}
      <AnimatePresence>
        {openMenu && (
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-x-3 z-50 origin-bottom overflow-hidden max-h-[calc(100dvh-7.5rem)] overflow-y-auto rounded-3xl border border-border-soft bg-surface p-2 shadow-[var(--shadow-lift)]"
              style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
            >
              <p className="px-3.5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-story-royal">
                {openMenu === "learn" ? "MyLoginn Learn" : "Services"}
              </p>
              {(openMenu === "learn" ? learnPopupLinks : servicesPopupLinks).map((s, i) => {
                const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
                return (
                  <motion.div key={s.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.045, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <Link
                      href={s.href}
                      onClick={() => setOpenMenu(null)}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors duration-200 active:scale-[0.98]",
                        active ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/25 dark:ring-brand-700/50" : "hover:bg-surface-2"
                      )}
                    >
                      <span className="transition-transform duration-300 group-active:scale-90">
                        <DuoIcon name={s.icon} delay={0.1 + i * 0.045} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm font-semibold", active && "text-brand-500")}>{s.label}</span>
                        <span className="block truncate text-xs text-muted">{s.desc}</span>
                      </span>
                      <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav
        aria-label="Primary mobile navigation"
        className="glass-nav fixed inset-x-0 bottom-0 z-50 border-t border-border-soft shadow-[0_-8px_30px_rgba(15,15,35,0.08)] lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 items-stretch px-1">
          {tabs.map((tab) => {
            const active = openMenu === tab.key || tab.isActive(pathname);
            return tab.href ? (
              <TabButton key={tab.key} tab={tab} active={active} href={tab.href} />
            ) : (
              <TabButton
                key={tab.key}
                tab={tab}
                active={active}
                expanded={openMenu === tab.key}
                onClick={() => setOpenMenu((menu) => (menu === tab.key ? null : tab.key as "learn" | "services"))}
              />
            );
          })}
        </div>
      </nav>
    </>
  );
}

function TabButton({
  tab,
  active,
  href,
  onClick,
  expanded = false,
}: {
  tab: TabItem;
  active: boolean;
  href?: string;
  onClick?: () => void;
  expanded?: boolean;
}) {
  const Icon = tab.icon;
  const content = (
    <>
      {active && (
        <motion.span
          layoutId="bottom-nav-indicator"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-x-[28%] top-0 h-[3px] rounded-b-full bg-story-royal"
        />
      )}
      {/* keyed by state: switching to active replays the icon drawing itself in, with a small spring */}
      <motion.span
        key={active ? "on" : "off"}
        initial={active ? { scale: 0.7, y: 4 } : false}
        animate={{ scale: 1, y: active ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
        className={cn("relative flex h-7 w-7 items-center justify-center transition-colors duration-200", active ? "text-story-royal" : "text-muted")}
      >
        {tab.avatar ? (
          <span className={cn("rounded-full transition-shadow duration-200", active && "ring-2 ring-story-royal ring-offset-1 ring-offset-background")}>
            <Avatar name={tab.avatar.name} avatarColor={tab.avatar.avatarColor} avatarUrl={tab.avatar.avatarUrl} size={26} fallback="silhouette" />
          </span>
        ) : (
          <Icon className={cn("h-[23px] w-[23px]", active && "icon-draw icon-draw-fast")} strokeWidth={active ? 2.1 : 1.7} />
        )}
      </motion.span>
      <span
        className={cn(
          "relative max-w-full truncate text-[10px] font-semibold leading-none transition-colors duration-200",
          active ? "text-story-royal" : "text-muted"
        )}
      >
        {tab.label}
      </span>
    </>
  );

  const className =
    "relative flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-transform duration-150 active:scale-95 cursor-pointer";

  return href ? (
    <Link href={href} className={className} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} aria-expanded={expanded}>
      {content}
    </button>
  );
}
