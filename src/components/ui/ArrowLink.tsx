"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { GlideArrow } from "@/components/ui/PlanButton";

const MotionLink = motion.create(Link);

/** Link version of PlanButton: same fixed colours, with the arrow gliding smoothly left to right on hover. */
export function ArrowLink({ href, children, tone = "royal", className }: { href: string; children: ReactNode; tone?: "royal" | "light"; className?: string }) {
  const reduced = useReducedMotion();
  const light = tone === "light";
  return (
    <MotionLink
      href={href}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      variants={{ rest: { y: 0 }, hover: { y: 0 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group inline-flex h-11 select-none transition-shadow duration-300 hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)] items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium tracking-[0.01em] shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        light ? "bg-white text-story-royal focus-visible:ring-white" : "bg-story-royal text-white focus-visible:ring-story-royal",
        className
      )}
    >
      <span>{children}</span>
      <span aria-hidden className={cn("grid h-8 w-14 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300", light ? "bg-story-royal/10 text-story-royal group-hover:bg-story-royal/20" : "bg-white/15 text-white group-hover:bg-white/25")}>
        <GlideArrow reduced={reduced} />
      </span>
    </MotionLink>
  );
}
