"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Arrow that plays one pass on hover (no loop): leaves the centre to the right end, re-enters from the left end and settles back in the centre. */
export function GlideArrow({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        rest: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        hover: reduced
          ? { x: 4, opacity: 1 }
          : { x: [0, 24, -24, 0], opacity: [1, 0, 0, 1], transition: { duration: 0.95, ease: "easeInOut", times: [0, 0.4, 0.42, 1] } },
      }}
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </motion.svg>
  );
}

/** Call-to-action pill: solid brand colour, a soft translucent arrow track, an idle shimmer and a smoothly gliding arrow on hover. */
export function PlanButton({ label, onClick, tone = "royal" }: { label: string; onClick: () => void; tone?: "royal" | "light" }) {
  const light = tone === "light";
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      variants={{ rest: { y: 0 }, hover: { y: 0 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group btn-sweep-navy relative isolate inline-flex h-11 cursor-pointer select-none items-center gap-3 overflow-hidden rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium tracking-[0.01em] shadow-[0_8px_20px_-10px_rgba(31,86,214,0.7)] ring-1 ring-inset hover:shadow-[0_14px_28px_-12px_rgba(31,86,214,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        light ? "bg-white text-story-royal ring-story-royal/10 hover:text-white focus-visible:ring-white" : "bg-story-royal text-white ring-white/15 focus-visible:ring-story-royal focus-visible:ring-offset-background"
      )}
    >
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -z-10 w-1/4 -skew-x-12 bg-white/15"
          initial={{ left: "-30%" }}
          animate={{ left: ["-30%", "130%"] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.4 }}
        />
      )}
      <span>{label}</span>
      <span aria-hidden className={cn("grid h-8 w-14 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300", light ? "bg-story-royal/10 text-story-royal group-hover:bg-white/20 group-hover:text-white" : "bg-white/15 text-white group-hover:bg-white/25")}>
        <GlideArrow reduced={reduced} />
      </span>
    </motion.button>
  );
}
