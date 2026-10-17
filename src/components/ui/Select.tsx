"use client";

import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
};

type Placement = { sheet: boolean; left: number; width: number; top?: number; bottom?: number; maxHeight: number };

/**
 * Dropdown with a custom, animated list. A real (visually hidden) <select> stays in the DOM and holds the value, so
 * react-hook-form's register(), refs, `value`/`onChange` and native form posts all keep working unchanged; picking
 * an option sets that select and fires its change event.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, disabled, ...rest }, forwardedRef) => {
    const autoId = useId();
    const triggerId = id ?? `select-${autoId}`;
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [current, setCurrent] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [mounted, setMounted] = useState(false);

    const setRefs = useCallback((node: HTMLSelectElement | null) => {
      selectRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    useEffect(() => setMounted(true), []);

    // Mirror the hidden select (form libraries and parents may change it without a React event).
    // Runs after every render on purpose; it only sets state when the value actually differs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      const el = selectRef.current;
      if (el && el.value !== current) setCurrent(el.value);
    });

    const selected = options.find((o) => o.value === current);

    const measure = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 640) {
        setPlacement({ sheet: true, left: 0, width: vw, bottom: 0, maxHeight: Math.round(vh * 0.7) });
        return;
      }
      const below = vh - r.bottom - 12;
      const above = r.top - 12;
      const want = Math.min(320, options.length * 44 + 12);
      if (below < want && above > below) {
        setPlacement({ sheet: false, left: r.left, width: r.width, bottom: vh - r.top + 6, maxHeight: Math.min(320, above) });
      } else {
        setPlacement({ sheet: false, left: r.left, width: r.width, top: r.bottom + 6, maxHeight: Math.min(320, below) });
      }
    }, [options.length]);

    useLayoutEffect(() => {
      if (!open) return;
      measure();
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }, [open, measure]);

    useEffect(() => {
      if (!open) return;
      function onDown(e: MouseEvent | TouchEvent) {
        const t = e.target as Node;
        if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
        setOpen(false);
      }
      document.addEventListener("mousedown", onDown);
      document.addEventListener("touchstart", onDown);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("touchstart", onDown);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;
      listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [active, open]);

    function show() {
      if (disabled) return;
      const i = options.findIndex((o) => o.value === current);
      setActive(i >= 0 ? i : 0);
      setOpen(true);
    }

    function choose(value: string) {
      const el = selectRef.current;
      if (el && el.value !== value) {
        el.value = value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      setCurrent(value);
      setOpen(false);
      triggerRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent) {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); }
        return;
      }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
      else if (e.key === "Home") { e.preventDefault(); setActive(0); }
      else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (options[active]) choose(options[active].value); }
      else if (e.key === "Escape" || e.key === "Tab") { if (e.key === "Escape") e.preventDefault(); setOpen(false); }
      else if (e.key.length === 1) {
        const next = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
        const wrap = next >= 0 ? next : options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
        if (wrap >= 0) setActive(wrap);
      }
    }

    return (
      <div className="group flex flex-col gap-1.5">
        {label && <label htmlFor={triggerId} className="field-label">{label}</label>}
        <div className="relative">
          <select ref={setRefs} tabIndex={-1} aria-hidden="true" disabled={disabled} className="pointer-events-none absolute inset-0 h-full w-full opacity-0" {...rest}>
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${triggerId}-list`}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : show())}
            onKeyDown={onKeyDown}
            className={cn("field-control flex cursor-pointer items-center text-left pr-11 disabled:cursor-not-allowed", className)}
          >
            <span className={cn("block min-w-0 flex-1 truncate", !selected && "text-muted/70")}>{selected?.label ?? placeholder ?? ""}</span>
          </button>
          <ChevronDown aria-hidden="true" className={cn("pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform duration-300", open && "rotate-180 text-story-royal")} />
        </div>

        {mounted && createPortal(
          <AnimatePresence>
            {open && placement && (
              <>
                {placement.sheet && (
                  <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden />
                )}
                <motion.div
                  key="panel"
                  ref={popRef}
                  initial={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={placement.sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={placement.sheet ? { y: "100%" } : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ left: placement.left, width: placement.width, top: placement.top, bottom: placement.bottom, maxHeight: placement.maxHeight }}
                  className={cn("fixed z-[121] flex flex-col overflow-hidden border border-border-soft bg-surface text-foreground shadow-[0_24px_60px_-16px_rgba(11,31,77,0.35)]", placement.sheet ? "rounded-t-3xl pb-2" : "rounded-2xl")}
                >
                  {placement.sheet && (
                    <div className="shrink-0">
                      <span aria-hidden className="mx-auto mt-2 block h-1 w-10 rounded-full bg-border-soft" />
                      {label && <p className="px-5 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-muted">{label}</p>}
                    </div>
                  )}
                  <ul ref={listRef} id={`${triggerId}-list`} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
                    {options.map((opt, i) => {
                      const isSelected = opt.value === current;
                      return (
                        <motion.li
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          data-idx={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i, 8) * 0.025, duration: 0.18 }}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => choose(opt.value)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                            i === active && "bg-story-mist",
                            isSelected ? "font-semibold text-story-royal" : "font-medium"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                          {isSelected && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 16 }} className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-story-royal text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </motion.span>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

        {error && <span role="alert" className="field-message font-medium text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
