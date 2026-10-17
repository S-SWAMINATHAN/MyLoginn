"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

function Fact({ icon, label, children, delay }: { icon: React.ReactNode; label: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover="hover"
      className="group flex flex-col items-center gap-1.5 px-1 py-3.5 text-center sm:flex-row sm:items-start sm:gap-3.5 sm:px-5 sm:py-4 sm:text-left sm:first:pl-0"
    >
      <motion.span variants={{ hover: { scale: 1.15, rotate: -6 } }} transition={{ type: "spring", stiffness: 320, damping: 14 }} className="grid h-8 w-8 shrink-0 place-items-center sm:mt-0.5 sm:h-9 sm:w-9">
        {icon}
      </motion.span>
      <div className="min-w-0 max-w-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Key facts for an internship in one line: format, location and duration. The duration shows one dot per week
 * that fill in one after another. No filled backgrounds; the dividers and motion do the work.
 */
export function InternshipFacts({ type, location, weeks }: { type: string; location: string; weeks: number }) {
  const reduced = useReducedMotion();
  const dots = Math.min(Math.max(weeks, 1), 16);

  return (
    <div className="mt-6 grid grid-cols-3 divide-x divide-border-soft border-y border-border-soft">
      <Fact label="Format" delay={0} icon={<Briefcase className="h-6 w-6 text-story-royal" strokeWidth={1.8} aria-hidden />}>
        <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-story-navy sm:text-base dark:text-foreground">{type}</p>
        <span aria-hidden className="mx-auto mt-1 block h-0.5 w-8 origin-left scale-x-0 rounded-full bg-story-royal transition-transform duration-500 group-hover:scale-x-100 sm:mx-0" />
      </Fact>

      <Fact label="Location" delay={0.08} icon={<AnimatedMapPin className="h-7 w-7" />}>
        <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-story-navy sm:text-base dark:text-foreground">{location}</p>
        <span aria-hidden className="mx-auto mt-1 block h-0.5 w-8 origin-left scale-x-0 rounded-full bg-story-royal transition-transform duration-500 group-hover:scale-x-100 sm:mx-0" />
      </Fact>

      <Fact label="Duration" delay={0.16} icon={<AnimatedClock className="h-7 w-7" />}>
        <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-story-navy sm:text-base dark:text-foreground">{weeks} {weeks === 1 ? "week" : "weeks"}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 sm:justify-start" aria-hidden>
          {Array.from({ length: dots }).map((_, i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-story-royal"
              initial={{ opacity: 0.2, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.07, type: "spring", stiffness: 400, damping: 18 }}
              {...(reduced ? {} : { whileHover: { scale: 1.8 } })}
            />
          ))}
          {weeks > dots && <span className="ml-1 text-[10px] font-semibold text-muted">+{weeks - dots}</span>}
        </div>
      </Fact>
    </div>
  );
}
