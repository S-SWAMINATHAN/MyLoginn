"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { ArrowLink } from "@/components/ui/ArrowLink";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import type { ShowcaseProject } from "@/lib/showcaseProjects";

gsap.registerPlugin(ScrollTrigger);

type SortKey = "latest" | "az";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "az", label: "A – Z" },
];

const CARD_WIDTH_CLASS =
  "h-full w-[84%] shrink-0 snap-start sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-18.67px)] xl:w-[calc(25%-21px)]";

export function ProjectsExplorer({ projects }: { projects: ShowcaseProject[] }) {
  const reducedMotion = useReducedMotion();
  const [tag, setTag] = useState("All Projects");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tags = useMemo(() => ["All Projects", ...new Set(projects.flatMap((p) => p.tags))], [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      const matchesTag = tag === "All Projects" || p.tags.includes(tag);
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [projects, tag, query, sort]);

  const pillsWrapRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const isFirstFilterRun = useRef(true);

  useIsomorphicLayoutEffect(() => {
    const btn = btnRefs.current[tag];
    const wrap = pillsWrapRef.current;
    const indicator = indicatorRef.current;
    if (!btn || !wrap || !indicator) return;

    const btnRect = btn.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const x = btnRect.left - wrapRect.left;
    const y = btnRect.top - wrapRect.top;
    const width = btnRect.width;
    const height = btnRect.height;

    if (reducedMotion) {
      gsap.set(indicator, { x, y, width, height, opacity: 1 });
    } else {
      gsap.to(indicator, { x, y, width, height, opacity: 1, duration: 0.45, ease: "power3.out" });
    }
  }, [tag, reducedMotion, tags.length]);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScroll - 8);
  };

  // Entrance reveal the first time the grid scrolls into view.
  useIsomorphicLayoutEffect(() => {
    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children);

    if (reducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    } else {
      const ctx = gsap.context(() => {
        gsap.from(cards, {
          opacity: 0,
          y: 34,
          scale: 0.96,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: trackRef.current, start: "top 88%" },
        });
      });
      updateScrollState();
      return () => ctx.revert();
    }
    updateScrollState();
  }, []);

  // Re-animate + reset scroll position whenever the filtered set changes.
  useIsomorphicLayoutEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });

    const cards = Array.from(el.children);
    if (reducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    } else {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
    requestAnimationFrame(updateScrollState);
  }, [filtered]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Let a vertical mouse-wheel gesture pan the row horizontally, like a
    // media-row carousel, without hijacking normal page scroll.
    const onWheel = (e: WheelEvent) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= maxScroll - 1)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("wheel", onWheel);
    };
  }, [filtered]);

  function selectTag(next: string) {
    if (next === tag) return;
    setTag(next);
  }

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.86, behavior: "smooth" });
  }

  return (
    <div>
      {/* Toolbar: category pills, expanding search and a sliding Latest / A-Z switch */}
      <div className="rounded-2xl border border-border-soft bg-surface p-3 shadow-[var(--shadow-soft)] sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div ref={pillsWrapRef} className="relative flex flex-1 flex-wrap gap-1.5 overflow-x-auto no-scrollbar">
            <span ref={indicatorRef} aria-hidden className="absolute left-0 top-0 z-0 rounded-full bg-story-royal shadow-[0_8px_18px_-10px_rgba(31,86,214,0.8)]" style={{ width: 0, height: 0, opacity: 0 }} />
            {tags.map((t) => (
              <button
                key={t}
                ref={(el) => {
                  btnRefs.current[t] = el;
                }}
                type="button"
                onClick={() => selectTag(t)}
                aria-pressed={tag === t}
                className={`relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 ${tag === t ? "text-white" : "text-muted hover:text-story-royal"}`}
              >
                {t === "All Projects" ? <LayoutGrid className="h-4 w-4" strokeWidth={2.25} /> : <ContentIcon keyword={t} className="h-4 w-4" />}
                {t}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <label className="group relative flex items-center">
              <AnimatedSearch className="pointer-events-none absolute left-3 h-4.5 w-4.5" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className="w-36 rounded-full border border-border-soft bg-story-mist py-2 pl-9 pr-8 text-sm outline-none transition-all duration-300 placeholder:text-muted focus:w-52 focus:border-story-royal focus:bg-surface focus:shadow-[0_0_0_3px_rgba(31,86,214,0.14)] sm:w-44 sm:focus:w-60 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 grid h-5 w-5 place-items-center rounded-full text-muted transition-colors hover:bg-border-soft hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </label>

            <div role="radiogroup" aria-label="Sort projects" className="relative flex rounded-full border border-border-soft bg-story-mist p-0.5">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} type="button" role="radio" aria-checked={sort === o.value} onClick={() => setSort(o.value)} className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${sort === o.value ? "text-story-royal" : "text-muted hover:text-foreground"}`}>
                  {sort === o.value && <motion.span layoutId="proj-sort" className="absolute inset-0 rounded-full bg-surface shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted" aria-live="polite">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-story-mist px-3 py-1 font-semibold">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={filtered.length} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }} className="tabular-nums text-story-royal">{filtered.length}</motion.span>
          </AnimatePresence>
          {filtered.length === 1 ? "project" : "projects"}
        </span>
        <span>
          {tag !== "All Projects" ? `in ${tag}` : "on display"}
          {query ? ` matching "${query}"` : ""}
        </span>
      </div>

      {/* Horizontally scrollable card row, mirroring the reference's carousel layout */}
      <div className="relative mt-6">
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory sm:gap-7"
        >
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} className={CARD_WIDTH_CLASS} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll to previous projects"
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface text-foreground shadow-[var(--shadow-lift)] transition-all duration-200 hover:scale-105 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll to more projects"
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border-soft bg-surface text-foreground shadow-[var(--shadow-lift)] transition-all duration-200 hover:scale-105 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative mx-auto mt-8 max-w-2xl overflow-hidden rounded-[2rem] border border-dashed border-border-soft bg-story-mist/60 px-6 py-12 text-center">
          <span aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full border-[18px] border-story-royal/5" />
          <span aria-hidden className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 rounded-full border-[22px] border-story-cyan/10" />
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface shadow-[var(--shadow-soft)]">
            <AnimatedFolder className="h-12 w-12" />
          </motion.div>
          {projects.length === 0 ? (
            <>
              <h3 className="relative mt-5 text-lg font-semibold text-story-navy dark:text-foreground">More projects are on the way</h3>
              <p className="relative mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted">New work will appear here as it launches. Meanwhile, tell us about the project you have in mind.</p>
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
                <ArrowLink href="/services">Explore solutions</ArrowLink>
                <Link href="/contact" className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal active:scale-95">Discuss a project</Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="relative mt-5 text-lg font-semibold text-story-navy dark:text-foreground">No projects match your search</h3>
              <p className="relative mt-1.5 text-sm text-muted">Try a different category or search term.</p>
              <button type="button" onClick={() => { setTag("All Projects"); setQuery(""); }} className="relative mt-5 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                Clear filters
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
