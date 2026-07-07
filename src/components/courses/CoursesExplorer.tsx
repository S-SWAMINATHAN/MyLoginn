"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedAi } from "@/components/ui/icons/AnimatedAi";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { CourseCard, type CourseCardData } from "./CourseCard";

export function CoursesExplorer({
  courses,
  enrolledIds,
  recommendedIds,
  trendingIds,
  isLoggedIn,
}: {
  courses: CourseCardData[];
  enrolledIds: string[];
  recommendedIds: string[];
  trendingIds: string[];
  isLoggedIn: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => ["All", ...new Set(courses.map((c) => c.category))], [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [courses, category, query]);

  const recommended = courses.filter((c) => recommendedIds.includes(c.id));

  return (
    <div>
      {isLoggedIn && recommended.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center gap-2">
            <AnimatedAi className="h-7 w-7" />
            <h2 className="text-lg font-semibold">AI-recommended for you</h2>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
            {recommended.slice(0, 3).map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={enrolledIds.includes(course.id)}
                trending={trendingIds.includes(course.id)}
                recommended
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
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
        <div className="group relative w-full sm:w-64">
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
      </div>

      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={enrolledIds.includes(course.id)}
              trending={trendingIds.includes(course.id)}
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
