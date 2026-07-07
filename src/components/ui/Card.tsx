import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-all duration-300",
        className
      )}
      {...rest}
    />
  );
}

export function GlassCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-panel rounded-2xl", className)} {...rest} />;
}
