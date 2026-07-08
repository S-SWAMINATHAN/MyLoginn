"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedTrash({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "tr" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}bin`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id={`${id}lid`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "17px 5.5px" }}
          animate={{ rotate: [0, -14, 0, 0] }}
          transition={{ duration: 2.6, times: [0, 0.2, 0.45, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M9.2 3.4c0-.8.6-1.4 1.4-1.4h2.8c.8 0 1.4.6 1.4 1.4V4h4.4a.9.9 0 1 1 0 1.8H4.8A.9.9 0 0 1 4.8 4h4.4v-.6Z"
            fill={`url(#${id}lid)`}
          />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "12px 14px" }}
          animate={{ y: [0, 0.6, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M5.8 7.4h12.4l-.9 12.2a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L5.8 7.4Z"
            fill={`url(#${id}bin)`}
          />
          <path d="M10 10.2v7.6M14 10.2v7.6" stroke="#fee2e2" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    </span>
  );
}
