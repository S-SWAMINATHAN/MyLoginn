/**
 * Soft white vignette behind headline copy in chapters where the crystal
 * core sits at full scale/opacity (formation "crystal") — without it, dark
 * text loses contrast wherever it crosses a bright facet.
 */
export function CrystalScrim({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[38rem] w-[46rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.82) 42%, rgba(255,255,255,0.35) 68%, transparent 82%)",
      }}
    />
  );
}
