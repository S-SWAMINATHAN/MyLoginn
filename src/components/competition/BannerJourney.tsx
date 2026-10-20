"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Award, BadgeCheck, CheckCircle2, Code2, GraduationCap, Loader2, ShieldCheck, Trophy } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;
const STAGE_MS = 5200;

const CODE = ["def solve(nums):", "    best = cur = nums[0]", "    for x in nums[1:]:", "        cur = max(x, cur + x)", "        best = max(best, cur)", "    return best"];
const TESTS = ["Sample 1", "Sample 2", "Hidden 1", "Hidden 2", "Hidden 3", "Hidden 4"];

function tint(line: string) {
  return line.split(/(\b(?:def|for|in|return)\b|\b(?:max|solve)\b|\d+)/g).map((p, i) =>
    /^(def|for|in|return)$/.test(p) ? <span key={i} className="text-violet-300">{p}</span>
    : /^(max|solve)$/.test(p) ? <span key={i} className="text-sky-300">{p}</span>
    : /^\d+$/.test(p) ? <span key={i} className="text-amber-300">{p}</span>
    : <span key={i}>{p}</span>
  );
}

/** Stage 1: code being written. */
function CodeStage({ play }: { play: boolean }) {
  const total = CODE.join("\n").length;
  const [n, setN] = useState(play ? 0 : total);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setN((v) => (v >= total ? v : v + 2)), 34);
    return () => clearInterval(id);
  }, [play, total]);
  const shown = CODE.join("\n").slice(0, n).split("\n");
  return (
    <div className="font-mono text-[11px] leading-[1.45rem] text-white/90">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-sans font-semibold text-white/55">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">main.py</span>Python 3
      </div>
      {shown.map((l, i) => (
        <div key={i} className="flex">
          <span className="w-5 shrink-0 select-none pr-2 text-right text-white/30">{i + 1}</span>
          <span className="whitespace-pre">
            {tint(l)}
            {i === shown.length - 1 && n < total && <span className="ml-px inline-block h-3.5 w-[2px] translate-y-[3px] animate-pulse bg-cyan-300" />}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Stage 2: hidden tests running on the judge, score counting up. */
function JudgeStage({ play }: { play: boolean }) {
  const [done, setDone] = useState(play ? 0 : TESTS.length);
  const [score, setScore] = useState(play ? 0 : 100);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setDone((d) => Math.min(TESTS.length, d + 1)), 520);
    const controls = animate(0, 100, { duration: TESTS.length * 0.52, ease: "easeOut", onUpdate: (v) => setScore(Math.round(v)) });
    return () => {
      clearInterval(id);
      controls.stop();
    };
  }, [play]);
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        {TESTS.map((t, i) => (
          <div key={t} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors duration-300", i < done ? "bg-emerald-400/15 text-emerald-200" : i === done ? "bg-white/10 text-white" : "bg-white/5 text-white/40")}>
            {i < done ? (
              <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}><CheckCircle2 className="h-3.5 w-3.5" /></motion.span>
            ) : i === done ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-current" />}
            {t}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-[11px] text-white/60">Scored on the server</span>
        <span className="text-2xl font-bold tabular-nums">{score}<span className="text-sm font-medium text-white/60">/100</span></span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-[width] duration-300" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

/** Stage 3: certificate issued, internship offer unlocked. */
function WinStage({ play, reward }: { play: boolean; reward: string | null }) {
  return (
    <div className="relative">
      <motion.div
        initial={play ? { y: 18, opacity: 0, rotate: -2 } : false}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-white p-3 text-[#0b1f4d] shadow-lg"
      >
        {play && (
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/90 to-transparent" initial={{ x: "0%" }} animate={{ x: "520%" }} transition={{ duration: 1.3, delay: 0.55, ease: "easeInOut" }} />
        )}
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950"><Award className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-amber-700">Certificate of achievement</p>
            <p className="truncate text-sm font-bold">Winner — First Place</p>
          </div>
          <BadgeCheck className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-amber-200 pt-2 text-[10px] text-[#576179]">
          <span className="font-mono">MLC-7Q2KD-…</span>
          <span>Verifiable online</span>
        </div>
      </motion.div>
      <motion.div
        initial={play ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 1.1, ease: EASE }}
        className="mt-2.5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-[11.5px] ring-1 ring-white/15"
      >
        <GraduationCap className="h-4 w-4 shrink-0 text-amber-200" />
        <span className="min-w-0 truncate"><b>Internship offer</b>{reward ? ` · ${reward}` : ""}</span>
      </motion.div>
    </div>
  );
}

const STAGES = [
  { key: "code", label: "Code", icon: Code2, caption: "Solve your own question set in a browser IDE." },
  { key: "judge", label: "Judge", icon: ShieldCheck, caption: "Hidden tests run on isolated judge servers." },
  { key: "win", label: "Win", icon: Trophy, caption: "Certificates for all, a paid internship for first place." },
] as const;

/** The interactive centrepiece of the registration banner. Auto-advances; hover pauses, tabs jump. */
export function BannerJourney({ reward }: { reward: string | null }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced || paused) return;
    const id = setTimeout(() => {
      setStage((s) => (s + 1) % STAGES.length);
      setCycle((c) => c + 1);
    }, STAGE_MS);
    return () => clearTimeout(id);
  }, [stage, paused, reduced, cycle]);

  const select = (i: number) => {
    setStage(i);
    setCycle((c) => c + 1);
  };
  const play = !reduced;

  return (
    <TiltCard maxTilt={reduced ? 0 : 4} className="relative">
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} className="rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/15 backdrop-blur-md">
        <div role="tablist" aria-label="How the competition works" className="grid grid-cols-3 gap-1 rounded-xl bg-black/15 p-1">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              type="button"
              aria-selected={stage === i}
              onClick={() => select(i)}
              className={cn("relative overflow-hidden rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors", stage === i ? "text-[#0b1f4d]" : "text-white/70 hover:text-white")}
            >
              {stage === i && <motion.span layoutId="journey-tab" className="absolute inset-0 rounded-lg bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative flex items-center justify-center gap-1.5"><s.icon className="h-3.5 w-3.5" />{s.label}</span>
              {stage === i && play && (
                <motion.span key={`${cycle}-${paused}`} aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 bg-story-royal" initial={{ width: "0%" }} animate={{ width: paused ? undefined : "100%" }} transition={{ duration: STAGE_MS / 1000, ease: "linear" }} />
              )}
            </button>
          ))}
        </div>
        <div className="relative mt-3 h-[10.5rem] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${stage}-${cycle}`}
              role="tabpanel"
              initial={play ? { opacity: 0, x: 24, filter: "blur(6px)" } : false}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={play ? { opacity: 0, x: -24, filter: "blur(6px)" } : { opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="absolute inset-0"
            >
              {stage === 0 ? <CodeStage play={play} /> : stage === 1 ? <JudgeStage play={play} /> : <WinStage play={play} reward={reward} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="mt-2 text-xs text-white/70">
            {STAGES[stage].caption}
          </motion.p>
        </AnimatePresence>
      </div>
    </TiltCard>
  );
}

/** Counts up to `value` once (instantly with reduced motion). */
export function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduced) {
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, { duration: 1.1, ease: EASE, onUpdate: (v) => setShown(Math.round(v)) });
    from.current = value;
    return () => controls.stop();
  }, [value, reduced]);
  return <>{(reduced ? value : shown).toLocaleString("en-IN")}</>;
}

/** Banner surface with a soft spotlight that follows the pointer. */
export function SpotlightBanner({ className, children }: { className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const x = useSpring(mx, { stiffness: 140, damping: 22 });
  const y = useSpring(my, { stiffness: 140, damping: 22 });
  const glow = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgba(125,211,252,0.22), transparent 62%)`;
  const move = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  return (
    <aside onPointerMove={move} onPointerLeave={() => { mx.set(-400); my.set(-400); }} className={cn("group relative overflow-hidden", className)}>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: glow }} />
      {/* A slow light sweep across the surface every few seconds. */}
      {!reduced && (
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/3 z-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" animate={{ x: ["0%", "450%"] }} transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }} />
      )}
      <div className="relative z-10">{children}</div>
    </aside>
  );
}
