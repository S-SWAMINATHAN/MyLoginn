import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Lock, RotateCcw } from "lucide-react";
import type { AssessmentResult } from "@/types/certificate";

function ScoreRing({ percent, pass }: { percent: number | null; pass: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const value = percent ?? 0;
  const passed = percent !== null && percent >= pass;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" className="stroke-story-mist" />
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className={passed ? "stroke-success" : "stroke-danger"} />
        {/* pass-mark tick */}
        <line x1="64" y1="6" x2="64" y2="20" strokeWidth="3" className="stroke-story-navy" transform={`rotate(${(pass / 100) * 360} 64 64)`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-story-navy">{percent === null ? "–" : `${percent}%`}</span>
        <span className="text-xs text-muted">best score</span>
      </div>
    </div>
  );
}

/**
 * Shows the certificate flow only when the server says the learner is eligible. The real gate is
 * server-side (the confirm API re-checks it); this screen explains what is missing and how to fix it.
 */
export function AssessmentGuard({ assessment, children }: { assessment: AssessmentResult; children: ReactNode }) {
  if (assessment.certificateEligible) return <>{children}</>;

  const { bestPercent, passPercent, attemptsUsed, maxAttempts, scorePassed } = assessment;
  const outOfAttempts = maxAttempts !== null && attemptsUsed >= maxAttempts;
  const heading = bestPercent === null ? "Take the final assessment to unlock your certificate"
    : scorePassed ? "Almost there: finish the remaining course requirements"
    : "Your certificate is locked";

  return (
    <section aria-labelledby="guard-heading" className="rounded-3xl border border-border-soft bg-surface p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
        <ScoreRing percent={bestPercent} pass={passPercent} />
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-story-mist px-3 py-1 text-xs font-semibold text-story-royal"><Lock className="h-3.5 w-3.5" aria-hidden />Certificate locked</span>
          <h2 id="guard-heading" className="mt-3 text-xl font-bold tracking-tight text-story-navy sm:text-2xl">{heading}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:max-w-sm">
            <div className="rounded-xl bg-story-mist px-3 py-2"><dt className="text-xs text-muted">Your best score</dt><dd className={`text-lg font-bold ${scorePassed ? "text-success" : "text-danger"}`}>{bestPercent === null ? "Not taken" : `${bestPercent}%`}</dd></div>
            <div className="rounded-xl bg-story-mist px-3 py-2"><dt className="text-xs text-muted">Passing score</dt><dd className="text-lg font-bold text-story-navy">{passPercent}%</dd></div>
          </dl>
          {assessment.lockReason && <p className="mt-4 text-sm text-muted" role="status">{assessment.lockReason}</p>}
          {maxAttempts !== null && <p className="mt-1 text-xs text-muted">{attemptsUsed} of {maxAttempts} attempts used.</p>}

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            {scorePassed ? (
              <Link href={`/courses/${assessment.courseSlug}/learn`} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Continue the course<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            ) : outOfAttempts ? (
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">No attempts left: contact support<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            ) : (
              <Link href={assessment.retakeHref} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"><RotateCcw className="h-4 w-4" aria-hidden />{bestPercent === null ? "Take the assessment" : "Retake Assessment"}</Link>
            )}
            {!scorePassed && <Link href={`/courses/${assessment.courseSlug}/learn`} className="inline-flex items-center rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-story-navy transition hover:bg-story-mist">Review lessons</Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
