"use client";

<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> 9a00051 (Initial commit)
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { StatCounter } from "@/components/ui/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
<<<<<<< HEAD
import { AnimatedBuilding } from "@/components/ui/icons/AnimatedBuilding";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import internshipHeader from "@/images/Internship header.png";
=======
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
>>>>>>> 9a00051 (Initial commit)

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
<<<<<<< HEAD
    { icon: AnimatedBriefcase, label: "Open internships", value: total },
    { icon: AnimatedRupee, label: "Paid programs", value: paidCount },
    { icon: AnimatedBuilding, label: "Partner companies", value: companyCount },
    { icon: AnimatedTrending, label: "Avg. duration (weeks)", value: avgWeeks },
=======
    { icon: AnimatedBriefcase, label: "Open internships", value: total, suffix: "" },
    { icon: AnimatedRupee, label: "Paid programs", value: paidCount, suffix: "" },
    { icon: AnimatedGraduation, label: "Partner companies", value: companyCount, suffix: "" },
    { icon: AnimatedTrending, label: "Avg. duration (weeks)", value: avgWeeks, suffix: "" },
>>>>>>> 9a00051 (Initial commit)
  ];

  return (
    <div className="relative">
      {/* Ambient aurora glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[26rem] overflow-hidden" aria-hidden>
        <span className="aurora-blob left-[8%] top-4 h-64 w-64 bg-brand-400/25 dark:bg-brand-500/20" />
        <span className="aurora-blob aurora-blob-alt right-[10%] top-10 h-72 w-72 bg-accent-400/20 dark:bg-accent-500/15" />
        <span className="aurora-blob left-[42%] top-24 h-56 w-56 bg-fuchsia-400/15 dark:bg-fuchsia-500/10" />
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        <div className="text-center lg:text-left">
          <motion.div
            className="flex justify-center lg:justify-start"
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow className="gap-2">
              <AnimatedBriefcase className="h-4.5 w-4.5" />
              Launch Your Career
            </Eyebrow>
          </motion.div>

          <h1 className="mx-auto mt-6 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:mx-0">
            <AnimatedText text="Internships that launch" delay={0.1} />{" "}
            <AnimatedText text="real careers" wordClassName="brand-gradient-text" delay={0.45} />
          </h1>

          <Reveal delay={0.55} distance={18}>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              Industry-relevant internships with hands-on projects, mentor guidance,
              certifications and interview prep.
            </p>
          </Reveal>

          {/* Compact stat row */}
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3 sm:gap-4 lg:mx-0 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="glass-panel card-shine relative flex flex-col items-start gap-2.5 overflow-hidden rounded-2xl p-4"
              >
                <s.icon className="h-8 w-8 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-semibold leading-tight">
                    <StatCounter to={s.value} duration={1.4} />
                  </p>
                  <p className="truncate text-[11px] text-muted">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src={internshipHeader}
              alt=""
              preload
              unoptimized
              className="mx-auto h-auto w-full max-w-md select-none object-contain"
            />
          </motion.div>
        </motion.div>
=======
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: -14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Eyebrow className="gap-2">
            <AnimatedBriefcase className="h-4.5 w-4.5" />
            Career Launchpad
          </Eyebrow>
        </motion.div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          <AnimatedText text="Internships that launch" delay={0.1} />{" "}
          <AnimatedText text="real careers" className="brand-gradient-text" delay={0.45} />
        </h1>

        <Reveal delay={0.55} distance={18}>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Paid and unpaid internships for IT and engineering students — with
            certification, mentor feedback and interview-prep support.
          </p>
        </Reveal>
      </div>

      {/* Animated stats */}
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.65 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="glass-panel card-shine relative flex items-center gap-3.5 overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <s.icon className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-tight sm:text-2xl">
                <StatCounter to={s.value} suffix={s.suffix} duration={1.4} />
              </p>
              <p className="truncate text-[11px] text-muted sm:text-xs">{s.label}</p>
            </div>
          </motion.div>
        ))}
>>>>>>> 9a00051 (Initial commit)
      </div>
    </div>
  );
}
