"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { splitLines } from "@/lib/postings";

export type ListItem = { id: string; text: string };

let seq = 0;
export const newItem = (text = ""): ListItem => ({ id: `li-${Date.now().toString(36)}-${seq++}`, text });
export const toItems = (list: string[] | null | undefined) => (list ?? []).map((t) => newItem(t));
export const fromItems = (items: ListItem[]) => items.map((i) => i.text.trim()).filter(Boolean);

/**
 * A bullet list edited point by point. Enter adds the next point, Backspace on an empty point removes it,
 * and pasting several lines splits them into separate points. Points can be moved up or down.
 */
export function ListEditor({
  items,
  onChange,
  placeholder,
  suggestions = [],
  max = 15,
}: {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder: string;
  suggestions?: readonly string[];
  max?: number;
}) {
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  /** The point to focus once the list re-renders (after adding, removing or moving points). */
  const focusId = useRef<string | null>(null);
  const setFocusId = (id: string) => { focusId.current = id; };

  useEffect(() => {
    if (!focusId.current) return;
    const el = refs.current.get(focusId.current);
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    focusId.current = null;
  }, [items]);

  // Grow each point to fit its text.
  useEffect(() => {
    refs.current.forEach((el) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [items]);

  const full = items.length >= max;

  function insertAt(index: number, texts: string[]) {
    const room = Math.max(0, max - items.length);
    const added = texts.slice(0, room).map((t) => newItem(t));
    if (!added.length) return;
    onChange([...items.slice(0, index), ...added, ...items.slice(index)]);
    setFocusId(added[added.length - 1].id);
  }

  function update(id: string, text: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  function remove(index: number, focusPrev = false) {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
    if (focusPrev && next.length) setFocusId(next[Math.max(0, index - 1)].id);
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, item: ListItem) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (item.text.trim()) insertAt(index + 1, [""]);
    } else if (e.key === "Backspace" && !item.text && items.length > 1) {
      e.preventDefault();
      remove(index, true);
    } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      move(index, e.key === "ArrowUp" ? -1 : 1);
      setFocusId(item.id);
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>, index: number, item: ListItem) {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\n")) return;
    e.preventDefault();
    const lines = splitLines(text);
    if (!lines.length) return;
    // The first pasted line fills the current point when it is empty.
    if (!item.text.trim()) {
      const [first, ...rest] = lines;
      const next = items.map((i) => (i.id === item.id ? { ...i, text: first } : i));
      const room = Math.max(0, max - next.length);
      const added = rest.slice(0, room).map((t) => newItem(t));
      onChange([...next.slice(0, index + 1), ...added, ...next.slice(index + 1)]);
      setFocusId((added.at(-1) ?? item).id);
    } else {
      insertAt(index + 1, lines);
    }
  }

  const existing = new Set(items.map((i) => i.text.trim().toLowerCase()));
  const unused = suggestions.filter((s) => !existing.has(s.toLowerCase()));

  return (
    <div>
      <ol className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18 }}
              className="group/item flex items-start gap-2 rounded-2xl border border-transparent bg-story-mist/60 py-1.5 pl-2 pr-1.5 transition-colors focus-within:border-story-royal/40 focus-within:bg-surface hover:bg-story-mist"
            >
              <span aria-hidden className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-story-royal/10 text-[10px] font-bold tabular-nums text-story-royal">{index + 1}</span>
              <textarea
                ref={(el) => { if (el) refs.current.set(item.id, el); else refs.current.delete(item.id); }}
                rows={1}
                value={item.text}
                maxLength={220}
                placeholder={index === 0 ? placeholder : "Next point"}
                aria-label={`Point ${index + 1}`}
                onChange={(e) => update(item.id, e.target.value.replace(/\n/g, " "))}
                onKeyDown={(e) => onKeyDown(e, index, item)}
                onPaste={(e) => onPaste(e, index, item)}
                className="min-h-8 flex-1 resize-none overflow-hidden bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-muted/60"
              />
              <span className="flex shrink-0 items-center opacity-40 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100">
                <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
                <IconButton label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
                <IconButton label="Remove point" danger onClick={() => remove(index)}><X className="h-3.5 w-3.5" /></IconButton>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" disabled={full} onClick={() => insertAt(items.length, [""])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-story-royal/40 px-3 py-1.5 text-xs font-semibold text-story-royal transition-colors hover:border-story-royal hover:bg-story-royal/5 disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" />Add point
        </button>
        <span className="text-[11px] text-muted">{full ? `Maximum ${max} points` : "Enter for a new point · paste a list to split it"}</span>
      </div>

      {unused.length > 0 && !full && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button key={s} type="button" onClick={() => onChange([...items.filter((i) => i.text.trim()), newItem(s)])} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-story-royal/10 hover:text-story-royal">
              <Plus className="h-3 w-3" />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cn("grid h-7 w-7 place-items-center rounded-full text-muted transition-colors disabled:pointer-events-none disabled:opacity-30", danger ? "hover:bg-rose-500/10 hover:text-rose-600" : "hover:bg-story-royal/10 hover:text-story-royal")}>
      {children}
    </button>
  );
}
