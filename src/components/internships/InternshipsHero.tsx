"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedBuilding } from "@/components/ui/icons/AnimatedBuilding";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import internshipHeader from "@/images/Internship header.png";

export function InternshipsHero({
  total,
  paidCount,
  companyCount,
  avgWeeks,
}: {
  total: number;
  paidCount: number;
  companyCount: number;
  avgWeeks: number;
}) {
  const stats = [
    { icon: AnimatedBriefcase, label: "Open internships", value: total },
    { icon: AnimatedRupee, label: "Paid programs", value: paidCount },
    { icon: AnimatedBuilding, label: "Organizations listed", value: companyCount },
    { icon: AnimatedTrending, label: "Avg. duration (weeks)", value: avgWeeks },
  ];

  return (
    <div className="relative">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 hidden h-[26rem] overflow-hidden md:block" aria-hidden>
        <span className="aurora-blob left-[8%] top-4 h-64 w-64 bg-brand-400/25 dark:bg-brand-500/20" />
        <span className="aurora-blob aurora-blob-alt right-[10%] top-10 h-72 w-72 bg-accent-400/20 dark:bg-accent-500/15" />
        <span className="aurora-blob left-[42%] top-24 h-56 w-56 bg-fuchsia-400/15 dark:bg-fuchsia-500/10" />
      </div>

      <div className="relative block items-center gap-4 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-3">
        <motion.div
          className="relative float-right ml-3 mb-2 block h-24 w-32 lg:order-2 lg:float-none lg:ml-auto lg:mb-0 lg:h-auto lg:w-auto"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <Image
              src={internshipHeader}
              alt=""
              preload
              unoptimized
              className="mx-0 h-full w-full max-w-none scale-100 select-none object-contain object-right lg:mx-auto lg:h-auto lg:max-w-xl lg:scale-110 lg:object-center"
            />
          </motion.div>
        </motion.div>
        <div className="text-center max-md:text-left lg:order-1 lg:text-left">
          <motion.div
            className="flex justify-center max-md:justify-start lg:justify-start"
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow className="gap-2">
              <AnimatedBriefcase className="h-4.5 w-4.5" />
              Launch Your Career
            </Eyebrow>
          </motion.div>

          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl max-md:mx-0 lg:mx-0">
            <AnimatedText text="Explore current" delay={0.1} />{" "}
            <AnimatedText text="internship opportunities" wordClassName="brand-gradient-text" delay={0.45} />
          </h1>

          <Reveal delay={0.55} distance={18}>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg max-md:mx-0 lg:mx-0">
              Review the current openings, program requirements, responsibilities and application details below.
            </p>
          </Reveal>

          {/* Compact stat row */}
          <div className="mx-auto mt-7 clear-both grid max-w-2xl grid-cols-2 gap-3 sm:gap-4 lg:mx-0 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="glass-panel card-shine relative flex flex-col items-start gap-2.5 overflow-hidden rounded-2xl p-4"
              >
                <s.icon className="h-10 w-10 shrink-0 lg:h-8 lg:w-8" />
                <div className="min-w-0">
                  <p className="text-2xl font-semibold leading-tight lg:text-xl">
                    <StatCounter to={s.value} duration={1.4} />
                  </p>
                  <p className="text-sm leading-5 text-muted lg:truncate lg:text-[11px]">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
