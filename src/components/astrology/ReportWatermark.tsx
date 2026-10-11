"use client";

/**
 * Wraps a GENERATED report. The watermark covers only this report (never the
 * rest of the page) and the content underneath stays fully visible:
 *  - until the report is paid for: a clear "PREVIEW" watermark;
 *  - after payment: a light copyright mark that remains on screen, in print and
 *    in the exported PDF (it is part of the captured report node).
 * Registers the report with the paywall so print / download can be gated.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReportAccess } from "@/lib/astrology/access";
import { setReportContext, usePaywall } from "@/lib/astrology/paywall";

const COPYRIGHT = "© MyLoginn Tech Private Limited · Astrology";

function tile(locked: boolean): string {
  const text = locked ? "PREVIEW · MyLoginn Astrology" : COPYRIGHT;
  const fill = locked ? "rgba(31,86,214,0.17)" : "rgba(31,86,214,0.08)";
  const size = locked ? 22 : 14;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="250">` +
    `<text x="190" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${size}" ` +
    `fill="${fill}" transform="rotate(-28 190 125)">${text}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function ReportWatermark({ access, children }: { access: ReportAccess; children: React.ReactNode }) {
  const { unlocked } = usePaywall();
  const locked = !unlocked;
  const rootRef = useRef<HTMLDivElement>(null);
  const [revive, setRevive] = useState(0);
  const { product, reportKey } = access;

  useEffect(() => {
    setReportContext({ product, reportKey });
    return () => setReportContext(null);
  }, [product, reportKey]);

  // If the overlay node is removed from the DOM, put it back.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mo = new MutationObserver(() => {
      if (!root.querySelector(":scope > [data-report-watermark]")) setRevive((n) => n + 1);
    });
    mo.observe(root, { childList: true });
    return () => mo.disconnect();
  }, []);

  const image = useMemo(() => tile(locked), [locked]);

  return (
    <div ref={rootRef} className="astro-report-watermark relative">
      {children}
      <div
        key={revive}
        data-report-watermark
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          pointerEvents: "none",
          backgroundImage: image,
          backgroundRepeat: "repeat",
          backgroundSize: "380px 250px",
        }}
      />
    </div>
  );
}
