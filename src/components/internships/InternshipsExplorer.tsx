"use client";

import { useMemo, useState } from "react";
import { InternshipCard, type InternshipCardData } from "./InternshipCard";

type PayFilter = "all" | "paid" | "unpaid";

type Props = {
  internships: InternshipCardData[];
  appliedIds: string[];
};

export function InternshipsExplorer({ internships, appliedIds }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [pay, setPay] = useState<PayFilter>("all");
  const appliedSet = new Set(appliedIds);
  const types = ["all", ...new Set(internships.map((internship) => internship.type))];
  const featured = internships.filter((internship) => internship.featured);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return internships.filter((internship) => {
      const matchesType = type === "all" || internship.type === type;
      const matchesPay = pay === "all" || (pay === "paid" ? internship.paid : !internship.paid);
      const matchesQuery = !normalizedQuery || `${internship.title} ${internship.company} ${internship.location}`.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesPay && matchesQuery;
    });
  }, [internships, pay, query, type]);

  function clearFilters() {
    setQuery("");
    setType("all");
    setPay("all");
  }

  return (
    <div>
      <div className="glass-panel sticky top-20 z-20 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {types.map((option) => (
            <button key={option} type="button" onClick={() => setType(option)} className={`rounded-full px-4 py-2 text-sm capitalize ${type === option ? "brand-gradient-bg text-white" : "bg-surface-2 text-muted"}`}>
              {option}
            </button>
          ))}
          {(["all", "paid", "unpaid"] as PayFilter[]).map((option) => (
            <button key={option} type="button" onClick={() => setPay(option)} className={`rounded-full px-4 py-2 text-sm capitalize ${pay === option ? "bg-foreground text-background" : "bg-surface-2 text-muted"}`}>
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search internships" className="rounded-full border border-border-soft bg-surface px-4 py-2 text-sm outline-none focus:border-brand-400" />
          <button type="button" onClick={clearFilters} className="rounded-full border border-border-soft px-4 py-2 text-sm text-muted hover:text-foreground">Reset</button>
        </div>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Featured Internships</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((internship, index) => <InternshipCard key={internship.id} internship={internship} applied={appliedSet.has(internship.id)} index={index} />)}
          </div>
        </section>
      )}

      <section id="all-internships" className="mt-14 scroll-mt-24">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">All Internships</h2><span className="text-sm text-muted">{filtered.length} found</span></div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((internship, index) => <InternshipCard key={internship.id} internship={internship} applied={appliedSet.has(internship.id)} index={index} />)}
        </div>
        {filtered.length === 0 && <p className="mt-10 text-center text-sm text-muted">No internships match your filters.</p>}
      </section>
    </div>
  );
}
