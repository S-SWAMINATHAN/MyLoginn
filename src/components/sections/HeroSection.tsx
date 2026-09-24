"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { AnimatedExploreCourses } from "@/components/ui/icons/AnimatedExploreCourses";
import { Eyebrow } from "@/components/ui/Section";
import { RotatingHeadline } from "@/components/ui/RotatingHeadline";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { HeroOrbitIcons } from "@/components/sections/HeroOrbitIcons";
import type { CourseIconKey } from "@/lib/courseIcons";
import heroImage from "@/images/Hero Section images/15.png";

const heroPhrases = [
  "Where Potential Meets Opportunity",
  "Elevating Learning, Empowering Careers",
  "Learning with Direction. Careers with Impact.",
  "From Aspiration to Achievement",
  "A Smarter Path to Professional Growth",
];

const stats: { iconKey: CourseIconKey; value: string; label: string; ring: string }[] = [
  { iconKey: "student", value: "50k+", label: "Learners upskilled", ring: "border-brand-400/50 text-brand-600 dark:border-brand-300/40 dark:text-brand-300" },
  { iconKey: "career", value: "1,200+", label: "Internships placed", ring: "border-teal-400/50 text-teal-600 dark:border-teal-300/40 dark:text-teal-300" },
  { iconKey: "comm", value: "98%", label: "Mentor satisfaction", ring: "border-amber-400/50 text-amber-600 dark:border-amber-300/40 dark:text-amber-300" },
];

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(108,77,255,0.14),transparent_70%)]" />

      <div className="mx-auto grid max-w-[85rem] grid-cols-1 items-center gap-12 px-5 pt-14 pb-10 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1.5fr] lg:gap-8 lg:pt-24">
        <div className="relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-start"
          >
            <Eyebrow>
              <AnimatedSparkle className="h-4.5 w-4.5" />
              AI Agent · Live Now
            </Eyebrow>
          </motion.div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <RotatingHeadline phrases={heroPhrases} gradientClassName="brand-gradient-text" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg lg:mx-0"
          >
            Advanced AI/ML &amp; digital marketing courses, personalized CBSE/State
            Board tutoring, real internships, and AI-driven growth services &mdash;
            all on one premium platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button href="/signup" size="lg" icon={<AnimatedArrow className="h-5 w-5" />}>
              Get started free
            </Button>
            <Button href="/courses" size="lg" variant="secondary" icon={<AnimatedExploreCourses className="h-5 w-5" />}>
              Explore courses
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
              >
                <IconBadge size="sm" className={`border bg-transparent ${s.ring}`}>
                  <ContentIcon keyword={s.iconKey} className="h-6 w-6" />
                </IconBadge>
                <span>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 6, delay: 1.3, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative -mx-5 w-[calc(100%+2.5rem)] max-w-none sm:mx-auto sm:w-full sm:max-w-2xl lg:mx-0 lg:w-[118%] lg:max-w-none"
        >
          <Image
            src={heroImage}
            alt="An AI mentor extending a hand in welcome"
            preload
            sizes="(min-width: 1024px) 720px, 100vw"
            className="relative z-10 h-auto w-full select-none"
          />
          <HeroOrbitIcons />
        </motion.div>
      </div>
    </div>
  );
}
