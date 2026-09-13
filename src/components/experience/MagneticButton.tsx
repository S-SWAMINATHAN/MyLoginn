"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceTier } from "@/lib/useDeviceTier";

/** Wraps a CTA so it drifts gently toward the cursor on hover — desktop only. */
export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isTouch } = useDeviceTier();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || isTouch) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * 0.26);
      yTo((e.clientY - (rect.top + rect.height / 2)) * 0.3);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [reducedMotion, isTouch]);

  return (
    <div ref={ref} className={className} style={{ display: "inline-block", willChange: "transform" }}>
      {children}
    </div>
  );
}
