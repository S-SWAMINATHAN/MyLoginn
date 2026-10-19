"use client";

import { useClock } from "@/lib/useClock";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BatteryFull, ChevronLeft, ChevronRight, Lock, Minus, RotateCw, Signal, Square, Wifi, X } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { DeviceId, Scenario } from "@/components/sections/hero/heroScenarios";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------------------------------------------- */
/* Layout: the showroom is drawn on a fixed canvas and scaled to fit. Wide screens get the panoramic    */
/* arrangement (tablet · monitor · phone in a row); narrow screens get a stacked arrangement.            */
/* ---------------------------------------------------------------------------------------------------- */

type Placement = { style: CSSProperties; turn: number; name: string };
/** `monitorBottom` is where the monitor ends on the canvas; the call-to-action buttons sit just below it. */
type Layout = { w: number; h: number; monitorBottom: number; devices: Record<DeviceId, Placement> };

const WIDE: Layout = {
  // the monitor centred, with a small, even gap to the angled tablet and phone either side
  w: 890,
  h: 320,
  monitorBottom: 238,
  devices: {
    tablet: { style: { left: 16, top: 96, width: 236 }, turn: 34, name: "Tablet" },
    desktop: { style: { left: 241, top: 6, width: 408 }, turn: 0, name: "Desktop" },
    phone: { style: { left: 649, top: 50, width: 128 }, turn: -34, name: "Phone" },
  },
};

const COMPACT: Layout = {
  // phones: a slider — one device at a time, facing forward, as large as fits
  w: 400,
  h: 272,
  monitorBottom: 250,
  devices: {
    desktop: { style: { left: 8, top: 28, width: 384 }, turn: 0, name: "Desktop" },
    tablet: { style: { left: 50, top: 14, width: 300 }, turn: 0, name: "Tablet" },
    phone: { style: { left: 134, top: 4, width: 132 }, turn: 0, name: "Phone" },
  },
};

/** On phones each device is shown on its own for this long before the next slides in. */
const SLIDE_MS = 2200;
const SLIDES: DeviceId[] = ["desktop", "tablet", "phone"];
const DEVICE_NAMES: Record<DeviceId, string> = { desktop: "Desktop", tablet: "Tablet", phone: "Phone" };

const MOTES = [
  { x: "8%", y: "70%", s: 4, d: 7, delay: 0 }, { x: "22%", y: "18%", s: 3, d: 9, delay: 2 }, { x: "48%", y: "86%", s: 3, d: 8, delay: 1 },
  { x: "70%", y: "12%", s: 4, d: 10, delay: 3 }, { x: "88%", y: "64%", s: 3, d: 7, delay: 1.5 }, { x: "36%", y: "48%", s: 2, d: 11, delay: 4 },
];

/* ---------- real hardware: metal edges, black glass bezels ---------- */

const ALUMINIUM = "linear-gradient(145deg, #f1f4f7 0%, #bcc3cd 38%, #e6eaef 62%, #a2aab6 100%)";
const SPACE_GREY = "linear-gradient(145deg, #c9ced6 0%, #6b7280 45%, #a8afba 70%, #4b5160 100%)";
const TITANIUM = "linear-gradient(150deg, #dde1e7 0%, #7c8492 40%, #bcc2cb 65%, #5a6170 100%)";
const BEZEL = "#06080c";
const BODY_SHADOW = "0 34px 60px -26px rgba(11,31,77,0.5), 0 12px 24px -12px rgba(11,31,77,0.3)";

/** A device body: a thin metal edge around a black glass bezel, with a soft contact shadow underneath. */
function Hardware({ finish, radius, edge, bezel, extras, children }: { finish: string; radius: number; edge: number; bezel: number; extras?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative w-full">
      {extras}
      <div style={{ borderRadius: radius, padding: edge, background: finish, boxShadow: BODY_SHADOW }}>
        <div className="relative" style={{ borderRadius: radius - edge, padding: bezel, background: BEZEL, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
          {children}
        </div>
      </div>
      <div aria-hidden className="mx-auto mt-2 h-3 w-[78%] rounded-[50%] bg-[rgba(11,31,77,0.18)] blur-[7px]" />
    </div>
  );
}

/** A faint reflection across the glass, as on a real screen. */
function Sheen({ flash = false }: { flash?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <>
      {/* pointing at the device catches the light once, straight away */}
      {flash && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-30 w-1/2 -skew-x-12"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
          initial={{ left: "-60%" }}
          animate={{ left: "160%" }}
          transition={{ duration: 0.9, ease: [0.45, 0, 0.2, 1] }}
        />
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-30" style={{ background: "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.14) 44%, rgba(255,255,255,0.03) 54%, transparent 64%)" }} />
      {/* a band of studio light sweeping across the glass */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-30 w-1/3 -skew-x-12"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }}
          initial={{ left: "-40%" }}
          animate={{ left: ["-40%", "140%"] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 5.5, delay: 2.2 }}
        />
      )}
    </>
  );
}

/** Screens that are not being explored dim slightly, the way an idle device does. */
function Dim({ on }: { on: boolean }) {
  return <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[#0b1f4d]" initial={false} animate={{ opacity: on ? 0.12 : 0 }} transition={{ duration: 0.45 }} />;
}

function Ripple({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.span aria-hidden className="pointer-events-none absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-story-royal" style={{ left: `${x}%`, top: `${y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2.2], opacity: [0.7, 0] }} transition={{ delay, duration: 0.6, ease: "easeOut" }} />
  );
}

function Cursor({ x, y }: { x: number; y: number }) {
  return (
    <>
      <motion.div aria-hidden className="pointer-events-none absolute z-20" initial={{ left: "62%", top: "32%", opacity: 0 }} animate={{ left: `${x}%`, top: `${y}%`, opacity: 1 }} transition={{ delay: 0.4, duration: 0.9, ease: EASE }}>
        <motion.svg width="11" height="15" viewBox="0 0 12 16" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" animate={{ scale: [1, 0.8, 1] }} transition={{ delay: 1.3, duration: 0.25 }}>
          <path d="M1 1 L1 13.2 L4 10.4 L6.4 15 L8.6 14 L6.3 9.4 L10.6 9.4 Z" fill="#111" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
      <Ripple x={x + 1} y={y + 1} delay={1.35} />
    </>
  );
}

function Tap({ x, y, delay = 1 }: { x: number; y: number; delay?: number }) {
  return (
    <>
      <motion.span aria-hidden className="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(11,31,77,0.28)] ring-2 ring-white/70" style={{ left: `${x}%`, top: `${y}%` }} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: [1.6, 1, 0.85, 1], opacity: [0, 0.9, 0.9, 0] }} transition={{ delay, duration: 0.9, times: [0, 0.35, 0.55, 1] }} />
      <Ripple x={x} y={y} delay={delay + 0.35} />
    </>
  );
}

function StatusBar({ wide }: { wide?: boolean }) {
  const clock = useClock();
  return (
    <div className={`relative z-10 flex h-4 items-center justify-between text-[7px] font-semibold text-[#0b1220] ${wide ? "px-3" : "px-[10px]"}`}>
      <span className="tabular-nums">{clock.slice(0, -3)}<span className="ml-px text-[5px]">{clock.slice(-2)}</span></span>
      <span className="flex items-center gap-[3px]"><Signal className="h-2 w-2" strokeWidth={3} /><Wifi className="h-2 w-2" strokeWidth={3} /><BatteryFull className="h-2.5 w-2.5" strokeWidth={2.4} /></span>
    </div>
  );
}

function Screen({ scenario, device }: { scenario: Scenario; device: DeviceId }) {
  const Content = scenario.screens[device];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={`${scenario.id}-${scenario.url}`} initial={{ opacity: 0, scale: 0.965 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: 0.3, ease: EASE }} className="h-full">
        <Content />
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- the three devices ---------- */

type FrameProps = { scenario: Scenario; dim: boolean; play: boolean; flash: boolean; children: ReactNode };

function MonitorFrame({ scenario, dim, play, flash, children }: FrameProps) {
  const t = scenario.touches.desktop;
  return (
    <Hardware finish={ALUMINIUM} radius={14} edge={2.5} bezel={7}>
      <span aria-hidden className="absolute left-1/2 top-[2px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#2b313d]" />
        <div className="relative overflow-hidden rounded-[5px] bg-white">
          {scenario.app ? (
            // a native application window: title and window controls instead of a browser bar
            <div className="flex h-[22px] items-center gap-2 border-b border-[#e3e7ee] bg-[#f6f8fb] pl-2">
              <span className="grid h-3 w-3 place-items-center rounded-[3px] bg-story-navy"><span className="h-1.5 w-1.5 rounded-[1px] bg-story-cyan" /></span>
              <span className="text-[7px] font-semibold text-[#4b5565]">{scenario.url}</span>
              <span className="ml-auto flex h-full text-[#6b7280]">
                <span className="grid w-6 place-items-center"><Minus className="h-2.5 w-2.5" /></span>
                <span className="grid w-6 place-items-center"><Square className="h-2 w-2" /></span>
                <span className="grid w-6 place-items-center hover:bg-[#e81123] hover:text-white"><X className="h-2.5 w-2.5" /></span>
              </span>
            </div>
          ) : (
            <div className="flex h-[22px] items-center gap-2 border-b border-[#e3e7ee] bg-[#f6f8fb] px-2">
              <span className="flex gap-[3px]"><span className="h-[6px] w-[6px] rounded-full bg-[#ff5f57]" /><span className="h-[6px] w-[6px] rounded-full bg-[#febc2e]" /><span className="h-[6px] w-[6px] rounded-full bg-[#28c840]" /></span>
              <span className="flex text-[#9aa3b2]"><ChevronLeft className="h-2.5 w-2.5" /><ChevronRight className="h-2.5 w-2.5" /></span>
              <span className="mx-auto flex h-[14px] w-[58%] items-center justify-center gap-1 rounded-[4px] bg-white text-[7px] text-[#4b5565] shadow-[inset_0_0_0_1px_#e3e7ee]"><Lock className="h-[7px] w-[7px]" />{scenario.url}</span>
              <RotateCw className="h-2.5 w-2.5 text-[#9aa3b2]" />
            </div>
          )}
          <div className="relative h-[186px]">
            {children}
            {play && <Cursor key={`${scenario.id}-${scenario.url}`} x={t.x} y={t.y} />}
          </div>
          <Sheen flash={flash} />
          <Dim on={dim} />
        </div>
    </Hardware>
  );
}

function TabletFrame({ scenario, dim, play, flash, children }: FrameProps) {
  const t = scenario.touches.tablet;
  return (
    <Hardware finish={SPACE_GREY} radius={20} edge={2} bezel={8} extras={<span aria-hidden className="absolute -top-[1.5px] right-10 h-[2px] w-7 rounded-full" style={{ background: SPACE_GREY }} />}>
      <span aria-hidden className="absolute left-1/2 top-[3px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#2b313d]" />
        <div className="relative overflow-hidden rounded-[11px] bg-white">
          <StatusBar wide />
          <div className="relative h-[156px]">
            {children}
            {play && <Tap key={`${scenario.id}-${scenario.url}`} x={t.x} y={t.y} delay={1.1} />}
          </div>
          <span className="absolute bottom-[3px] left-1/2 h-[2.5px] w-14 -translate-x-1/2 rounded-full bg-[#0b1220]/60" />
          <Sheen flash={flash} />
          <Dim on={dim} />
        </div>
    </Hardware>
  );
}

function PhoneFrame({ scenario, dim, play, flash, children }: FrameProps) {
  const t = scenario.touches.phone;
  return (
    <Hardware
      finish={TITANIUM}
      radius={28}
      edge={2}
      bezel={4}
      extras={
        <>
          {/* action, volume and side buttons */}
          <span aria-hidden className="absolute -left-[2px] top-[50px] h-[10px] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
          <span aria-hidden className="absolute -left-[2px] top-[70px] h-[22px] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
          <span aria-hidden className="absolute -left-[2px] top-[98px] h-[22px] w-[3px] rounded-l-sm" style={{ background: TITANIUM }} />
          <span aria-hidden className="absolute -right-[2px] top-[80px] h-[34px] w-[3px] rounded-r-sm" style={{ background: TITANIUM }} />
        </>
      }
    >
        <div className="relative overflow-hidden rounded-[22px] bg-white">
          <span className="absolute left-1/2 top-[5px] z-40 h-[10px] w-[28px] -translate-x-1/2 rounded-full bg-black" />
          <StatusBar />
          <div className="relative h-[226px]">
            {children}
            {play && <Tap key={`${scenario.id}-${scenario.url}`} x={t.x} y={t.y} delay={1.5} />}
          </div>
          <span className="absolute bottom-[4px] left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-[#0b1220]/70" />
          <Sheen flash={flash} />
          <Dim on={dim} />
        </div>
    </Hardware>
  );
}

const FRAMES: Record<DeviceId, (p: FrameProps) => ReactNode> = { desktop: MonitorFrame, tablet: TabletFrame, phone: PhoneFrame };

type Props = {
  scenario: Scenario;
  focus: DeviceId;
  exploring: boolean;
  onExplore: (device: DeviceId) => void;
  onLeave: () => void;
  introDelay?: number;
  /** Rendered centred just below the monitor (at real size, not scaled with the devices); under the devices on narrow screens. */
  below?: ReactNode;
  /** Narrow screens: a sideways swipe across the devices moves to the next (1) or previous (-1) service. */
  onSwipe?: (dir: 1 | -1) => void;
};

/**
 * The hero showroom: three realistic devices — tablet, monitor and phone — on a white stage. The device for the current service is brought forward; pointing at (or tapping, or focusing) a device pauses
 * the tour and lets the visitor explore it. The scene leans gently towards the pointer — it never floats on its own.
 */
export function HeroShowroom({ scenario, focus, exploring, onExplore, onLeave, introDelay = 0, below, onSwipe }: Props) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  // unknown until measured: the server cannot know the screen size, so the stage reserves its height with CSS until then
  const [measured, setMeasured] = useState<number | null>(null);
  const width = measured ?? 1000;
  const touched = useRef(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const layout = width < 700 ? COMPACT : WIDE;
  const wide = layout === WIDE;
  const scale = Math.min(wide ? 1.15 : 1.25, width / layout.w);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 20 });
  const sy = useSpring(py, { stiffness: 90, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [3, -3]);

  // measured before the first paint, so a phone never sees the desktop arrangement
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setMeasured(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setMeasured(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // after a tap there is no "mouse leaves", so a tap elsewhere or a few idle seconds resumes the tour
  useEffect(() => {
    if (!exploring || !touched.current) return;
    const away = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) onLeave(); };
    const idle = window.setTimeout(onLeave, 9000);
    document.addEventListener("pointerdown", away);
    return () => { window.clearTimeout(idle); document.removeEventListener("pointerdown", away); };
  }, [exploring, focus, onLeave]);

  const order: DeviceId[] = ["tablet", "desktop", "phone"];

  // phones: which device the slider shows; each service starts again on the monitor
  const [slide, setSlide] = useState(0);
  const [slideFor, setSlideFor] = useState(scenario.id);
  if (slideFor !== scenario.id) { setSlideFor(scenario.id); setSlide(0); }
  useEffect(() => {
    if (wide || reduced || slide >= SLIDES.length - 1) return;
    const t = window.setTimeout(() => setSlide((n) => n + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [wide, reduced, slide, scenario.id]);
  const step = (dir: 1 | -1) => {
    const next = slide + dir;
    if (next < 0 || next >= SLIDES.length) onSwipe?.(dir); // past either end: the previous or next service
    else setSlide(next);
  };

  return (
    <div ref={wrapRef} className="relative mx-auto w-full">
    <div
      className={`relative w-full select-none ${measured === null ? "invisible aspect-[400/272] min-[700px]:aspect-[890/330]" : ""}`}
      style={{ height: measured === null ? undefined : layout.h * scale, touchAction: wide ? undefined : "pan-y" }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y) * 1.5) {
          if (!wide) step(dx < 0 ? 1 : -1);
          else onSwipe?.(dx < 0 ? 1 : -1);
        }
      }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { px.set(0); py.set(0); onLeave(); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onLeave(); }}
    >
      {/* soft spotlight behind the device on show */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[5%] h-[80%] w-[45%] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(47,111,237,0.22), rgba(34,211,238,0.08), transparent)" }}
          animate={{ left: "27%" }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      )}
      {/* a few slow light motes for depth */}
      {!reduced && MOTES.map((m, k) => (
        <motion.span
          key={k}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-[#7fb2ff]"
          style={{ left: m.x, top: m.y, width: m.s, height: m.s, filter: "blur(0.5px)" }}
          animate={{ y: [0, -18, 0], opacity: [0, 0.55, 0] }}
          transition={{ duration: m.d, repeat: Infinity, delay: m.delay, ease: "easeInOut" }}
        />
      ))}
      {/* the camera: a slow push-in as the scene opens */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE, delay: Math.max(0, introDelay - 0.4) }}
        style={{ transformOrigin: "50% 30%" }}
      >
      <div className="absolute left-1/2 top-0" style={{ width: layout.w, height: layout.h, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center", perspective: 1400 }}>
        <motion.div className="relative h-full w-full" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformStyle: "preserve-3d" }}>
          {order.map((id, k) => {
            const { style, turn, name } = layout.devices[id];
            const Frame = FRAMES[id];
            // phones: only the current slide is shown; the others wait to its left or right
            const offset = wide ? 0 : SLIDES.indexOf(id) - slide;
            const active = wide ? id === focus : offset === 0;
            const keyActivate = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onExplore(id); } };
            return (
              <motion.div
                key={id}
                role={wide ? "button" : undefined}
                tabIndex={wide || active ? 0 : -1}
                aria-hidden={!wide && !active ? true : undefined}
                aria-label={`${name}: ${scenario.area}. Explore this device`}
                aria-pressed={active && exploring}
                onPointerEnter={(e) => { if (wide && e.pointerType === "mouse") onExplore(id); }}
                onPointerDown={(e) => { touched.current = e.pointerType !== "mouse"; }}
                onClick={() => { if (wide) onExplore(id); }}
                onFocus={() => { if (wide) onExplore(id); }}
                onKeyDown={wide ? keyActivate : undefined}
                className="absolute cursor-pointer rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-story-royal focus-visible:ring-offset-4"
                // each side device has its own close perspective, so its 3D angle reads clearly: the tablet's screen faces
                // right and the phone's faces left — the two screens face each other across the monitor
                style={{ ...style, transformOrigin: "50% 60%", transformPerspective: 700, zIndex: active ? 10 : 1 }}
                initial={{ opacity: 1, y: 0, rotateY: turn }}
                // pointed at, a device turns part-way towards the viewer and comes forward a little
                animate={wide
                  ? { opacity: exploring && !active ? 0.7 : 1, y: 0, x: 0, rotateY: active && exploring ? turn * 0.45 : turn, scale: active && exploring ? 1.045 : 1 }
                  : { opacity: active ? 1 : 0, y: 0, x: offset * 260, rotateY: offset * -18, scale: active ? 1 : 0.86 }}
                transition={!wide ? { type: "spring", stiffness: 120, damping: 20, opacity: { duration: 0.35 } } : {
                  opacity: { duration: 0.6, delay: exploring ? 0 : introDelay + k * 0.25 },
                  y: { duration: 0.9, ease: EASE, delay: introDelay + k * 0.25 },
                  z: { type: "spring", stiffness: 140, damping: 20 },
                  scale: { type: "spring", stiffness: 160, damping: 20 },
                  rotateY: { type: "spring", stiffness: 110, damping: 18 },
                }}
              >
                {/* light pooling behind the device in focus */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] blur-2xl"
                  style={{ background: "radial-gradient(closest-side, rgba(47,111,237,0.28), rgba(34,211,238,0.12), transparent)" }}
                  initial={false}
                  animate={{ opacity: active ? (exploring ? 1 : 0.55) : 0 }}
                  transition={{ duration: 0.6 }}
                />
                <Frame scenario={scenario} dim={exploring && !active} play={!reduced && active} flash={active && exploring}>
                  <Screen scenario={scenario} device={id} />
                </Frame>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      </motion.div>
      {below && wide && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-4"
          animate={{ y: focus === "desktop" ? (exploring ? 11 : 4) * scale : 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20 }}
          style={{ top: (layout.monitorBottom + 4) * scale, rotateX: reduced ? 0 : rotateX, transformPerspective: 1400 * scale, transformOrigin: `50% ${(layout.h * scale) / 2 - (layout.monitorBottom + 4) * scale}px` }}
        >
          {/* kept within the monitor's width so it never runs under the tablet or phone */}
          <div className="pointer-events-auto" style={{ maxWidth: 400 * scale }}>{below}</div>
        </motion.div>
      )}
    </div>
      {!wide && (
        <div className="mt-1 flex justify-center gap-1.5" role="tablist" aria-label="Devices">
          {SLIDES.map((id, k) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={k === slide}
              aria-label={DEVICE_NAMES[id]}
              onClick={() => setSlide(k)}
              className="grid h-6 place-items-center px-0.5"
            >
              <motion.span className="block h-1.5 rounded-full" initial={false} animate={{ width: k === slide ? 18 : 6, backgroundColor: k === slide ? "#1f56d6" : "#c7d2e6" }} transition={{ duration: 0.3 }} />
            </button>
          ))}
        </div>
      )}
      {below && !wide && <div className="relative mt-2 flex justify-center px-2">{below}</div>}
    </div>
  );
}
