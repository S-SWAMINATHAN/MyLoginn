"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ComponentType, CSSProperties } from "react";
import { AnimatedHome } from "@/components/ui/icons/AnimatedHome";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedLayers } from "@/components/ui/icons/AnimatedLayers";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedMegaphone } from "@/components/ui/icons/AnimatedMegaphone";
import { AnimatedCode } from "@/components/ui/icons/AnimatedCode";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { cn } from "@/lib/cn";

type IconComponent = ComponentType<{ className?: string; style?: CSSProperties }>;

type TabItem = {
  key: string;
  label: string;
  icon: IconComponent;
  href?: string;
  isActive: (pathname: string) => boolean;
};

const servicesPopupLinks: { href: string; label: string; desc: string; icon: IconComponent }[] = [
  { href: "/internships", label: "Internship", desc: "Get real-world experience", icon: AnimatedBriefcase },
  { href: "/projects", label: "Project", desc: "Build your portfolio", icon: AnimatedFolder },
  { href: "/services/digital-marketing", label: "Digital Marketing", desc: "AI-driven growth campaigns", icon: AnimatedMegaphone },
  { href: "/services/app-web-development", label: "App & Web Development", desc: "Full-stack builds, premium UX", icon: AnimatedCode },
];

const learnPopupLinks: { href: string; label: string; desc: string; icon: IconComponent }[] = [
  { href: "/courses", label: "Courses", desc: "Learn job-ready skills", icon: AnimatedBook },
  { href: "/tutoring", label: "Tutoring", desc: "1:1 mentor sessions, live classes", icon: AnimatedGraduation },
];

const isLearnPath = (p: string) => p.startsWith("/courses") || p === "/tutoring";
const isServicesPath = (p: string) => p.startsWith("/services") || p.startsWith("/internships") || p.startsWith("/projects");

export function MobileBottomNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"learn" | "services" | null>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const tabs: TabItem[] = [
    { key: "home", label: "Home", icon: AnimatedHome, href: "/", isActive: (p) => p === "/" },
    { key: "learn", label: "Learn", icon: AnimatedBook, isActive: isLearnPath },
    { key: "services", label: "Services", icon: AnimatedLayers, isActive: isServicesPath },
    { key: "contact", label: "Contact Us", icon: AnimatedMail, href: "/contact", isActive: (p) => p === "/contact" },
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
              className="fixed inset-x-3 z-50 origin-bottom overflow-hidden rounded-3xl border border-border-soft bg-surface p-2 shadow-[var(--shadow-lift)]"
              style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
            >
              <div className="pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(31,86,214,0.2),transparent_70%)]" />
              <p className="px-3.5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] brand-gradient-text">
                {openMenu === "learn" ? "Learn" : "Services"}
              </p>
              {(openMenu === "learn" ? learnPopupLinks : servicesPopupLinks).map((s) => {
                const Icon = s.icon;
                const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setOpenMenu(null)}
                    className={cn(
                      "group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-all duration-200 active:scale-[0.98]",
                      active
                        ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/25 dark:ring-brand-700/50"
                        : "hover:bg-surface-2"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <Icon className="h-8 w-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm font-semibold", active && "text-brand-500")}>{s.label}</span>
                      <span className="block truncate text-xs text-muted">{s.desc}</span>
                    </span>
                  </Link>
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
        <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-4 items-stretch px-2">
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
          layoutId="bottom-nav-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-x-0.5 inset-y-1.5 rounded-2xl bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/25 dark:ring-brand-700/50"
        />
      )}
      <motion.span
        animate={active ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="relative flex h-7 w-7 items-center justify-center"
      >
        <Icon className="h-6 w-6" />
      </motion.span>
      <span
        className={cn(
          "relative max-w-full truncate text-[10px] font-semibold leading-none transition-colors duration-200",
          active ? "text-brand-500" : "text-muted"
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
