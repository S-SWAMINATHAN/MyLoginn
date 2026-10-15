"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Award, Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";
import { hasTutorialCurriculum } from "@/lib/freeCourseCurriculum";
import { CourseIconThumb } from "./CourseIconThumb";
import { FreeEnrollButton } from "./FreeEnrollButton";

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
  imageColor: string;
  tags: string[];
  progress: number;
};

export function CourseCard({
  course,
  enrolled,
  recommended,
  loggedIn,
  index = 0,
}: {
  course: CourseCardData;
  enrolled: boolean;
  recommended?: boolean;
  loggedIn: boolean;
  index?: number;
}) {
  const discountPct =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round((1 - course.price / course.originalPrice) * 100)
      : null;
  const courseKeyword = course.tags.find(
    (tag) => !["free", "fundamentals", "beginner"].includes(tag.toLowerCase()),
  ) ?? course.category;
  const displayTitle = getCourseDisplayTitle(course.slug, course.title);
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const router = useRouter();
  const detailsHref = `/courses/${course.slug}`;
  // A purchased paid course with a lesson-by-lesson curriculum behaves like a free one: progress bar and Continue.
  const paidStepByStep = course.price > 0 && enrolled && hasTutorialCurriculum(course.slug);

  // The whole card opens the course page; real links and buttons inside (enroll, continue, title) keep their own behaviour.
  function openDetails(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a, button, input, label")) return;
    router.push(detailsHref);
  }

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
          <Card onClick={openDetails} className="relative flex h-full cursor-pointer flex-col items-center overflow-hidden p-4 text-center sm:p-5 transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)] group-hover:-translate-y-1.5">
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBg }}
            />

            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              {recommended && <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">Featured</span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25"><Award className="h-3.5 w-3.5" aria-hidden="true" />Certificate</span>
            </div>
            {course.price === 0 ? (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">FREE · {courseKeyword}</span>
            ) : (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-200 dark:bg-brand-400/10 dark:text-brand-300 dark:ring-brand-400/25">Paid course</span>
            )}

            <CourseIconThumb
              category={course.category}
              title={displayTitle}
              variant="round"
              className="relative z-10 mt-9 h-16 w-16 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:mt-8 sm:h-[4.5rem] sm:w-[4.5rem]"
            />

            <p className="relative z-10 mt-3 text-[11px] font-semibold uppercase tracking-wide text-brand-500">{course.category}</p>
            <h3 className="relative z-10 mt-1 line-clamp-2 text-[15px] font-semibold leading-snug"><Link href={`/courses/${course.slug}`} className="rounded-sm hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">{displayTitle}</Link></h3>
            <p className="relative z-10 mt-1.5 line-clamp-2 flex-1 text-[13px] leading-5 text-muted">{course.description}</p>

            <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <AnimatedClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks} {course.durationWeeks === 1 ? "week" : "weeks"}
              </span>
              <span className="truncate">Instructor: {course.instructor}</span>
            </div>

            {course.price === 0 ? <div className="relative z-10 mt-3 flex w-full items-center justify-between border-t border-border-soft pt-2.5 text-[11px]">
              <span className="font-medium uppercase tracking-wider text-muted">Course access</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-bold tracking-wide text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />FREE</span>
            </div> : <div className="relative z-10 mt-5 flex w-full flex-col items-center border-t border-border-soft pt-4">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{course.price === 0 ? "Course access" : "Course fee"}</span>
              <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
                <span className={`font-bold ${course.price === 0 ? "text-lg text-success sm:text-xl" : "text-2xl sm:text-3xl"}`}>{course.price === 0 ? "FREE" : `₹${course.price.toLocaleString("en-IN")}`}</span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-sm text-muted line-through" aria-label={`Original price ₹${course.originalPrice.toLocaleString("en-IN")}`}>
                    ₹{course.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {discountPct && (
                <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <Percent className="h-3.5 w-3.5" /> Save {discountPct}%
                </span>
              )}
            </div>}

            {course.price === 0 ? <div className="relative z-10 mt-3 w-full">
              {enrolled && <div className="mb-3 text-left"><div className="mb-1 flex justify-between text-xs"><span className="text-muted">Course progress</span><span className="font-semibold text-brand-700">{course.progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500 transition-[width]" style={{ width: `${course.progress}%` }} /></div></div>}
              <FreeEnrollButton slug={course.slug} loggedIn={loggedIn} enrolled={enrolled} />
            </div> : paidStepByStep ? <div className="relative z-10 mt-3 w-full">
              <div className="mb-3 text-left"><div className="mb-1 flex justify-between text-xs"><span className="text-muted">Course progress</span><span className="font-semibold text-brand-700">{course.progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500 transition-[width]" style={{ width: `${course.progress}%` }} /></div></div>
              <FreeEnrollButton slug={course.slug} loggedIn={loggedIn} enrolled />
            </div> : enrolled ? <span className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success"><AnimatedSuccess className="h-4.5 w-4.5" /> Enrolled</span> : <Link href={`/courses/${course.slug}`} className="relative z-10 mt-4 inline-flex w-full items-center justify-center rounded-full border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">Enroll now</Link>}
          </Card>
      </motion.div>
    </motion.div>
  );
}
