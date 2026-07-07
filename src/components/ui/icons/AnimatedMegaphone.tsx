"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Megaphone — rocks as it announces, sound waves ripple out in a loop. */
export function AnimatedMegaphone({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "mg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "8px 14px" }}
          animate={{ rotate: [0, -4, 0, 3, 0], y: [0, -0.6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Horn */}
          <path
            d="M15.4 3.8c.8-.5 1.8.1 1.8 1v11.4c0 .9-1 1.5-1.8 1-2.1-1.3-4.5-2.1-7.1-2.35H5.6A2.6 2.6 0 0 1 3 12.25v-3.5a2.6 2.6 0 0 1 2.6-2.6h2.7c2.6-.25 5-1.05 7.1-2.35Z"
            fill={`url(#${id}g)`}
          />
          {/* Mouthpiece band */}
          <path d="M15.4 3.8c.8-.5 1.8.1 1.8 1v11.4c0 .9-1 1.5-1.8 1Z" fill={`url(#${id}h)`} />
          {/* Handle */}
          <path
            d="M5.4 14.85h3l.9 4.3a1.5 1.5 0 0 1-1.45 1.85h-.6a1.5 1.5 0 0 1-1.45-1.15Z"
            fill={`url(#${id}h)`}
          />
        </motion.g>

        {/* Sound waves rippling out */}
        {[
          { d: "M19.6 8.4a4.4 4.4 0 0 1 0 4.2", delay: 0 },
          { d: "M21.4 6.6a7.2 7.2 0 0 1 0 7.8", delay: 0.35 },
        ].map((w, i) => (
          <motion.path
            key={i}
            d={w.d}
            stroke="#e879f9"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0, 1, 0], x: [-1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
          />
        ))}

        {/* Sparkle */}
        <motion.path
          d="M4.4 2.6 4.85 3.9 6.15 4.35 4.85 4.8 4.4 6.1 3.95 4.8 2.65 4.35 3.95 3.9Z"
          fill="#f0abfc"
          style={{ transformOrigin: "4.4px 4.35px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
        />
      </svg>
    </span>
  );
}
