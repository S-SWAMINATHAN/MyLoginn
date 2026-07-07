"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

export function ApplyForm({
  internshipId,
  isLoggedIn,
  alreadyApplied,
}: {
  internshipId: string;
  isLoggedIn: boolean;
  alreadyApplied: boolean;
}) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [applied, setApplied] = useState(alreadyApplied);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/internships/${internshipId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote, resumeName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }
      setApplied(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-panel p-6">
      {applied ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-4 text-center">
          <AnimatedSuccess once className="h-12.5 w-12.5" />
          <p className="font-medium">Application submitted</p>
          <p className="text-sm text-muted">Track its status anytime from your dashboard.</p>
          <Button size="sm" variant="secondary" href="/dashboard">
            Go to dashboard
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">Apply for this internship</h3>
          <Input
            label="Resume file name (optional)"
            placeholder="ananya-resume.pdf"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
          />
          <Textarea
            label="Cover note (optional)"
            placeholder="Tell us why you're a great fit…"
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button className="w-full" onClick={handleApply} disabled={loading}>
            {loading ? "Submitting…" : isLoggedIn ? "Submit application" : "Log in to apply"}
          </Button>
        </div>
      )}
    </Card>
  );
}
