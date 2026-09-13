"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { ApplyForm } from "@/components/internships/ApplyForm";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

export function InternshipApplyPanel({
  internshipId,
  paid,
  stipend,
  applyDeadline,
  loggedIn,
  applicationStatus,
}: {
  internshipId: string;
  paid: boolean;
  stipend: number | null;
  applyDeadline: string;
  loggedIn: boolean;
  applicationStatus: string | null;
}) {
  const daysLeft = useMemo(() => {
    const deadline = new Date(applyDeadline);
    return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [applyDeadline]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{paid ? `₹${stipend?.toLocaleString()}/mo` : "Unpaid"}</span>
        <span className="text-xs text-muted">{daysLeft > 0 ? `${daysLeft} days left to apply` : "Deadline passed"}</span>
      </div>

      <div className="mt-5">
        {!loggedIn ? (
          <a
            href="/login"
            className="card-shine brand-gradient-bg block w-full rounded-full py-3.5 text-center text-sm font-medium text-white shadow-[var(--shadow-lift)] transition-transform duration-300 hover:scale-[1.02]"
          >
            Log in to apply
          </a>
        ) : applicationStatus ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <AnimatedSuccess className="h-10.5 w-10.5" />
            <p className="text-sm font-medium">You&apos;ve applied</p>
            <p className="text-xs capitalize text-muted">Status: {applicationStatus}</p>
          </div>
        ) : daysLeft > 0 ? (
          <ApplyForm internshipId={internshipId} />
        ) : (
          <p className="text-center text-sm text-muted">Applications are closed for this internship.</p>
        )}
      </div>
    </Card>
  );
}
