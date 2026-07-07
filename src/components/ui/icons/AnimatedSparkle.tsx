"use client";

import { useId } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedSparkle({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "sp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}main`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M32 6c1.4 14 5 21.6 14 26-9 4.4-12.6 12-14 26-1.4-14-5-21.6-14-26 9-4.4 12.6-12 14-26Z"
          fill={`url(#${id}main)`}
          filter={`url(#${id}glow)`}
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1 1;1.18 1.18;1 1"
            dur="2.2s"
            repeatCount="indefinite"
            additive="sum"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-6 32 32;6 32 32;-6 32 32"
            dur="4.4s"
            repeatCount="indefinite"
            additive="sum"
          />
        </path>
        <path d="M50 12c.6 5.4 2 8.2 5.6 10-3.6 1.8-5 4.6-5.6 10-.6-5.4-2-8.2-5.6-10 3.6-1.8 5-4.6 5.6-10Z" fill="#c084fc">
          <animate attributeName="opacity" values="1;.25;1" dur="1.8s" begin=".2s" repeatCount="indefinite" />
        </path>
        <path d="M12 38c.4 3.8 1.4 5.8 4 7-2.6 1.2-3.6 3.2-4 7-.4-3.8-1.4-5.8-4-7 2.6-1.2 3.6-3.2 4-7Z" fill="#ddd6fe">
          <animate attributeName="opacity" values=".25;1;.25" dur="1.6s" begin=".5s" repeatCount="indefinite" />
        </path>
      </svg>
    </span>
  );
}
