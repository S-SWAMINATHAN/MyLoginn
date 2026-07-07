"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { ContentIcon } from "@/components/ui/ContentIcon";
import type { CourseIconKey } from "@/lib/courseIcons";

const settle = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const floaters: { key: CourseIconKey; className: string; delay: number; duration: number }[] = [
  { key: "math", className: "-left-14 top-6 sm:-left-20", delay: 0.2, duration: 5.5 },
  { key: "physics", className: "-right-10 top-32 sm:-right-16", delay: 0.7, duration: 6.4 },
  { key: "chemistry", className: "-left-8 bottom-2 sm:-left-14", delay: 1.1, duration: 5.9 },
  { key: "webdev", className: "-right-14 bottom-16 sm:-right-20", delay: 0.4, duration: 6.1 },
];

export function TutoringHero() {
  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_50%_20%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_50%_20%,rgba(108,77,255,0.16),transparent_70%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
        {floaters.map((f) => (
          <motion.div
            key={f.key}
            className={`absolute h-12 w-12 ${f.className}`}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 0.8, scale: 1, y: [0, -14, 0] }}
            transition={{
              opacity: { duration: 0.8, delay: f.delay },
              scale: { type: "spring", stiffness: 200, damping: 14, delay: f.delay },
              y: { duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            }}
          >
            <ContentIcon
              keyword={f.key}
              className="h-full w-full drop-shadow-[0_10px_22px_rgba(108,77,255,0.28)]"
            />
          </motion.div>
        ))}
      </div>

      <motion.div className="flex justify-center" initial={settle.initial} animate={settle.animate} transition={{ type: "spring", damping: 18, delay: 0 }}>
        <Eyebrow>1:1 Mentorship</Eyebrow>
      </motion.div>
      <motion.h1
        className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={settle.initial}
        animate={settle.animate}
        transition={{ type: "spring", damping: 18, delay: 0.08 }}
      >
        Online Tutoring Program
      </motion.h1>
      <motion.p
        className="mt-4 text-muted"
        initial={settle.initial}
        animate={settle.animate}
        transition={{ type: "spring", damping: 18, delay: 0.16 }}
      >
        Personalized tutoring for CBSE &amp; State Board curricula &mdash; live
        classes, progress dashboards, and mentor feedback from 1st grade onward.
      </motion.p>
    </div>
  );
}
