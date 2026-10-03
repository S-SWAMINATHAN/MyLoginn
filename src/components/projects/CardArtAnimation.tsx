"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function CardArtAnimation({
  svg,
  animationUrl,
}: {
  svg: string;
  animationUrl?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const accents = [
    { left: "18%", top: "24%", size: 5, delay: 0 },
    { left: "78%", top: "30%", size: 4, delay: 0.8 },
    { left: "66%", top: "78%", size: 3, delay: 1.5 },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !animationUrl || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(video);
        void video.play().catch(() => setPlaying(false));
      },
      { rootMargin: "100px 0px" }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [animationUrl, reduceMotion]);

  return (
    <div className="absolute inset-0">
      {!(animationUrl && playing && !reduceMotion) && (
        <span
          aria-hidden
          className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {animationUrl && !reduceMotion && (
        <video
          ref={videoRef}
          src={animationUrl}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
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
