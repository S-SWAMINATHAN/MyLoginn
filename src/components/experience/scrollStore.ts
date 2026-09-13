"use client";

/**
 * Scroll-driven story registry.
 *
 * One long "stage" wrapper (see StoryStage.tsx) hosts every narrative chapter
 * from the hero to the final CTA, with a single sticky WebGL canvas pinned
 * behind all of them. A single GSAP ScrollTrigger spanning that wrapper
 * drives a global `progress` value (0 → 1); this module fans that value out
 * to:
 *
 *  - the Three.js scene (imperative reads inside useFrame — no React re-renders)
 *  - any chapter that wants its own local 0 → 1 progress (text reveals)
 *  - React UI that wants a reactive value (via useSyncExternalStore)
 *
 * Chapters self-register their DOM node once, in mount order, and the stage
 * measures real rendered bounds (offsetTop/offsetHeight) rather than
 * hard-coded viewport-height guesses, so responsive text reflow never
 * desyncs the story from the geometry.
 */

export type Formation = "seed" | "crystal" | "network" | "grid" | "orbitHub" | "stream" | "tree";

export type ChapterRecord = {
  id: string;
  el: HTMLElement;
  formation: Formation;
  variant: string;
  start: number; // fraction of the stage, 0..1
  end: number;
};

type ProgressListener = (progress: number) => void;

const chapters: ChapterRecord[] = [];
let progress = 0;
const listeners = new Set<ProgressListener>();
let idCounter = 0;

export function registerChapter(el: HTMLElement, formation: Formation, variant: string): string {
  const id = `chapter-${idCounter++}`;
  chapters.push({ id, el, formation, variant, start: 0, end: 0 });
  return id;
}

export function unregisterChapter(id: string) {
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx !== -1) chapters.splice(idx, 1);
}

/** Re-measure every registered chapter against the stage wrapper's live height. */
export function recomputeChapterBounds(stageEl: HTMLElement) {
  const total = stageEl.scrollHeight || 1;
  for (const chapter of chapters) {
    const start = chapter.el.offsetTop / total;
    const end = (chapter.el.offsetTop + chapter.el.offsetHeight) / total;
    chapter.start = start;
    chapter.end = end;
  }
}

export function getChapters(): readonly ChapterRecord[] {
  return chapters;
}

export function setProgress(next: number) {
  progress = next;
  for (const listener of listeners) listener(progress);
}

export function getProgress() {
  return progress;
}

export function subscribeProgress(listener: ProgressListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Active chapter + local (within-chapter) progress for the current global progress. */
export function getActiveChapter(): { chapter: ChapterRecord | null; local: number } {
  if (chapters.length === 0) return { chapter: null, local: 0 };

  for (const chapter of chapters) {
    if (progress >= chapter.start && progress <= chapter.end) {
      const span = chapter.end - chapter.start || 1;
      return { chapter, local: clamp01((progress - chapter.start) / span) };
    }
  }

  // Before the first or after the last chapter.
  if (progress < chapters[0].start) return { chapter: chapters[0], local: 0 };
  const last = chapters[chapters.length - 1];
  return { chapter: last, local: 1 };
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
