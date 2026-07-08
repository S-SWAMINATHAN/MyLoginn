"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedWarning({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "wa" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "12px 14px" }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M10.4 3.9c.7-1.2 2.5-1.2 3.2 0l7.6 13.4c.7 1.2-.2 2.7-1.6 2.7H4.4c-1.4 0-2.3-1.5-1.6-2.7l7.6-13.4Z"
            fill={`url(#${id}g)`}
          />
        </motion.g>
        <motion.g animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="10.9" y="8.2" width="2.2" height="6" rx="1.1" fill="#fffbeb" />
          <circle cx="12" cy="16.6" r="1.25" fill="#fffbeb" />
        </motion.g>
      </svg>
    </span>
  );
}
