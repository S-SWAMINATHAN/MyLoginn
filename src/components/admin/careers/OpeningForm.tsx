"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, useToast } from "@/components/admin/Modal";
import { JOB_STATUS_LABEL, JOB_STATUSES, JOB_TEAMS, JOB_TYPES, type JobStatus } from "@/lib/jobs";
import type { JobRow } from "@/lib/careerTypes";

const dateValue = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const toLines = (text: string) => text.split("\n").map((l) => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);

const STATUS_HINT: Record<JobStatus, string> = {
  open: "Visible on the careers page and taking applications.",
  upcoming: "Shown as “Opening soon” with its opening date. It opens by itself on that day.",
  closed: "Shown under closed roles. Applications are switched off.",
  draft: "Hidden from the public while you prepare it.",
};

/** Create or edit a job opening. Lists are typed one per line. */
export function OpeningForm({ job, onClose, onSaved }: { job: JobRow | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState(() => ({
    title: job?.title ?? "",
    team: job?.team ?? JOB_TEAMS[0],
    type: job?.type ?? JOB_TYPES[0],
    location: job?.location ?? "",
    experience: job?.experience ?? "",
    salaryRange: job?.salaryRange ?? "",
    positions: String(job?.positions ?? 1),
    summary: job?.summary ?? "",
    responsibilities: (job?.responsibilities ?? []).join("\n"),
    requirements: (job?.requirements ?? []).join("\n"),
    status: (job?.status as JobStatus) ?? "open",
    openFrom: dateValue(job?.openFrom ?? null),
    closeBy: dateValue(job?.closeBy ?? null),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => setF((s) => ({ ...s, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(job ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs", {
        method: job ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          positions: Number(f.positions),
          responsibilities: toLines(f.responsibilities),
          requirements: toLines(f.requirements),
          openFrom: f.status === "upcoming" || f.openFrom ? f.openFrom : "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not save the opening"); return; }
      toast("success", job ? "Opening updated" : "Opening created");
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} wide title={job ? "Edit opening" : "New opening"} subtitle={job ? job.title : "Set the status to control where it appears on the careers page."}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="field-label">Status</legend>
          <div role="radiogroup" className="mt-1.5 grid grid-cols-2 gap-1 rounded-2xl bg-story-mist p-1 sm:grid-cols-4">
            {JOB_STATUSES.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={f.status === s} onClick={() => set("status", s)} className={cn("relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors", f.status === s ? "text-white" : "text-muted hover:text-story-royal")}>
                {f.status === s && <motion.span layoutId="job-status-pill" className="absolute inset-0 rounded-xl bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{JOB_STATUS_LABEL[s]}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">{STATUS_HINT[f.status]}</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input id="job-title" label="Role title *" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={100} placeholder="e.g. Full-stack Developer" /></div>
          <Select id="job-team" label="Team *" value={f.team} onChange={(e) => set("team", e.target.value)} options={[...JOB_TEAMS, ...(JOB_TEAMS.includes(f.team as (typeof JOB_TEAMS)[number]) ? [] : [f.team])].map((v) => ({ value: v, label: v }))} />
          <Select id="job-type" label="Employment type *" value={f.type} onChange={(e) => set("type", e.target.value)} options={JOB_TYPES.map((v) => ({ value: v, label: v }))} />
          <Input id="job-location" label="Location *" value={f.location} onChange={(e) => set("location", e.target.value)} maxLength={80} placeholder="e.g. Coimbatore, India · Hybrid" />
          <Input id="job-exp" label="Experience" value={f.experience} onChange={(e) => set("experience", e.target.value)} maxLength={60} placeholder="e.g. 0 to 2 years" />
          <Input id="job-salary" label="Salary range (optional)" value={f.salaryRange} onChange={(e) => set("salaryRange", e.target.value)} maxLength={60} placeholder="Shown to candidates if you fill it" />
          <Input id="job-positions" label="Open positions *" type="number" min={1} max={99} value={f.positions} onChange={(e) => set("positions", e.target.value)} />
          <Input id="job-from" label={f.status === "upcoming" ? "Opens on *" : "Opens on (optional)"} type="date" value={f.openFrom} onChange={(e) => set("openFrom", e.target.value)} />
          <Input id="job-close" label="Last day to apply (optional)" type="date" value={f.closeBy} onChange={(e) => set("closeBy", e.target.value)} hint="The role closes by itself after this day." />
        </div>

        <Textarea id="job-summary" label="About the role *" value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={3} maxLength={1200} placeholder="Two or three sentences on what this person will do and why it matters." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea id="job-resp" label="What they will do *" hint="One per line" value={f.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} rows={6} />
          <Textarea id="job-req" label="What we are looking for *" hint="One per line" value={f.requirements} onChange={(e) => set("requirements", e.target.value)} rows={6} />
        </div>

        {error && <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-story-royal">Cancel</button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{busy ? "Saving…" : job ? "Save changes" : "Create opening"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
