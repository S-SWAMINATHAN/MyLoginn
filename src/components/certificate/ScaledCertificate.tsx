"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { CERT_HEIGHT_PX, CERT_WIDTH_PX } from "@/lib/certificate/config";

/**
 * Shows a fixed 1123 × 794 certificate scaled to the container width. The box keeps the exact A4
 * ratio (297 / 210) and the page is scaled with a transform, so layout inside never reflows.
 */
export function ScaledCertificate({ children, className = "", pageRef }: { children: ReactNode; className?: string; pageRef?: Ref<HTMLDivElement> }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CERT_WIDTH_PX);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative aspect-[297/210] w-full overflow-hidden ${className}`}>
      <div style={{ width: CERT_WIDTH_PX, height: CERT_HEIGHT_PX, transform: `scale(${scale})`, transformOrigin: "top left", visibility: scale ? "visible" : "hidden" }}>
        {/* Untransformed, full-size page: the node the exporter captures. */}
        <div ref={pageRef} style={{ width: CERT_WIDTH_PX, height: CERT_HEIGHT_PX }}>{children}</div>
      </div>
    </div>
  );
}
