"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Signatory } from "@/types/certificate";
import { fonts } from "./fonts";

/**
 * Text that shrinks until it fits its box (one line by default, or `maxHeight` when wrapping).
 * Layout metrics ignore CSS transforms, so the result is identical in the scaled preview and the full-size export.
 */
export function FitText({ children, width, maxSize, minSize, maxHeight, style, className, fitKey }: {
  children: ReactNode; width: number; maxSize: number; minSize: number; maxHeight?: number; style?: CSSProperties; className?: string;
  /** What the content depends on, when children is not a plain string. */
  fitKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(maxSize);
  const text = fitKey ?? (typeof children === "string" ? children : "");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      let s = maxSize;
      el.style.fontSize = `${s}px`;
      const overflows = () => (maxHeight ? el.scrollHeight > maxHeight + 1 : el.scrollWidth > width + 1);
      // Jump close to the answer for one-liners, then step down. Never stop while it still overflows:
      // `minSize` only bounds the jump, because clipping a learner's legal name is worse than small type.
      if (!maxHeight && overflows()) s = Math.max(minSize, Math.floor((maxSize * width) / el.scrollWidth));
      el.style.fontSize = `${s}px`;
      while (overflows() && s > 6) el.style.fontSize = `${(s -= 0.5)}px`;
      setSize(s);
    };
    fit();
    // Re-measure once webfonts arrive; fallback-font widths are wrong.
    document.fonts?.ready.then(fit).catch(() => undefined);
    return () => { cancelled = true; };
  }, [text, width, maxSize, minSize, maxHeight]);

  return (
    <div ref={ref} className={className} style={{ ...style, width, fontSize: size, whiteSpace: maxHeight ? "normal" : "nowrap", overflow: maxHeight ? "hidden" : "visible", overflowWrap: "break-word" }}>
      {children}
    </div>
  );
}

/** A handwritten signature over a rule, with the printed name and title beneath. */
export function SignatureBlock({ signatory, ink, rule, nameColor, titleColor, nameFont, titleFont, width = 230, nameUppercase = false, ruleWidth }: {
  signatory: Signatory; ink: string; rule: string; nameColor: string; titleColor: string; nameFont: string; titleFont: string; width?: number; nameUppercase?: boolean; ruleWidth?: number;
}) {
  return (
    <div style={{ width, textAlign: "center" }}>
      <div style={{ position: "relative", height: 64 }}>
        <div style={{ fontFamily: fonts.signature, fontSize: 52, lineHeight: "64px", color: ink, whiteSpace: "nowrap", transform: "rotate(-4deg)" }}>{signatory.name}</div>
        <svg aria-hidden width={width} height={64} viewBox={`0 0 ${width} 64`} style={{ position: "absolute", inset: 0 }}>
          <path d={`M ${width * 0.18} 54 C ${width * 0.4} 46, ${width * 0.62} 60, ${width * 0.86} 44`} fill="none" stroke={ink} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
        </svg>
      </div>
      <div style={{ height: 1.5, width: ruleWidth ?? width, margin: "2px auto 8px", background: rule }} />
      <div style={{ fontFamily: nameFont, fontSize: 15, fontWeight: 700, color: nameColor, letterSpacing: nameUppercase ? 1.5 : 0.2, textTransform: nameUppercase ? "uppercase" : "none" }}>{signatory.name}</div>
      {signatory.title && <div style={{ fontFamily: titleFont, fontSize: 12.5, color: titleColor, marginTop: 3 }}>{signatory.title}</div>}
    </div>
  );
}

/** "CREDENTIAL ID" caption over the serial, centred in a fixed-width column. */
export function Credential({ id, font, labelColor, valueColor, width = 180 }: { id: string; font: string; labelColor: string; valueColor: string; width?: number }) {
  return (
    <div style={{ width, textAlign: "center", fontFamily: font }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: labelColor }}>CREDENTIAL ID</div>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.8, color: valueColor, marginTop: 4, whiteSpace: "nowrap" }}>{id}</div>
    </div>
  );
}

/** Diagonal watermark for admin previews; real credentials never show it. */
export function SampleMark({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
      <div style={{ transform: "rotate(-24deg)", fontFamily: fonts.poppins, fontWeight: 800, fontSize: 150, letterSpacing: 24, color: "rgba(220, 38, 38, 0.13)" }}>SAMPLE</div>
    </div>
  );
}

/** Fixed-size page every template draws into. */
export function Page({ background, color, children }: { background: string; color: string; children: ReactNode }) {
  return (
    <div style={{ position: "relative", width: 1123, height: 794, overflow: "hidden", background, color, boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

export const abs = (left: number, top: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", left, top, ...extra });

/** A full-width row at `top` whose content is horizontally centred on the page. */
export function Center({ top, children, style }: { top: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", textAlign: "center", ...style }}>{children}</div>;
}

/**
 * Per-instance prefix for SVG gradient/clip ids. The same template is mounted several times at once
 * (thumbnail, preview, export copy), and duplicate ids make url(#…) resolve to the wrong element.
 */
export function useSvgId() {
  const raw = useId();
  return (name: string) => `c${raw.replace(/[^a-zA-Z0-9_-]/g, "")}-${name}`;
}

/** SVG path for an n-pointed star centred on (cx, cy). */
export function starPath(cx: number, cy: number, outer: number, inner = outer * 0.45, points = 5) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (Math.PI * i) / points;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Logo served from /public; a same-origin <img> so exports can inline it. */
export function Logo({ size, style }: { size: number; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- must stay a plain <img> for html-to-image capture
  return <img src="/myloginn-logo.png" alt="" width={size} height={size} style={{ display: "block", width: size, height: size, ...style }} />;
}
