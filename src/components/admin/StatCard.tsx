"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { LiveNumber } from "@/components/admin/charts";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";

export function StatCard({
  label,
  value,
  prefix = "",
  sub,
  href,
  icon,
  accent = "brand",
  index = 0,
  loading = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  sub?: string;
  href?: string;
  icon: React.ReactNode;
  accent?: "brand" | "cyan" | "amber" | "green" | "rose";
  index?: number;
  loading?: boolean;
}) {
  const accents: Record<string, { top: string; chip: string }> = {
    brand: { top: "from-brand-500 to-brand-700", chip: "bg-brand-50 dark:bg-brand-900/25" },
    cyan: { top: "from-accent-400 to-accent-600", chip: "bg-accent-500/10" },
    amber: { top: "from-amber-400 to-amber-600", chip: "bg-amber-500/10" },
    green: { top: "from-emerald-400 to-emerald-600", chip: "bg-emerald-500/10" },
    rose: { top: "from-rose-400 to-rose-600", chip: "bg-rose-500/10" },
  };
  const a = accents[accent];

  const body = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] transition-all duration-300",
        href && "cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", a.top)} />
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.chip)}>{icon}</span>
        {href && (
          <AnimatedArrow className="h-4 w-4 -rotate-45 opacity-50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
        )}
      </div>
      {loading ? (
        <span className="mt-4 block h-7 w-20 animate-pulse rounded-full bg-surface-2" />
      ) : (
        <LiveNumber value={value} prefix={prefix} className="mt-4 text-2xl font-bold leading-none" />
      )}
      <p className="mt-1.5 text-xs font-medium text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-success">{sub}</p>}
    </motion.div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
