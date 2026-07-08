"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { useLiveData } from "@/components/admin/useLiveData";

type Category = { id: string; name: string; courses: number };

/**
 * Fully dynamic category field: options stream live from the database (a
 * category exists exactly as long as a course uses it), every option carries
 * its auto-generated animated icon, and typing anything new creates a fresh
 * category with a live preview of the icon it will get.
 */
export function CategoryPicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const { data } = useLiveData<{ rows: Category[] }>("/api/admin/categories", { intervalMs: 30_000 });
  const categories = useMemo(() => data?.rows ?? [], [data]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const queryIsNew =
    query.trim().length >= 2 && !categories.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());

  function pick(name: string) {
    onChange(name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-left text-sm transition-all duration-200",
          "hover:border-brand-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none dark:focus:ring-brand-900/30",
          open && "border-brand-400"
        )}
      >
        {value ? (
          <>
            <ContentIcon keyword={value} className="h-6 w-6" />
            <span className="min-w-0 flex-1 truncate">{value}</span>
          </>
        ) : (
          <span className="flex-1 text-muted">Choose a category…</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-muted">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border-soft bg-surface-2/50 p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (queryIsNew) pick(query.trim());
                    else if (matches[0]) pick(matches[0].name);
                  }
                }}
                placeholder="Search or type a new category…"
                className="w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2 text-sm outline-none transition-all placeholder:text-muted focus:border-brand-400"
              />

              <div className="mt-2.5 grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                {matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pick(c.name)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]",
                      value === c.name
                        ? "border-brand-400 bg-brand-50 dark:bg-brand-900/25"
                        : "border-border-soft bg-surface"
                    )}
                  >
                    <ContentIcon keyword={c.name} className="h-7 w-7" />
                    <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                    <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted">
                      {c.courses}
                    </span>
                  </button>
                ))}

                {queryIsNew && (
                  <button
                    type="button"
                    onClick={() => pick(query.trim())}
                    className="col-span-full flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-brand-400 bg-brand-50/50 px-3 py-2 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] dark:bg-brand-900/15"
                  >
                    <ContentIcon keyword={query.trim()} className="h-7 w-7" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      Create “{query.trim()}”
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      new
                    </span>
                  </button>
                )}

                {matches.length === 0 && !queryIsNew && (
                  <p className="col-span-full py-4 text-center text-xs text-muted">
                    Keep typing to create a new category…
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
