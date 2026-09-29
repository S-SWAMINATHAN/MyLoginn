"use client";

import Image from "next/image";
import tutoringHeader from "@/images/Tutoring header.png";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { BriefcaseBusiness } from "lucide-react";
import { ReferenceStatIcon } from "@/components/ui/ReferenceStatIcon";

export function TutoringHero() {
  return (
    <div className="relative grid min-h-[330px] items-center gap-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_72%_45%,rgba(117,177,255,.24),transparent_48%),radial-gradient(ellipse_at_55%_70%,rgba(216,173,255,.2),transparent_45%)] py-5 md:grid-cols-[1.05fr_.95fr]">
      <div className="relative z-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><Eyebrow><BriefcaseBusiness className="h-4 w-4" /> Launch your career</Eyebrow></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Master any subject with our expert tutoring</motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-4 max-w-2xl text-base text-muted sm:text-lg">Tailored 1-on-1 guidance and group classes from industry veterans. Enhance your knowledge, build confidence, and achieve your goals.</motion.p>
      </div>
      <div className="relative mx-auto h-64 w-full max-w-lg md:h-[390px]"><Image src={tutoringHeader} alt="Tutor guiding a student through a lesson" fill priority className="scale-125 object-contain" sizes="(max-width: 768px) 100vw, 45vw" /></div>
      <div className="relative z-10 grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
        {[{ icon: "tutor-verified", value: "Expert-led", label: "Verified tutors" }, { icon: "tutor-subjects", value: "Personalized", label: "Subjects covered" }, { icon: "tutor-rating", value: "Student-first", label: "Tutoring approach" }, { icon: "tutor-success", value: "Goal-focused", label: "Student support" }].map(({ icon, value, label }) => <div key={label} className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border-soft bg-surface/85 p-4 shadow-[var(--shadow-soft)]"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p></div><ReferenceStatIcon name={icon as "tutor-verified" | "tutor-subjects" | "tutor-rating" | "tutor-success"} className="h-20 w-20 sm:h-24 sm:w-24" /></div>)}
      </div>
    </div>
  );
}
