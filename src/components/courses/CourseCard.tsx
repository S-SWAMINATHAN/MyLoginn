"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { AnimatedAi } from "@/components/ui/icons/AnimatedAi";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import { CourseIconThumb } from "./CourseIconThumb";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  instructor: string;
  instructorTitle: string | null;
  durationWeeks: number;
  price: number;
  originalPrice: number | null;
  rating: number;
  studentsCount: number;
  imageColor: string;
  tags: string[];
};

export function CourseCard({
  course,
  enrolled,
  recommended,
  trending,
  index = 0,
}: {
  course: CourseCardData;
  enrolled: boolean;
  recommended?: boolean;
  trending?: boolean;
  index?: number;
}) {
  const discountPct =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round((1 - course.price / course.originalPrice) * 100)
      : null;
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
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
        <Link href={`/courses/${course.slug}`} className="block h-full">
          <Card className="relative flex h-full flex-col items-center overflow-hidden p-6 text-center transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)] group-hover:-translate-y-1.5">
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBg }}
            />

            <div className="absolute left-4 top-4 z-10 flex gap-2.5">
              {recommended && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                  <AnimatedAi className="h-4.5 w-4.5" /> AI Pick
                </span>
              )}
              {trending && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-300">
                  <AnimatedFlame className="h-4.5 w-4.5" /> Trending
                </span>
              )}
            </div>
            <span className="absolute right-4 top-4 z-10 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
              {course.level}
            </span>

            <CourseIconThumb
              category={course.category}
              title={course.title}
              variant="round"
              className="relative z-10 mt-4 h-20 w-20 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24"
            />

            <p className="relative z-10 mt-4 text-xs font-semibold uppercase tracking-wide text-brand-500">{course.category}</p>
            <h3 className="relative z-10 mt-1.5 line-clamp-2 text-base font-semibold leading-snug">{course.title}</h3>
            <p className="relative z-10 mt-2 line-clamp-2 flex-1 text-sm text-muted">{course.description}</p>

            <div className="relative z-10 mt-4 flex items-center justify-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <AnimatedStar className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {course.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <AnimatedUsers className="h-5 w-5" /> {course.studentsCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <AnimatedClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks}w
              </span>
            </div>

            <div className="relative z-10 mt-5 flex w-full items-center justify-center gap-2 border-t border-border-soft pt-5">
              <span className="text-2xl font-bold sm:text-3xl">₹{course.price.toLocaleString()}</span>
              {course.originalPrice && (
                <span className="text-xs text-muted line-through">₹{course.originalPrice.toLocaleString()}</span>
              )}
              {discountPct && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <Percent className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> {discountPct}% off
                </span>
              )}
            </div>

            {enrolled && (
              <span className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success">
                <AnimatedSuccess className="h-4.5 w-4.5" /> Enrolled
              </span>
            )}
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
