"use client";

import { useRef, type ReactNode } from "react";
import { registerChapter, unregisterChapter, type Formation } from "./scrollStore";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { cn } from "@/lib/cn";

/**
 * One narrative beat inside <StoryStage>. Registers its DOM bounds with the
 * scroll registry (so the persistent 3D world knows which formation to
 * settle into while this chapter is in view) and renders as a plain,
 * normal-flow <section> — no fixed positioning, no pinning by default, so
 * it behaves exactly like ordinary content for scroll, focus and readers.
 */
export function Chapter({
  formation,
  variant,
  title,
  id,
  className,
  children,
}: {
  formation: Formation;
  variant: string;
  title: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chapterId = registerChapter(el, formation, variant);
    return () => unregisterChapter(chapterId);
  }, [formation, variant]);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={title}
      data-chapter={variant}
      className={cn("relative flex min-h-0 min-w-0 max-w-full scroll-mt-16 flex-col justify-start overflow-x-clip py-9 sm:min-h-[480px] sm:justify-center sm:py-14", className)}
    >
      {children}
    </section>
  );
}
