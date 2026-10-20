"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardPaste, Copy, Eye, FileText, Loader2, PenLine, Save, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/admin/Modal";
import { ListEditor, fromItems, toItems, type ListItem } from "@/components/admin/careers/ListEditor";
import { PostingPreview } from "@/components/admin/careers/PostingPreview";
import { INTERNSHIP_POST_STATUSES, JOB_STATUS_LABEL, JOB_STATUSES, JOB_TEAMS, JOB_TYPES, type InternshipPostStatus, type JobStatus } from "@/lib/jobs";
import {
  BENEFIT_SUGGESTIONS, DEFAULT_COMPANY, POSTING_SECTIONS, POSTING_TEMPLATES, SALARY_OPTIONS, STIPEND_OPTIONS, WORK_MODES,
  parsePosting, postingToMarkdown, type Posting, type PostingKind,
} from "@/lib/postings";
import type { InternshipRow, JobRow } from "@/lib/careerTypes";

const nfIN = new Intl.NumberFormat("en-IN");
const CUSTOM = "__custom";

const JOB_STATUS_HINT: Record<JobStatus, string> = {
  open: "Visible on the careers page and taking applications until you close it.",
  upcoming: "Shown as “Opening soon” with its opening date. It opens by itself on that day.",
  closed: "Shown under closed roles. Applications are switched off.",
  draft: "Hidden from the public while you prepare it.",
};
const INTERN_STATUS_LABEL: Record<InternshipPostStatus, string> = { open: "Open", closed: "Closed", draft: "Draft" };
const INTERN_STATUS_HINT: Record<InternshipPostStatus, string> = {
  open: "Listed on the site and taking applications until you close it.",
  closed: "Still visible, but applications are switched off.",
  draft: "Hidden from the public while you prepare it.",
};

type Form = {
  title: string;
  company: string;
  workMode: string;
  location: string;
  about: string;
  responsibilities: ListItem[];
  requirements: ListItem[];
  goodToHave: ListItem[];
  benefits: ListItem[];
  idealCandidate: string;
  applyUrl: string;
  status: string;
  // Job openings
  jobTypes: string[];
  team: string;
  experience: string;
  salary: string;
  customSalary: string;
  positions: string;
  openFrom: string;
  // Internships
  durationWeeks: string;
  /** "unpaid", "tbd", an amount, or CUSTOM. */
  stipend: string;
  customStipend: string;
  mentorName: string;
  mentorEmail: string;
  featured: boolean;
};

function initialForm(kind: PostingKind, job: JobRow | null, intern: InternshipRow | null): Form {
  const salary = job?.salaryRange ?? "";
  const stipendValue = intern ? (!intern.paid ? "unpaid" : !intern.stipend ? "tbd" : (STIPEND_OPTIONS as readonly number[]).includes(intern.stipend) ? String(intern.stipend) : CUSTOM) : "tbd";
  const src = job ?? intern;
  return {
    title: src?.title ?? "",
    company: src?.company ?? DEFAULT_COMPANY,
    workMode: (src?.workMode && (WORK_MODES as readonly string[]).includes(src.workMode) ? src.workMode : null) ?? "On-site",
    location: src?.location ?? "",
    about: job?.summary ?? intern?.description ?? "",
    responsibilities: toItems(src?.responsibilities.length ? src.responsibilities : [""]),
    requirements: toItems(src?.requirements.length ? src.requirements : [""]),
    goodToHave: toItems(src?.goodToHave.length ? src.goodToHave : [""]),
    benefits: toItems(src?.benefits.length ? src.benefits : [""]),
    idealCandidate: src?.idealCandidate ?? "",
    applyUrl: src?.applyUrl ?? "",
    status: src?.status ?? "open",
    jobTypes: job ? job.type.split("/").map((t) => t.trim()).filter(Boolean) : ["Full-time"],
    team: job?.team ?? JOB_TEAMS[0],
    experience: job?.experience ?? "",
    salary: !salary ? "" : (SALARY_OPTIONS as readonly string[]).includes(salary) ? salary : CUSTOM,
    customSalary: salary && !(SALARY_OPTIONS as readonly string[]).includes(salary) ? salary : "",
    positions: String(job?.positions ?? 1),
    openFrom: job?.openFrom ? job.openFrom.slice(0, 10) : "",
    durationWeeks: String(intern?.durationWeeks ?? 8),
    stipend: stipendValue,
    customStipend: stipendValue === CUSTOM && intern?.stipend ? String(intern.stipend) : "",
    mentorName: intern?.mentorName ?? "",
    mentorEmail: intern?.mentorEmail ?? "",
    featured: intern?.featured ?? false,
  };
}

const SECTIONS = [
  { id: "basics", label: "Basics" },
  ...POSTING_SECTIONS.map((s) => ({ id: s.key, label: s.heading })),
  { id: "publish", label: "Apply & publish" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * Create or edit a job opening or an internship as a structured posting: header details, About the role, Key
 * responsibilities, Requirements, Good to have, What you'll gain, Who we're looking for and Apply. A live preview
 * mirrors the posting as candidates will read it; a posting can be pasted in to fill the form, started from a
 * template, or copied out as text for job boards. There are no end dates: the status decides when it is open.
 */
export function PostingEditor({ kind, job = null, internship = null, onClose, onSaved }: { kind: PostingKind; job?: JobRow | null; internship?: InternshipRow | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const editing = Boolean(job ?? internship);
  const [f, setF] = useState<Form>(() => initialForm(kind, job, internship));
  const [initial] = useState(() => JSON.stringify(initialForm(kind, job, internship), (k, v) => (k === "id" ? undefined : v)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [tool, setTool] = useState<"paste" | "templates" | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [active, setActive] = useState<SectionId>("basics");
  const scroller = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setF((s) => ({ ...s, [key]: value }));
  const dirty = JSON.stringify(f, (k, v) => (k === "id" ? undefined : v)) !== initial;

  /* ── Derived posting (for preview, copy and completeness) ── */
  const salaryText = f.salary === CUSTOM ? f.customSalary.trim() : f.salary;
  const stipendAmount = f.stipend === CUSTOM ? Number(f.customStipend) || 0 : Number(f.stipend) || 0;
  const payText = kind === "job" ? salaryText : f.stipend === "unpaid" ? "Unpaid" : stipendAmount ? `₹${nfIN.format(stipendAmount)} / month` : "Stipend to be discussed";

  const posting: Posting = useMemo(() => ({
    title: f.title.trim(),
    company: f.company.trim(),
    jobType: kind === "job" ? JOB_TYPES.filter((t) => f.jobTypes.includes(t)).join(" / ") : "Internship",
    workMode: f.workMode,
    location: f.location,
    about: f.about,
    responsibilities: fromItems(f.responsibilities),
    requirements: fromItems(f.requirements),
    goodToHave: fromItems(f.goodToHave),
    benefits: fromItems(f.benefits),
    idealCandidate: f.idealCandidate,
    applyUrl: f.applyUrl,
  }), [f, kind]);

  const extras = kind === "job"
    ? [f.team, f.experience.trim(), payText ? `Salary: ${payText}` : "", `${f.positions || 1} ${Number(f.positions) === 1 ? "position" : "positions"}`].filter(Boolean)
    : [`${f.durationWeeks || "?"} weeks`, payText].filter(Boolean);

  const done: Record<SectionId, boolean> = {
    basics: Boolean(posting.title.length >= 3 && posting.company && posting.jobType),
    about: posting.about.trim().length >= 20,
    responsibilities: posting.responsibilities.length > 0,
    requirements: posting.requirements.length > 0,
    goodToHave: posting.goodToHave.length > 0,
    benefits: posting.benefits.length > 0,
    idealCandidate: posting.idealCandidate.trim().length > 0,
    publish: kind === "internship" || f.status !== "upcoming" || Boolean(f.openFrom),
  };
  const required: SectionId[] = ["basics", "about", "responsibilities", "requirements", "publish"];
  const missing = required.filter((id) => !done[id]);
  const filled = SECTIONS.filter((s) => done[s.id]).length;

  /* ── Window behaviour ── */
  function requestClose() {
    if (dirty && !busy) setConfirmClose(true);
    else onClose();
  }
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=listbox]")) { e.preventDefault(); requestClose(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); void save(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  });

  // Highlight the section being edited in the section bar.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const obs = new IntersectionObserver((entries) => {
      const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setActive(top.target.id.replace("sec-", "") as SectionId);
    }, { root, rootMargin: "0px 0px -60% 0px" });
    root.querySelectorAll("[data-section]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [view]);

  const jump = (id: SectionId) => {
    setView("edit");
    requestAnimationFrame(() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /* ── Fill helpers ── */
  function fill(p: Partial<Posting>) {
    setF((s) => ({
      ...s,
      ...(p.title ? { title: p.title } : {}),
      ...(p.company ? { company: p.company } : {}),
      ...(p.workMode && (WORK_MODES as readonly string[]).includes(p.workMode) ? { workMode: p.workMode } : {}),
      ...(p.location ? { location: p.location } : {}),
      ...(p.about ? { about: p.about } : {}),
      ...(p.responsibilities?.length ? { responsibilities: toItems(p.responsibilities) } : {}),
      ...(p.requirements?.length ? { requirements: toItems(p.requirements) } : {}),
      ...(p.goodToHave?.length ? { goodToHave: toItems(p.goodToHave) } : {}),
      ...(p.benefits?.length ? { benefits: toItems(p.benefits) } : {}),
      ...(p.idealCandidate ? { idealCandidate: p.idealCandidate } : {}),
      ...(p.applyUrl ? { applyUrl: p.applyUrl } : {}),
      ...(kind === "job" && p.jobType ? (() => {
        const types = JOB_TYPES.filter((t) => p.jobType!.toLowerCase().includes(t.toLowerCase()));
        return types.length ? { jobTypes: types } : {};
      })() : {}),
    }));
  }

  function importPaste() {
    const parsed = parsePosting(pasteText);
    const found = Object.keys(parsed).length;
    if (!found) { toast("error", "No posting sections found. Use headings like “About the Role” and “Requirements”."); return; }
    fill(parsed);
    setPasteText("");
    setTool(null);
    toast("success", `Filled ${found} ${found === 1 ? "field" : "fields"} from the pasted posting`);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(postingToMarkdown(posting));
      toast("success", "Posting copied as text");
    } catch {
      toast("error", "Could not copy. Select the preview text instead.");
    }
  }

  /* ── Save ── */
  async function save() {
    if (busy) return;
    if (missing.length) {
      setError(`Finish ${missing.map((id) => SECTIONS.find((s) => s.id === id)!.label).join(", ")} before saving.`);
      jump(missing[0]);
      return;
    }
    setBusy(true);
    setError(null);
    const shared = {
      title: posting.title,
      company: posting.company,
      workMode: posting.workMode,
      location: posting.location.trim(),
      responsibilities: posting.responsibilities,
      requirements: posting.requirements,
      goodToHave: posting.goodToHave,
      benefits: posting.benefits,
      idealCandidate: posting.idealCandidate.trim(),
      applyUrl: posting.applyUrl.trim(),
      status: f.status,
    };
    const body = kind === "job"
      ? { ...shared, summary: posting.about.trim(), team: f.team, type: posting.jobType, experience: f.experience.trim(), salaryRange: salaryText, positions: Number(f.positions) || 1, openFrom: f.status === "upcoming" ? f.openFrom : "" }
      : { ...shared, description: posting.about.trim(), durationWeeks: Number(f.durationWeeks), paid: f.stipend !== "unpaid", stipend: f.stipend === "unpaid" ? null : stipendAmount || null, mentorName: f.mentorName.trim(), mentorEmail: f.mentorEmail.trim(), featured: f.featured };
    const base = kind === "job" ? "/api/admin/jobs" : "/api/admin/careers/internships";
    const id = job?.id ?? internship?.id;
    try {
      const res = await fetch(id ? `${base}/${id}` : base, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not save the posting"); return; }
      toast("success", id ? "Posting updated" : kind === "job" ? "Job opening created" : "Internship created");
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const noun = kind === "job" ? "job opening" : "internship";
  const statuses = kind === "job" ? JOB_STATUSES : INTERNSHIP_POST_STATUSES;
  const statusLabel = (s: string) => (kind === "job" ? JOB_STATUS_LABEL[s as JobStatus] : INTERN_STATUS_LABEL[s as InternshipPostStatus]);
  const statusHint = kind === "job" ? JOB_STATUS_HINT[f.status as JobStatus] : INTERN_STATUS_HINT[f.status as InternshipPostStatus];
  const templates = [...POSTING_TEMPLATES].sort((a, b) => Number(b.kind === kind) - Number(a.kind === kind));

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={requestClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? `Edit ${noun}` : `New ${noun}`}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        className="relative flex h-[96dvh] w-full max-w-7xl flex-col overflow-hidden rounded-t-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)] sm:h-[92dvh] sm:rounded-3xl"
      >
        {/* Header */}
        <header className="flex flex-wrap items-center gap-3 border-b border-border-soft px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-story-royal">{editing ? "Edit" : "New"} {noun}</p>
            <h2 className="truncate text-base font-semibold sm:text-lg">{f.title.trim() || "Untitled posting"}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <ToolButton active={tool === "paste"} onClick={() => setTool(tool === "paste" ? null : "paste")} icon={<ClipboardPaste className="h-4 w-4" />}>Paste posting</ToolButton>
            <ToolButton active={tool === "templates"} onClick={() => setTool(tool === "templates" ? null : "templates")} icon={<Sparkles className="h-4 w-4" />}>Templates</ToolButton>
            <button onClick={requestClose} aria-label="Close" className="ml-1 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-600"><X className="h-5 w-5" /></button>
          </div>
        </header>

        {/* Paste / templates tray */}
        <AnimatePresence initial={false}>
          {tool && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden border-b border-border-soft bg-story-mist/60">
              {tool === "paste" ? (
                <div className="px-4 py-4 sm:px-6">
                  <p className="text-sm font-semibold">Paste a full posting</p>
                  <p className="mt-0.5 text-xs text-muted">Headings like “About the Role”, “Key Responsibilities”, “Requirements”, “Good to Have”, “What You&apos;ll Gain” and lines like “Company:” or “Work Mode:” are read into the form. Placeholders in [brackets] are skipped.</p>
                  <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={6} autoFocus placeholder={"# App Development Intern\n\n**Company:** MyLoginn Tech\n**Work Mode:** Hybrid\n\n### About the Role\n…"} className="field-control mt-3 font-mono text-xs" />
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setTool(null)} className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-story-royal">Cancel</button>
                    <button type="button" disabled={!pasteText.trim()} onClick={importPaste} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"><ClipboardPaste className="h-4 w-4" />Fill the form</button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-4 sm:px-6">
                  <p className="text-sm font-semibold">Start from a template</p>
                  <p className="mt-0.5 text-xs text-muted">Fills the title and every section. Status, location and pay are kept. Edit anything afterwards.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((t) => (
                      <button key={t.id} type="button" onClick={() => { fill(t.posting); setTool(null); toast("success", `“${t.label}” template applied`); }} className="group flex items-start gap-3 rounded-2xl border border-border-soft bg-surface p-3.5 text-left transition-colors hover:border-story-royal/50">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-story-royal/10 text-story-royal"><FileText className="h-4 w-4" /></span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold group-hover:text-story-royal">{t.label}</span>
                          <span className="block text-xs text-muted">{t.posting.jobType} · {t.posting.responsibilities.length} responsibilities · {t.posting.requirements.length} requirements</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section bar + mobile view switch */}
        <div className="flex items-center gap-3 border-b border-border-soft px-4 py-2 sm:px-6">
          <div className="flex gap-1 rounded-full bg-story-mist p-1 lg:hidden" role="tablist" aria-label="Editor view">
            {([["edit", "Edit", PenLine], ["preview", "Preview", Eye]] as const).map(([id, label, Icon]) => (
              <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cn("relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", view === id ? "text-white" : "text-muted")}>
                {view === id && <motion.span layoutId="posting-view-pill" className="absolute inset-0 rounded-full bg-story-royal" />}
                <Icon className="relative h-3.5 w-3.5" /><span className="relative">{label}</span>
              </button>
            ))}
          </div>
          <nav aria-label="Posting sections" className="no-scrollbar hidden min-w-0 flex-1 gap-1 overflow-x-auto sm:flex">
            {SECTIONS.map((s, i) => (
              <button key={s.id} type="button" onClick={() => jump(s.id)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", active === s.id && view === "edit" ? "bg-story-royal/10 text-story-royal" : "text-muted hover:text-story-royal")}>
                <span className={cn("grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold", done[s.id] ? "bg-emerald-500 text-white" : "border border-border-soft")}>{done[s.id] ? <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> : i + 1}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <span className="ml-auto shrink-0 text-xs tabular-nums text-muted">{filled}/{SECTIONS.length} sections</span>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div ref={scroller} className={cn("min-h-0 overflow-y-auto px-4 py-5 sm:px-6", view === "preview" && "hidden lg:block")}>
            <div className="mx-auto max-w-2xl space-y-4">
              <Card id="basics" n={1} title="Basics" done={done.basics} hint="The header candidates see first.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Input id="p-title" label="Role title *" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={100} placeholder={kind === "job" ? "e.g. AI Web Builder" : "e.g. App Development Intern"} /></div>
                  <Input id="p-company" label="Company *" value={f.company} onChange={(e) => set("company", e.target.value)} maxLength={100} />
                  <Input id="p-location" label="Location (optional)" value={f.location} onChange={(e) => set("location", e.target.value)} maxLength={80} placeholder="e.g. Coimbatore, Tamil Nadu" />

                  <fieldset className="sm:col-span-2">
                    <legend className="field-label">Work mode *</legend>
                    <Segmented id="workmode" options={WORK_MODES.map((m) => ({ value: m, label: m }))} value={f.workMode} onChange={(v) => set("workMode", v)} />
                  </fieldset>

                  {kind === "job" ? (
                    <>
                      <fieldset className="sm:col-span-2">
                        <legend className="field-label">Job type * <span className="font-normal text-muted">Pick one or more</span></legend>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {JOB_TYPES.map((t) => {
                            const on = f.jobTypes.includes(t);
                            return (
                              <button key={t} type="button" aria-pressed={on} onClick={() => set("jobTypes", on ? f.jobTypes.filter((x) => x !== t) : [...f.jobTypes, t])} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors", on ? "border-story-royal bg-story-royal text-white" : "border-border-soft text-muted hover:border-story-royal/50 hover:text-story-royal")}>
                                {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}{t}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <Select id="p-team" label="Team *" value={f.team} onChange={(e) => set("team", e.target.value)} options={[...JOB_TEAMS, ...((JOB_TEAMS as readonly string[]).includes(f.team) ? [] : [f.team])].map((v) => ({ value: v, label: v }))} />
                      <Input id="p-positions" label="Open positions *" type="number" min={1} max={99} value={f.positions} onChange={(e) => set("positions", e.target.value)} />
                      <Input id="p-exp" label="Experience (optional)" value={f.experience} onChange={(e) => set("experience", e.target.value)} maxLength={60} placeholder="e.g. Freshers / 0 - 2 years" />
                      <div className="space-y-2">
                        <Select id="p-salary" label="Salary (optional)" value={f.salary} onChange={(e) => set("salary", e.target.value)} options={[{ value: "", label: "Don't show salary" }, ...SALARY_OPTIONS.map((s) => ({ value: s, label: s })), { value: CUSTOM, label: "Custom…" }]} />
                        {f.salary === CUSTOM && <Input id="p-salary-custom" aria-label="Custom salary" value={f.customSalary} onChange={(e) => set("customSalary", e.target.value)} maxLength={60} placeholder="e.g. ₹25,000 / month" autoFocus />}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sm:col-span-2 flex items-center gap-2 rounded-2xl bg-story-mist px-3.5 py-2.5 text-sm"><span className="font-semibold">Job type:</span> Internship</div>
                      <Input id="p-weeks" label="Duration (weeks) *" type="number" min={1} max={52} value={f.durationWeeks} onChange={(e) => set("durationWeeks", e.target.value)} />
                      <div className="space-y-2">
                        <Select id="p-stipend" label="Stipend (optional)" value={f.stipend} onChange={(e) => set("stipend", e.target.value)} options={[{ value: "tbd", label: "To be discussed" }, { value: "unpaid", label: "Unpaid" }, ...STIPEND_OPTIONS.map((n) => ({ value: String(n), label: `₹${nfIN.format(n)} / month` })), { value: CUSTOM, label: "Custom amount…" }]} />
                        {f.stipend === CUSTOM && <Input id="p-stipend-custom" aria-label="Custom stipend per month" type="number" min={0} value={f.customStipend} onChange={(e) => set("customStipend", e.target.value)} placeholder="₹ per month" autoFocus />}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card id="about" n={2} title="About the Role" done={done.about} hint={POSTING_SECTIONS[0].hint} required>
                <Textarea id="p-about" value={f.about} onChange={(e) => set("about", e.target.value)} rows={6} maxLength={2000} placeholder={"MyLoginn is looking for a motivated **App Development Intern** to join our development team…\n\nYou'll work closely with our team on…"} hint="Leave a blank line between paragraphs. Wrap words in **double stars** to make them bold." />
              </Card>

              <Card id="responsibilities" n={3} title="Key Responsibilities" done={done.responsibilities} hint={POSTING_SECTIONS[1].hint} required count={posting.responsibilities.length}>
                <ListEditor items={f.responsibilities} onChange={(v) => set("responsibilities", v)} placeholder="e.g. Develop and maintain mobile application features." />
              </Card>

              <Card id="requirements" n={4} title="Requirements" done={done.requirements} hint={POSTING_SECTIONS[2].hint} required count={posting.requirements.length}>
                <ListEditor items={f.requirements} onChange={(v) => set("requirements", v)} placeholder="e.g. Basic knowledge of **Flutter / React Native**." />
              </Card>

              <Card id="goodToHave" n={5} title="Good to Have" done={done.goodToHave} hint={POSTING_SECTIONS[3].hint} count={posting.goodToHave.length}>
                <ListEditor items={f.goodToHave} onChange={(v) => set("goodToHave", v)} placeholder="e.g. Knowledge of Firebase or similar backend services." max={12} />
              </Card>

              <Card id="benefits" n={6} title="What You'll Gain" done={done.benefits} hint={POSTING_SECTIONS[4].hint} count={posting.benefits.length}>
                <ListEditor items={f.benefits} onChange={(v) => set("benefits", v)} placeholder="e.g. Mentorship and guidance from the development team." suggestions={BENEFIT_SUGGESTIONS} max={12} />
              </Card>

              <Card id="idealCandidate" n={7} title="Who We're Looking For" done={done.idealCandidate} hint={POSTING_SECTIONS[5].hint}>
                <Textarea id="p-ideal" value={f.idealCandidate} onChange={(e) => set("idealCandidate", e.target.value)} rows={3} maxLength={1200} placeholder="Someone who is **curious, responsible and excited about building technology**…" />
              </Card>

              <Card id="publish" n={8} title="Apply & publish" done={done.publish} hint="Where candidates apply and whether the posting is live. There is no end date: it stays open until you close it.">
                <div className="space-y-4">
                  <Input id="p-apply" label="Apply link or email (optional)" value={f.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} maxLength={200} placeholder="https://… or careers@myloginn.com" hint="Candidates can always apply on the site. Add a link or email to show it as well." />
                  <fieldset>
                    <legend className="field-label">Status</legend>
                    <Segmented id="status" options={statuses.map((s) => ({ value: s, label: statusLabel(s) }))} value={f.status} onChange={(v) => set("status", v)} />
                    <p className="mt-1.5 text-xs text-muted">{statusHint}</p>
                  </fieldset>
                  {kind === "job" && f.status === "upcoming" && (
                    <Input id="p-open" label="Opens on *" type="date" value={f.openFrom} onChange={(e) => set("openFrom", e.target.value)} />
                  )}
                  {kind === "internship" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input id="p-mentor" label="Mentor name (optional)" value={f.mentorName} onChange={(e) => set("mentorName", e.target.value)} maxLength={80} />
                        <Input id="p-mentor-email" label="Mentor email (optional)" type="email" value={f.mentorEmail} onChange={(e) => set("mentorEmail", e.target.value)} maxLength={120} />
                      </div>
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border-soft px-4 py-3">
                        <span><span className="block text-sm font-semibold">Featured listing</span><span className="block text-xs text-muted">Highlighted with a crown on the internships page.</span></span>
                        <Toggle on={f.featured} onChange={(v) => set("featured", v)} label="Featured listing" />
                      </label>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Preview */}
          <aside className={cn("min-h-0 overflow-y-auto border-l border-border-soft bg-story-mist/40 px-4 py-5 sm:px-6", view === "edit" && "hidden lg:block")}>
            <div className="mx-auto max-w-xl">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted"><Eye className="h-3.5 w-3.5" />Live preview</p>
                <button type="button" onClick={copyText} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-story-royal hover:text-story-royal"><Copy className="h-3.5 w-3.5" />Copy as text</button>
              </div>
              <div className="rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-7">
                <PostingPreview posting={posting} extras={extras} />
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center gap-3 border-t border-border-soft px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 text-xs">
            {error ? (
              <p role="alert" className="font-medium text-danger">{error}</p>
            ) : missing.length ? (
              <p className="text-muted">Still needed: {missing.map((id, i) => <span key={id}>{i > 0 && ", "}<button type="button" onClick={() => jump(id)} className="font-semibold text-story-royal hover:underline">{SECTIONS.find((s) => s.id === id)!.label}</button></span>)}</p>
            ) : (
              <p className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300"><Check className="h-3.5 w-3.5" strokeWidth={3} />Ready to {f.status === "draft" ? "save as a draft" : "publish"}</p>
            )}
          </div>
          <button type="button" onClick={requestClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-story-royal">Cancel</button>
          <button type="button" onClick={() => void save()} disabled={busy} title="Save (Ctrl+S)" className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {busy ? "Saving…" : editing ? "Save changes" : f.status === "draft" ? "Save draft" : `Publish ${noun}`}
          </button>
        </footer>

        {/* Unsaved changes */}
        <AnimatePresence>
          {confirmClose && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 grid place-items-center bg-black/40 p-4">
              <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} role="alertdialog" aria-label="Discard changes?" className="w-full max-w-sm rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-lift)]">
                <p className="text-base font-semibold">Discard your changes?</p>
                <p className="mt-1 text-sm text-muted">This {noun} has unsaved edits.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setConfirmClose(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-story-royal">Keep editing</button>
                  <button type="button" onClick={onClose} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Discard</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── Small pieces ───────────────────────────────────────────────────── */

function Card({ id, n, title, hint, done, required, count, children }: { id: SectionId; n: number; title: string; hint: string; done: boolean; required?: boolean; count?: number; children: React.ReactNode }) {
  return (
    <section id={`sec-${id}`} data-section className="scroll-mt-4 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
      <div className="mb-3.5 flex items-start gap-3">
        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors", done ? "bg-emerald-500 text-white" : "bg-story-mist text-story-royal")}>
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-story-navy dark:text-foreground">
            {title}
            {required ? <span className="rounded-full bg-story-royal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-story-royal">Required</span> : id !== "basics" && id !== "publish" ? <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Optional</span> : null}
            {count ? <span className="text-xs font-medium tabular-nums text-muted">{count} {count === 1 ? "point" : "points"}</span> : null}
          </h3>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented({ id, options, value, onChange }: { id: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="mt-1.5 flex gap-1 rounded-2xl bg-story-mist p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={cn("relative flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors", value === o.value ? "text-white" : "text-muted hover:text-story-royal")}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-story-royal" : "bg-surface-2 ring-1 ring-inset ring-border-soft")}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", on ? "right-0.5" : "left-0.5")} />
    </button>
  );
}

function ToolButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", active ? "border-story-royal bg-story-royal/10 text-story-royal" : "border-border-soft text-muted hover:border-story-royal/50 hover:text-story-royal")}>
      {icon}<span className="hidden sm:inline">{children}</span>
    </button>
  );
}
