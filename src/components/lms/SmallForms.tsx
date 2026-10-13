"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlideArrow } from "@/components/ui/PlanButton";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function LmsEnrollButton({ slug, label = "Enroll free" }: { slug: string; label?: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function enroll() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/lms/courses/${slug}/enroll`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) { router.push(`/login?next=/courses/${slug}`); return; }
      if (!res.ok) { setError(json.error ?? "Could not enroll."); return; }
      router.push(`/courses/${slug}/learn`);
      router.refresh();
    } finally { setBusy(false); }
  }
  return (
    <div>
      <motion.button
        type="button"
        onClick={enroll}
        disabled={busy}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        variants={{ rest: { y: 0 }, hover: { y: -2 } }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group inline-flex h-11 w-full select-none items-center justify-between gap-3 rounded-full bg-story-royal py-1.5 pl-5 pr-1.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] disabled:opacity-60"
      >
        <span>{busy ? "Enrolling…" : label}</span>
        <span aria-hidden className="grid h-8 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white/15 text-white transition-colors group-hover:bg-white/25"><GlideArrow reduced={reduced} /></span>
      </motion.button>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

export function AssignmentForm({ assignmentId, status, feedback, initialContent, initialLink }: { assignmentId: string; status: string | null; feedback: string | null; initialContent: string; initialLink: string }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [link, setLink] = useState(initialLink);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const locked = status === "approved";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/lms/assignments/${assignmentId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, linkUrl: link }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg({ ok: false, text: json.error ?? "Could not submit." }); return; }
      setMsg({ ok: true, text: "Submitted. A reviewer will approve it or send feedback." });
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      {status && <p className="text-sm">Status: <strong className={status === "approved" ? "text-success" : status === "rejected" ? "text-danger" : ""}>{status}</strong></p>}
      {feedback && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Reviewer feedback: {feedback}</p>}
      <label className="block text-sm font-semibold" htmlFor={`as-${assignmentId}`}>Your work</label>
      <textarea id={`as-${assignmentId}`} value={content} onChange={(e) => setContent(e.target.value)} rows={6} disabled={locked} required minLength={20} maxLength={10000}
        className="w-full rounded-xl border border-border-soft bg-background p-3 text-sm outline-none focus:border-story-royal disabled:opacity-60" />
      <label className="block text-sm font-semibold" htmlFor={`al-${assignmentId}`}>Link (optional, e.g. a GitHub repository)</label>
      <input id={`al-${assignmentId}`} type="url" value={link} onChange={(e) => setLink(e.target.value)} disabled={locked} placeholder="https://" className="w-full rounded-xl border border-border-soft bg-background p-3 text-sm outline-none focus:border-story-royal disabled:opacity-60" />
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      {!locked && <button type="submit" disabled={busy} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Submitting…" : status ? "Resubmit" : "Submit for review"}</button>}
    </form>
  );
}

const STYLES = [["classic-seal", "Classic seal"], ["navy-ribbon", "Navy ribbon"], ["lavender-modern", "Lavender modern"]] as const;

export function CertificateDownload({ slug, defaultName }: { slug: string; defaultName: string }) {
  const [first, ...rest] = defaultName.trim().split(/\s+/);
  const [firstName, setFirst] = useState(first ?? "");
  const [lastName, setLast] = useState(rest.join(" "));
  const [style, setStyle] = useState<string>("classic-seal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/lms/courses/${slug}/certificate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, style }) });
      if (!res.ok) { const json = await res.json().catch(() => ({})); setError(json.error ?? "Could not create the certificate."); return; }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "certificate.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={download} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold">First name<input value={firstName} onChange={(e) => setFirst(e.target.value)} maxLength={60} required className="mt-1 w-full rounded-xl border border-border-soft bg-background p-2.5 text-sm font-normal" /></label>
      <label className="text-sm font-semibold">Last name<input value={lastName} onChange={(e) => setLast(e.target.value)} maxLength={60} required className="mt-1 w-full rounded-xl border border-border-soft bg-background p-2.5 text-sm font-normal" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Design
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1 w-full rounded-xl border border-border-soft bg-background p-2.5 text-sm font-normal">{STYLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </label>
      {error && <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Preparing…" : "Download certificate (PDF)"}</button>
    </form>
  );
}
