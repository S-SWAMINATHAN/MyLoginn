"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Building2, CheckCircle2, Clock, EyeOff, Lock, MapPin, Pencil, Plus, Trash2, Unlock, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { ConfirmDialog, useToast, type ConfirmState } from "@/components/admin/Modal";
import { PostingEditor } from "@/components/admin/careers/PostingEditor";
import type { InternshipPostStatus } from "@/lib/jobs";
import type { InternshipRow } from "@/lib/careerTypes";

const FILTERS: { id: InternshipPostStatus | "all"; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "draft", label: "Drafts" },
  { id: "all", label: "All" },
];

const TONE: Record<InternshipPostStatus, { bar: string; chip: string; label: string; Icon: typeof CheckCircle2 }> = {
  open: { bar: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", label: "Open", Icon: CheckCircle2 },
  closed: { bar: "bg-slate-400", chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300", label: "Closed", Icon: Lock },
  draft: { bar: "bg-violet-400", chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300", label: "Draft", Icon: EyeOff },
};

const nfIN = new Intl.NumberFormat("en-IN");
const statusOf = (i: InternshipRow): InternshipPostStatus => (i.status === "closed" || i.status === "draft" ? i.status : "open");

/** Internship postings: create and edit them in the structured posting editor, open, close or draft them, and jump to their applications. */
export function InternshipsPanel({ internships, loading, refresh, onViewApplications }: { internships: InternshipRow[]; loading: boolean; refresh: () => void; onViewApplications: () => void }) {
  const toast = useToast();
  const [filter, setFilter] = useState<InternshipPostStatus | "all">("open");
  const [editing, setEditing] = useState<InternshipRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: internships.length, open: 0, closed: 0, draft: 0 };
    for (const i of internships) c[statusOf(i)] += 1;
    return c;
  }, [internships]);
  const shown = useMemo(() => (filter === "all" ? internships : internships.filter((i) => statusOf(i) === filter)), [internships, filter]);

  async function quick(i: InternshipRow, quickStatus: InternshipPostStatus, message: string) {
    setBusyId(i.id);
    try {
      const res = await fetch(`/api/admin/careers/internships/${i.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quickStatus }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return toast("error", json.error ?? "Could not update the internship");
      toast("success", message);
      refresh();
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function remove(i: InternshipRow) {
    setConfirm({
      title: `Delete “${i.title}”?`,
      message: i.applications ? `This removes the internship and its ${i.applications} application${i.applications === 1 ? "" : "s"}. Close it instead to keep them.` : "This removes the internship permanently.",
      confirmLabel: "Delete internship",
      tone: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/careers/internships/${i.id}`, { method: "DELETE" });
        if (!res.ok) { toast("error", "Could not delete the internship"); return; }
        toast("success", "Internship deleted");
        refresh();
      },
    });
  }

  const primary = (i: InternshipRow) => {
    const s = statusOf(i);
    const base = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60";
    if (s === "open") return <button disabled={busyId === i.id} onClick={() => quick(i, "closed", "Internship closed to new applications")} className={cn(base, "border border-border-soft hover:border-slate-400 hover:bg-slate-500/10")}><Lock className="h-3.5 w-3.5" />Close</button>;
    if (s === "closed") return <button disabled={busyId === i.id} onClick={() => quick(i, "open", "Internship reopened")} className={cn(base, "bg-story-royal text-white hover:opacity-90")}><Unlock className="h-3.5 w-3.5" />Reopen</button>;
    return <button disabled={busyId === i.id} onClick={() => quick(i, "open", "Internship published")} className={cn(base, "bg-story-royal text-white hover:opacity-90")}><CheckCircle2 className="h-3.5 w-3.5" />Publish</button>;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter internships" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn("relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", filter === f.id ? "text-white" : "text-muted hover:text-story-royal")}>
              {filter === f.id && <motion.span layoutId="intern-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{f.label}</span>
              <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", filter === f.id ? "bg-white/20" : "bg-surface text-muted")}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"><Plus className="h-4 w-4" />New internship</button>
      </div>

      <ul className="mt-5 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((i) => {
            const tone = TONE[statusOf(i)];
            return (
              <motion.li key={i.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.28 }} className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface">
                <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", tone.bar)} />
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 pl-5 sm:p-5 sm:pl-6">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-story-navy dark:text-foreground">{i.title}</h3>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", tone.chip)}><tone.Icon className="h-3 w-3" />{tone.label}</span>
                      {i.featured && <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">Featured</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{i.description.replace(/\*\*/g, "")}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="font-semibold text-story-royal">{i.company}</span>
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{i.workMode}</span>
                      {i.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{i.location}</span>}
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{i.durationWeeks} weeks</span>
                      <span className="inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{!i.paid ? "Unpaid" : i.stipend ? `₹${nfIN.format(i.stipend)} / month` : "Stipend to be discussed"}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button onClick={onViewApplications} className="inline-flex items-center gap-1.5 rounded-full bg-story-mist px-3.5 py-1.5 text-xs font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white">
                      <Users className="h-3.5 w-3.5" />{i.applications} applied{i.newApplications ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{i.newApplications} new</span> : null}
                    </button>
                    {primary(i)}
                    <button onClick={() => setEditing(i)} aria-label={`Edit ${i.title}`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><Pencil className="h-3.5 w-3.5" /></button>
                    {statusOf(i) !== "draft" && <Link href={`/internships/${i.slug}`} target="_blank" aria-label={`View ${i.title} on the site`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><ArrowUpRight className="h-3.5 w-3.5" /></Link>}
                    <button onClick={() => remove(i)} aria-label={`Delete ${i.title}`} className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {!shown.length && (
        <div className="mt-5 rounded-3xl border border-dashed border-border-soft px-6 py-12 text-center">
          <p className="font-semibold text-story-navy dark:text-foreground">{loading ? "Loading internships…" : filter === "all" ? "No internships yet" : `No ${filter === "draft" ? "draft" : filter} internships`}</p>
          {!loading && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Internships have no end date. They stay open until you close them here.</p>}
          {!loading && <button onClick={() => setEditing("new")} className="mt-4 inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />New internship</button>}
        </div>
      )}

      {editing && <PostingEditor kind="internship" internship={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={refresh} />}
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
