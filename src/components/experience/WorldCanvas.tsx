"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldScene } from "./WorldScene";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceTier } from "@/lib/useDeviceTier";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext) && Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/**
 * The persistent 3D "world" behind the story. Sits inside a sticky layer
 * (see StoryStage) so it never unmounts between chapters — only the active
 * node formation and camera framing change as the user scrolls.
 */
export function WorldCanvas() {
  const reducedMotion = useReducedMotion();
  const { isCompact } = useDeviceTier();
  // Lazy-initialized: WorldCanvas is only ever mounted client-side (dynamic
  // import with ssr:false in StoryStage), so it's safe to touch the DOM here.
  const [supported] = useState(supportsWebGL);
  const [active, setActive] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onVisibility = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | undefined;
    if (wrapperRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => setActive(document.visibilityState === "visible" && entry.isIntersecting),
        { threshold: 0 }
      );
      observer.observe(wrapperRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  if (!supported) {
    return (
      <div
        ref={wrapperRef}
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(85,144,255,0.16), transparent 70%), #ffffff",
        }}
      />
    );
  }

  const count = isCompact ? 26 : 58;

  return (
    <div ref={wrapperRef} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, isCompact ? 1.5 : 2]}
        gl={{ antialias: !isCompact, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.15, 6.1], fov: 42, near: 0.1, far: 50 }}
        frameloop={active ? "always" : "never"}
      >
        <WorldScene count={count} reducedMotion={reducedMotion} compact={isCompact} />
      </Canvas>
    </div>
  );
}
