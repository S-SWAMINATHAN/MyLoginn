"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Bot, Briefcase, Code2, Headset, Megaphone, Palette, Settings, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublicJob } from "@/components/careers/CareersBoard";
import { JobCover } from "@/components/careers/JobCover";

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

  const status =
    job.status === "open" ? { label: "Open now", dot: "bg-emerald-300" }
    : job.status === "upcoming" ? { label: job.openFrom ? `Opens ${day(job.openFrom)}` : "Opening soon", dot: "bg-amber-300" }
    : { label: "Closed", dot: "bg-slate-300" };

  // the pointer position over the card (-0.5 to 0.5) drives the 3D cover; it settles back when the pointer leaves
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useSpring(px, { stiffness: 120, damping: 18 });
  const my = useSpring(py, { stiffness: 120, damping: 18 });
  const where = [job.workMode, job.location].filter(Boolean).join(" · ");
  const deadline = job.status === "upcoming" ? "Not open yet" : job.status === "closed" ? "No longer accepting" : win ? (win.left === 0 ? "Last day to apply" : `${win.left} ${win.left === 1 ? "day" : "days"} left to apply`) : "Open until filled";
  const points = [where, job.experience, `${job.positions} ${job.positions === 1 ? "vacancy" : "vacancies"}`, job.salaryRange, deadline].filter(Boolean) as string[];

  return (
    <motion.li
      layout
      onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); px.set((e.clientX - r.left) / r.width - 0.5); py.set((e.clientY - r.top) / r.height - 0.5); }}
      onPointerLeave={() => { px.set(0); py.set(0); }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-lift)]", job.status === "closed" && "opacity-80")}
    >
      <button type="button" onClick={() => onOpen(job)} aria-label={`View details for ${job.title}`} className="flex flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-story-royal">
        {/* the cover: team colour, a status badge, the role name, and a drawing of the team's work */}
        <div className={cn("relative h-40 shrink-0 overflow-hidden px-5 pb-4 pt-4 text-white", team.band)}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              {job.status === "open" && <span className="absolute inset-0 animate-ping rounded-full bg-white/80" />}
              <span className={cn("relative h-1.5 w-1.5 rounded-full", status.dot)} />
            </span>
            {status.label}
          </span>
          <JobCover team={job.team} Icon={Icon} mx={mx} my={my} />
          <h3 className="absolute inset-x-5 bottom-4 z-10 line-clamp-2 max-w-[75%] text-xl font-bold leading-tight tracking-tight">{job.title}</h3>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span className="w-fit rounded-full bg-story-royal/10 px-3 py-1 text-xs font-semibold text-story-royal">{job.team} · {job.type}</span>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{job.summary.replace(/\*\*/g, "")}</p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
            {points.slice(0, 4).map((t) => (
              <li key={t} className="flex gap-2"><span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-story-royal" /><span className="min-w-0 truncate">{t}</span></li>
            ))}
          </ul>
          <span className="mt-auto block pt-5">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] transition-shadow duration-300 group-hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)]">
              View details
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </span>
        </div>
      </button>
    </motion.li>
  );
}
