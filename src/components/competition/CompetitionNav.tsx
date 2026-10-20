"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/coding-competition", label: "Overview" },
  { href: "/coding-competition/rules", label: "Rules" },
  { href: "/coding-competition/instructions", label: "Instructions" },
  { href: "/coding-competition/leaderboard", label: "Leaderboard" },
  { href: "/coding-competition/dashboard", label: "My dashboard" },
];

/** Section navigation for the competition pages (hidden in the exam arena). */
export function CompetitionNav({ registered }: { registered: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/coding-competition/arena")) return null;
  const active = (href: string) => (href === "/coding-competition" ? pathname === href : pathname.startsWith(href));
  return (
    <div className="sticky top-16 z-30 border-b border-border-soft bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-8">
        <Link href="/coding-competition" className="hidden items-center gap-2 py-3 text-sm font-bold text-story-royal md:flex">
          <Trophy className="h-4 w-4" /> Coding Competition
        </Link>
        <nav aria-label="Competition" className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 py-2 [scrollbar-width:none] md:justify-center">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined} className={cn("relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", active(t.href) ? "text-white" : "text-foreground/75 hover:bg-surface-2 hover:text-foreground")}>
              {active(t.href) && <motion.span layoutId="cc-tab" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{t.label}</span>
            </Link>
          ))}
        </nav>
        {!registered && !pathname.startsWith("/coding-competition/register") && (
          <Link href="/coding-competition/register" className="hidden shrink-0 rounded-full bg-story-royal px-4 py-1.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] sm:inline-flex">
            Register
          </Link>
        )}
      </div>
    </div>
  );
}
