"use client";

import { useMemo } from "react";
import { ApplyForm } from "@/components/internships/ApplyForm";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

export function InternshipApplyPanel({
  internshipId,
  applyDeadline,
  loggedIn,
  applicationStatus,
}: {
  internshipId: string;
  applyDeadline: string;
  loggedIn: boolean;
  applicationStatus: string | null;
}) {
  const daysLeft = useMemo(() => {
    const deadline = new Date(applyDeadline);
    return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [applyDeadline]);

  const open = daysLeft > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)]">
      <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
        {["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"].map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Application</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">Apply now</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${open ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-story-mist text-muted"}`}>
          <span className="relative grid h-2 w-2 place-items-center">
            {open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />}
            <span className={`relative h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-muted"}`} />
          </span>
          {open ? `${daysLeft} days left` : "Deadline passed"}
        </span>
      </div>

      <div className="mt-6 border-t border-border-soft pt-5">
        {!loggedIn ? (
          <ArrowLink href="/login" className="w-full justify-between">Log in to apply</ArrowLink>
        ) : applicationStatus ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <AnimatedSuccess className="h-12 w-12" />
            <p className="text-base font-semibold">You&apos;ve applied</p>
            <span className="rounded-full bg-story-mist px-3 py-1 text-xs font-semibold capitalize text-story-royal">Status: {applicationStatus}</span>
          </div>
        ) : open ? (
          <ApplyForm internshipId={internshipId} />
        ) : (
          <p className="text-center text-sm text-muted">Applications are closed for this internship.</p>
        )}
      </div>
    </div>
  );
}
