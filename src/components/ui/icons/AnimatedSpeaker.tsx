"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedSpeaker({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center gap-[3px]", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" style={{ width: "55%" }} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4Z"
          fill="currentColor"
        />
      </svg>
      <span className="flex h-[70%] items-center gap-[2.5px]">
        {[0.55, 1, 0.75].map((h, i) => (
          <span
            key={i}
            className="block w-[3px] origin-center rounded-full bg-current"
            style={{
              height: `${h * 100}%`,
              animation: `speaker-bar ${0.7 + i * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </span>
    </span>
  );
}
