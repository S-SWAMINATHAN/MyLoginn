"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Lightbulb } from "lucide-react";

const sparks: { x: number; y: number; delay: number }[] = [
  { x: 16, y: -10, delay: 0 },
  { x: -16, y: -10, delay: 0.35 },
  { x: 12, y: 12, delay: 0.7 },
  { x: -12, y: 12, delay: 1.05 },
];

export function AnimatedBulb({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <span
        className="pointer-events-none absolute inset-[-35%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(250,204,21,0.55) 0%, transparent 70%)",
          animation: "icon-glow-orb 2.4s ease-in-out infinite",
        }}
      />
      {sparks.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-amber-300"
          style={
            {
              "--spark-x": `${s.x}px`,
              "--spark-y": `${s.y}px`,
              animation: `bulb-spark-out 1.4s ease-out infinite`,
              animationDelay: `${s.delay}s`,
            } as CSSProperties
          }
        />
      ))}
      <Lightbulb
        className="relative z-10 h-full w-full text-amber-400"
        style={{ animation: "bulb-blink 3.2s ease-in-out infinite" }}
        fill="rgba(250,204,21,0.25)"
      />
    </span>
  );
}
