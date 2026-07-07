"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedLayers } from "@/components/ui/icons/AnimatedLayers";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";

export function ProjectsHero({
  projectCount,
  mentorCount,
  categoryCount,
}: {
  projectCount: number;
  mentorCount: number;
  categoryCount: number;
}) {
  const stats = [
    { icon: AnimatedFolder, label: "Projects shipped", value: projectCount },
    { icon: AnimatedUsers, label: "Mentors involved", value: mentorCount },
    { icon: AnimatedLayers, label: "Categories covered", value: categoryCount },
  ];

  return (
    <div className="relative">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[26rem] overflow-hidden" aria-hidden>
        <span className="aurora-blob left-[12%] top-6 h-64 w-64 bg-accent-400/20 dark:bg-accent-500/15" />
        <span className="aurora-blob aurora-blob-alt right-[8%] top-2 h-72 w-72 bg-brand-400/25 dark:bg-brand-500/20" />
        <span className="aurora-blob left-[45%] top-28 h-52 w-52 bg-emerald-400/15 dark:bg-emerald-500/10" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: -14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Eyebrow className="gap-2">
            <AnimatedRocket className="h-4.5 w-4.5" />
            Built by Learners
          </Eyebrow>
        </motion.div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          <AnimatedText text="Real projects," delay={0.1} />{" "}
          <AnimatedText text="real outcomes" className="brand-gradient-text" delay={0.4} />
        </h1>

        <Reveal delay={0.5} distance={18}>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Capstone work from MyLoginn learners — built with mentor feedback,
            shipped with measurable results.
          </p>
        </Reveal>
      </div>

      {/* Animated stats */}
      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.6 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="glass-panel card-shine relative flex items-center gap-4 overflow-hidden rounded-2xl p-5"
          >
            <s.icon className="h-10 w-10 shrink-0" />
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-tight">
                <StatCounter to={s.value} duration={1.4} />
              </p>
              <p className="truncate text-xs text-muted">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
