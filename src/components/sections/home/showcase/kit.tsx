"use client";

import { useClock } from "@/lib/useClock";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { BatteryFull, ChevronLeft, ChevronRight, Lock, Minus, RotateCw, Signal, Square, Wifi, X, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

export const EASE = [0.16, 1, 0.3, 1] as const;
export const ROYAL = "#1f56d6";
export const GREEN = "#16a34a";
export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/* ---------------------------------------------------------------------------------------------------- */
/* Timeline hooks: every page plays like a real session the moment it appears.                          */
/* ---------------------------------------------------------------------------------------------------- */

/** Counts 0 … last, one step every `ms`, then holds. Reduced motion jumps to the end. */
export function useSteps(last: number, ms: number) {
  const reduced = useReducedMotion();
  const [s, setS] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setS((x) => (x >= last ? x : x + 1)), ms);
    return () => window.clearInterval(id);
  }, [reduced, last, ms]);
  return reduced ? last : s;
}

/** Types `text` out character by character. */
export function useTyped(text: string, speed = 55, delay = 300) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let id = 0;
    const t = window.setTimeout(() => {
      id = window.setInterval(() => setN((x) => (x >= text.length ? x : x + 1)), speed);
    }, delay);
    return () => { window.clearTimeout(t); window.clearInterval(id); };
  }, [reduced, text, speed, delay]);
  return reduced ? text : text.slice(0, n);
}

/** A value that drifts like a live metric. */
export function useLive(base: number, spread: number, ms: number) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(base);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setV((x) => Math.max(0, Math.round(x + (Math.random() - 0.4) * spread))), ms);
    return () => window.clearInterval(id);
  }, [reduced, spread, ms]);
  return v;
}

export function CountUp({ to, from = 0, duration = 1.3, delay = 0.2, format = fmt }: { to: number; from?: number; duration?: number; delay?: number; format?: (n: number) => string }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(reduced ? to : from);
  const text = useTransform(mv, format);
  useEffect(() => {
    if (reduced) { mv.set(to); return; }
    const c = animate(mv, to, { duration, delay, ease: EASE });
    return () => c.stop();
  }, [to, duration, delay, reduced, mv]);
  return <motion.span>{text}</motion.span>;
}

/* ---------------------------------------------------------------------------------------------------- */
/* Small UI parts used inside the pages                                                                  */
/* ---------------------------------------------------------------------------------------------------- */

export function Caret() {
  return <motion.span className="ml-px inline-block h-[1em] w-px translate-y-[2px] bg-current" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />;
}

export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <motion.span className={cn("inline-block shrink-0 rounded-full border-2 border-white/40", className)} style={{ borderTopColor: "#fff" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />;
}

export function Pill({ color, children }: { color: string; children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[9px] font-semibold" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}><span className="h-1 w-1 rounded-full bg-current" />{children}</span>;
}

export function Bars({ values, color = ROYAL, className = "", delay = 0.2 }: { values: number[]; color?: string; className?: string; delay?: number }) {
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {values.map((h, i) => (
        <motion.span key={i} className="flex-1 rounded-t-sm" style={{ background: color, opacity: 0.35 + (i / values.length) * 0.65 }} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: delay + i * 0.05, duration: 0.6, ease: EASE }} />
      ))}
    </div>
  );
}

/**
 * A smooth line chart. The line is revealed by a wipe (not by stroke drawing, which breaks on stretched charts),
 * the area fades in underneath, and a pulsing dot marks the latest value.
 */
export function Line({ points, color = ROYAL, className = "", fill = true, delay = 0.2 }: { points: number[]; color?: string; className?: string; fill?: boolean; delay?: number }) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const xy = points.map((v, i) => [(i / (points.length - 1)) * 100, 100 - v] as const);
  // Catmull-Rom → cubic Bézier, for a smooth curve through every point
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 0; i < xy.length - 1; i++) {
    const p0 = xy[Math.max(0, i - 1)], p1 = xy[i], p2 = xy[i + 1], p3 = xy[Math.min(xy.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  const last = xy[xy.length - 1];
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <clipPath id={`wipe-${id}`}>
            <motion.rect x="0" y="-10" height="120" initial={{ width: reduced ? 100 : 0 }} animate={{ width: 100 }} transition={{ delay, duration: 1.3, ease: EASE }} />
          </clipPath>
        </defs>
        <g clipPath={`url(#wipe-${id})`}>
          {fill && <path d={`${d} L100 100 L0 100 Z`} fill={color} opacity={0.1} />}
          <path d={d} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </svg>
      {/* the latest value: an HTML dot, so it stays perfectly round however the chart is stretched */}
      <motion.span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{ left: `${last[0]}%`, top: `${last[1]}%`, background: color, boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)` }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ delay: delay + 1.2, duration: 0.4 }}
      />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-[#e6ebf3] bg-white", className)}>{children}</div>;
}

export function Kpi({ label, to, format, delay = 0.15, tint = ROYAL }: { label: string; to: number; format?: (n: number) => string; delay?: number; tint?: string }) {
  return (
    <Card className="p-2">
      <p className="text-[9px] text-[#64748b]">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold leading-none" style={{ color: tint === ROYAL ? "#0b1f4d" : tint }}><CountUp to={to} format={format} delay={delay} /></p>
    </Card>
  );
}

/** A toast that slides in from the top right. */
export function Toast({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: -10, x: 10 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="absolute right-2 top-2 z-20 flex items-center gap-1.5 rounded-lg border border-[#e6ebf3] bg-white px-2 py-1.5 text-[10px] font-semibold shadow-[0_10px_24px_-10px_rgba(11,31,77,0.4)]">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------------------------------------- */
/* Frames                                                                                                */
/* ---------------------------------------------------------------------------------------------------- */

const ALUMINIUM = "linear-gradient(145deg, #f1f4f7 0%, #bcc3cd 38%, #e6eaef 62%, #a2aab6 100%)";
const TITANIUM = "linear-gradient(160deg, #d9dbdf 0%, #a3a7af 100%)";
const SHADOW = "0 26px 44px -26px rgba(11,31,77,0.38), 0 6px 14px -8px rgba(11,31,77,0.18)";

/** A browser window: tab, address bar that follows the page, and the page itself. */
export function BrowserFrame({ url, title, children }: { url: string; title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dfe5ee] bg-white" style={{ boxShadow: SHADOW }}>
      <div className="flex items-end gap-2 bg-[#eef2f7] px-3 pt-2">
        <span className="mb-2 flex gap-1"><span className="h-2 w-2 rounded-full bg-[#ff5f57]" /><span className="h-2 w-2 rounded-full bg-[#febc2e]" /><span className="h-2 w-2 rounded-full bg-[#28c840]" /></span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-1.5 rounded-t-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-[#334155]">
            <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-[#1f56d6] to-[#22d3ee]" />{title}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 border-b border-[#e6ebf3] px-3 py-1.5">
        <span className="flex text-[#94a3b8]"><ChevronLeft className="h-3 w-3" /><ChevronRight className="h-3 w-3" /></span>
        <RotateCw className="h-3 w-3 text-[#94a3b8]" />
        <span className="flex flex-1 items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-[10px] text-[#475569]">
          <Lock className="h-2.5 w-2.5 text-[#16a34a]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{url}</motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

/** A native desktop application window. */
export function AppFrame({ app, children }: { app: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dfe5ee] bg-white" style={{ boxShadow: SHADOW }}>
      <div className="flex h-8 items-center gap-2 border-b border-[#e6ebf3] bg-[#f6f8fb] pl-3 text-[11px] font-semibold text-[#334155]">
        <span className="grid h-4 w-4 place-items-center rounded bg-[#0b1f4d]"><span className="h-2 w-2 rounded-sm bg-[#22d3ee]" /></span>
        {app}
        <span className="ml-auto flex h-full text-[#64748b]">
          <span className="grid w-9 place-items-center"><Minus className="h-3 w-3" /></span>
          <span className="grid w-9 place-items-center"><Square className="h-2.5 w-2.5" /></span>
          <span className="grid w-9 place-items-center"><X className="h-3 w-3" /></span>
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

/** Soft specular reflection across a device's glass, plus a faint edge falloff, so screens read as real glass. */
export function GlassGlare() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        background: "linear-gradient(118deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.13) 42%, rgba(255,255,255,0.04) 52%, rgba(255,255,255,0) 60%)",
        boxShadow: "inset 0 0 22px rgba(11,18,32,0.10), inset 0 0 0 0.5px rgba(11,18,32,0.14)",
      }}
    />
  );
}

/**
 * Draws a phone screen on a fixed logical canvas (200px wide) and scales it to whatever size the frame is, so the
 * layout, text and spacing look identical on a small phone and a big one: nothing wraps, clips or crowds.
 */
const SCREEN_W = 224;

function ScaledScreen({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = size.w / SCREEN_W || 1;
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <GlassGlare />
      <div className="relative flex flex-col" style={{ width: SCREEN_W, height: size.h / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

/** A realistic phone: titanium edge, black bezel, side buttons and Dynamic Island. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const clock = useClock();
  const btn = { background: TITANIUM } as const;
  return (
    <div className="relative h-full" style={{ aspectRatio: "9 / 18.5" }}>
      <span aria-hidden className="absolute -left-[2px] top-[18%] h-[4%] w-[3px] rounded-l-sm" style={btn} />
      <span aria-hidden className="absolute -left-[2px] top-[25%] h-[8%] w-[3px] rounded-l-sm" style={btn} />
      <span aria-hidden className="absolute -left-[2px] top-[35%] h-[8%] w-[3px] rounded-l-sm" style={btn} />
      <span aria-hidden className="absolute -right-[2px] top-[28%] h-[12%] w-[3px] rounded-r-sm" style={btn} />
      <div className="h-full rounded-[2.2rem] p-[1.5px]" style={{ background: TITANIUM, boxShadow: SHADOW }}>
        <div className="h-full rounded-[2.1rem] bg-[#0a0c10] p-[3.5px]">
          <div className="relative h-full overflow-hidden rounded-[1.95rem] bg-white">
            <ScaledScreen>
              <span className="absolute left-1/2 top-2 z-30 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
              <div className="flex h-8 shrink-0 items-center justify-between px-5 pt-1 text-[10px] font-semibold text-[#0b1220]">
                <span className="tabular-nums">{clock.slice(0, -3)}<span className="ml-px text-[7px]">{clock.slice(-2)}</span></span>
                <span className="flex items-center gap-1"><Signal className="h-3 w-3" strokeWidth={2.6} /><Wifi className="h-3 w-3" strokeWidth={2.6} /><BatteryFull className="h-3.5 w-3.5" /></span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
              <span className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-[#0b1220]/80" />
            </ScaledScreen>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------- */
/* Flow graph: an agent workflow drawn at a fixed aspect ratio, so lines, nodes and pulses never distort */
/* ---------------------------------------------------------------------------------------------------- */

export type FlowNode = { id: string; x: number; y: number; label: string; icon: LucideIcon; core?: boolean; hot?: boolean };

export function FlowGraph({ w, h, nodes, links, small = false }: { w: number; h: number; nodes: FlowNode[]; links: [number, number][]; small?: boolean }) {
  const reduced = useReducedMotion();
  const stroke = small ? 1.6 : 2.2;
  const curve = (a: FlowNode, b: FlowNode) => {
    const mx = (a.x + b.x) / 2;
    return `M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  };
  return (
    <div className="relative mx-auto h-full max-w-full" style={{ aspectRatio: `${w} / ${h}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {links.map(([a, b], k) => {
          const d = curve(nodes[a], nodes[b]);
          const begin = `${1 + k * 0.3}s`;
          return (
            <g key={k}>
              <path d={d} fill="none" stroke="#dbe4f3" strokeWidth={stroke} />
              {/* the connection draws itself in … */}
              <motion.path d={d} fill="none" stroke={ROYAL} strokeWidth={stroke} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25 + k * 0.15, duration: 0.7, ease: EASE }} />
              {!reduced && (
                <>
                  {/* … then a current flows along it … */}
                  <motion.path
                    d={d} fill="none" stroke="#ffffff" strokeWidth={stroke} strokeLinecap="round" strokeDasharray="2 10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9, strokeDashoffset: [0, -24] }}
                    transition={{ opacity: { delay: 1 + k * 0.15, duration: 0.4 }, strokeDashoffset: { duration: 0.9, repeat: Infinity, ease: "linear" } }}
                  />
                  {/* … and a data pulse travels from one end to the other */}
                  <circle r={small ? 2.6 : 3.6} fill="#22d3ee" opacity="0" style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.9))" }}>
                    <animateMotion dur="1.8s" begin={begin} repeatCount="indefinite" path={d} calcMode="linear" />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="1.8s" begin={begin} repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const Icon = n.icon;
        const box = n.core ? (small ? "h-10 w-10" : "h-14 w-14") : small ? "h-6 w-6" : "h-9 w-9";
        return (
          <motion.div
            key={n.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${(n.x / w) * 100}%`, top: `${(n.y / h) * 100}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: n.hot && !n.core ? 1.12 : 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
          >
            <span
              className={cn("relative grid place-items-center rounded-xl transition-colors duration-300", box, n.core ? "text-white" : n.hot ? "border border-[#1f56d6] bg-[#eef3ff]" : "border border-[#e6ebf3] bg-white shadow-sm")}
              style={n.core ? { background: `linear-gradient(135deg, ${ROYAL}, #2f6fed)`, boxShadow: "0 10px 24px -10px rgba(31,86,214,0.8)" } : undefined}
            >
              {n.core && !reduced && <motion.span aria-hidden className="absolute inset-0 rounded-xl" animate={{ boxShadow: ["0 0 0 0 rgba(47,111,237,0.45)", "0 0 0 14px rgba(47,111,237,0)"] }} transition={{ duration: 1.8, repeat: Infinity }} />}
              <Icon className={n.core ? (small ? "h-5 w-5" : "h-7 w-7") : small ? "h-3 w-3" : "h-4 w-4"} style={n.core ? undefined : { color: ROYAL }} />
            </span>
            <span className={cn("whitespace-nowrap font-semibold", small ? "text-[6px]" : "text-[10px]", n.hot ? "text-[#1f56d6]" : "text-[#64748b]")}>{n.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** A realistic Android phone: flat graphite frame, punch-hole camera and gesture bar. */
export function AndroidFrame({ children }: { children: ReactNode }) {
  const clock = useClock();
  const btn = { background: "#4b5160" } as const;
  return (
    <div className="relative h-full" style={{ aspectRatio: "9 / 19" }}>
      <span aria-hidden className="absolute -right-[2px] top-[20%] h-[10%] w-[3px] rounded-r-sm" style={btn} />
      <span aria-hidden className="absolute -right-[2px] top-[33%] h-[6%] w-[3px] rounded-r-sm" style={btn} />
      <div className="h-full rounded-[1.6rem] p-[1.5px]" style={{ background: "linear-gradient(160deg, #5a606d, #2a2f38)", boxShadow: SHADOW }}>
        <div className="h-full rounded-[1.5rem] bg-[#0a0c10] p-[3px]">
          <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-white">
            <ScaledScreen>
              <span className="absolute left-1/2 top-2 z-30 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black ring-2 ring-[#1f232b]" />
              <div className="flex h-7 shrink-0 items-center justify-between px-4 pt-0.5 text-[10px] font-medium text-[#0b1220]">
                <span className="tabular-nums">{clock.slice(0, -3)}<span className="ml-px text-[7px]">{clock.slice(-2)}</span></span>
                <span className="flex items-center gap-1"><Wifi className="h-3 w-3" strokeWidth={2.6} /><Signal className="h-3 w-3" strokeWidth={2.6} /><BatteryFull className="h-3.5 w-3.5" /></span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
              <span className="absolute bottom-1.5 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#0b1220]/60" />
            </ScaledScreen>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ALUMINIUM };

/* ---------------------------------------------------------------------------------------------------- */
/* The tour: pages that advance on their own, with a clickable page list                                 */
/* ---------------------------------------------------------------------------------------------------- */

export type TourPage = { label: string; icon: LucideIcon; url?: string; Page: () => ReactNode };

const PAGE_MS = 4200;

/**
 * Plays a service as a product tour: each page animates in (and plays its own session), then the next page takes
 * over. The page list below the frame shows where you are and jumps straight to a page; hovering pauses the tour.
 */
export function Tour({ pages, play, frame }: { pages: TourPage[]; play: boolean; frame: (page: TourPage, content: ReactNode) => ReactNode }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const tourId = useId();
  const page = pages[i];

  useEffect(() => {
    if (!play || hold || reduced) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % pages.length), PAGE_MS);
    return () => window.clearTimeout(t);
  }, [i, play, hold, reduced, pages.length]);

  const content = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={page.label}
        className="absolute inset-0"
        initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -24, filter: "blur(6px)" }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <page.Page />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="flex h-full flex-col gap-3" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="relative min-h-0 flex-1">{frame(page, content)}</div>
      <div role="tablist" aria-label="Pages" className="flex flex-wrap justify-center gap-1.5">
        {pages.map((p, k) => {
          const on = k === i;
          const Icon = p.icon;
          return (
            <motion.button
              key={p.label}
              type="button"
              role="tab"
              aria-selected={on}
              data-magnetic=""
              onClick={() => setI(k)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "group relative flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300",
                on ? "text-white" : "bg-white/60 text-[#64748b] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(11,31,77,0.08),0_4px_12px_-8px_rgba(11,31,77,0.3)] backdrop-blur-md",
              )}
            >
              {/* one dark pill that glides to the active page */}
              {on && <motion.span layoutId={`tour-tab-${tourId}`} className="absolute inset-0 rounded-full bg-[#1f56d6] shadow-[0_8px_18px_-10px_rgba(31,86,214,0.7)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon className="relative h-3 w-3" />
              <span className="relative">{p.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** The area each tour plays in: no box or background — the devices and windows sit directly on the page. */
export function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/**
 * Renders a full-size page shrunk to fit its container, like a real screen: the page is laid out at `width` CSS
 * pixels and scaled down uniformly, so its proportions, type and graphics stay exactly as designed.
 */
export function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = box.w ? box.w / width : 0;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <GlassGlare />
      {k > 0 && (
        <div className="absolute left-0 top-0 origin-top-left bg-white text-[#0b1f4d]" style={{ width, height: box.h / k, transform: `scale(${k})` }}>
          {children}
        </div>
      )}
    </div>
  );
}
