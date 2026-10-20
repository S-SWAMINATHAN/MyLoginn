"use client";

import { cn } from "@/lib/cn";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberWithError,
  type CountryCode,
} from "libphonenumber-js";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LabelText } from "@/components/ui/LabelText";

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(iso2: string) {
  return regionNames?.of(iso2) ?? iso2;
}

const ALL_COUNTRIES: { code: CountryCode; name: string; calling: string }[] = getCountries()
  .map((code) => ({ code, name: countryName(code), calling: getCountryCallingCode(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY: CountryCode = "IN";
const POPULAR: CountryCode[] = ["IN", "US", "GB", "AE", "SG", "AU", "CA"];

type Placement = { sheet: boolean; left: number; width: number; top?: number; bottom?: number; maxHeight: number };

/**
 * AsYouType's *display* formatting adds a national trunk prefix for some
 * countries (e.g. India renders 10 digits as "098765 43210"). Since the
 * input's value is controlled by that formatted string, naively stripping
 * non-digits from it on the next keystroke would bake that synthetic
 * leading 0 into the stored number permanently. Re-parsing through
 * AsYouType and reading back `nationalNumber` gives the trunk-prefix-free
 * digits libphonenumber actually considers significant.
 */
function toSignificantDigits(country: CountryCode, rawDigits: string): string {
  if (!rawDigits) return "";
  const typer = new AsYouType(country);
  typer.input(rawDigits);
  return typer.getNumber()?.nationalNumber ?? rawDigits;
}

type PhoneInputProps = {
  label?: string;
  hint?: string;
  valid?: boolean;
  error?: string;
  value: string;
  onChange: (e164: string) => void;
  onCountryChange?: (iso2: string) => void;
  onBlur?: () => void;
};

export function PhoneInput({ label, hint, error, valid, value, onChange, onCountryChange, onBlur }: PhoneInputProps) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  function setCountry(next: CountryCode) {
    setCountryState(next);
    onCountryChange?.(next);
  }

  // Follow value changes made from outside (form reset, "same as phone"), not only the first one.
  useEffect(() => {
    const emitted = national ? `+${getCountryCallingCode(country)}${national}` : "";
    if (value === emitted) return;
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNational("");
      return;
    }
    try {
      const parsed = parsePhoneNumberWithError(value);
      if (parsed.country) {
        setCountry(parsed.country);
        setNational(parsed.nationalNumber);
      }
    } catch {
      // keep what the learner typed if the outside value can't be parsed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Position the list against the field (in a portal, so no parent card can clip it); bottom sheet on phones.
  useLayoutEffect(() => {
    if (!open) return;
    function measure() {
      const el = shellRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 640) {
        setPlacement({ sheet: true, left: 0, width: vw, bottom: 0, maxHeight: Math.round(vh * 0.78) });
        return;
      }
      const width = Math.min(380, vw - 16);
      const left = Math.max(8, Math.min(r.left, vw - width - 8));
      const below = vh - r.bottom - 14;
      const above = r.top - 14;
      if (below < 300 && above > below) {
        setPlacement({ sheet: false, left, width, bottom: vh - r.top + 6, maxHeight: Math.min(400, above) });
      } else {
        setPlacement({ sheet: false, left, width, top: r.bottom + 6, maxHeight: Math.min(400, below) });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COUNTRIES;
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    // Rank by how well the query matches: ISO code, name start, any word start, then calling code.
    // Matching in the middle of a word ("in" inside "Argentina") is only a last resort.
    const score = (c: (typeof ALL_COUNTRIES)[number]) => {
      const name = c.name.toLowerCase();
      if (c.code.toLowerCase() === q) return 0;
      if (name.startsWith(q)) return 1;
      if (name.split(/[\s(),-]+/).some((word) => word.startsWith(q))) return 2;
      if (/^\d+$/.test(q) && c.calling.startsWith(q)) return 3;
      return name.includes(q) ? 4 : -1;
    };
    const ranked = ALL_COUNTRIES.map((c) => ({ c, s: score(c) })).filter((item) => item.s >= 0);
    const strong = ranked.filter((item) => item.s <= 3);
    return (strong.length ? strong : ranked).sort((a, b) => a.s - b.s || a.c.name.localeCompare(b.c.name)).map((item) => item.c);
  }, [query]);

  const popularCount = query.trim() ? 0 : POPULAR.length;
  const ordered = useMemo(() => {
    if (query.trim()) return filtered;
    const pop = POPULAR.map((code) => ALL_COUNTRIES.find((c) => c.code === code)!).filter(Boolean);
    return [...pop, ...ALL_COUNTRIES.filter((c) => !POPULAR.includes(c.code))];
  }, [filtered, query]);

  useEffect(() => {
    if (!open) return;
    const i = query.trim() ? 0 : Math.max(0, ordered.findIndex((c) => c.code === country));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(code: CountryCode) {
    setCountry(code);
    emit(code, national);
    close();
  }

  function onSearchKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(ordered.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (ordered[active]) choose(ordered[active].code); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  const formatted = useMemo(() => {
    const typer = new AsYouType(country);
    return typer.input(national);
  }, [country, national]);

  const complete = Boolean(value) && isValidPhoneNumber(value);
  const pretty = useMemo(() => {
    if (!complete) return "";
    try { return parsePhoneNumberWithError(value).formatInternational(); } catch { return value; }
  }, [complete, value]);

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "");
    onChange(digits ? `+${getCountryCallingCode(nextCountry)}${digits}` : "");
  }

  return (
    <div className="group flex flex-col gap-1.5" ref={rootRef}>
      {label && <label className="field-label"><LabelText>{label}</LabelText></label>}
      <div
        ref={shellRef}
        className={cn(
          "field-shell flex min-h-12 items-stretch"
        )}
        data-invalid={error ? "true" : undefined}
        data-valid={(valid || complete) && !error ? "true" : undefined}
      >
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-[0.8rem] border-r border-border-soft px-3.5 text-sm font-medium transition-colors hover:bg-story-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-story-royal"
        >
          <span className="rounded-md bg-story-royal/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-story-royal">{country}</span>
          <span className="text-muted">+{getCountryCallingCode(country)}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-4 w-4 text-muted" />
          </motion.span>
        </button>
        <input
          inputMode="tel"
          type="tel"
          autoComplete="tel-national"
          aria-invalid={error ? true : undefined}
          placeholder="98765 43210"
          value={formatted}
          onChange={(e) => {
            const digits = toSignificantDigits(country, e.target.value.replace(/\D/g, ""));
            setNational(digits);
            emit(country, digits);
          }}
          onBlur={onBlur}
          className="w-full min-w-0 rounded-r-[0.8rem] bg-transparent px-4 py-2.5 text-[0.9375rem] text-foreground placeholder:text-muted/70 outline-none"
        />
        <div className="mr-3 flex shrink-0 items-center gap-1.5 self-center">
          <AnimatePresence initial={false} mode="popLayout">
            {national && !complete && (
              <motion.button
                key="clear"
                type="button"
                onClick={() => { setNational(""); onChange(""); }}
                aria-label="Clear phone number"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="grid h-6 w-6 place-items-center rounded-full text-muted transition-colors hover:bg-story-mist hover:text-story-royal"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
            {(complete || valid) && !error && (
              <motion.span key="ok" initial={{ opacity: 0, scale: 0.4, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.4 }} transition={{ type: "spring", stiffness: 420, damping: 16 }}>
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && placement && (
              <>
                {placement.sheet && (
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[140] bg-slate-900/40"
                    onClick={close}
                    aria-hidden
                  />
                )}
                <motion.div
                  key="panel"
                  ref={popRef}
                  role="dialog"
                  aria-label="Choose country code"
                  initial={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.97 }}
                  animate={placement.sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ left: placement.left, width: placement.width, top: placement.top, bottom: placement.bottom, maxHeight: placement.maxHeight }}
                  className={cn(
                    "fixed z-[141] flex flex-col overflow-hidden border border-border-soft bg-surface text-foreground shadow-[0_24px_60px_-16px_rgba(11,31,77,0.35)]",
                    placement.sheet ? "rounded-t-3xl" : "rounded-2xl"
                  )}
                >
                  {placement.sheet && <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-soft" />}
                  <div className="flex shrink-0 items-center gap-2 p-3">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border-2 border-transparent bg-surface-2 px-3 py-2 transition-colors focus-within:border-story-royal focus-within:bg-surface">
                      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onSearchKey}
                        placeholder="Search country or code"
                        aria-label="Search country or code"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
                      />
                      {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-border-soft">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {placement.sheet && (
                      <button type="button" onClick={close} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-story-royal">Done</button>
                    )}
                  </div>

                  <div ref={listRef} role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
                    {ordered.map((c, i) => {
                      const selected = c.code === country;
                      return (
                        <div key={c.code}>
                          {i === 0 && popularCount > 0 && <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Popular</p>}
                          {i === popularCount && popularCount > 0 && <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">All countries</p>}
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            data-idx={i}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => choose(c.code)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                              i === active && "bg-surface-2",
                              selected && "bg-story-royal/10"
                            )}
                          >
                            <span className={cn("grid h-7 w-9 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold", selected ? "bg-story-royal text-white" : "bg-story-royal/10 text-story-royal")}>{c.code}</span>
                            <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                            <span className="shrink-0 font-mono text-xs tabular-nums text-muted">+{c.calling}</span>
                            {selected && <Check className="h-4 w-4 shrink-0 text-story-royal" aria-hidden />}
                          </button>
                        </div>
                      );
                    })}
                    {ordered.length === 0 && (
                      <p className="px-3 py-8 text-center text-sm text-muted">No countries match &ldquo;{query}&rdquo;</p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.span key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="field-message font-medium text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{error}</motion.span>
        ) : complete ? (
          <motion.span key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="field-message font-medium text-success"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Looks good · {pretty}</motion.span>
        ) : hint ? (
          <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="field-message text-muted">{hint}</motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
