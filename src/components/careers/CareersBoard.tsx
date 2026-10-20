"use client";

import { ArrowButton } from "@/components/ui/ArrowLink";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, RotateCcw, Search, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { JobCard } from "@/components/careers/JobCard";
import { JobDetailDialog } from "@/components/careers/JobDetailDialog";
import { ApplyDialog, type ApplyTarget } from "@/components/careers/ApplyDialog";

export type PublicJob = {
  id: string;
  title: string;
  team: string;
  type: string;
  location: string;
  experience: string | null;
  salaryRange: string | null;
  positions: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  company: string;
  workMode: string;
  goodToHave: string[];
  benefits: string[];
  idealCandidate: string | null;
  applyUrl: string | null;
  status: "open" | "upcoming" | "closed";
  openFrom: string | null;
  closeBy: string | null;
  postedAt: string;
};

export type PublicInternship = { id: string; slug: string; title: string; type: string; location: string; duration: string | null; open: boolean };

const TABS = [
  { id: "open", label: "Open now" },
  { id: "upcoming", label: "Opening soon" },
  { id: "closed", label: "Closed" },
] as const;

/** Roles from the database grouped by status, with team filters, an apply dialog and the open internships. */
export function CareersBoard({ jobs, internships, email }: { jobs: PublicJob[]; internships: PublicInternship[]; email: string }) {
  const counts = { open: jobs.filter((j) => j.status === "open").length, upcoming: jobs.filter((j) => j.status === "upcoming").length, closed: jobs.filter((j) => j.status === "closed").length };
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(counts.open ? "open" : counts.upcoming ? "upcoming" : "open");
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [detail, setDetail] = useState<PublicJob | null>(null);
  const [now] = useState(() => Date.now());
  const [applying, setApplying] = useState<ApplyTarget | null>(null);

  const inTab = useMemo(() => jobs.filter((j) => j.status === tab), [jobs, tab]);
  const uniq = (key: "team" | "location" | "type") => Array.from(new Set(inTab.map((j) => j[key]).filter(Boolean))).sort().map((v) => ({ value: v, label: v }));
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    const list = inTab.filter((j) => (!team || j.team === team) && (!location || j.location === location) && (!type || j.type === type) && (!q || `${j.title} ${j.team} ${j.location} ${j.summary}`.toLowerCase().includes(q)));
    return list.sort((a, b) => (sort === "closing" ? (a.closeBy ?? "9").localeCompare(b.closeBy ?? "9") : b.postedAt.localeCompare(a.postedAt)));
  }, [inTab, team, location, type, q, sort]);
  const filtered = Boolean(query || team || location || type);
  const reset = () => { setQuery(""); setTeam(""); setLocation(""); setType(""); setSort("newest"); };
  const openApplication: ApplyTarget = { id: null, title: "Open application" };

  return (
    <>
      <section id="openings" aria-label="Job openings" className="scroll-mt-20 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Job openings</h2>
            <div role="tablist" aria-label="Role status" className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); reset(); }} className={cn("relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] sm:gap-1.5 sm:px-3.5 sm:text-sm font-semibold transition-colors", tab === t.id ? "text-white" : "text-muted hover:text-story-royal")}>
                  {tab === t.id && <motion.span layoutId="careers-status-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{t.label}</span>
                  <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", tab === t.id ? "bg-white/20" : "bg-surface text-muted")}>{counts[t.id]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-3xl border border-border-soft bg-surface p-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
            <label className="relative col-span-2 block lg:col-span-1">
              <span className="field-label">Job title or keyword</span>
              <Search className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-muted" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles" className="field-control mt-1.5" style={{ paddingLeft: "2.5rem", paddingRight: "2.25rem" }} />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute bottom-3 right-3 grid h-5 w-5 place-items-center rounded-full text-muted hover:text-story-royal"><X className="h-3.5 w-3.5" /></button>}
            </label>
            <Select id="f-team" label="Category" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="All categories" options={uniq("team")} />
            <Select id="f-loc" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="All locations" options={uniq("location")} />
            <Select id="f-type" label="Job type" value={type} onChange={(e) => setType(e.target.value)} placeholder="All types" options={uniq("type")} />
            <button type="button" onClick={reset} disabled={!filtered && sort === "newest"} className="col-span-2 inline-flex h-[2.9rem] items-center justify-center gap-1.5 rounded-full border lg:col-span-1 border-border-soft px-4 text-sm font-semibold text-muted transition-colors hover:border-story-royal hover:text-story-royal disabled:opacity-40"><RotateCcw className="h-4 w-4" />Reset</button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted" aria-live="polite"><span className="font-bold text-story-navy dark:text-foreground">{shown.length}</span> {shown.length === 1 ? "role" : "roles"}{filtered ? " match your filters" : ""}</p>
            <div className="flex gap-1 rounded-full bg-story-mist p-1" role="radiogroup" aria-label="Sort roles">
              {[{ id: "newest", label: "Newest" }, { id: "closing", label: "Closing soon" }].map((o) => (
                <button key={o.id} role="radio" aria-checked={sort === o.id} onClick={() => setSort(o.id)} className={cn("relative rounded-full px-3 py-1 text-xs font-semibold transition-colors", sort === o.id ? "text-white" : "text-muted hover:text-story-royal")}>
                  {sort === o.id && <motion.span layoutId="careers-sort-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((job, i) => (
                <JobCard key={job.id} job={job} now={now} index={i} onOpen={setDetail} />
              ))}
            </AnimatePresence>
          </ul>

          {!shown.length && (
            <div className="mt-5 rounded-3xl border border-dashed border-story-royal/30 bg-story-mist p-6 text-center sm:p-10">
              <p className="text-lg font-semibold text-story-navy dark:text-foreground">
                {filtered ? "No roles match these filters." : tab === "open" ? "There are no open positions right now." : tab === "upcoming" ? "No roles are scheduled to open yet." : "No closed roles to show."}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">{filtered ? "Try a different keyword or clear a filter." : "We still like hearing from developers, designers and marketers. Send your CV and we will reach out when a matching role opens."}</p>
              {filtered && <button onClick={reset} className="mr-2 mt-4 inline-flex items-center gap-1.5 rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold hover:border-story-royal hover:text-story-royal"><RotateCcw className="h-4 w-4" />Reset filters</button>}
              <div className="mt-5 flex justify-center"><ArrowButton onClick={() => setApplying(openApplication)}>Send an open application</ArrowButton></div>
            </div>
          )}
        </div>
      </section>

      <section aria-label="Internship opportunities" className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Internship opportunities</h2>
            <Link href="/internships" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-story-royal">All internships <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {internships.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No internships are open at the moment.</p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {internships.map((i) => (
                <li key={i.id}>
                  <Link href={`/internships/${i.slug}`} className="group block h-full rounded-2xl border border-border-soft bg-surface p-5 transition-colors hover:border-story-royal/40">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-base font-semibold text-story-navy group-hover:text-story-royal dark:text-foreground">{i.title}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted group-hover:text-story-royal" />
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      <span>{i.type}</span>
                      {i.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{i.location}</span>}
                      {i.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{i.duration}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="px-5 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-3xl bg-story-mist p-5 sm:p-6">
          <p className="text-sm font-semibold text-story-navy dark:text-foreground">Prefer email? Write to <a href={`mailto:${email}`} className="text-story-royal">{email}</a></p>
          <ArrowButton onClick={() => setApplying(openApplication)}>Open application</ArrowButton>
        </div>
      </div>

      <JobDetailDialog job={detail} onClose={() => setDetail(null)} onApply={(j) => { setDetail(null); setApplying({ id: j.id, title: j.title }); }} onOpenApplication={() => { setDetail(null); setApplying(openApplication); }} />
      <ApplyDialog target={applying} onClose={() => setApplying(null)} />
    </>
  );
}
