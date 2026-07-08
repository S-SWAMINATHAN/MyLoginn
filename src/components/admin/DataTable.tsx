"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type Row = Record<string, unknown> & { id: string };

export type Column<R extends Row = Row> = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: R) => ReactNode;
  className?: string;
  align?: "left" | "right";
  /** Hide the column below this breakpoint to keep small screens readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
};

const hiddenClasses: Record<NonNullable<Column["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const PAGE_SIZE = 10;

function compare(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 active:scale-90",
        checked ? "brand-gradient-bg border-transparent" : "border-border-soft bg-surface hover:border-brand-400"
      )}
    >
      <motion.svg
        viewBox="0 0 12 12"
        className="h-3 w-3"
        initial={false}
        animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
      >
        <path d="M2 6.2 4.8 9 10 3.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>
    </button>
  );
}

export function DataTable<R extends Row>({
  columns,
  rows,
  loading,
  actions,
  emptyMessage = "Nothing here yet.",
  selected,
  onSelectedChange,
}: {
  columns: Column<R>[];
  rows: R[];
  loading: boolean;
  actions?: (row: R) => ReactNode;
  emptyMessage?: string;
  /** Pass both to enable multi-select: a checkbox column + select-all header. */
  selected?: Set<string>;
  onSelectedChange?: (ids: Set<string>) => void;
}) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let out = rows;
    for (const [key, value] of Object.entries(filters)) {
      const q = value.trim().toLowerCase();
      if (!q) continue;
      out = out.filter((r) => String(r[key] ?? "").toLowerCase().includes(q));
    }
    if (sort) out = [...out].sort((a, b) => sort.dir * compare(a[sort.key], b[sort.key]));
    return out;
  }, [rows, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const hasFilters = columns.some((c) => c.filterable !== false);

  const selectable = Boolean(selected && onSelectedChange);
  const allFilteredSelected =
    selectable && filtered.length > 0 && filtered.every((r) => selected!.has(r.id));
  const totalCols = columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0);

  function toggleAll() {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    if (allFilteredSelected) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    onSelectedChange(next);
  }

  function toggleRow(id: string) {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  }

  function toggleSort(key: string) {
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-soft bg-surface-2/60 text-left text-[11px] uppercase tracking-wide text-muted">
              {selectable && (
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    label={allFilteredSelected ? "Deselect all" : "Select all"}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-semibold", c.hideBelow && hiddenClasses[c.hideBelow], c.align === "right" && "text-right")}>
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="group inline-flex cursor-pointer items-center gap-1 uppercase transition-colors hover:text-foreground"
                    >
                      {c.label}
                      <span className="flex flex-col leading-none text-[7px]">
                        <span className={cn("transition-opacity", sort?.key === c.key && sort.dir === 1 ? "opacity-100 text-brand-500" : "opacity-40")}>▲</span>
                        <span className={cn("transition-opacity", sort?.key === c.key && sort.dir === -1 ? "opacity-100 text-brand-500" : "opacity-40")}>▼</span>
                      </span>
                    </button>
                  )}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
            {hasFilters && (
              <tr className="border-b border-border-soft">
                {selectable && <th className="px-3 py-2" />}
                {columns.map((c) => (
                  <th key={c.key} className={cn("px-3 py-2", c.hideBelow && hiddenClasses[c.hideBelow])}>
                    {c.filterable !== false && (
                      <input
                        value={filters[c.key] ?? ""}
                        onChange={(e) => {
                          setFilters((f) => ({ ...f, [c.key]: e.target.value }));
                          setPage(0);
                        }}
                        placeholder="Filter…"
                        className="w-full min-w-16 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-brand-400"
                      />
                    )}
                  </th>
                ))}
                {actions && <th className="px-3 py-2" />}
              </tr>
            )}
          </thead>
          <tbody>
            {loading &&
              rows.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border-soft last:border-0">
                  {selectable && <td className="px-3 py-3.5" />}
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3.5", c.hideBelow && hiddenClasses[c.hideBelow])}>
                      <span className="block h-3.5 w-4/5 animate-pulse rounded-full bg-surface-2" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3.5" />}
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="px-4 py-12 text-center text-sm text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {visible.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                className={cn(
                  "border-b border-border-soft transition-colors last:border-0 hover:bg-surface-2/50",
                  selectable && selected!.has(row.id) && "bg-brand-50/60 dark:bg-brand-900/15"
                )}
              >
                {selectable && (
                  <td className="px-3 py-3.5">
                    <Checkbox
                      checked={selected!.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      label={`Select row`}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3.5 align-middle",
                      c.hideBelow && hiddenClasses[c.hideBelow],
                      c.align === "right" && "text-right",
                      c.className
                    )}
                  >
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">{actions(row)}</div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-4 py-3 text-xs text-muted">
        <span>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
          {filtered.length !== rows.length && ` (filtered from ${rows.length})`}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="cursor-pointer rounded-full border border-border-soft px-3 py-1.5 font-medium transition-all hover:border-brand-400 disabled:cursor-default disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {safePage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="cursor-pointer rounded-full border border-border-soft px-3 py-1.5 font-medium transition-all hover:border-brand-400 disabled:cursor-default disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Live status chip (shared by all admin screens) ─────────────────── */

export function LiveIndicator({ updatedAt, error }: { updatedAt: Date | null; error: string | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-[11px] font-medium",
        error ? "text-danger" : "text-muted"
      )}
    >
      <motion.span
        className={cn("h-2 w-2 rounded-full", error ? "bg-danger" : "bg-success")}
        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {error
        ? error
        : updatedAt
          ? `Live · updated ${updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
          : "Connecting…"}
    </span>
  );
}
