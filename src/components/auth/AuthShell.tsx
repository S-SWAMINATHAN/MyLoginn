"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Signup side panel: Learn, Build and Grow take turns being highlighted on a connected timeline. */
function JourneyPanel() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const items = [
    { icon: "student", title: "Learn", text: "Practical courses with mentors" },
    { icon: "webdev", title: "Build", text: "Real projects for your portfolio" },
    { icon: "career", title: "Grow", text: "Internships and new opportunities" },
  ];

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % items.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, items.length]);

  return (
    <ol className="relative space-y-3">
      <span aria-hidden className="absolute bottom-6 left-[1.7rem] top-6 w-px bg-border-soft" />
      {items.map((it, idx) => {
        const on = idx === i;
        return (
          <motion.li key={it.title} onMouseEnter={() => setI(idx)} animate={{ x: on ? 6 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="relative flex cursor-default items-center gap-4 rounded-2xl bg-surface p-3 shadow-sm">
            <motion.span animate={{ scale: on ? 1.08 : 1 }} className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-story-mist">
              <ContentIcon keyword={it.icon} className="h-8 w-8" />
            </motion.span>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: on ? "var(--story-royal)" : undefined }}>{it.title}</p>
              <p className="text-xs text-muted">{it.text}</p>
            </div>
            <motion.span aria-hidden className="ml-auto h-2 w-2 shrink-0 rounded-full bg-story-royal" animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }} />
          </motion.li>
        );
      })}
    </ol>
  );
}

/** Login side panel: three small cards that float gently, showing what is waiting after signing in. */
function WaitingPanel() {
  const reduced = useReducedMotion();
  const float = () => (reduced ? undefined : { y: [0, -6, 0] });
  const floatT = (delay: number) => ({ duration: 4.5, repeat: Infinity, ease: "easeInOut" as const, delay });
  return (
    <div className="relative space-y-3">
      <motion.div animate={float()} transition={floatT(0)} className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm">
        <span className="grid h-12 w-12 shrink-0 place-items-center text-story-royal"><AnimatedFlame className="h-9 w-9" /></span>
        <div><p className="text-sm font-bold">Keep your streak alive</p><p className="text-xs text-muted">Log in every day to build momentum</p></div>
      </motion.div>

      <motion.div animate={float()} transition={floatT(0.6)} className="ml-6 rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center text-story-royal"><ContentIcon keyword="student" className="h-8 w-8" /></span>
          <p className="text-sm font-bold">Pick up where you left off</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-story-mist">
          <motion.div className="h-full rounded-full bg-story-royal" initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1.4, delay: 0.4, ease: EASE }} />
        </div>
      </motion.div>

      <motion.div animate={float()} transition={floatT(1.2)} className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm">
        <span className="grid h-12 w-12 shrink-0 place-items-center text-story-royal"><AnimatedReward className="h-9 w-9" /></span>
        <div><p className="text-sm font-bold">Earn points and badges</p><p className="text-xs text-muted">Climb the learning leaderboard</p></div>
      </motion.div>
    </div>
  );
}

export function AuthShell({ mode, children }: { mode: "login" | "signup"; children: ReactNode }) {
  const signup = mode === "signup";

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[.35] [background-image:radial-gradient(var(--story-line)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(60%_60%_at_50%_45%,#000,transparent)]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border-soft bg-surface shadow-[0_30px_80px_-40px_rgba(11,31,77,0.35)] lg:grid-cols-[0.95fr_1.05fr]">
        {/* side panel (large screens) */}
        <aside className="relative hidden flex-col justify-between gap-8 bg-story-mist p-10 lg:flex">
          <div>
            <span className="story-eyebrow">Your next chapter</span>
            <h2 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-story-navy">
              {signup ? <>Make room for <span className="text-story-royal">what&apos;s next.</span></> : <>Good to have you <span className="text-story-royal">back.</span></>}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              {signup ? "One account brings your learning, expert guidance and new opportunities together." : "Your courses, progress and next opportunity are right where you left them."}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {signup ? <JourneyPanel /> : <WaitingPanel />}
            </motion.div>
          </AnimatePresence>

          <p className="text-xs font-medium text-muted">MyLoginn <span className="px-1 text-story-royal">·</span> Learn, create and move forward.</p>
        </aside>

        {/* form panel */}
        <div className="relative flex min-w-0 items-center justify-center px-5 py-8 sm:px-10 sm:py-10">
          <span aria-hidden className="absolute inset-x-0 top-0 flex h-1 lg:hidden">
            {["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"].map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
          </span>
          <div className="w-full max-w-[400px]">
            {children}
            <div className="mt-6 border-t border-border-soft pt-4 text-center text-sm text-muted">
              {signup ? "Already have an account?" : "New to MyLoginn?"}{" "}
              <Link href={signup ? "/login" : "/signup"} className="group inline-flex items-center gap-1 font-semibold text-story-royal">
                {signup ? "Log in" : "Create an account"}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            {signup && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Your details are protected and kept private.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
