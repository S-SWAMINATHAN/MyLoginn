"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Friendly robot mascot — rounded head, blinking eyes, warm smile, pulsing
 * antenna and a little wave from one ear-side arm. Used wherever the app
 * wants a recognizable "AI agent" character (CTA banners, empty states). */
export function AnimatedAgent({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "agent" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="55%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g animate={{ y: [0, -1.2, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
          {/* Antenna */}
          <line x1="32" y1="9" x2="32" y2="4.5" stroke={`url(#${id}g)`} strokeWidth="2.2" strokeLinecap="round" />
          <motion.circle
            cx="32"
            cy="3"
            r="2.2"
            fill="#67e8f9"
            filter={`url(#${id}glow)`}
            style={{ transformOrigin: "32px 3px" }}
            animate={{ scale: [0.75, 1.25, 0.75], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Waving arm */}
          <motion.g style={{ transformOrigin: "14px 34px" }} animate={{ rotate: [0, -18, 0, -18, 0] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}>
            <circle cx="14" cy="34" r="4" fill={`url(#${id}g)`} />
          </motion.g>
          {/* Other arm, resting */}
          <circle cx="50" cy="38" r="4" fill={`url(#${id}g)`} opacity=".9" />

          {/* Ears */}
          <rect x="7.5" y="19" width="6" height="15" rx="3" fill={`url(#${id}g)`} opacity=".95" />
          <rect x="50.5" y="19" width="6" height="15" rx="3" fill={`url(#${id}g)`} opacity=".95" />

          {/* Head */}
          <rect x="11" y="9" width="42" height="38" rx="15" fill={`url(#${id}g)`} filter={`url(#${id}glow)`} />
          {/* Face plate */}
          <rect x="17.5" y="16" width="29" height="22" rx="9" fill="#ffffff" opacity=".22" />

          {/* Blinking eyes */}
          {[25, 39].map((cx, i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy="27"
              r="3.4"
              fill="#f8fbff"
              style={{ transformOrigin: `${cx}px 27px` }}
              animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{ duration: 3.4, times: [0, 0.42, 0.5, 0.58, 1], repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          ))}

          {/* Warm smile */}
          <path d="M23 34.5 Q32 41 41 34.5" stroke="#eff6ff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Orbiting spark */}
        <motion.g style={{ transformOrigin: "32px 28px" }} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}>
          <motion.path
            d="M56 28 56.6 29.4 58 30 56.6 30.6 56 32 55.4 30.6 54 30 55.4 29.4Z"
            fill="#67e8f9"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </span>
  );
}
