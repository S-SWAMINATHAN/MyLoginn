"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CalendarClock, CheckCircle2, Clock, EyeOff, Lock, MapPin, Pencil, Plus, Trash2, Unlock, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { ConfirmDialog, useToast, type ConfirmState } from "@/components/admin/Modal";
import { PostingEditor } from "@/components/admin/careers/PostingEditor";
import { JOB_STATUS_LABEL, type JobStatus } from "@/lib/jobs";
import type { JobRow } from "@/lib/careerTypes";

const FILTERS: { id: JobStatus | "all"; label: string }[] = [
  { id: "open", label: "Current" },
  { id: "upcoming", label: "Upcoming" },
  { id: "closed", label: "Closed" },
  { id: "draft", label: "Drafts" },
  { id: "all", label: "All" },
];

const TONE: Record<JobStatus, { bar: string; chip: string; Icon: typeof CheckCircle2 }> = {
  open: { bar: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Icon: CheckCircle2 },
  upcoming: { bar: "bg-amber-500", chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300", Icon: CalendarClock },
  closed: { bar: "bg-slate-400", chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300", Icon: Lock },
  draft: { bar: "bg-violet-400", chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300", Icon: EyeOff },
};

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

/** Current, upcoming, closed and draft openings, with one-click status changes, editing and removal. */
export function OpeningsPanel({ jobs, loading, refresh, onViewApplications }: { jobs: JobRow[]; loading: boolean; refresh: () => void; onViewApplications: (jobId: string) => void }) {
  const toast = useToast();
  const [filter, setFilter] = useState<JobStatus | "all">("open");
  const [editing, setEditing] = useState<JobRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length, open: 0, upcoming: 0, closed: 0, draft: 0 };
    for (const j of jobs) c[j.effective] += 1;
    return c;
  }, [jobs]);
  const shown = useMemo(() => (filter === "all" ? jobs : jobs.filter((j) => j.effective === filter)), [jobs, filter]);

  async function quick(job: JobRow, quickStatus: "open" | "closed" | "draft", message: string) {
    setBusyId(job.id);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quickStatus }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast("error", json.error ?? "Could not update the opening");
      toast("success", message);
      refresh();
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function remove(job: JobRow) {
    setConfirm({
      title: `Delete “${job.title}”?`,
      message: job.applications ? `This removes the opening. Its ${job.applications} application${job.applications === 1 ? "" : "s"} are kept and show as open applications.` : "This removes the opening permanently.",
      confirmLabel: "Delete opening",
      tone: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
        if (!res.ok) { toast("error", "Could not delete the opening"); return; }
        toast("success", "Opening deleted");
        refresh();
      },
    });
  }

  const primary = (job: JobRow) => {
    const s = job.effective;
    const base = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60";
    if (s === "open") return <button disabled={busyId === job.id} onClick={() => quick(job, "closed", "Role closed")} className={cn(base, "border border-border-soft hover:border-slate-400 hover:bg-slate-500/10")}><Lock className="h-3.5 w-3.5" />Close</button>;
    if (s === "upcoming") return <button disabled={busyId === job.id} onClick={() => quick(job, "open", "Role is now open")} className={cn(base, "bg-story-royal text-white hover:opacity-90")}><Unlock className="h-3.5 w-3.5" />Open now</button>;
    if (s === "closed") return <button disabled={busyId === job.id} onClick={() => quick(job, "open", "Role reopened")} className={cn(base, "bg-story-royal text-white hover:opacity-90")}><Unlock className="h-3.5 w-3.5" />Reopen</button>;
    return <button disabled={busyId === job.id} onClick={() => quick(job, "open", "Role published")} className={cn(base, "bg-story-royal text-white hover:opacity-90")}><CheckCircle2 className="h-3.5 w-3.5" />Publish</button>;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter openings" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn("relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", filter === f.id ? "text-white" : "text-muted hover:text-story-royal")}>
              {filter === f.id && <motion.span layoutId="openings-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{f.label}</span>
              <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", filter === f.id ? "bg-white/20" : "bg-surface text-muted")}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"><Plus className="h-4 w-4" />New opening</button>
      </div>

      <ul className="mt-5 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((job) => {
            const tone = TONE[job.effective];
            const opens = day(job.openFrom);
            return (
              <motion.li key={job.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.28 }} className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface">
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", tone.bar)} />
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 pl-5 sm:p-5 sm:pl-6">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-story-navy dark:text-foreground">{job.title}</h3>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", tone.chip)}><tone.Icon className="h-3 w-3" />{JOB_STATUS_LABEL[job.effective]}</span>
                      {job.status !== job.effective && <span className="text-[11px] text-muted">(set to {job.status}; dates changed it)</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{job.summary}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="font-semibold text-story-royal">{job.team}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</span>
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.workMode}</span>
                      {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                      {job.experience && <span>{job.experience}</span>}
                      {job.salaryRange && <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{job.salaryRange}</span>}
                      <span>{job.positions} {job.positions === 1 ? "position" : "positions"}</span>
                      {job.effective === "upcoming" && opens && <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />Opens {opens}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button onClick={() => onViewApplications(job.id)} className="inline-flex items-center gap-1.5 rounded-full bg-story-mist px-3.5 py-1.5 text-xs font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white">
                      <Users className="h-3.5 w-3.5" />{job.applications} applied{job.newApplications ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{job.newApplications} new</span> : null}
                    </button>
                    {primary(job)}
                    <button onClick={() => setEditing(job)} aria-label={`Edit ${job.title}`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(job)} aria-label={`Delete ${job.title}`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {!shown.length && (
        <div className="mt-5 rounded-3xl border border-dashed border-border-soft px-6 py-12 text-center">
          <p className="font-semibold text-story-navy dark:text-foreground">{loading ? "Loading openings…" : filter === "all" ? "No openings yet" : `No ${JOB_STATUS_LABEL[filter as JobStatus].toLowerCase()} roles`}</p>
          {!loading && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{filter === "all" || filter === "open" ? "Create your first opening and it appears on the careers page as soon as it is open." : "Roles move here when you change their status or their dates pass."}</p>}
          {!loading && <button onClick={() => setEditing("new")} className="mt-4 inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />New opening</button>}
        </div>
      )}

      {editing && <PostingEditor kind="job" job={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={refresh} />}
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
