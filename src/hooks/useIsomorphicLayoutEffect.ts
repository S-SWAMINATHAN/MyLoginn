"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server — avoids
 * React's "useLayoutEffect does nothing on the server" warning while still
 * running before paint on the client, which matters for GSAP setup that
 * hides elements (e.g. `drawSVG: "0%"`) right before their entrance
 * animation plays. Without this, a GSAP `useEffect` runs *after* the
 * browser paints the server-rendered markup, so anything GSAP is meant to
 * hide-then-reveal flashes fully visible for a frame first.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
