"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Phone handset — rings with a wiggle while sound waves ripple outward. */
export function AnimatedPhone({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ph" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <motion.path
          d="M7.7 3.1c.6-.2 1.3.05 1.6.6l1.6 2.9c.3.5.2 1.15-.25 1.55l-1.3 1.2c-.3.3-.4.75-.2 1.15a10.4 10.4 0 0 0 4.35 4.35c.4.2.85.1 1.15-.2l1.2-1.3c.4-.45 1.05-.55 1.55-.25l2.9 1.6c.55.3.8 1 .6 1.6l-.75 2.2a1.7 1.7 0 0 1-1.8 1.15C10.6 19.1 4.9 13.4 4.3 5.65A1.7 1.7 0 0 1 5.45 3.85Z"
          fill={`url(#${id}g)`}
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 2.6, times: [0, 0.12, 0.24, 0.36, 0.48, 0.7], repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sound waves */}
        {[0, 0.35].map((d, i) => (
          <motion.path
            key={i}
            d={i === 0 ? "M15.4 5.4a4.6 4.6 0 0 1 3.2 3.2" : "M16.2 2.4a7.8 7.8 0 0 1 5.4 5.4"}
            stroke="#34d399"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0, 1, 0], scale: [0.85, 1.08, 0.85] }}
            style={{ transformOrigin: "15px 6px" }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: d }}
          />
        ))}
      </svg>
    </span>
  );
}
