"use client";

import Link from "next/link";
import { FancyLink } from "@/components/ui/FancyButton";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, GraduationCap } from "lucide-react";

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

/** 10 — Learn stays its own destination; the homepage only points to it. */
export function LearnTeaser() {
  return (
    <section aria-label="MyLoginn Learn" className="px-5 pb-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 rounded-2xl bg-story-mist px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted">
          <GraduationCap className="h-4 w-4 text-story-royal" />
          <span>Looking to learn? Courses, practice and LogiQuest live in <span className="font-semibold text-story-navy dark:text-foreground">MyLoginn Learn</span>.</span>
        </p>
        <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-story-royal hover:underline">
          Go to Learn <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
