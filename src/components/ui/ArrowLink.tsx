"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { GlideArrow } from "@/components/ui/PlanButton";

const MotionLink = motion.create(Link);

type Tone = "royal" | "navy" | "light" | "outline";

const SHELL = "group relative inline-flex h-11 select-none items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium tracking-[0.01em] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 btn-collide disabled:pointer-events-none disabled:opacity-60";
const SURFACE: Record<Tone, string> = {
  royal: "bg-story-royal text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)] [--collide:var(--story-royal)] focus-visible:ring-story-royal",
  navy: "bg-story-navy text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)] [--collide:var(--story-navy)] focus-visible:ring-story-navy",
  light: "bg-white text-story-royal shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)] [--collide:var(--story-royal)] focus-visible:ring-white",
  outline: "bg-white text-story-navy shadow-[inset_0_0_0_1px_#dbe3ef] [--collide:#fff] [--collide-text:var(--story-navy)] hover:shadow-[inset_0_0_0_1px_#0b1f4d] focus-visible:ring-story-royal",
};
const TRACK: Record<Tone, string> = {
  royal: "bg-white/15 text-white group-hover:bg-white/25",
  navy: "bg-white/15 text-white group-hover:bg-white/25",
  light: "bg-story-royal/10 text-story-royal group-hover:bg-story-royal/20",
  outline: "bg-story-navy/[0.06] text-story-navy group-hover:bg-story-navy/10",
};

function Track({ tone, reduced, busy }: { tone: Tone; reduced: boolean; busy?: boolean }) {
  return (
    <span aria-hidden className={cn("grid h-8 w-14 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300", TRACK[tone])}>
      {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GlideArrow reduced={reduced} />}
    </span>
  );
}

const hoverVariants = { rest: { y: 0 }, hover: { y: 0 } };

/** The site's call-to-action link: a solid pill with a soft arrow track that glides on hover. */
export function ArrowLink({ href, children, tone = "royal", className, onClick, block }: { href: string; children: ReactNode; tone?: Tone; className?: string; onClick?: () => void; block?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <MotionLink href={href} onClick={onClick} initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }} variants={hoverVariants} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className={cn(SHELL, SURFACE[tone], block && "w-full pl-[4.625rem]", className)}>
      <span className={cn(block && "flex-1 text-center")}>{children}</span>
      <Track tone={tone} reduced={reduced} />
    </MotionLink>
  );
}

/** Button version of ArrowLink for forms, dialogs and actions. `busy` swaps the arrow for a spinner and disables it. */
export function ArrowButton({ children, tone = "royal", className, onClick, type = "button", disabled, busy, full }: { children: ReactNode; tone?: Tone; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; busy?: boolean; full?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled || busy} initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }} variants={hoverVariants} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className={cn(SHELL, SURFACE[tone], "cursor-pointer", full && "w-full pl-[4.625rem]", className)}>
      <span className={cn(full && "flex-1 text-center")}>{children}</span>
      <Track tone={tone} reduced={reduced} busy={busy} />
    </motion.button>
  );
}
