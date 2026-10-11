"use client";

/**
 * 12-hour time picker with an analog clock dial.
 * `value` / `onChange` stay in 24-hour "HH:MM:SS" (seconds are preserved, not editable),
 * so every existing call site keeps working.
 */
import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { usePersistentLang } from "@/lib/astrology/useLang";
import { FloatingPanel } from "@/components/astrology/ui/FloatingPanel";

interface TimeInput12hProps {
  /** Current value in 24-hour "HH:MM:SS" format, e.g. "07:00:00" */
  value: string;
  /** Called with the new value, still in 24-hour "HH:MM:SS" format */
  onChange: (value24h: string) => void;
  label?: string;
}

type Ampm = "AM" | "PM";

function parse24h(value: string) {
  const [hStr, mStr, sStr] = (value || "00:00:00").split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const second = sStr ?? "00";
  const ampm: Ampm = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, second, ampm };
}

function toValue24h(hour12: number, minute: number, second: string, ampm: Ampm) {
  let h24 = hour12 % 12;
  if (ampm === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${(second || "00").padStart(2, "0")}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

const SIZE = 232;
const C = SIZE / 2;
const R_NUM = 88;
const R_HAND = 80;

export const TimeInput12h: React.FC<TimeInput12hProps> = ({ value, onChange }) => {
  const [lang] = usePersistentLang();
  const p = parse24h(value);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"hour" | "minute">("hour");

  const emit = (h12: number, m: number, ap: Ampm) => onChange(toValue24h(h12, m, p.second, ap));

  const openPicker = () => {
    setStep("hour");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /** Angle (0 = 12 o'clock, clockwise, degrees) of a pointer position on the dial. */
  const angleOf = (clientX: number, clientY: number) => {
    const rect = dialRef.current!.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
  };

  const apply = (clientX: number, clientY: number) => {
    const deg = angleOf(clientX, clientY);
    if (step === "hour") {
      const h = Math.round(deg / 30) % 12 || 12;
      emit(h, p.minute, p.ampm);
    } else {
      emit(p.hour12, Math.round(deg / 6) % 60, p.ampm);
    }
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current) apply(e.clientX, e.clientY);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (step === "hour") setStep("minute");
  };

  const handDeg = step === "hour" ? (p.hour12 % 12) * 30 : p.minute * 6;
  const hx = C + R_HAND * Math.sin((handDeg * Math.PI) / 180);
  const hy = C - R_HAND * Math.cos((handDeg * Math.PI) / 180);
  const labels = step === "hour" ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 12 }, (_, i) => i * 5);
  const activeLabel = step === "hour" ? p.hour12 : Math.round(p.minute / 5) * 5 === p.minute ? p.minute : -1;

  const seg = (active: boolean) =>
    `rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${active ? "bg-brand-600 text-white shadow-soft" : "bg-surface-2 text-muted hover:text-foreground"}`;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="field flex items-center gap-2.5 text-left tabular-nums"
      >
        <Clock className="h-4 w-4 shrink-0 text-brand-500" />
        <span className="font-semibold">
          {pad(p.hour12)}:{pad(p.minute)} {p.ampm}
        </span>
      </button>

      {open && (
        <FloatingPanel anchorRef={wrapRef} width={280} label="Choose time" className="p-4" onClose={() => setOpen(false)}>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1 font-display text-3xl font-semibold tabular-nums">
              <button type="button" onClick={() => setStep("hour")} className={step === "hour" ? "text-brand-fg" : "text-muted hover:text-foreground"}>
                {pad(p.hour12)}
              </button>
              <span className="text-muted">:</span>
              <button type="button" onClick={() => setStep("minute")} className={step === "minute" ? "text-brand-fg" : "text-muted hover:text-foreground"}>
                {pad(p.minute)}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {(["AM", "PM"] as const).map((ap) => (
                <button key={ap} type="button" onClick={() => emit(p.hour12, p.minute, ap)} className={seg(p.ampm === ap)} aria-pressed={p.ampm === ap}>
                  {ap}
                </button>
              ))}
            </div>
          </div>

          <svg
            ref={dialRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="mx-auto mt-3 block w-full touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="img"
            aria-label={step === "hour" ? "Hour dial" : "Minute dial"}
          >
            <circle cx={C} cy={C} r={C - 2} className="fill-surface-2" />
            <line x1={C} y1={C} x2={hx} y2={hy} className="stroke-brand-600" strokeWidth={2} />
            <circle cx={C} cy={C} r={3.5} className="fill-brand-600" />
            <circle cx={hx} cy={hy} r={19} className="fill-brand-600" />
            {labels.map((n, i) => {
              const a = ((step === "hour" ? n : i * 5) * (step === "hour" ? 30 : 6) * Math.PI) / 180;
              const x = C + R_NUM * Math.sin(a);
              const y = C - R_NUM * Math.cos(a);
              const active = n === activeLabel;
              return (
                <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600}
                  className={active ? "fill-white" : "fill-foreground"} style={{ pointerEvents: "none" }}>
                  {step === "hour" ? n : pad(n)}
                </text>
              );
            })}
            {/* a minute that is not a multiple of 5 shows as a dot on the rim */}
            {step === "minute" && activeLabel === -1 && (
              <text x={hx} y={hy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} className="fill-white" style={{ pointerEvents: "none" }}>
                {pad(p.minute)}
              </text>
            )}
          </svg>

          <div className="mt-3 flex items-center justify-between text-sm font-semibold">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-muted hover:text-foreground"
              onClick={() => {
                const now = new Date();
                const n = parse24h(`${pad(now.getHours())}:${pad(now.getMinutes())}:00`);
                emit(n.hour12, n.minute, n.ampm);
              }}
            >
              {lang === "ta" ? "இப்போது" : "Now"}
            </button>
            <button type="button" className="rounded-lg bg-brand-600 px-4 py-1.5 text-white shadow-soft hover:bg-brand-700" onClick={() => setOpen(false)}>
              {lang === "ta" ? "சரி" : "Done"}
            </button>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
};
