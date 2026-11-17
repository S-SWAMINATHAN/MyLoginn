"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { AnimatedProfileIcon } from "@/components/about/AnimatedProfileIcon";

export function DefaultTeamAvatar() {
  const reducedMotion = useReducedMotion();
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#fff,#f1f3f6)]">
      <AnimatedProfileIcon className="h-full w-full overflow-visible" animate={!reducedMotion} />
    </div>
  );
}
