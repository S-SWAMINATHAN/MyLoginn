"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Briefcase, Check, FileText, Link2, Lock, Mail, Trash2, Upload, User, X } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { ArrowButton } from "@/components/ui/ArrowLink";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/cn";

export type ApplyTarget = { id: string | null; title: string };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { title: "About you", hint: "How we reach you" },
  { title: "Experience", hint: "Where you are now" },
  { title: "Your CV", hint: "Review and send" },
] as const;

type Form = { name: string; email: string; phone: string; experienceYears: string; currentRole: string; profileUrl: string; coverNote: string };
type Errors = Partial<Record<keyof Form | "resume", string>>;

const EMPTY: Form = { name: "", email: "", phone: "", experienceYears: "", currentRole: "", profileUrl: "", coverNote: "" };

/** Checks one step before moving on; the server repeats every rule, so this only saves a round trip. */
function validate(step: number, f: Form, file: File | null): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (f.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address";
    if (f.phone.replace(/\D/g, "").length < 8) e.phone = "Enter a phone number we can call or WhatsApp";
  }
  if (step === 1) {
    if (f.experienceYears && (!/^\d{1,2}$/.test(f.experienceYears) || Number(f.experienceYears) > 50)) e.experienceYears = "Whole years, 0 for a fresher";
    if (f.profileUrl && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(f.profileUrl.trim())) e.profileUrl = "Use a full link starting with https://";
  }
  if (step === 2) {
    if (!file) e.resume = "Attach your CV to continue";
    if (f.coverNote.trim() && f.coverNote.trim().length < 10) e.coverNote = "Add a few more words, or leave it empty";
  }
  return e;
}

/** Which step a server message is about, so a rejected field takes the applicant back to it. */
const stepFor = (message: string) => (/name|e-?mail|mail server|phone|mobile/i.test(message) ? 0 : /experience|link|https/i.test(message) ? 1 : 2);

/** Apply for a role (or send an open application) in three short steps. Posts to /api/careers/apply. */
export function ApplyDialog({ target, onClose }: { target: ApplyTarget | null; onClose: () => void }) {
  return <AnimatePresence>{target && <Body key={target.id ?? "open"} target={target} onClose={onClose} />}</AnimatePresence>;
}

function Body({ target, onClose }: { target: ApplyTarget; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState<Form>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const startedAt = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    startedAt.current = Date.now();
    panel.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((s) => ({ ...s, [key]: e.target.value }));
    if (errors[key]) setErrors((s) => ({ ...s, [key]: undefined }));
  };

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setServerError(null);
    body.current?.scrollTo({ top: 0 });
  }

  function next() {
    const e = validate(step, f, file);
    setErrors(e);
    if (Object.keys(e).length) return;
    go(step + 1);
  }

  function pick(picked: File | null) {
    setErrors((s) => ({ ...s, resume: undefined }));
    if (!picked) return setFile(null);
    if (!/\.(pdf|docx?)$/i.test(picked.name)) return setErrors((s) => ({ ...s, resume: "Upload your CV as a PDF, DOC or DOCX file" }));
    if (picked.size > MAX_BYTES) return setErrors((s) => ({ ...s, resume: "Your CV must be under 5MB" }));
    setFile(picked);
  }

  async function submit() {
    // every step must pass before anything is sent
    for (let s = 0; s < 3; s++) {
      const e = validate(s, f, file);
      if (Object.keys(e).length) { setErrors(e); go(s); return; }
    }
    setBusy(true);
    setServerError(null);
    const fd = new FormData();
    fd.set("jobId", target.id ?? "");
    fd.set("startedAt", String(startedAt.current));
    fd.set("website", "");
    (Object.keys(f) as (keyof Form)[]).forEach((k) => fd.set(k, f[k].trim()));
    fd.set("resume", file as File);
    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json.error ?? "We couldn't send your application. Please try again.";
        setServerError(message);
        const to = stepFor(message);
        if (to !== step) go(to);
        return;
      }
      setDone({ reference: json.reference });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const slide = { enter: (d: number) => ({ opacity: 0, x: d * 36 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d * -36 }) };
  const last = step === 2;

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-story-navy/60" onClick={onClose} aria-hidden />
      <motion.div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Apply: ${target.title}`}
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
        className="relative flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-background outline-none sm:h-auto sm:max-h-[88dvh] sm:min-h-[34rem] sm:flex-row sm:rounded-3xl"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-border-soft bg-background text-muted transition-colors hover:border-story-royal hover:text-story-royal"><X className="h-4 w-4" /></button>

        {done ? (
          <div className="flex min-h-0 flex-1 flex-col"><Success reference={done.reference} title={target.title} onClose={onClose} /></div>
        ) : (
          <>
            {/* side panel (desktop) / compact header (phone): the role, and where you are */}
            <aside className="shrink-0 bg-story-royal px-5 pb-4 pt-5 text-white sm:flex sm:w-72 sm:flex-col sm:px-7 sm:py-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{target.id ? "Applying for" : "Open application"}</span>
              <h2 className="mt-1.5 line-clamp-2 pr-10 text-lg font-bold leading-snug tracking-tight sm:pr-0 sm:text-2xl">{target.id ? target.title : "Tell us about you"}</h2>
              {!target.id && <p className="mt-2 hidden text-sm leading-6 text-white/80 sm:block">Not seeing the right role? Send your CV and we will contact you when a match opens.</p>}

              {/* phone: a thin progress bar and the current step name */}
              <div className="mt-3 sm:hidden">
                <div className="h-1 overflow-hidden rounded-full bg-white/25"><motion.div className="h-full rounded-full bg-white" initial={false} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4, ease: EASE }} /></div>
                <p className="mt-1.5 text-xs font-semibold text-white/85">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</p>
              </div>

              {/* desktop: a vertical step list; finished steps can be revisited */}
              <ol className="relative mt-8 hidden flex-col gap-1 sm:flex" aria-label="Progress">
                <span aria-hidden className="absolute bottom-6 left-[1.05rem] top-6 w-px bg-white/25" />
                {STEPS.map((st, i) => {
                  const state = i < step ? "done" : i === step ? "current" : "todo";
                  return (
                    <li key={st.title} aria-current={state === "current" ? "step" : undefined}>
                      <button type="button" disabled={i > step} onClick={() => i < step && go(i)} className={cn("relative flex w-full items-center gap-3 rounded-xl px-1.5 py-2.5 text-left transition-colors", state === "current" && "bg-white/10", i < step && "cursor-pointer hover:bg-white/10")}>
                        <span className={cn("relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300", state === "todo" ? "border border-white/40 bg-story-royal text-white/70" : "bg-white text-story-royal")}>
                          {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("block text-sm font-semibold", state === "todo" && "text-white/70")}>{st.title}</span>
                          <span className="block text-xs text-white/65">{st.hint}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-auto hidden items-center gap-2 pt-6 text-xs text-white/75 sm:flex"><Lock className="h-3.5 w-3.5 shrink-0" />Your CV stays private and is only seen by our hiring team.</p>
            </aside>

            {/* the form: one step at a time */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div ref={body} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-8 sm:py-8">
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.26, ease: EASE }}>
                    <h3 className="text-lg font-bold text-story-navy dark:text-foreground">{STEPS[step].title}</h3>
                    <p className="mb-5 mt-0.5 text-sm text-muted">{["How should we reach you?", "A little about your background. All optional.", "Attach your CV, then review and send."][step]}</p>

                    {step === 0 && (
                      <div className="grid gap-4">
                        <Input id="ap-name" label="Full name *" icon={<User className="h-4 w-4" />} autoComplete="name" maxLength={80} value={f.name} onChange={set("name")} error={errors.name} valid={f.name.trim().length >= 2} style={{ paddingLeft: "2.75rem" }} />
                        <Input id="ap-email" type="email" label="Email *" icon={<Mail className="h-4 w-4" />} autoComplete="email" maxLength={120} value={f.email} onChange={set("email")} error={errors.email} valid={/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())} style={{ paddingLeft: "2.75rem" }} />
                        <PhoneInput label="Phone *" hint="Country code included. We may call or WhatsApp you." value={f.phone} onChange={(v) => { setF((s) => ({ ...s, phone: v })); if (errors.phone) setErrors((s) => ({ ...s, phone: undefined })); }} error={errors.phone} />
                      </div>
                    )}
                    {step === 1 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input id="ap-exp" type="number" min={0} max={50} label="Experience (years)" icon={<Briefcase className="h-4 w-4" />} placeholder="0 for a fresher" value={f.experienceYears} onChange={set("experienceYears")} error={errors.experienceYears} style={{ paddingLeft: "2.75rem" }} />
                        <Input id="ap-role" label="Current role" icon={<User className="h-4 w-4" />} maxLength={80} placeholder="e.g. Junior developer" value={f.currentRole} onChange={set("currentRole")} style={{ paddingLeft: "2.75rem" }} />
                        <div className="sm:col-span-2"><Input id="ap-link" type="url" label="LinkedIn or portfolio" icon={<Link2 className="h-4 w-4" />} maxLength={200} placeholder="https://" value={f.profileUrl} onChange={set("profileUrl")} error={errors.profileUrl} hint="Work you are proud of helps" style={{ paddingLeft: "2.75rem" }} /></div>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4">
                        <div>
                          <span className="field-label">CV / resume <span className="font-bold text-danger">*</span></span>
                          <label
                            htmlFor="ap-cv"
                            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0] ?? null); }}
                            className={cn("mt-1.5 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors duration-200", drag ? "border-story-royal bg-story-royal/5" : file ? "border-emerald-500/50 bg-emerald-500/5" : errors.resume ? "border-danger/60" : "border-border-soft bg-surface hover:border-story-royal")}
                          >
                            <span className={cn("grid h-11 w-11 shrink-0 place-items-center", file ? "text-emerald-600" : "text-story-royal")}>{file ? <FileText className="h-6 w-6" /> : <Upload className="h-6 w-6" />}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">{file ? file.name : drag ? "Drop it here" : "Drop your CV here, or browse"}</span>
                              <span className="block text-xs text-muted">{file ? `${Math.max(1, Math.round(file.size / 1024))} KB · ready to send` : "PDF, DOC or DOCX, up to 5MB"}</span>
                            </span>
                            {file && <button type="button" onClick={(e) => { e.preventDefault(); pick(null); }} aria-label="Remove CV" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>}
                          </label>
                          <input id="ap-cv" type="file" accept={ACCEPT} className="sr-only" onChange={(e) => { pick(e.target.files?.[0] ?? null); e.target.value = ""; }} />
                          {errors.resume && <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{errors.resume}</p>}
                        </div>
                        <Textarea id="ap-note" label="Short note" rows={3} maxLength={1500} placeholder="Why this role, and what you have built." value={f.coverNote} onChange={set("coverNote")} error={errors.coverNote} />
                        <p className="rounded-2xl bg-story-mist px-4 py-3 text-xs leading-5 text-muted">Sending as <b className="text-story-navy dark:text-foreground">{f.name.trim()}</b> · {f.email.trim()} · {f.phone.trim()}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                {serverError && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{serverError}</p>}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border-soft bg-background px-5 py-3.5 sm:px-8" style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}>
                {step > 0 ? (
                  <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-story-royal"><ArrowLeft className="h-4 w-4" />Back</button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted sm:hidden"><Lock className="h-3.5 w-3.5" />CV stays private</span>
                )}
                {last ? <ArrowButton onClick={submit} busy={busy}>{busy ? "Sending…" : "Send application"}</ArrowButton> : <ArrowButton onClick={next}>Continue</ArrowButton>}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Confirmation: the tick draws itself, then what happens next. */
function Success({ reference, title, onClose }: { reference: string; title: string; onClose: () => void }) {
  const next = ["Our team reads your CV", "We contact you if your profile matches", "A conversation about the role"];
  return (
    <div className="overflow-y-auto px-6 py-10 text-center sm:px-10">
      <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
        <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-emerald-500" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }} />
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="m5 12.5 4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: EASE }} />
        </svg>
      </span>
      <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-5 text-2xl font-bold text-story-navy dark:text-foreground">Application sent</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Thanks for applying for {title === "Open application" ? "a role at MyLoginn" : title}. Here is what happens next.</motion.p>
      <ol className="mx-auto mt-6 grid max-w-sm gap-2 text-left">
        {next.map((t, i) => (
          <motion.li key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.1 }} className="flex items-center gap-3 rounded-2xl bg-story-mist px-4 py-3 text-sm font-medium text-story-navy dark:text-foreground">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-story-royal text-xs font-bold text-white">{i + 1}</span>{t}
          </motion.li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-muted">Reference <span className="font-mono font-semibold text-story-royal">{reference}</span></p>
      <div className="mt-6 flex justify-center"><ArrowButton onClick={onClose}>Done</ArrowButton></div>
    </div>
  );
}
