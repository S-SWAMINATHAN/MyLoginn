"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const confetti: { x: number; y: number; r: number; color: string; delay: number }[] = [
  { x: 18, y: -14, r: 90, color: "#f59e0b", delay: 0 },
  { x: -18, y: -12, r: -70, color: "#22c55e", delay: 0.12 },
  { x: 14, y: 16, r: 60, color: "#6c4dff", delay: 0.24 },
  { x: -14, y: 15, r: -100, color: "#22d3ee", delay: 0.36 },
  { x: 0, y: -20, r: 40, color: "#fb7185", delay: 0.48 },
  { x: 0, y: 20, r: -50, color: "#f59e0b", delay: 0.6 },
];

export function AnimatedSuccess({
  className,
  style,
  once = false,
}: {
  className?: string;
  style?: CSSProperties;
  once?: boolean;
}) {
  const id = "sc" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <motion.span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={style}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
    >
      {confetti.map((c, i) => (
        <span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-sm"
          style={
            {
              background: c.color,
              "--confetti-x": `${c.x}px`,
              "--confetti-y": `${c.y}px`,
              "--confetti-r": `${c.r}deg`,
              animation: `confetti-burst 1s ease-out ${once ? "1" : "infinite"}`,
              animationDelay: `${c.delay}s`,
              animationFillMode: once ? "forwards" : "none",
            } as CSSProperties
          }
        />
      ))}
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="12"
          cy="12"
          r="9.6"
          fill={`url(#${id}g)`}
          style={{ transformOrigin: "12px 12px" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="m7.6 12.3 3 3 5.8-6.1"
          stroke="#f0fdf4"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={once ? { pathLength: 1 } : { pathLength: [0, 1, 1] }}
          transition={
            once
              ? { duration: 0.6, ease: "easeOut", delay: 0.2 }
              : { duration: 2.2, times: [0, 0.4, 1], repeat: Infinity, ease: "easeInOut" }
          }
        />
      </svg>
    </motion.span>
  );
}
