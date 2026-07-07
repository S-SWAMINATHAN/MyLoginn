"use client";

import type { MouseEvent } from "react";
import { useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";

export function useTiltSpotlight() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springCfg = { stiffness: 220, damping: 24, mass: 0.6 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);
  const rotateX = useTransform(smoothY, [0, 1], [7, -7]);
  const rotateY = useTransform(smoothX, [0, 1], [-7, 7]);
  const spotX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const spotY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const spotlightBg = useMotionTemplate`radial-gradient(420px circle at ${spotX} ${spotY}, color-mix(in srgb, var(--brand-400) 18%, transparent), transparent 70%)`;

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }
  function onMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave };
}
