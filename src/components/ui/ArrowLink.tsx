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
      variants={{ rest: { y: 0 }, hover: { y: -2 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group inline-flex h-12 select-none items-center gap-3 rounded-full pl-6 pr-1.5 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        light ? "bg-white text-story-royal focus-visible:ring-white" : "bg-story-royal text-white focus-visible:ring-story-royal",
        className
      )}
    >
      <span>{children}</span>
      <span aria-hidden className={cn("grid h-9 w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-full", light ? "bg-story-royal text-white" : "bg-white text-story-royal")}>
        <GlideArrow reduced={reduced} />
      </span>
    </MotionLink>
  );
}
