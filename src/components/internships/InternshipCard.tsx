"use client";

import { useId, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { getProjectCardArt } from "@/lib/projectCardArt";
import { CardArtAnimation } from "@/components/projects/CardArtAnimation";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import { formatDuration } from "@/lib/postings";

export type InternshipCardData = {
  id: string;
  title: string;
  slug: string;
  company: string;
  type: string;
  paid: boolean;
  stipend: number | null;
  location: string;
  /** Optional duration amount, counted in durationUnit. */
  durationWeeks: number | null;
  durationUnit: string;
  /** Whether the internship is taking applications (set by the admin; there is no end date). */
  open: boolean;
  featured: boolean;
};

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
  const art = useMemo(
    () => getProjectCardArt(`${internship.type} ${internship.title}`, idSeed),
    [internship.type, internship.title, idSeed]
  );
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

            {/* Illustrated banner header */}
            <div className="relative h-24 shrink-0 overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 [&>svg]:h-full [&>svg]:w-full"
              >
                <CardArtAnimation svg={art.svg} />
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />

              {internship.featured && (
                <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.45)]">
                  <AnimatedCrown className="h-4.5 w-4.5" /> Featured
                </span>
              )}
              <span className="absolute right-3 top-3 z-10 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {internship.type}
              </span>
            </div>

            <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                    <ContentIcon keyword={`${internship.type} ${internship.title}`} className="h-4.5 w-4.5" />
                    {internship.type}
                  </div>
                  <h3 className="mt-1 text-[15px] font-semibold leading-snug transition-colors duration-300 group-hover:text-brand-500">
                    {internship.title}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-muted">{internship.company}</p>
                </div>
                {applied && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                    <AnimatedSuccess className="h-3.5 w-3.5" />
                    Applied
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <AnimatedMapPin className="h-4.5 w-4.5" /> {internship.location}
                </span>
                {internship.durationWeeks ? (
                  <span className="flex items-center gap-1.5">
                    <AnimatedClock className="h-4.5 w-4.5" /> {formatDuration(internship.durationWeeks, internship.durationUnit)}
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <AnimatedRupee className="h-4.5 w-4.5" />{" "}
                  {internship.paid ? `${internship.stipend?.toLocaleString()} / month` : "Unpaid"}
                </span>
              </div>

              <div className="mt-4 border-t border-border-soft pt-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${internship.open ? "font-semibold text-emerald-700 dark:text-emerald-300" : "text-muted"}`}>
                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${internship.open ? "bg-emerald-500" : "bg-muted"}`} />
                    {internship.open ? "Taking applications" : "Applications closed"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full brand-gradient-bg px-3 py-1 text-[11px] font-medium text-white shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-105">
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
