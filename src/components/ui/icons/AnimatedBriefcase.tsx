"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Briefcase — bobs softly, handle lifts, clasp glints in a loop. */
export function AnimatedBriefcase({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "bc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id={`${id}lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 21px" }}
          animate={{ y: [0, -0.9, 0], scaleY: [1, 1.02, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Handle — lifts slightly */}
          <motion.path
            d="M9.2 7V5.4c0-.9.7-1.6 1.6-1.6h2.4c.9 0 1.6.7 1.6 1.6V7"
            stroke={`url(#${id}lid)`}
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
            animate={{ y: [0, -0.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          />
          {/* Body */}
          <rect x="2.8" y="7" width="18.4" height="13.4" rx="2.6" fill={`url(#${id}g)`} />
          {/* Lid band */}
          <path d="M2.8 11.6h18.4v-2A2.6 2.6 0 0 0 18.6 7H5.4a2.6 2.6 0 0 0-2.6 2.6Z" fill={`url(#${id}lid)`} />
          {/* Clasp — glints */}
          <motion.rect
            x="10.4"
            y="10.4"
            width="3.2"
            height="2.6"
            rx="0.9"
            fill="#eff6ff"
            style={{ transformOrigin: "12px 11.7px" }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </motion.g>

        {/* Sparkle */}
        <motion.path
          d="M20.6 2.6 21.1 3.9 22.4 4.4 21.1 4.9 20.6 6.2 20.1 4.9 18.8 4.4 20.1 3.9Z"
          fill="#bfdbfe"
          style={{ transformOrigin: "20.6px 4.4px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    </span>
  );
}
