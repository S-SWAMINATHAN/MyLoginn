"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { cn } from "@/lib/cn";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "#e11d48" },
  doc: { label: "DOC", color: "#2563eb" },
  docx: { label: "DOCX", color: "#2563eb" },
};
const STARTERS = [
  { label: "Relevant projects", text: "Projects I have built that relate to this role: " },
  { label: "Skills I bring", text: "Skills I can contribute: " },
  { label: "Why this role", text: "I am interested in this internship because " },
];

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
const fmtSize = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export function ApplyForm({ internshipId }: { internshipId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  function chooseFile(next: File | undefined | null) {
    if (!next) return;
    const ext = extOf(next.name);
    if (!TYPES[ext]) return setFileError("Upload a PDF, DOC or DOCX file");
    if (next.size > MAX_BYTES) return setFileError("Your resume must be under 5MB");
    if (next.size === 0) return setFileError("That file is empty");
    setFileError(null);
    setFile(next);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    chooseFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setProgress(0);

    const body = new FormData();
    body.append("coverNote", coverNote);
    if (file) body.append("resume", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/internships/${internshipId}/apply`);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onerror = () => {
      setError("We couldn't send your application. Check your connection and try again.");
      setSubmitting(false);
    };
    xhr.onload = () => {
      let data: { error?: string } = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON response */ }
      if (xhr.status < 200 || xhr.status >= 300) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      setProgress(100);
      setApplied(true);
      setSubmitting(false);
      router.refresh();
    };
    xhr.send(body);
  }

  if (applied) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center gap-2 py-4 text-center">
        <AnimatedSuccess className="h-12 w-12" />
        <p className="text-base font-semibold">Application submitted</p>
        <p className="text-xs text-muted">We&apos;ll reach out if you&apos;re shortlisted.</p>
      </motion.div>
    );
  }

  const ext = file ? extOf(file.name) : "";
  const noteDone = coverNote.trim().length >= 20;
  const steps = [
    { label: "Resume", done: Boolean(file) },
    { label: "Note", done: noteDone },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* progress checklist */}
      <div className="flex items-center gap-2" aria-label="Application progress">
        {steps.map((s) => (
          <motion.span key={s.label} animate={{ backgroundColor: s.done ? "#1f56d6" : "#f1f5fb", color: s.done ? "#ffffff" : "#64748b" }} transition={{ duration: 0.25 }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold">
            <span aria-hidden>{s.done ? "✓" : "○"}</span>
            {s.label} <span className="font-normal opacity-80">(optional)</span>
          </motion.span>
        ))}
      </div>

      {/* resume upload */}
      <div>
        <p className="mb-1.5 text-[13px] font-semibold">Resume</p>
        <label
          htmlFor="resume"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200",
            dragging ? "scale-[1.02] border-story-royal bg-story-royal/10" : "border-slate-300 bg-story-mist/60 hover:border-story-royal/60 hover:bg-story-mist",
            file && "hidden"
          )}
        >
          <motion.span animate={dragging ? { y: -4 } : { y: [0, -3, 0] }} transition={dragging ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }} className="grid h-11 w-11 place-items-center rounded-full bg-surface text-story-royal shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
          </motion.span>
          <span className="text-sm font-semibold">{dragging ? "Drop your resume here" : "Drag a file here or browse"}</span>
          <span className="text-[11px] text-muted">PDF, DOC or DOCX · up to 5MB</span>
          <input ref={inputRef} id="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(e) => chooseFile(e.target.files?.[0])} />
        </label>

        <AnimatePresence initial={false}>
          {file && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex items-center gap-3 rounded-2xl bg-story-mist p-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[10px] font-bold text-white" style={{ background: TYPES[ext]?.color }}>{TYPES[ext]?.label}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-[11px] text-muted">{fmtSize(file.size)}</p>
                {submitting && (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div className="h-full rounded-full bg-story-royal" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                  </div>
                )}
              </div>
              {!submitting && (
                <button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }} aria-label="Remove resume" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-600">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M3 3l8 8M11 3l-8 8" /></svg>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {fileError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{fileError}</p>}
      </div>

      {/* note */}
      <div>
        <label htmlFor="coverNote" className="mb-1.5 block text-[13px] font-semibold">Why you&apos;re a good fit</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {STARTERS.map((s) => (
            <button key={s.label} type="button" onClick={() => setCoverNote((c) => (c ? `${c}\n${s.text}` : s.text).slice(0, 1500))} className="rounded-full bg-story-mist px-2.5 py-1 text-[11px] font-semibold text-story-royal transition-all hover:-translate-y-0.5 hover:bg-story-royal hover:text-white active:scale-95">
              + {s.label}
            </button>
          ))}
        </div>
        <textarea
          id="coverNote"
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          maxLength={1500}
          placeholder="A few lines about relevant projects or skills…"
          className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]"
        />
        <p className="mt-1 text-right font-mono text-[10px] text-slate-400">{coverNote.length}/1500</p>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="group btn-sweep-navy inline-flex h-12 w-full items-center justify-between gap-3 rounded-full bg-story-royal py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(31,86,214,0.8)] transition-shadow hover:shadow-[0_16px_30px_-12px_rgba(31,86,214,0.85)] disabled:opacity-60"
      >
        <span>{submitting ? (file ? `Uploading… ${progress}%` : "Submitting…") : "Submit application"}</span>
        <span aria-hidden className="relative grid h-9 w-14 place-items-center overflow-hidden rounded-full bg-white/15">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[220%]"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -translate-x-[220%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
        </span>
      </motion.button>
    </form>
  );
}
