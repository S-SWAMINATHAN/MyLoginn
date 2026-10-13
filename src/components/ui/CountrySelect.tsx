"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const nameOf = (code: string) => regionNames?.of(code) ?? code;
const ALL = getCountries().map((code) => ({ code, name: nameOf(code), calling: getCountryCallingCode(code) })).sort((a, b) => a.name.localeCompare(b.name));
const POPULAR: CountryCode[] = ["IN", "US", "GB", "AE", "SG", "AU", "CA"];

type Placement = { sheet: boolean; left: number; width: number; top?: number; bottom?: number; maxHeight: number };

/**
 * Searchable country picker. Opens a panel in a portal (so no card can clip it): a popover under the field on larger
 * screens, a bottom sheet on phones. Popular countries come first; arrow keys, Enter and Escape work in the search box.
 */
export function CountrySelect({ id, value, onChange }: { id?: string; value: string; onChange: (code: string) => void }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (q) {
      return ALL.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.calling.startsWith(q));
    }
    const pop = POPULAR.map((code) => ALL.find((c) => c.code === code)!).filter(Boolean);
    return [...pop, ...ALL.filter((c) => !POPULAR.includes(c.code))];
  }, [query]);
  const popularCount = query.trim() ? 0 : POPULAR.length;

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      close();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    function measure() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 640) return setPlacement({ sheet: true, left: 0, width: vw, bottom: 0, maxHeight: Math.round(vh * 0.78) });
      const width = Math.min(Math.max(r.width, 300), vw - 16);
      const left = Math.max(8, Math.min(r.left, vw - width - 8));
      const below = vh - r.bottom - 14;
      const above = r.top - 14;
      if (below < 300 && above > below) setPlacement({ sheet: false, left, width, bottom: vh - r.top + 6, maxHeight: Math.min(380, above) });
      else setPlacement({ sheet: false, left, width, top: r.bottom + 6, maxHeight: Math.min(380, below) });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const i = query.trim() ? 0 : Math.max(0, list.findIndex((c) => c.code === value));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(code: string) {
    onChange(code);
    close();
    triggerRef.current?.focus();
  }

  function onSearchKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (list[active]) choose(list[active].code); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 hover:border-slate-400 focus-visible:border-story-royal focus-visible:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]"
      >
        {value ? (
          <>
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-brand-700">{value}</span>
            <span className="min-w-0 flex-1 truncate">{nameOf(value)}</span>
          </>
        ) : (
          <span className="flex-1 text-slate-400">Select your country</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}><ChevronDown className="h-4 w-4 text-slate-500" /></motion.span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && placement && (
              <>
                {placement.sheet && <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-slate-900/40" onClick={close} aria-hidden />}
                <motion.div
                  key="panel"
                  ref={popRef}
                  role="dialog"
                  aria-label="Choose country"
                  initial={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.97 }}
                  animate={placement.sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ left: placement.left, width: placement.width, top: placement.top, bottom: placement.bottom, maxHeight: placement.maxHeight }}
                  className={cn("fixed z-[81] flex flex-col overflow-hidden border border-border-soft bg-surface text-foreground shadow-[0_24px_60px_-16px_rgba(11,31,77,0.35)]", placement.sheet ? "rounded-t-3xl" : "rounded-2xl")}
                >
                  {placement.sheet && <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-soft" />}
                  <div className="flex shrink-0 items-center gap-2 p-3">
                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-story-mist px-3 py-2 transition-shadow focus-within:bg-surface focus-within:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]">
                      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                      <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onSearchKey} placeholder="Search country" aria-label="Search country" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
                      {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-border-soft"><X className="h-3 w-3" /></button>
                      )}
                    </div>
                    {placement.sheet && <button type="button" onClick={close} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-story-royal">Done</button>}
                  </div>

                  <div ref={listRef} role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
                    {value && !query && (
                      <button type="button" onClick={() => choose("")} className="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-muted transition-colors hover:bg-story-mist hover:text-foreground">
                        <X className="h-4 w-4" /> Clear selection
                      </button>
                    )}
                    {list.map((c, i) => {
                      const selected = c.code === value;
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
                            className={cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors", i === active && "bg-story-mist", selected && "bg-brand-50")}
                          >
                            <span className={cn("grid h-7 w-9 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold", selected ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700")}>{c.code}</span>
                            <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                            {selected && <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />}
                          </button>
                        </div>
                      );
                    })}
                    {list.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">No countries match &ldquo;{query}&rdquo;</p>}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
