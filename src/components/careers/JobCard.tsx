"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Briefcase, CalendarClock, Code2, Headset, Megaphone, MapPin, Palette, Settings, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublicJob } from "@/components/careers/CareersBoard";

/** One flat colour and one icon per team, so roles are recognisable at a glance. */
const TEAM: Record<string, { band: string; icon: LucideIcon }> = {
  Engineering: { band: "bg-story-royal", icon: Code2 },
  Design: { band: "bg-violet-600", icon: Palette },
  AI: { band: "bg-story-navy", icon: Bot },
  Marketing: { band: "bg-amber-600", icon: Megaphone },
  Operations: { band: "bg-emerald-600", icon: Settings },
  Sales: { band: "bg-sky-600", icon: TrendingUp },
  Support: { band: "bg-rose-600", icon: Headset },
};

const DAY = 86_400_000;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Days left and how much of the application window remains (0 to 1). */
function windowLeft(job: PublicJob, now: number) {
  if (!job.closeBy) return null;
  const end = new Date(job.closeBy).getTime() + DAY;
  const start = new Date(job.postedAt).getTime();
  const left = Math.max(0, Math.ceil((end - now) / DAY));
  const share = Math.min(1, Math.max(0.04, (end - now) / Math.max(DAY, end - start)));
  return { left, share };
}

export function JobCard({ job, now, index, onOpen }: { job: PublicJob; now: number; index: number; onOpen: (job: PublicJob) => void }) {
  const team = TEAM[job.team] ?? { band: "bg-story-royal", icon: Briefcase };
  const Icon = team.icon;
  const win = job.status === "open" ? windowLeft(job, now) : null;
  const urgent = win ? win.left <= 5 : false;

  const status =
    job.status === "open" ? { label: "Open now", dot: "bg-emerald-300" }
    : job.status === "upcoming" ? { label: job.openFrom ? `Opens ${day(job.openFrom)}` : "Opening soon", dot: "bg-amber-300" }
    : { label: "Closed", dot: "bg-slate-300" };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-lift)]"
    >
      <button type="button" onClick={() => onOpen(job)} aria-label={`View details for ${job.title}`} className="flex flex-1 flex-col text-left">
        <div className={cn("relative h-28 overflow-hidden px-5 pt-4 text-white", team.band, job.status === "closed" && "opacity-70")}>
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{job.type}</span>
          </div>
          <p className="absolute bottom-4 left-5 text-sm font-semibold text-white/90">{job.team}</p>
          <Icon aria-hidden strokeWidth={1.4} className="absolute -bottom-3 right-4 h-20 w-20 text-white/30 transition-transform duration-500 group-hover:scale-110" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-story-navy transition-colors group-hover:text-story-royal dark:text-foreground">{job.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted">{job.summary.replace(/\*\*/g, "")}</p>

          <ul className="mt-4 grid gap-2 text-sm text-muted">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-story-royal" />{[job.workMode, job.location].filter(Boolean).join(" · ")}</li>
            {job.experience && <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 shrink-0 text-story-royal" />{job.experience}</li>}
            <li className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-story-royal" />{job.positions} {job.positions === 1 ? "vacancy" : "vacancies"}</li>
            {job.salaryRange && <li className="flex items-center gap-2"><Wallet className="h-4 w-4 shrink-0 text-story-royal" />{job.salaryRange}</li>}
          </ul>

          <div className="mt-auto pt-5">
            {win && (
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-story-mist" role="presentation">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${win.share * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full", urgent ? "bg-rose-500" : "bg-story-royal")} />
              </div>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-border-soft pt-4">
              <span className={cn("inline-flex items-center gap-1.5 text-sm", urgent ? "font-semibold text-rose-600" : "text-muted")}>
                {job.status === "upcoming" ? <><CalendarClock className="h-4 w-4" />Not open yet</>
                  : job.status === "closed" ? "No longer accepting"
                  : win ? <><CalendarClock className="h-4 w-4" />{win.left === 0 ? "Last day to apply" : `${win.left} ${win.left === 1 ? "day" : "days"} left to apply`}</>
                  : "Open until filled"}
              </span>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-story-royal py-1 pl-4 pr-1 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] transition-shadow group-hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)]">
                View details
                <span aria-hidden className="grid h-7 w-11 place-items-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25"><ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.li>
  );
}
