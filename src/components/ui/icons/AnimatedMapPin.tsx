"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Location pin — bounces with squash-and-stretch over a rippling ground ring. */
export function AnimatedMapPin({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "mp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Ground ripple */}
        <motion.ellipse
          cx="12"
          cy="20.6"
          rx="4"
          ry="1.15"
          fill="#e11d48"
          style={{ transformOrigin: "12px 20.6px" }}
          animate={{ scale: [0.5, 1.25, 0.5], opacity: [0.3, 0.06, 0.3] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pin — bounce + squash */}
        <motion.g
          style={{ transformOrigin: "12px 19px" }}
          animate={{ y: [0, -2.4, 0], scaleY: [0.96, 1.05, 0.96], scaleX: [1.04, 0.97, 1.04] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M12 2.2c-4 0-7.1 3.1-7.1 7 0 5.2 6.1 10.1 6.7 10.6a.7.7 0 0 0 .8 0c.6-.5 6.7-5.4 6.7-10.6 0-3.9-3.1-7-7.1-7Z"
            fill={`url(#${id}g)`}
          />
          <motion.circle
            cx="12"
            cy="9.2"
            r="2.5"
            fill="#fff1f2"
            style={{ transformOrigin: "12px 9.2px" }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </span>
  );
}
