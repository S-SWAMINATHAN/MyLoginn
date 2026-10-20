"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** What the front panel shows for each team: a tiny, believable slice of that team's work. */
function Front({ team }: { team: string }): ReactNode {
  const bar = "rounded-full bg-slate-200";
  switch (team) {
    case "Design":
      return (
        <div className="flex h-full flex-col justify-between">
          <div className="flex gap-1.5">{["#f43f5e", "#f59e0b", "#10b981", "#6366f1"].map((c) => <span key={c} className="h-5 w-5 rounded-full shadow-inner" style={{ background: c }} />)}</div>
          <div className="h-2 w-3/4 rounded-full bg-violet-200" /><div className={`h-2 w-1/2 ${bar}`} />
        </div>
      );
    case "AI":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5">
          <div className="w-4/5 rounded-lg rounded-bl-sm bg-slate-100 px-2 py-1"><div className="h-1.5 w-full rounded-full bg-slate-300" /></div>
          <div className="ml-auto w-3/5 rounded-lg rounded-br-sm bg-story-royal px-2 py-1"><div className="h-1.5 w-full rounded-full bg-white/70" /></div>
          <div className="flex gap-1 pl-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-300" />)}</div>
        </div>
      );
    case "Marketing":
    case "Sales":
      return (
        <div className="flex h-full items-end gap-1.5">
          {[40, 62, 48, 80, 66, 92].map((h, i) => <span key={i} className="flex-1 rounded-t bg-gradient-to-t from-amber-500 to-amber-300" style={{ height: `${h}%` }} />)}
        </div>
      );
    case "Operations":
      return (
        <div className="flex h-full flex-col justify-center gap-2">
          {[true, true, false].map((d, i) => (
            <div key={i} className="flex items-center gap-2"><span className={`grid h-4 w-4 place-items-center rounded ${d ? "bg-emerald-500" : "border-2 border-slate-300"}`}>{d && <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m2.5 6.5 2.2 2.2L9.5 3.8" /></svg>}</span><span className={`h-1.5 flex-1 ${bar}`} /></div>
          ))}
        </div>
      );
    case "Support":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-rose-300" /><div className="flex-1 space-y-1"><div className="h-1.5 w-3/4 rounded-full bg-slate-300" /><div className="h-1.5 w-1/2 rounded-full bg-slate-200" /></div></div>
          <div className="ml-8 rounded-lg bg-rose-500 px-2 py-1"><div className="h-1.5 w-4/5 rounded-full bg-white/80" /></div>
        </div>
      );
    default: // Engineering and anything new: a code editor
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 font-mono">
          <div className="flex gap-1.5"><span className="h-1.5 w-6 rounded-full bg-violet-400" /><span className="h-1.5 w-10 rounded-full bg-sky-400" /></div>
          <div className="flex gap-1.5 pl-3"><span className="h-1.5 w-12 rounded-full bg-emerald-400" /><span className="h-1.5 w-5 rounded-full bg-slate-300" /></div>
          <div className="flex gap-1.5 pl-3"><span className="h-1.5 w-4 rounded-full bg-amber-400" /><span className="h-1.5 w-14 rounded-full bg-slate-300" /></div>
          <div className="flex gap-1.5"><span className="h-1.5 w-3 rounded-full bg-violet-400" /></div>
        </div>
      );
  }
}

/**
 * A small 3D scene for the top of a job card: a browser window, a front panel with that team's work, and a floating
 * badge, each at its own depth. The layers tilt towards the pointer (parallax), so the card feels like an object you
 * can turn. With no pointer, or with reduced motion, the scene simply sits still.
 */
export function JobCover({ team, Icon, mx, my }: { team: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; mx: MotionValue<number>; my: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const rotateY = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-14, 14]);
  const rotateX = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [10, -10]);
  const backX = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [6, -6]);
  const frontX = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-8, 8]);
  const badgeX = useTransform(mx, [-0.5, 0.5], reduced ? [0, 0] : [-14, 14]);
  const badgeY = useTransform(my, [-0.5, 0.5], reduced ? [0, 0] : [-8, 8]);

  return (
    <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-[7.5rem] w-44 [perspective:700px] sm:right-4">
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
        {/* back: the browser window */}
        <motion.div className="absolute right-0 top-0 h-[5.5rem] w-36 overflow-hidden rounded-xl bg-white/90 shadow-[0_18px_30px_-12px_rgba(2,12,40,0.55)] ring-1 ring-white/60" style={{ x: backX, translateZ: 0 }}>
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-100/90 px-2 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="ml-1 h-1.5 flex-1 rounded-full bg-white" />
          </div>
          <div className="space-y-1.5 p-2.5"><div className="h-2 w-2/3 rounded-full bg-slate-300" /><div className="h-1.5 w-full rounded-full bg-slate-200" /><div className="h-1.5 w-4/5 rounded-full bg-slate-200" /></div>
          {/* a soft glass reflection across the window */}
          <span className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        </motion.div>

        {/* front: this team's work */}
        <motion.div className="absolute bottom-1 left-0 h-[4.25rem] w-28 rounded-xl bg-white p-2.5 shadow-[0_22px_34px_-10px_rgba(2,12,40,0.6)] ring-1 ring-white/70" style={{ x: frontX, translateZ: 34 }}>
          <Front team={team} />
        </motion.div>

        {/* floating badge: the team's icon, closest to you */}
        <motion.div className="absolute right-1 top-[3.6rem] grid h-11 w-11 place-items-center rounded-2xl bg-white text-story-royal shadow-[0_16px_26px_-8px_rgba(2,12,40,0.6)] ring-1 ring-white/80" style={{ x: badgeX, y: badgeY, translateZ: 64 }}>
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </motion.div>
      </motion.div>
    </div>
  );
}
