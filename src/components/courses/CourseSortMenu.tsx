"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDownAZ, ArrowDownUp, ArrowUpZA, Check, ChevronDown, Clock, IndianRupee } from "lucide-react";

export type SortKey = "az" | "za" | "price-asc" | "price-desc" | "duration";

const OPTIONS: { value: SortKey; label: string; hint: string; Icon: typeof ArrowDownAZ }[] = [
  { value: "az", label: "A to Z", hint: "Course name", Icon: ArrowDownAZ },
  { value: "za", label: "Z to A", hint: "Course name", Icon: ArrowUpZA },
  { value: "price-asc", label: "Price: low to high", hint: "Free courses first", Icon: IndianRupee },
  { value: "price-desc", label: "Price: high to low", hint: "Paid courses first", Icon: ArrowDownUp },
  { value: "duration", label: "Shortest duration", hint: "Fewest weeks first", Icon: Clock },
];

/** Compact sort control: a pill button that opens a rounded menu (keyboard and screen-reader friendly). */
export function CourseSortMenu({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function move(step: number) {
    const index = OPTIONS.findIndex((option) => option.value === value);
    onChange(OPTIONS[(index + step + OPTIONS.length) % OPTIONS.length].value);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Sort courses: ${current.label}`}
        onClick={() => setOpen((state) => !state)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
          if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
        }}
        className={`group inline-flex h-[42px] items-center gap-2 rounded-full border bg-surface px-3.5 text-sm font-medium shadow-[var(--shadow-soft)] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-brand-100 dark:focus-visible:ring-brand-900/40 ${open ? "border-brand-400" : "border-border-soft hover:border-brand-300"}`}
      >
        <current.Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
        <span className="hidden text-muted sm:inline">Sort</span>
        <span className="whitespace-nowrap text-foreground">{current.label}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sort courses"
          className="absolute right-0 z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-right animate-[scale-in_0.14s_ease-out] overflow-hidden rounded-2xl border border-border-soft bg-surface p-1.5 shadow-[var(--shadow-lift)]"
        >
          {OPTIONS.map(({ value: optionValue, label, hint, Icon }) => {
            const selected = optionValue === value;
            return (
              <li key={optionValue} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => { onChange(optionValue); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "text-foreground hover:bg-surface-2"}`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-brand-600 text-white" : "bg-surface-2 text-muted"}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-5">{label}</span>
                    <span className="block text-xs leading-4 text-muted">{hint}</span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
