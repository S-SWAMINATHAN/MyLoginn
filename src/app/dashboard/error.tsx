"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard failed to render", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-5 py-12 sm:px-8">
      <div className="w-full rounded-3xl border border-border-soft bg-surface p-7 shadow-[var(--shadow-soft)] sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
          <AlertTriangle aria-hidden className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">
          Your dashboard couldn’t load
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Your account is safe. A temporary problem stopped us from loading your learning activity. Try again in a moment.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-story-royal px-5 font-semibold text-white transition-colors hover:bg-story-royal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal focus-visible:ring-offset-2"
        >
          <RefreshCw aria-hidden className="h-4 w-4" />
          Retry dashboard
        </button>
        {error.digest && <p className="mt-5 text-xs text-muted">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
