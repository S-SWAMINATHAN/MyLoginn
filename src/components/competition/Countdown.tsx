"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useHasMounted } from "@/lib/useHasMounted";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { pad, splitDuration, useServerNow } from "./client";

function Digit({ value, label, compact, dark }: { value: string; label: string; compact?: boolean; dark?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative overflow-hidden rounded-2xl border font-bold tabular-nums", dark ? "border-white/15 bg-white/10 text-white" : "border-border-soft bg-surface text-foreground shadow-[var(--shadow-soft)]", compact ? "h-12 w-12 text-xl" : "h-16 w-16 text-3xl sm:h-20 sm:w-20 sm:text-4xl")}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={value}
            initial={reduced ? false : { y: "-60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: "60%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 grid place-items-center"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={cn("mt-1.5 text-[11px] font-semibold uppercase tracking-wider", dark ? "text-white/55" : "text-muted")}>{label}</span>
    </div>
  );
}

/** Countdown to `target`, corrected by the server's clock. Shows `done` once reached. */
export function Countdown({ target, serverNow, compact, done, tone }: { target: string; serverNow: string; compact?: boolean; done?: React.ReactNode; tone?: "dark" }) {
  const dark = tone === "dark";
  const now = useServerNow(serverNow);
  // The seconds differ between the server render and hydration, so the digits render on the client only.
  const mounted = useHasMounted();
  const left = new Date(target).getTime() - now;
  if (!mounted)
    return (
      <div aria-hidden="true" className="flex items-start gap-2.5 sm:gap-3">
        {["Hours", "Min", "Sec"].map((l) => <Digit key={l} value="--" label={l} compact={compact} dark={dark} />)}
      </div>
    );
  if (left <= 0) return <>{done ?? null}</>;
  const { days, hours, minutes, seconds } = splitDuration(left);
  return (
    <div role="timer" aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`} className="flex items-start gap-2.5 sm:gap-3">
      {days > 0 && <Digit value={pad(days)} label="Days" compact={compact} dark={dark} />}
      <Digit value={pad(hours)} label="Hours" compact={compact} dark={dark} />
      <Digit value={pad(minutes)} label="Min" compact={compact} dark={dark} />
      <Digit value={pad(seconds)} label="Sec" compact={compact} dark={dark} />
    </div>
  );
}
