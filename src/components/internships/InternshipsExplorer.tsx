"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { InternshipCard, type InternshipCardData } from "./InternshipCard";

type PayFilter = "all" | "paid" | "unpaid";

export function InternshipsExplorer({
  internships,
  appliedIds,
}: {
  internships: InternshipCardData[];
  appliedIds: string[];
}) {
  const [type, setType] = useState("All");
  const [pay, setPay] = useState<PayFilter>("all");
  const [query, setQuery] = useState("");

  const types = useMemo(() => ["All", ...new Set(internships.map((i) => i.type))], [internships]);
  const featured = internships.filter((i) => i.featured);

  const filtered = useMemo(() => {
    return internships.filter((i) => {
      const matchesType = type === "All" || i.type === type;
      const matchesPay = pay === "all" || (pay === "paid" ? i.paid : !i.paid);
      const matchesQuery =
        i.title.toLowerCase().includes(query.toLowerCase()) || i.company.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesPay && matchesQuery;
    });
  }, [internships, type, pay, query]);

  const appliedSet = new Set(appliedIds);

  return (
    <div>
      {featured.length > 0 && (
        <div className="mb-14">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatedCrown className="h-7 w-7" />
            <h2 className="text-lg font-semibold sm:text-xl">Featured internships</h2>
            <span className="hidden h-px flex-1 bg-gradient-to-r from-border-soft to-transparent sm:block" />
          </motion.div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
            {featured.slice(0, 3).map((internship, i) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                applied={appliedSet.has(internship.id)}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky glass filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel sticky top-20 z-20 flex flex-col gap-3.5 rounded-2xl p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          {types.map((t) => (
            <motion.button
              key={t}
              onClick={() => setType(t)}
              whileTap={{ scale: 0.94 }}
              className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 sm:px-4 sm:py-2 ${
                type === t ? "text-white" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {type === t ? (
                <motion.span
                  layoutId="internship-type-pill"
                  className="absolute inset-0 -z-10 rounded-full brand-gradient-bg shadow-[var(--shadow-soft)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : (
                <span className="absolute inset-0 -z-10 rounded-full bg-surface-2 transition-colors duration-200 hover:bg-surface-2/80" />
              )}
              {t}
            </motion.button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border-soft sm:block" />
          {(["all", "paid", "unpaid"] as PayFilter[]).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPay(p)}
              whileTap={{ scale: 0.94 }}
              className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors duration-200 sm:px-4 sm:py-2 ${
                pay === p ? "text-background" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {pay === p ? (
                <motion.span
                  layoutId="internship-pay-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-foreground shadow-[var(--shadow-soft)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : (
                <span className="absolute inset-0 -z-10 rounded-full bg-surface-2 transition-colors duration-200 hover:bg-surface-2/80" />
              )}
              {p}
            </motion.button>
          ))}
        </div>
        <div className="group relative w-full sm:w-64">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <AnimatedSearch className="h-5 w-5" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internships…"
            className="w-full rounded-full border border-border-soft bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow duration-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
          />
        </div>
      </motion.div>

      {/* Animated result count */}
      <div className="mt-6 flex items-center justify-between text-xs text-muted">
        <AnimatePresence mode="wait">
          <motion.span
            key={filtered.length}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.length} {filtered.length === 1 ? "internship" : "internships"} found
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div layout className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((internship, i) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              applied={appliedSet.has(internship.id)}
              index={i}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <AnimatedSearch className="h-16 w-16 opacity-80" />
          <div>
            <p className="text-sm font-medium">No internships match your search</p>
            <p className="mt-1 text-xs text-muted">Try a different keyword or clear the filters.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setType("All");
              setPay("all");
              setQuery("");
            }}
            className="cursor-pointer rounded-full brand-gradient-bg px-5 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)]"
          >
            Clear filters
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
