import type { ReactNode } from "react";

/** Hosts the homepage chapters over a quiet, static grid backdrop. */
export function StoryStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative isolate grid overflow-x-clip"
      style={{ gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none"
        style={{ gridArea: "1 / 1", position: "sticky", top: 0, height: "100svh", overflow: "hidden", zIndex: 0, minWidth: 0 }}
      >
        <span
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 100%, rgba(255,255,255,0.92), transparent 62%)" }}
        />
      </div>

      <div style={{ gridArea: "1 / 1", position: "relative", zIndex: 10, minWidth: 0 }}>{children}</div>
    </div>
  );
}
