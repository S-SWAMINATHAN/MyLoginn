"use client";

/**
 * Calendar date picker, a drop-in replacement for <input type="date">.
 * `value` is "YYYY-MM-DD" (same as the native input) and `onChange` receives an
 * event-like object with `target.value`, so existing call sites keep working.
 * The field can also be typed into as dd-mm-yyyy.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { usePersistentLang } from "@/lib/astrology/useLang";
import { FloatingPanel } from "./FloatingPanel";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseIso(v?: string): { y: number; m: number; d: number } | null {
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
  if (!mt) return null;
  const y = +mt[1], m = +mt[2] - 1, d = +mt[3];
  const dt = new Date(y, m, d);
  return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d ? { y, m, d } : null;
}

const display = (iso: string) => {
  const p = parseIso(iso);
  return p ? `${pad(p.d)}-${pad(p.m + 1)}-${p.y}` : "";
};

/** "12081995" / "12-08-1995" -> ISO, or null while incomplete or invalid. */
function parseTyped(text: string): string | null {
  const digits = text.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const iso = `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  return parseIso(iso) ? iso : null;
}

function maskTyped(text: string): string {
  const d = text.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("-");
}

export const DateInput: React.FC<Props> = ({ value, onChange, min, max, required, disabled, id, className, style, placeholder }) => {
  const [lang] = usePersistentLang();
  const locale = lang === "ta" ? "ta-IN" : "en-IN";
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(display(value));
  const selected = parseIso(value);
  const today = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  }, []);
  const [view, setView] = useState(() => ({ y: selected?.y ?? today.y, m: selected?.m ?? today.m }));

  useEffect(() => setText(display(value)), [value]);

  const emit = useCallback(
    (iso: string) => onChange({ target: { value: iso }, currentTarget: { value: iso } } as unknown as React.ChangeEvent<HTMLInputElement>),
    [onChange],
  );

  const minP = parseIso(min);
  const maxP = parseIso(max);
  const outOfRange = (y: number, m: number, d: number) => {
    const iso = toIso(y, m, d);
    return (!!min && iso < min) || (!!max && iso > max);
  };

  const openPicker = () => {
    if (disabled) return;
    const s = parseIso(value);
    setView({ y: s?.y ?? today.y, m: s?.m ?? today.m });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2021, i, 1))),
    [locale],
  );
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2021, 7, 1 + i))), // Sun..Sat
    [locale],
  );

  const years = useMemo(() => {
    const from = minP?.y ?? 1900;
    const to = maxP?.y ?? today.y + 100;
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  }, [minP?.y, maxP?.y, today.y]);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay();
    const out: { y: number; m: number; d: number; outside: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(view.y, view.m, 1 - first + i);
      out.push({ y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), outside: dt.getMonth() !== view.m });
    }
    return out;
  }, [view]);

  const shift = (delta: number) =>
    setView((v) => {
      const dt = new Date(v.y, v.m + delta, 1);
      return { y: dt.getFullYear(), m: dt.getMonth() };
    });

  const pick = (y: number, m: number, d: number) => {
    if (outOfRange(y, m, d)) return;
    emit(toIso(y, m, d));
    setOpen(false);
  };

  const navBtn = "flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand-500/10 hover:text-brand-fg";
  const sel = "rounded-lg border border-border-soft bg-surface-2 px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-brand-500";

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        disabled={disabled}
        value={text}
        placeholder={placeholder ?? "dd-mm-yyyy"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className ?? "field"}
        style={style}
        onFocus={openPicker}
        onClick={openPicker}
        onChange={(e) => {
          const masked = maskTyped(e.target.value);
          setText(masked);
          const iso = parseTyped(masked);
          if (iso && !outOfRange(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8))) {
            emit(iso);
            setView({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 });
          } else if (!masked) emit("");
        }}
        onBlur={() => setText(display(value))}
      />
      {open && (
        <FloatingPanel anchorRef={wrapRef} width={312} label="Choose date" className="p-3" onClose={() => setOpen(false)}>
          <div className="flex items-center gap-1.5">
            <button type="button" className={navBtn} onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <select className={`${sel} flex-1`} aria-label="Month" value={view.m} onChange={(e) => setView({ ...view, m: +e.target.value })}>
              {monthNames.map((n, i) => <option key={n} value={i}>{n}</option>)}
            </select>
            <select className={sel} aria-label="Year" value={view.y} onChange={(e) => setView({ ...view, y: +e.target.value })}>
              {!years.includes(view.y) && <option value={view.y}>{view.y}</option>}
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button type="button" className={navBtn} onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
            {weekdays.map((w) => <div key={w} className="py-1">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((c) => {
              const isSel = !!selected && selected.y === c.y && selected.m === c.m && selected.d === c.d;
              const isToday = today.y === c.y && today.m === c.m && today.d === c.d;
              const disabledDay = outOfRange(c.y, c.m, c.d);
              return (
                <button
                  key={`${c.y}-${c.m}-${c.d}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => pick(c.y, c.m, c.d)}
                  aria-label={toIso(c.y, c.m, c.d)}
                  aria-pressed={isSel}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    isSel
                      ? "bg-brand-600 font-semibold text-white shadow-soft"
                      : isToday
                        ? "font-semibold text-brand-fg ring-1 ring-brand-500/60 hover:bg-brand-500/10"
                        : c.outside
                          ? "text-muted/50 hover:bg-brand-500/10"
                          : "text-foreground hover:bg-brand-500/10"
                  }`}
                >
                  {c.d}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 text-sm font-semibold">
            <button type="button" className="rounded-lg px-2 py-1 text-muted hover:text-foreground" onClick={() => { emit(""); setOpen(false); }}>
              {lang === "ta" ? "அழி" : "Clear"}
            </button>
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted"><Calendar className="h-3.5 w-3.5" />{selected ? display(value) : "dd-mm-yyyy"}</span>
            <button type="button" className="rounded-lg px-2 py-1 text-brand-fg hover:bg-brand-500/10" onClick={() => pick(today.y, today.m, today.d)}>
              {lang === "ta" ? "இன்று" : "Today"}
            </button>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
};
