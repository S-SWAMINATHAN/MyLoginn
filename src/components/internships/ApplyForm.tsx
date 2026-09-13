"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";

export function ApplyForm({ internshipId }: { internshipId: string }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/internships/${internshipId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverNote, resumeName }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    setApplied(true);
    setSubmitting(false);
    router.refresh();
  }

  if (applied) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 py-4 text-center"
      >
        <AnimatedSuccess className="h-10.5 w-10.5" />
        <p className="text-sm font-medium">Application submitted</p>
        <p className="text-xs text-muted">We&apos;ll reach out if you&apos;re shortlisted.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <label htmlFor="resumeName" className="text-xs font-medium text-foreground/80">
          Resume file name (optional)
        </label>
        <input
          id="resumeName"
          value={resumeName}
          onChange={(e) => setResumeName(e.target.value)}
          placeholder="resume.pdf"
          className="mt-1.5 w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm outline-none transition-shadow duration-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
        />
      </div>

      <div>
        <label htmlFor="coverNote" className="text-xs font-medium text-foreground/80">
          Why you&apos;re a good fit (optional)
        </label>
        <textarea
          id="coverNote"
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          maxLength={1500}
          placeholder="A few lines about relevant projects or skills…"
          className="mt-1.5 w-full resize-none rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm outline-none transition-shadow duration-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
        />
      </div>

      {error && <p className="text-xs font-medium text-danger">{error}</p>}

      <Button type="submit" disabled={submitting} size="lg" icon={<AnimatedArrow className="h-5 w-5" />} className="w-full">
        {submitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
