"use client";

import { useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Ties a discrete "active step" index to how far a DOM node has scrolled
 * through the viewport — used to progressively highlight pipeline/timeline
 * UI as the user scrolls, without pinning the section.
 */
export function useScrollStep(stepCount: number): { ref: RefObject<HTMLDivElement | null>; activeStep: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) {
      setActiveStep(stepCount - 1);
      return;
    }
    const el = ref.current;
    if (!el || stepCount <= 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "bottom 45%",
        scrub: true,
        onUpdate: (self) => setActiveStep(Math.min(stepCount - 1, Math.floor(self.progress * stepCount))),
      });
    });
    return () => ctx.revert();
  }, [reducedMotion, stepCount]);

  return { ref, activeStep };
}
