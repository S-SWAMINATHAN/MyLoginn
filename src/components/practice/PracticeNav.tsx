"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/practice", label: "Dashboard", exact: true },
  { href: "/practice/interview", label: "AI Interview" },
  { href: "/practice/gd", label: "Group Discussion" },
  { href: "/practice/speaking", label: "Speaking Lab" },
  { href: "/practice/reports", label: "My Reports" },
];

/** Section menu under the site header, styled like the LogiQuest one. Plain links, so it costs nothing to render. */
export function PracticeNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-16 z-40 border-b border-border-soft bg-[var(--glass-nav-bg)] backdrop-blur-md">
      <nav aria-label="Practice sections" className="no-scrollbar mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-3 py-1.5 sm:px-6">
        <Link href="/practice" className="mr-2 shrink-0 text-sm font-extrabold tracking-tight text-story-royal">Practice</Link>
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors", active ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
