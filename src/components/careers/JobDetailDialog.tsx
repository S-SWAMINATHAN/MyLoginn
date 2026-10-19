"use client";

import { ArrowButton } from "@/components/ui/ArrowLink";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CalendarClock, Check, Clock, MapPin, Users, Wallet, X } from "lucide-react";
import type { PublicJob } from "@/components/careers/CareersBoard";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Full role description in a dialog, with the apply action for open roles. */
export function JobDetailDialog({ job, onClose, onApply, onOpenApplication }: { job: PublicJob | null; onClose: () => void; onApply: (job: PublicJob) => void; onOpenApplication: () => void }) {
  return <AnimatePresence>{job && <Body key={job.id} job={job} onClose={onClose} onApply={onApply} onOpenApplication={onOpenApplication} />}</AnimatePresence>;
}

function Body({ job, onClose, onApply, onOpenApplication }: { job: PublicJob; onClose: () => void; onApply: (job: PublicJob) => void; onOpenApplication: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const facts = [
    { Icon: Briefcase, text: job.team },
    { Icon: Clock, text: job.type },
    { Icon: MapPin, text: job.location },
    { Icon: Users, text: `${job.positions} ${job.positions === 1 ? "vacancy" : "vacancies"}` },
    ...(job.experience ? [{ Icon: Briefcase, text: job.experience }] : []),
    ...(job.salaryRange ? [{ Icon: Wallet, text: job.salaryRange }] : []),
  ];

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-0 bg-story-navy/60" onClick={onClose} aria-hidden />
      <motion.div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={job.title} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-background outline-none sm:rounded-3xl">
        <div className="overflow-y-auto p-5 sm:p-8">
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border-soft bg-background text-muted transition-colors hover:border-story-royal hover:text-story-royal"><X className="h-4 w-4" /></button>
          <span className="story-eyebrow">{job.status === "open" ? "Open now" : job.status === "upcoming" ? "Opening soon" : "Closed"}</span>
          <h2 className="mt-2 pr-10 text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">{job.title}</h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {facts.map((f, i) => <li key={i} className="flex items-center gap-1.5"><f.Icon className="h-4 w-4 text-story-royal" />{f.text}</li>)}
          </ul>
          {job.status === "upcoming" && job.openFrom && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300"><CalendarClock className="h-4 w-4" />Applications open on {day(job.openFrom)}</p>}
          {job.status === "open" && job.closeBy && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal"><CalendarClock className="h-4 w-4" />Apply by {day(job.closeBy)}</p>}

          <p className="mt-5 text-sm leading-7 text-muted">{job.summary}</p>
          {[{ title: "What you will do", items: job.responsibilities }, { title: "What we are looking for", items: job.requirements }].map((s) => (
            <section key={s.title} className="mt-6">
              <h3 className="text-sm font-bold text-story-navy dark:text-foreground">{s.title}</h3>
              <ul className="mt-2.5 space-y-2">
                {s.items.map((r) => <li key={r} className="flex gap-2.5 text-sm leading-6 text-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-story-royal" />{r}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-soft bg-background p-4 sm:px-8">
          {job.status === "open" ? (
            <ArrowButton onClick={() => onApply(job)}>Apply for this role</ArrowButton>
          ) : (
            <ArrowButton tone="outline" onClick={onOpenApplication}>Send an open application</ArrowButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
