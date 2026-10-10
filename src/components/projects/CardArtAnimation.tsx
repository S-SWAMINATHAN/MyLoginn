"use client";

import { motion, useReducedMotion } from "framer-motion";

export function CardArtAnimation({ svg }: { svg: string }) {
  const reduceMotion = useReducedMotion();
  const accents = [
    { left: "18%", top: "24%", size: 5, delay: 0 },
    { left: "78%", top: "30%", size: 4, delay: 0.8 },
    { left: "66%", top: "78%", size: 3, delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0">
      <span
        aria-hidden
        className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {!reduceMotion && accents.map((accent) => (
        <motion.span
          key={`${accent.left}-${accent.top}`}
          aria-hidden="true"
          className="pointer-events-none absolute z-[1] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.85)]"
          style={{ left: accent.left, top: accent.top, width: accent.size, height: accent.size }}
          animate={{ y: [0, -7, 0], opacity: [0.3, 0.95, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, delay: accent.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
