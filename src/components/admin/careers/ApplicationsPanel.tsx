"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, FileText, Link2, Loader2, Mail, MessageCircle, Phone, Save, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/Modal";
import { useLiveData } from "@/components/admin/useLiveData";
import { timeAgo } from "@/components/admin/format";
import { statusesFor } from "@/lib/jobs";
import type { ApplicationRow, ApplicationsResponse } from "@/lib/careerTypes";

/** Pipeline stages. Job and internship applications use different status names; a stage groups the equivalent ones. */
const STAGES = [
  { id: "new", label: "New", statuses: ["new", "submitted"], chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  { id: "reviewing", label: "Reviewing", statuses: ["reviewing", "under_review"], chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { id: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"], chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { id: "interview", label: "Interview", statuses: ["interview"], chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { id: "offer", label: "Offer", statuses: ["offered", "accepted"], chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { id: "hired", label: "Hired", statuses: ["hired"], chip: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-200" },
  { id: "rejected", label: "Rejected", statuses: ["rejected"], chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
] as const;

const stageOf = (status: string) => STAGES.find((s) => (s.statuses as readonly string[]).includes(status)) ?? STAGES[0];
const keyOf = (r: ApplicationRow) => `${r.source}:${r.id}`;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia("(min-width: 1024px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true
  );
}

function Stars({ value, onChange, size = "md" }: { value: number | null; onChange?: (n: number) => void; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-3 w-3" : "h-5 w-5";
  return (
    <span className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={value ? `Rated ${value} out of 5` : "Not rated"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = (value ?? 0) >= n;
        const star = <Star className={cn(dim, "transition-colors", on ? "fill-amber-400 text-amber-400" : "text-border-soft")} />;
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n === 1 ? "" : "s"}`} onClick={() => onChange(value === n ? 0 : n)} className="rounded p-0.5 transition-transform hover:scale-110 active:scale-95">{star}</button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

/* ── Detail / review panel ──────────────────────────────────────────── */

function Detail({ row, onSaved }: { row: ApplicationRow; onSaved: () => void }) {
  const toast = useToast();
  const [notes, setNotes] = useState(row.notes ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState(row.status);
  const [rating, setRating] = useState<number | null>(row.rating);
  const base = `/api/admin/careers/applications/${row.source}/${row.id}`;
  const dirty = (notes.trim() || "") !== (row.notes ?? "");
  const wa = row.phone ? `https://wa.me/${row.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${row.name.split(" ")[0]}, this is MyLoginn regarding your application for ${row.role}.`)}` : null;

  async function save(patch: { status?: string; rating?: number; notes?: string }, what: string) {
    setSaving(what);
    try {
      const res = await fetch(base, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { toast("error", json.error ?? "Could not save the review"); return false; }
      toast("success", what === "notes" ? "Notes saved" : what === "status" ? "Status updated" : "Rating saved");
      onSaved();
      return true;
    } catch {
      toast("error", "Network error. Please try again.");
      return false;
    } finally {
      setSaving(null);
    }
  }

  const options = statusesFor(row.source);
  const pill = "inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-2 text-xs font-semibold transition-colors hover:border-story-royal hover:text-story-royal";

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3.5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-story-royal text-lg font-bold text-white">{initials(row.name)}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-story-navy dark:text-foreground">{row.name}</h3>
          <p className="truncate text-sm text-muted">{row.role}</p>
          <p className="mt-0.5 text-xs text-muted">Applied {timeAgo(row.appliedAt)}{row.reviewedAt ? ` · last reviewed ${timeAgo(row.reviewedAt)}` : ""}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", stageOf(status).chip)}>{stageOf(status).label}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`mailto:${row.email}`} className={pill}><Mail className="h-3.5 w-3.5" />{row.email}</a>
        {row.phone && <a href={`tel:${row.phone}`} className={pill}><Phone className="h-3.5 w-3.5" />{row.phone}</a>}
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={pill}><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}
        {row.profileUrl && <a href={row.profileUrl} target="_blank" rel="noopener noreferrer nofollow" className={pill}><Link2 className="h-3.5 w-3.5" />Profile link</a>}
      </div>

      {(row.experienceYears !== null || row.currentRole) && (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {row.experienceYears !== null && <div className="rounded-2xl bg-story-mist px-4 py-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Experience</dt><dd className="mt-0.5 font-semibold">{row.experienceYears === 0 ? "Fresher" : `${row.experienceYears} year${row.experienceYears === 1 ? "" : "s"}`}</dd></div>}
          {row.currentRole && <div className="rounded-2xl bg-story-mist px-4 py-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Current role</dt><dd className="mt-0.5 font-semibold">{row.currentRole}</dd></div>}
        </dl>
      )}

      {row.coverNote && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Note from the candidate</h4>
          <p className="mt-1.5 whitespace-pre-line rounded-2xl border border-border-soft p-4 text-sm leading-6">{row.coverNote}</p>
        </section>
      )}

      {/* CV viewer */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">CV / resume</h4>
          {row.resumeType && (
            <div className="flex gap-2">
              {row.resumeType === "pdf" && <a href={`${base}/resume`} target="_blank" rel="noopener noreferrer" className={pill}><ExternalLink className="h-3.5 w-3.5" />Open in new tab</a>}
              <a href={`${base}/resume?download=1`} className={pill}><Download className="h-3.5 w-3.5" />Download</a>
            </div>
          )}
        </div>
        {row.resumeType === "pdf" ? (
          <iframe key={row.id} title={`CV of ${row.name}`} src={`${base}/resume#toolbar=0&navpanes=0`} className="mt-2 h-[32rem] w-full rounded-2xl border border-border-soft bg-white" />
        ) : row.resumeType ? (
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border-soft p-4">
            <span className="grid h-11 w-11 place-items-center text-story-royal"><FileText className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{row.resumeName}</p><p className="text-xs text-muted">{row.resumeType.toUpperCase()} files can&apos;t be previewed in the browser. Download it to read.</p></div>
          </div>
        ) : (
          <p className="mt-2 rounded-2xl border border-dashed border-border-soft p-4 text-sm text-muted">No CV was attached to this application.</p>
        )}
      </section>

      {/* Review */}
      <section className="rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Review</h4>
        <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Application status">
          {options.map((o) => {
            const on = status === o.id;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} disabled={saving === "status"} onClick={async () => { const prev = status; setStatus(o.id); if (!(await save({ status: o.id }, "status"))) setStatus(prev); }} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60", on ? "border-story-royal bg-story-royal text-white" : "border-border-soft hover:border-story-royal hover:text-story-royal")}>{o.label}</button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-semibold">Rating</span>
          <Stars value={rating} onChange={async (n) => { const prev = rating; setRating(n || null); if (!(await save({ rating: n }, "rating"))) setRating(prev); }} />
        </div>
        <label htmlFor="review-notes" className="mt-4 block text-sm font-semibold">Private notes</label>
        <textarea id="review-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={3000} placeholder="Strengths, concerns, interview feedback. Only admins can see this." className="mt-1.5 w-full rounded-2xl border border-border-soft bg-background p-3 text-sm outline-none transition-[border-color,box-shadow] focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.14)]" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{notes.length}/3000</span>
          <button type="button" disabled={!dirty || saving === "notes"} onClick={() => save({ notes: notes.trim() }, "notes")} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50">
            {saving === "notes" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save notes
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── Inbox ──────────────────────────────────────────────────────────── */

/** Every application in one inbox: filter, open a candidate, read their CV in the page and review them. */
export function ApplicationsPanel({ presetJobId, presetKind, jobTitle, clearJob }: { presetJobId?: string; presetKind?: "all" | "job" | "internship"; jobTitle?: string; clearJob?: () => void }) {
  const isDesktop = useIsDesktop();
  const [kind, setKind] = useState<"all" | "job" | "internship">(presetKind ?? "all");
  const [stage, setStage] = useState<string>("");
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setQ(query.trim()), 250); return () => clearTimeout(t); }, [query]);

  const url = useMemo(() => {
    const p = new URLSearchParams({ kind });
    const st = STAGES.find((s) => s.id === stage);
    if (st) p.set("status", st.statuses.join(","));
    if (presetJobId) p.set("jobId", presetJobId);
    if (q) p.set("q", q);
    return `/api/admin/careers/applications?${p}`;
  }, [kind, stage, presetJobId, q]);

  const { data, loading, error, refresh } = useLiveData<ApplicationsResponse>(url, { intervalMs: 30_000 });
  const rows = data?.rows ?? [];
  const current = rows.find((r) => keyOf(r) === selected) ?? (isDesktop ? rows[0] : undefined);
  const open = useCallback((r: ApplicationRow) => setSelected(keyOf(r)), []);

  const seg = (id: typeof kind, label: string, n?: number) => (
    <button key={id} role="tab" aria-selected={kind === id} onClick={() => setKind(id)} className={cn("relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", kind === id ? "text-white" : "text-muted hover:text-story-royal")}>
      {kind === id && <motion.span layoutId="apps-kind-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
      <span className="relative">{label}</span>
      {n !== undefined && <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", kind === id ? "bg-white/20" : "bg-surface text-muted")}>{n}</span>}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Application type" className="flex gap-1 rounded-full bg-story-mist p-1">
          {seg("all", "All", data?.counts.all)}
          {seg("job", "Jobs", data?.counts.job)}
          {seg("internship", "Internships", data?.counts.internship)}
        </div>
        <label className="relative ml-auto flex min-w-[14rem] flex-1 items-center sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" aria-hidden />
          <span className="sr-only">Search applications</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or role" className="w-full rounded-full border border-border-soft bg-surface py-2 pl-10 pr-9 text-sm outline-none transition-[border-color,box-shadow] focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.12)]" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 grid h-5 w-5 place-items-center rounded-full text-muted hover:text-story-royal"><X className="h-3.5 w-3.5" /></button>}
        </label>
      </div>

      <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
        {presetJobId && (
          <button onClick={clearJob} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-story-royal px-3 py-1.5 text-xs font-semibold text-white">Role: {jobTitle ?? "selected"}<X className="h-3 w-3" /></button>
        )}
        {[{ id: "", label: "All stages", chip: "" }, ...STAGES].map((s) => (
          <button key={s.id} onClick={() => setStage(s.id)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", stage === s.id ? "border-story-royal bg-story-royal/10 text-story-royal" : "border-border-soft text-muted hover:border-story-royal hover:text-story-royal")}>{s.label}</button>
        ))}
      </div>

      {error && <p role="alert" className="mt-3 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ul className="max-h-[calc(100vh-14rem)] space-y-2 overflow-y-auto pr-1 lg:sticky lg:top-24">
          {rows.map((r) => {
            const st = stageOf(r.status);
            const on = current && keyOf(current) === keyOf(r);
            return (
              <li key={keyOf(r)}>
                <button onClick={() => open(r)} aria-current={on ? "true" : undefined} className={cn("relative w-full rounded-2xl border p-3.5 text-left transition-colors", on ? "border-story-royal bg-story-royal/[0.06]" : "border-border-soft bg-surface hover:border-story-royal/40")}>
                  <span className="flex items-start gap-3">
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-story-mist text-sm font-bold text-story-royal">
                      {initials(r.name)}
                      {r.unreviewed && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-rose-500" aria-label="Not reviewed yet" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{r.name}</span><span className="shrink-0 text-[11px] text-muted">{timeAgo(r.appliedAt)}</span></span>
                      <span className="block truncate text-xs text-muted">{r.role}</span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", st.chip)}>{st.label}</span>
                        {r.rating ? <Stars value={r.rating} size="sm" /> : null}
                        {r.resumeType && <FileText className="ml-auto h-3.5 w-3.5 text-muted" aria-label="CV attached" />}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {!rows.length && (
            <li className="rounded-3xl border border-dashed border-border-soft px-5 py-10 text-center text-sm text-muted">
              {loading ? "Loading applications…" : q || stage || presetJobId ? "No applications match these filters." : "No applications yet. They appear here as soon as candidates apply."}
            </li>
          )}
        </ul>

        {isDesktop && (
          <div className="min-w-0">
            {current ? (
              <motion.div key={keyOf(current)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
                <Detail row={current} onSaved={refresh} />
              </motion.div>
            ) : (
              <div className="grid min-h-[16rem] place-items-center rounded-3xl border border-dashed border-border-soft p-8 text-center text-sm text-muted">Select an application to read the CV and review the candidate.</div>
            )}
          </div>
        )}
      </div>

      {/* Phones and tablets: the candidate opens full screen. */}
      <AnimatePresence>
        {!isDesktop && selected && current && (
          <motion.div key="sheet" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[70] overflow-y-auto bg-background">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border-soft bg-background/95 px-4 py-3 backdrop-blur">
              <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-1.5 text-sm font-semibold"><ArrowLeft className="h-4 w-4" />Back</button>
              <span className="truncate text-sm font-semibold">{current.name}</span>
            </div>
            <div className="mx-auto max-w-2xl p-4 pb-24"><Detail row={current} onSaved={refresh} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
