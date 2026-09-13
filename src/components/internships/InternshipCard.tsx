"use client";

import { useId, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { getCourseIconInfo } from "@/lib/courseIcons";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";

export type InternshipCardData = {
  id: string;
  title: string;
  slug: string;
  company: string;
  type: string;
  paid: boolean;
  stipend: number | null;
  location: string;
  durationWeeks: number;
  applyDeadline: string;
  featured: boolean;
};

const APPLY_WINDOW_DAYS = 30;

export function InternshipCard({
  internship,
  applied,
  index = 0,
}: {
  internship: InternshipCardData;
  applied: boolean;
  index?: number;
}) {
  const idSeed = useId();
  const visual = useMemo(
    () => getCourseIconInfo(`${internship.type} ${internship.title}`, idSeed),
    [internship.type, internship.title, idSeed]
  );

  const deadline = new Date(internship.applyDeadline);
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const urgent = daysLeft > 0 && daysLeft <= 5;
  const windowLeft = Math.min(1, daysLeft / APPLY_WINDOW_DAYS);
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY }}
        className="group h-full"
      >
        <Link href={`/internships/${internship.slug}`} className="block h-full">
          <Card className="card-shine relative flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lift)]">
            <motion.div
              className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBg }}
            />

            {/* Gradient banner header */}
            <div
              className="relative flex h-28 shrink-0 items-center justify-center overflow-hidden"
              style={{ background: visual.gradient }}
            >
              <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <span
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 [&>svg]:h-6 [&>svg]:w-6"
                dangerouslySetInnerHTML={{ __html: visual.svg }}
              />

              {internship.featured && (
                <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.45)]">
                  <AnimatedCrown className="h-4.5 w-4.5" /> Featured
                </span>
              )}
              <span className="absolute right-3 top-3 z-10 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {internship.type}
              </span>
            </div>

            <div className="relative z-10 flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                    <ContentIcon keyword={`${internship.type} ${internship.title}`} className="h-4.5 w-4.5" />
                    {internship.type}
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold leading-snug transition-colors duration-300 group-hover:text-brand-500">
                    {internship.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{internship.company}</p>
                </div>
                {applied && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                    <AnimatedSuccess className="h-3.5 w-3.5" />
                    Applied
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <AnimatedMapPin className="h-4.5 w-4.5" /> {internship.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <AnimatedClock className="h-4.5 w-4.5" /> {internship.durationWeeks} weeks
                </span>
                <span className="flex items-center gap-1.5">
                  <AnimatedRupee className="h-4.5 w-4.5" />{" "}
                  {internship.paid ? `₹${internship.stipend?.toLocaleString()} / month` : "Unpaid"}
                </span>
              </div>

              <div className="mt-5 border-t border-border-soft pt-4">
                {/* Deadline progress */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className={`h-full rounded-full ${urgent ? "bg-gradient-to-r from-amber-400 to-rose-500" : "brand-gradient-bg"}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(6, windowLeft * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {daysLeft > 0 ? `${daysLeft} days left to apply` : "Deadline passed"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full brand-gradient-bg px-3.5 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-105">
                    View Details
                    <AnimatedArrow className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
