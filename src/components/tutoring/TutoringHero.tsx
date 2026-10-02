"use client";

import Image from "next/image";
import tutoringHeader from "@/images/Tutoring header.png";
import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { BriefcaseBusiness } from "lucide-react";
import { ReferenceStatIcon } from "@/components/ui/ReferenceStatIcon";

export function TutoringHero() {
  return (
    <div className="relative block min-h-[330px] items-center gap-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_72%_45%,rgba(117,177,255,.24),transparent_48%),radial-gradient(ellipse_at_55%_70%,rgba(216,173,255,.2),transparent_45%)] py-5 max-md:min-h-0 max-md:py-0 md:grid md:grid-cols-[1.05fr_.95fr]">
      <div className="relative float-right ml-3 mb-1 h-24 w-32 max-w-none max-md:h-auto max-md:aspect-[4/3] max-md:w-[clamp(8rem,37vw,9rem)] md:order-2 md:float-none md:ml-auto md:mb-0 md:h-[390px] md:w-full md:max-w-lg"><Image src={tutoringHeader} alt="Tutor guiding a student through a lesson" fill priority className="object-contain object-right md:scale-125 md:object-center" sizes="(max-width: 767px) 9rem, 45vw" /></div>
      <div className="relative z-10 max-w-2xl md:order-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><Eyebrow className="max-md:max-w-full max-md:flex-wrap max-md:px-2 max-md:text-[10px] max-md:tracking-normal"><BriefcaseBusiness className="h-4 w-4 shrink-0" /> Personalized tutoring</Eyebrow></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight max-md:mt-2 max-md:text-[1.875rem] max-[380px]:text-[1.75rem] sm:text-5xl">Find tutoring support for your learning goals</motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-3 max-w-2xl text-base text-muted max-md:mt-2 max-md:text-sm sm:text-lg">Browse available tutor profiles by subject, review their background and boards, then send a session request to discuss fit and availability.</motion.p>
      </div>
      <div className="relative z-10 clear-both order-3 grid grid-cols-2 gap-3 max-md:mt-2 md:col-span-2 md:grid-cols-4">
        {[
          { icon: "tutor-verified", value: "Available", label: "Tutor profiles" },
          { icon: "tutor-subjects", value: "By subject", label: "Browse options" },
          { icon: "tutor-rating", value: "Listed", label: "Tutor background" },
          { icon: "tutor-success", value: "Request", label: "Session enquiry" },
        ].map(({ icon, value, label }) => (
          <div
            key={label}
            className="flex min-h-32 min-w-0 flex-col gap-2 rounded-2xl border border-border-soft bg-surface/85 p-3 shadow-[var(--shadow-soft)] sm:min-h-28 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4"
          >
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-2 sm:block">
              <p className="min-w-0 text-xs font-semibold uppercase leading-4 tracking-wide text-muted sm:text-xs">
                {label}
              </p>
              <ReferenceStatIcon
                name={icon as "tutor-verified" | "tutor-subjects" | "tutor-rating" | "tutor-success"}
                className="h-11 w-11 sm:hidden"
              />
              <p className="col-span-2 mt-1 text-xl font-semibold leading-6 sm:col-span-1 sm:mt-2 sm:min-h-14 sm:text-2xl sm:leading-7">
                {value}
              </p>
            </div>
            <ReferenceStatIcon
              name={icon as "tutor-verified" | "tutor-subjects" | "tutor-rating" | "tutor-success"}
              className="hidden h-16 w-16 shrink-0 sm:block sm:h-20 sm:w-20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
