"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { recomputeChapterBounds, setProgress } from "./scrollStore";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const WorldCanvas = dynamic(() => import("./WorldCanvas").then((m) => m.WorldCanvas), { ssr: false });

/**
 * Hosts the entire hero-to-final-CTA journey. A single sticky WebGL layer
 * (WorldCanvas) is pinned behind every chapter via a CSS Grid stack — both
 * layers occupy the same grid cell, so the canvas "sticks" for the full
 * height of the content layer without ever using `position: fixed` (which
 * would be captured by PageTransition's animated wrapper higher up the
 * tree). One ScrollTrigger spanning the whole stage drives global progress;
 * each <Chapter> re-measures its own real rendered bounds against it.
 */
export function StoryStage({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      const refresh = () => recomputeChapterBounds(wrapper);
      refresh();

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
        onRefresh: refresh,
      });

      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(wrapper);

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      // Images (hero art, story illustrations) finishing decode after that
      // first refresh change the wrapper's real height without necessarily
      // firing the ResizeObserver in time — stale chapter bounds are what
      // make the story feel like it's scrolling "wrong" (chapters swapping
      // early/late, or the 3D layer jumping) until something forces a
      // refresh, like a manual reload. Re-measure once everything, images
      // included, has actually loaded.
      const onWindowLoad = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") {
        onWindowLoad();
      } else {
        window.addEventListener("load", onWindowLoad);
      }

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener("load", onWindowLoad);
      };
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative isolate grid overflow-x-hidden"
      style={{ gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none"
        style={{ gridArea: "1 / 1", position: "sticky", top: 0, height: "100svh", overflow: "hidden", zIndex: 0, minWidth: 0 }}
      >
        {!reducedMotion && (
          <>
            <span
              className="aurora-blob aurora-blob-alt absolute h-[38rem] w-[38rem]"
              style={{ top: "6%", left: "-8%", background: "radial-gradient(circle, rgba(37,99,235,0.14), transparent 70%)" }}
            />
            <span
              className="aurora-blob absolute h-[34rem] w-[34rem]"
              style={{ bottom: "4%", right: "-10%", background: "radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)" }}
            />
          </>
        )}
        <WorldCanvas />
        <span className="story-grid-bg absolute inset-0" />
        <span
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 100%, rgba(255,255,255,0.92), transparent 62%)" }}
        />
      </div>

      <div style={{ gridArea: "1 / 1", position: "relative", zIndex: 10, minWidth: 0 }}>{children}</div>
    </div>
  );
}
