"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Filled gradient compass — needle sweeps and settles in a loop, cardinal tick blips. */
export function AnimatedExploreCourses({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "cp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id={`${id}n`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: [-8, 10, -8], y: [0, -0.8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="12" cy="12" r="9.6" fill={`url(#${id}g)`} />
          <circle cx="12" cy="12" r="7.5" fill="#312e81" opacity="0.3" />
          {/* Cardinal ticks */}
          {[0, 90, 180, 270].map((r) => (
            <rect key={r} x="11.65" y="3.4" width="0.7" height="1.8" rx="0.35" fill="#e0e7ff" transform={`rotate(${r} 12 12)`} />
          ))}
          {/* Needle — sweeps and settles */}
          <motion.path
            d="M12 5.6 14 12l-2 6.4L10 12Z"
            fill={`url(#${id}n)`}
            style={{ transformOrigin: "12px 12px" }}
            animate={{ rotate: [0, 48, -32, 12, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="12" cy="12" r="1.2" fill="#eef2ff" />
        </motion.g>

        {/* North blip */}
        <motion.circle
          cx="12"
          cy="2.4"
          r="0.9"
          fill="#22d3ee"
          style={{ transformOrigin: "12px 2.4px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
