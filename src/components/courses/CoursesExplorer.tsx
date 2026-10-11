"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { CourseCard, type CourseCardData } from "./CourseCard";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";
import { CourseSortMenu, type SortKey } from "./CourseSortMenu";

type CourseType = "All courses" | "Free courses" | "Paid courses";

const byTitle = (a: CourseCardData, b: CourseCardData) =>
  getCourseDisplayTitle(a.slug, a.title).localeCompare(getCourseDisplayTitle(b.slug, b.title), undefined, { sensitivity: "base", numeric: true });

export function CoursesExplorer({
  courses,
  enrolledIds,
  recommendedIds,
  isLoggedIn,
}: {
  courses: CourseCardData[];
  enrolledIds: string[];
  recommendedIds: string[];
  isLoggedIn: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [courseType, setCourseType] = useState<CourseType>("All courses");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");

  const categories = useMemo(() => ["All", ...new Set(courses.map((c) => c.category))], [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesType = courseType === "All courses" || (courseType === "Free courses" ? c.price === 0 : c.price > 0);
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery = !normalizedQuery || `${c.title} ${c.category} ${c.description}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesType && matchesQuery;
    }).sort((a, b) => {
      // Ties always fall back to A to Z so the order stays stable.
      if (sort === "za") return byTitle(b, a);
      if (sort === "price-asc") return a.price - b.price || byTitle(a, b);
      if (sort === "price-desc") return b.price - a.price || byTitle(a, b);
      if (sort === "duration") return a.durationWeeks - b.durationWeeks || byTitle(a, b);
      return byTitle(a, b);
    });
  }, [courses, category, courseType, query, sort]);

  const recommended = courses.filter((c) => recommendedIds.includes(c.id));

  return (
    <div>
      {isLoggedIn && recommended.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Featured courses</h2>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
            {recommended.slice(0, 3).map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={enrolledIds.includes(course.id)}
                recommended
                loggedIn={isLoggedIn}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      <div className="lg:flex lg:items-center lg:gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:contents">
        <div className="isolate -mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:order-1 lg:min-w-0 lg:flex-1 lg:flex-nowrap lg:overflow-x-auto lg:p-1 lg:[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`relative shrink-0 cursor-pointer snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                category === cat ? "text-white" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {category === cat ? (
                <motion.span
                  layoutId="course-category-pill"
                  className="absolute inset-0 -z-10 rounded-full brand-gradient-bg shadow-[var(--shadow-soft)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : (
                <span className="absolute inset-0 -z-10 rounded-full bg-surface-2 transition-colors duration-200 hover:bg-surface-2/80" />
              )}
              {cat}
            </button>
          ))}
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto lg:order-3">
          <div className="group relative min-w-0 flex-1 sm:w-48 sm:flex-none lg:w-44">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110">
              <AnimatedSearch className="h-5 w-5" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses…"
              className="w-full rounded-full border border-border-soft bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
            />
          </div>
        <CourseSortMenu value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 sm:gap-3 lg:order-2 lg:mt-0 lg:shrink-0" role="group" aria-label="Filter by course access">
        <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted sm:inline lg:hidden xl:inline">Access</span>
        <div className="flex w-full gap-1 rounded-full bg-surface-2 p-1 sm:w-auto">
          {(["All courses", "Free courses", "Paid courses"] as CourseType[]).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={courseType === type}
              onClick={() => setCourseType(type)}
              className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-2 text-xs font-semibold transition-colors sm:flex-none sm:px-4 ${courseType === type ? "brand-gradient-bg text-white shadow-[var(--shadow-soft)]" : "text-foreground/80 hover:text-foreground"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      </div>

      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={enrolledIds.includes(course.id)}
              loggedIn={isLoggedIn}
              index={i}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">No courses match your search.</p>
      )}
    </div>
  );
}
