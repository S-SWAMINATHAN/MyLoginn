"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedUsers({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "us" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}back`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`${id}front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "8px 13px" }}
          animate={{ opacity: [0.75, 0.95, 0.75] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="8" cy="7.5" r="3" fill={`url(#${id}back)`} />
          <path d="M2.2 20c.3-3.9 2.7-6.5 5.8-6.5s5.5 2.6 5.8 6.5a.6.6 0 0 1-.6.6H2.8a.6.6 0 0 1-.6-.6Z" fill={`url(#${id}back)`} />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "15px 14px" }}
          animate={{ scale: [1, 1.06, 1], y: [0, -0.4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="15.2" cy="8.3" r="3.5" fill={`url(#${id}front)`} />
          <path
            d="M8.4 20.6c.3-4.6 3.2-7.6 6.8-7.6s6.5 3 6.8 7.6a.7.7 0 0 1-.7.7H9.1a.7.7 0 0 1-.7-.7Z"
            fill={`url(#${id}front)`}
          />
        </motion.g>
        <motion.circle
          cx="19.4"
          cy="5.4"
          r="1.7"
          fill="#4ade80"
          stroke="white"
          strokeWidth="1"
          animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
