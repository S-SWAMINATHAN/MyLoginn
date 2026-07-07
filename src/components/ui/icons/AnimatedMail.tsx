"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Envelope — flap lifts as a letter peeks out; notification dot pulses. */
export function AnimatedMail({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ml" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id={`${id}flap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 13px" }}
          animate={{ y: [0, -0.7, 0], rotate: [0, -1.5, 0, 1.5, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Letter peeking out */}
          <motion.rect
            x="6.4"
            y="6.2"
            width="11.2"
            height="8"
            rx="1"
            fill="#f0f9ff"
            animate={{ y: [0, -2.2, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          {/* Envelope body */}
          <rect x="2.9" y="8.2" width="18.2" height="12" rx="2.3" fill={`url(#${id}g)`} />
          {/* V-flap on front */}
          <path
            d="M3.4 9.4 10.9 15a1.9 1.9 0 0 0 2.2 0l7.5-5.6"
            stroke={`url(#${id}flap)`}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Notification dot */}
        <motion.circle
          cx="20.4"
          cy="6.4"
          r="2"
          fill="#f43f5e"
          stroke="white"
          strokeWidth="1"
          style={{ transformOrigin: "20.4px 6.4px" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
