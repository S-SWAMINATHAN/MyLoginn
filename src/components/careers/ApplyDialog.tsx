"use client";

import { ArrowButton } from "@/components/ui/ArrowLink";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, Send, Upload, X } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";

export type ApplyTarget = { id: string | null; title: string };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Apply for a role (or send an open application) with a CV attached. Posts to /api/careers/apply. */
export function ApplyDialog({ target, onClose }: { target: ApplyTarget | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {target && <Body key={target.id ?? "open"} target={target} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Body({ target, onClose }: { target: ApplyTarget; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const startedAt = useRef<number>(0);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    startedAt.current = Date.now();
    panel.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  function pick(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (!/\.(pdf|docx?)$/i.test(f.name)) return setError("Upload your CV as a PDF, DOC or DOCX file");
    if (f.size > MAX_BYTES) return setError("Your CV must be under 5MB");
    setFile(f);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setError("Attach your CV to continue");
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("jobId", target.id ?? "");
    fd.set("startedAt", String(startedAt.current));
    fd.set("resume", file);
    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return setError(json.error ?? "We couldn't send your application. Please try again.");
      setDone({ reference: json.reference });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-story-navy/60" onClick={onClose} aria-hidden />
      <motion.div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Apply: ${target.title}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-background p-5 outline-none sm:rounded-3xl sm:p-7"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"><X className="h-4 w-4" /></button>

        {done ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center text-emerald-600"><CheckCircle2 className="h-7 w-7" /></span>
            <h2 className="mt-4 text-xl font-bold text-story-navy dark:text-foreground">Application sent</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Thanks for applying for {target.title}. Our team reviews every application and will contact you if your profile matches.</p>
            <p className="mt-3 text-xs text-muted">Reference <span className="font-mono font-semibold text-story-royal">{done.reference}</span></p>
            <div className="mt-6 flex justify-center"><ArrowButton onClick={onClose}>Done</ArrowButton></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="pr-10">
              <span className="story-eyebrow">{target.id ? "Apply" : "Open application"}</span>
              <h2 className="mt-2 text-xl font-bold text-story-navy dark:text-foreground">{target.title}</h2>
              {!target.id && <p className="mt-1 text-sm text-muted">Not seeing the right role? Send your CV and we will contact you when a match opens.</p>}
            </div>

            {/* honeypot */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="ap-name" name="name" label="Full name *" autoComplete="name" required maxLength={80} />
              <Input id="ap-email" name="email" type="email" label="Email *" autoComplete="email" required maxLength={120} />
              <Input id="ap-phone" name="phone" type="tel" label="Phone *" autoComplete="tel" required placeholder="+91 98765 43210" />
              <Input id="ap-exp" name="experienceYears" type="number" min={0} max={50} label="Experience (years)" placeholder="0 for a fresher" />
              <Input id="ap-role" name="currentRole" label="Current role" maxLength={80} />
              <Input id="ap-link" name="profileUrl" type="url" label="LinkedIn or portfolio" placeholder="https://" maxLength={200} />
            </div>

            <div>
              <span className="field-label">CV / resume *</span>
              <label htmlFor="ap-cv" className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-soft bg-surface p-4 transition-colors hover:border-story-royal">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-story-mist text-story-royal">{file ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{file ? file.name : "Choose a file"}</span>
                  <span className="block text-xs text-muted">{file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF, DOC or DOCX, up to 5MB"}</span>
                </span>
                {file && <button type="button" onClick={(e) => { e.preventDefault(); pick(null); }} className="text-xs font-semibold text-muted hover:text-story-royal">Remove</button>}
              </label>
              <input id="ap-cv" type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
            </div>

            <Textarea id="ap-note" name="coverNote" label="Short note" rows={3} maxLength={1500} placeholder="Why this role, and what you have built." />

            {error && <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-story-royal px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busy ? "Sending…" : "Send application"}
            </button>
            <p className="text-center text-xs text-muted">Your CV is stored privately and only seen by our hiring team.</p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
