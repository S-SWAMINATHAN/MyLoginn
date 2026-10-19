"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, CheckCircle2, Lock, MapPin, Pencil, Plus, Unlock, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/Modal";
import type { InternshipRow } from "@/lib/careerTypes";

const FILTERS = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "all", label: "All" },
] as const;

const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Internships at a glance: open or closed (decided by the apply deadline), with one-click close and reopen and a shortcut to
 * their applications. Full editing (title, stipend, mentor and so on) stays in the Internships manager.
 */
export function InternshipsPanel({ internships, loading, refresh, onViewApplications }: { internships: InternshipRow[]; loading: boolean; refresh: () => void; onViewApplications: () => void }) {
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => ({ open: internships.filter((i) => i.open).length, closed: internships.filter((i) => !i.open).length, all: internships.length }), [internships]);
  const shown = useMemo(() => internships.filter((i) => (filter === "all" ? true : filter === "open" ? i.open : !i.open)), [internships, filter]);

  async function act(i: InternshipRow, action: "close" | "reopen") {
    setBusyId(i.id);
    try {
      const res = await fetch(`/api/admin/careers/internships/${i.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast("error", json.error ?? "Could not update the internship");
      toast("success", action === "close" ? "Internship closed to new applications" : "Internship reopened for 30 days");
      refresh();
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter internships" className="flex gap-1 rounded-full bg-story-mist p-1">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn("relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", filter === f.id ? "text-white" : "text-muted hover:text-story-royal")}>
              {filter === f.id && <motion.span layoutId="intern-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{f.label}</span>
              <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", filter === f.id ? "bg-white/20" : "bg-surface text-muted")}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <Link href="/admin/internships" className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"><Plus className="h-4 w-4" />Add or edit internships</Link>
      </div>

      <ul className="mt-5 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((i) => (
            <motion.li key={i.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.28 }} className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface">
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", i.open ? "bg-emerald-500" : "bg-slate-400")} />
              <div className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 pl-5 sm:p-5 sm:pl-6">
                <div className="min-w-0 flex-1 basis-64">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-story-navy dark:text-foreground">{i.title}</h3>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", i.open ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-slate-500/10 text-slate-600 dark:text-slate-300")}>
                      {i.open ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{i.open ? "Open" : "Closed"}
                    </span>
                    {i.featured && <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">Featured</span>}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="font-semibold text-story-royal">{i.company}</span>
                    <span>{i.type}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{i.location}</span>
                    <span>{i.durationWeeks} weeks</span>
                    <span>{i.paid ? "Paid" : "Unpaid"}</span>
                    <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{i.open ? "Apply by" : "Closed on"} {day(i.applyDeadline)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button onClick={onViewApplications} className="inline-flex items-center gap-1.5 rounded-full bg-story-mist px-3.5 py-1.5 text-xs font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white">
                    <Users className="h-3.5 w-3.5" />{i.applications} applied{i.newApplications ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{i.newApplications} new</span> : null}
                  </button>
                  {i.open ? (
                    <button disabled={busyId === i.id} onClick={() => act(i, "close")} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-slate-400 hover:bg-slate-500/10 disabled:opacity-60"><Lock className="h-3.5 w-3.5" />Close</button>
                  ) : (
                    <button disabled={busyId === i.id} onClick={() => act(i, "reopen")} className="inline-flex items-center gap-1.5 rounded-full bg-story-royal px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"><Unlock className="h-3.5 w-3.5" />Reopen 30 days</button>
                  )}
                  <Link href="/admin/internships" aria-label={`Edit ${i.title}`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><Pencil className="h-3.5 w-3.5" /></Link>
                  <Link href={`/internships/${i.slug}`} target="_blank" aria-label={`View ${i.title} on the site`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {!shown.length && (
        <div className="mt-5 rounded-3xl border border-dashed border-border-soft px-6 py-12 text-center">
          <p className="font-semibold text-story-navy dark:text-foreground">{loading ? "Loading internships…" : filter === "all" ? "No internships yet" : `No ${filter} internships`}</p>
          {!loading && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Internships are open until their apply deadline. Close or reopen them here, or add new ones in the Internships manager.</p>}
        </div>
      )}
    </div>
  );
}
