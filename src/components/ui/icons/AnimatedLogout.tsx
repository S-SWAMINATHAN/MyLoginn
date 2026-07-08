"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedLogout({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "lo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}door`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a89dff" />
            <stop offset="100%" stopColor="#5934f0" />
          </linearGradient>
          <linearGradient id={`${id}arrow`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <motion.path
          d="M4.5 3.8A1.8 1.8 0 0 1 6.3 2h6.4a1.8 1.8 0 0 1 1.8 1.8v3.4h-2V4h-6v16h6v-3.2h2v3.4a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8V3.8Z"
          fill={`url(#${id}door)`}
          style={{ transformOrigin: "9px 12px" }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M15.4 8.2 19.2 12l-3.8 3.8-1.4-1.4 1.4-1.4H9.8v-2h5.6L14 9.6l1.4-1.4Z"
          fill={`url(#${id}arrow)`}
          animate={{ x: [0, 2.2, 0], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
