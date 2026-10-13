"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { GlideArrow } from "@/components/ui/PlanButton";

type Props = {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  /** Outline buttons can lead with a back arrow. */
  back?: boolean;
  className?: string;
};

/** Full-width auth action. Primary has a flat blue pill with a gliding arrow; outline is a quiet bordered button. */
export function AuthButton({ children, type = "button", onClick, disabled, variant = "primary", back, className }: Props) {
  const reduced = useReducedMotion();

  if (variant === "outline") {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border-soft bg-surface px-6 text-sm font-semibold transition-colors hover:border-story-royal hover:text-story-royal disabled:opacity-50", className)}
      >
        {back && <span aria-hidden>←</span>}
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial="rest"
      whileHover={disabled ? "rest" : "hover"}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      variants={{ rest: { y: 0 }, hover: { y: -2 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group inline-flex h-12 w-full cursor-pointer select-none items-center justify-between gap-3 rounded-full bg-story-royal py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(31,86,214,0.8)] transition-shadow hover:shadow-[0_16px_30px_-12px_rgba(31,86,214,0.85)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none", className)}
    >
      <span>{children}</span>
      <span aria-hidden className="grid h-9 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white/15">
        <GlideArrow reduced={reduced} />
      </span>
    </motion.button>
  );
}
