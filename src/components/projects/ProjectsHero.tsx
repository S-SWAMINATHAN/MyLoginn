"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { FolderKanban, Globe2, Layers3, type LucideIcon } from "lucide-react";
import projectHeaderImage from "@/images/Project header.png";

type StatTile = {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: string;
};

export function ProjectsHero({
  projectCount,
  liveCount,
  industryCount,
}: {
  projectCount: number;
  liveCount: number;
  industryCount: number;
}) {
  const stats: StatTile[] = [
    { icon: FolderKanban, value: projectCount, label: "Projects delivered", tone: "from-sky-500 to-indigo-600 shadow-indigo-500/30" },
    { icon: Globe2, value: liveCount, label: "Live products", tone: "from-emerald-500 to-teal-600 shadow-emerald-500/30" },
    { icon: Layers3, value: industryCount, label: "Industries served", tone: "from-violet-500 to-fuchsia-600 shadow-fuchsia-500/30" },
  ];

  return (
    <div className="relative">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 hidden h-[30rem] overflow-hidden md:block" aria-hidden>
        <span className="aurora-blob left-[8%] top-6 h-64 w-64 bg-accent-400/20 dark:bg-accent-500/15" />
        <span className="aurora-blob aurora-blob-alt right-[6%] top-2 h-80 w-80 bg-brand-400/25 dark:bg-brand-500/20" />
        <span className="aurora-blob left-[42%] top-32 h-52 w-52 bg-emerald-400/15 dark:bg-emerald-500/10" />
      </div>

      <div className="relative block items-center gap-4 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-4">
        <HeroIllustration />
        <div className="text-center max-md:text-left lg:order-1 lg:text-left">
          <motion.div
            className="flex justify-center max-md:justify-start lg:justify-start"
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow className="gap-2">
              <AnimatedRocket className="h-4.5 w-4.5" />
              Designed, built and launched by MyLoginn.
            </Eyebrow>
          </motion.div>

          <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight max-md:mt-2 max-md:text-[1.75rem] sm:text-5xl lg:text-6xl">
            <AnimatedText text="Real Projects." as="span" className="flex w-full justify-center max-md:inline max-md:w-auto max-md:justify-start lg:justify-start" delay={0.1} />
            <AnimatedText
              text="Real Impact."
              as="span"
              className="flex w-full justify-center max-md:inline max-md:w-auto max-md:justify-start lg:justify-start"
              wordClassName="brand-gradient-text"
              delay={0.4}
            />
          </h1>

          <Reveal delay={0.5} distance={18}>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted max-md:mt-2 max-md:mx-0 max-md:text-sm sm:text-lg lg:mx-0">
              Websites, apps, business software and AI solutions we&apos;ve built and
              launched for businesses.
            </p>
          </Reveal>
        </div>

      </div>

      {/* Stat tiles */}
      <div className="mx-auto mt-7 clear-both grid max-w-4xl grid-cols-2 gap-4 max-md:mt-3 lg:mx-0 lg:max-w-4xl lg:grid-cols-3 lg:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="glass-panel card-shine relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 sm:gap-3.5 sm:p-5"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-1 ring-white/30 ${s.tone}`}>
              <s.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-tight">
                <StatCounter to={s.value} duration={1.4} />
              </p>
              <p className="text-sm leading-5 text-muted sm:truncate sm:text-xs">{s.label}</p>
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
      className="relative float-right ml-3 mb-1 block h-24 w-32 max-w-none lg:order-2 lg:float-none lg:mx-auto lg:mb-0 lg:h-auto lg:w-full lg:max-w-xl"
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
        sizes="(min-width: 1024px) 620px, 90vw"
        className="h-full w-full scale-100 object-contain object-right select-none lg:h-auto lg:scale-110 lg:object-center"
      />
    </motion.div>
  );
}
