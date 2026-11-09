"use client";

import { FancyLink } from "@/components/ui/FancyButton";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 08 — A small careers invitation. MyLoginn hires; it is not presented as a placement organisation. */
export function CareersCta() {
  return (
    <section aria-label="Careers at MyLoginn" className="px-5 py-10 sm:px-8 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="group relative mx-auto flex max-w-6xl flex-col items-start gap-5 overflow-hidden rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-story-royal/10 to-transparent transition-all duration-1000 group-hover:left-[110%]" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center text-story-royal"><Briefcase className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-story-navy dark:text-foreground">Careers at MyLoginn</h2>
            <p className="mt-0.5 text-sm text-muted">Build web, app, AI and marketing work for real businesses with our team.</p>
          </div>
        </div>
        <FancyLink href="/careers" variant="dark" className="relative shrink-0">View open positions</FancyLink>
      </motion.div>
    </section>
  );
}
