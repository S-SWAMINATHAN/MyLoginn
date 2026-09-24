"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedCode } from "@/components/ui/icons/AnimatedCode";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import projectHeaderImage from "@/images/Project header.png";

type StatTile = {
  icon: typeof AnimatedFolder;
  value: number | null;
  display?: string;
  suffix?: string;
  label: string;
  tone: string;
};

export function ProjectsHero({
  projectCount,
  mentorCount,
  techCount,
}: {
  projectCount: number;
  mentorCount: number;
  techCount: number;
}) {
  const stats: StatTile[] = [
    { icon: AnimatedFolder, value: projectCount, suffix: "+", label: "Projects Built", tone: "bg-brand-500/10 text-brand-600" },
    { icon: AnimatedUsers, value: mentorCount, suffix: "+", label: "Mentors Involved", tone: "bg-emerald-500/10 text-emerald-600" },
    { icon: AnimatedCode, value: techCount, suffix: "", label: "Technologies", tone: "bg-rose-500/10 text-rose-600" },
    { icon: AnimatedStar, value: null, display: "Real", label: "Industry Outcomes", tone: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <div className="relative">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[30rem] overflow-hidden" aria-hidden>
        <span className="aurora-blob left-[8%] top-6 h-64 w-64 bg-accent-400/20 dark:bg-accent-500/15" />
        <span className="aurora-blob aurora-blob-alt right-[6%] top-2 h-80 w-80 bg-brand-400/25 dark:bg-brand-500/20" />
        <span className="aurora-blob left-[42%] top-32 h-52 w-52 bg-emerald-400/15 dark:bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow className="gap-2">
              <AnimatedRocket className="h-4.5 w-4.5" />
              Built by learners. Backed by mentors.
            </Eyebrow>
          </motion.div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            <AnimatedText text="Real Projects." as="span" className="block" delay={0.1} />
            <AnimatedText
              text="Real Impact."
              as="span"
              className="block"
              wordClassName="brand-gradient-text"
              delay={0.4}
            />
          </h1>

          <Reveal delay={0.5} distance={18}>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              Explore capstone projects built by MyLoginn learners with guidance from
              industry mentors.
            </p>
          </Reveal>
        </div>

        <HeroIllustration />
      </div>

      {/* Stat tiles */}
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="glass-panel card-shine relative flex items-center gap-3.5 overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-tight sm:text-2xl">
                {s.value !== null ? (
                  <>
                    <StatCounter to={s.value} duration={1.4} />
                    {s.suffix}
                  </>
                ) : (
                  s.display
                )}
              </p>
              <p className="truncate text-xs text-muted">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <motion.div
      className="relative mx-auto hidden w-full max-w-md sm:block"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 5, delay: 1.1, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Image
        src={projectHeaderImage}
        alt="An illustration of a browser window orbited by code, chart and AI icons"
        preload
        sizes="(min-width: 1024px) 480px, 90vw"
        className="h-auto w-full select-none"
      />
    </motion.div>
  );
}
