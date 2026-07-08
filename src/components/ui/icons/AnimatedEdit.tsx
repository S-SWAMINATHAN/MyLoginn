"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedEdit({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ed" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}pen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8874ff" />
            <stop offset="100%" stopColor="#4726c4" />
          </linearGradient>
          <linearGradient id={`${id}tip`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <path
          d="M4 17.2V20h2.8L4.6 16.9 4 17.2Z"
          fill={`url(#${id}tip)`}
        />
        <motion.g
          style={{ transformOrigin: "6px 18px" }}
          animate={{ rotate: [0, -6, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M14.9 5.2 4.8 15.3a1 1 0 0 0-.26.45L3.6 19.3a.7.7 0 0 0 .86.86l3.55-.95a1 1 0 0 0 .45-.26L18.6 8.8l-3.7-3.6Z"
            fill={`url(#${id}pen)`}
          />
          <path
            d="m16.3 3.8 1.2-1.2a1.9 1.9 0 0 1 2.7 0l1 1a1.9 1.9 0 0 1 0 2.7L20 7.5l-3.7-3.7Z"
            fill={`url(#${id}tip)`}
          />
        </motion.g>
        <motion.path
          d="M13 20.4h7"
          stroke={`url(#${id}pen)`}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 2.4, times: [0, 0.4, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
