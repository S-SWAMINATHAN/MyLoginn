"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Arrow that glides left to right through its circle on hover: one arrow, eased and slow enough to read as smooth. */
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
          : { x: [-26, 26], opacity: [0, 1, 1, 0], transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.1, times: [0, 0.2, 0.8, 1] } },
      }}
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </motion.svg>
  );
}

/** Call-to-action pill for the story sections: solid brand colour, pulsing ring, a shine on hover and a smoothly gliding arrow. */
export function PlanButton({ label, onClick }: { label: string; onClick: () => void }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      variants={{ rest: { y: 0 }, hover: { y: -3 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative isolate inline-flex cursor-pointer select-none items-center gap-3 rounded-full bg-story-royal py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(31,86,214,0.7)] transition-shadow duration-500 hover:shadow-[0_16px_32px_-10px_rgba(31,86,214,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full border-2 border-story-royal"
          animate={{ scale: [1, 1.18], opacity: [0.45, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full">
        <span className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/25 transition-transform duration-1000 ease-out group-hover:translate-x-[520%]" />
      </span>
      <span>{label}</span>
      <span aria-hidden className="grid h-9 w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-full bg-white text-story-royal">
        <GlideArrow reduced={reduced} />
      </span>
    </motion.button>
  );
}
