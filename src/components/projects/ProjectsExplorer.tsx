"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedSearch } from "@/components/ui/icons/AnimatedSearch";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
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
      {/* Filter bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            ref={pillsWrapRef}
            className="relative flex flex-1 flex-wrap gap-2 overflow-x-auto no-scrollbar"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="absolute left-0 top-0 z-0 rounded-full brand-gradient-bg shadow-[var(--shadow-soft)]"
              style={{ width: 0, height: 0, opacity: 0 }}
            />
            {tags.map((t) => (
              <button
                key={t}
                ref={(el) => {
                  btnRefs.current[t] = el;
                }}
                type="button"
                onClick={() => selectTag(t)}
                className={`relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  tag === t ? "text-white" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {t === "All Projects" ? (
                  <LayoutGrid className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <ContentIcon keyword={t} className="h-4 w-4" />
                )}
                {t}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="relative flex items-center">
              <AnimatedSearch className="pointer-events-none absolute left-3 h-4.5 w-4.5" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-40 rounded-full border border-border-soft bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:w-52 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 sm:w-48 sm:focus:w-56 dark:focus:ring-brand-900/30"
              />
            </label>

            <div className="group relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-full border border-border-soft bg-surface py-2 pl-4 pr-9 text-sm font-medium outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform duration-300 group-focus-within:rotate-180" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        {tag !== "All Projects" ? ` in ${tag}` : " on display"}
        {query ? ` matching "${query}"` : ""}
      </p>

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
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <AnimatedFolder className="h-16 w-16 opacity-80" />
          <div>
            <p className="text-sm font-medium">No projects match your search</p>
            <p className="mt-1 text-xs text-muted">Try a different category or search term.</p>
          </div>
        </div>
      )}
    </div>
  );
}
