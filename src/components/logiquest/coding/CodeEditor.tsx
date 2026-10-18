"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The MyLoginn IDE editor: a monospace textarea with a line-number gutter, Tab indentation, auto-indent on Enter
 * and Ctrl/Cmd + Enter to run. Kept dependency-free so it loads instantly.
 */
export function CodeEditor({ value, onChange, onRun, onSubmit, indent = 4, light, label }: {
  value: string; onChange: (v: string) => void; onRun?: () => void; onSubmit?: () => void; indent?: number; light: boolean; label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const lines = value.split("\n").length;
  const pad = " ".repeat(indent);

  function updateCursor(el: HTMLTextAreaElement) {
    const before = el.value.slice(0, el.selectionStart);
    const parts = before.split("\n");
    setCursor({ line: parts.length, col: parts[parts.length - 1].length + 1 });
  }

  function replace(el: HTMLTextAreaElement, start: number, end: number, text: string, caret: number) {
    const next = el.value.slice(0, start) + text + el.value.slice(end);
    onChange(next);
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = caret; updateCursor(el); });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t, value: v } = el;
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) onSubmit?.(); else onRun?.();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        const remove = v.slice(lineStart, lineStart + indent).match(/^ */)![0].length;
        if (remove) replace(el, lineStart, lineStart + remove, "", Math.max(lineStart, s - remove));
      } else if (s === t) {
        replace(el, s, t, pad, s + indent);
      } else {
        // Indent every selected line.
        const blockEnd = v.indexOf("\n", t - 1) === -1 ? v.length : v.indexOf("\n", t - 1);
        const block = v.slice(lineStart, blockEnd).split("\n").map((l) => pad + l).join("\n");
        replace(el, lineStart, blockEnd, block, blockEnd + (block.length - (blockEnd - lineStart)));
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const current = v.slice(lineStart, s);
      let ind = current.match(/^[ \t]*/)![0];
      if (/[:{[(]\s*$/.test(current)) ind += pad;
      replace(el, s, t, `\n${ind}`, s + 1 + ind.length);
    }
  }

  return (
    <div className={cn("relative flex min-h-0 flex-1 overflow-hidden font-mono text-[13px] leading-6", light ? "bg-white text-slate-900" : "bg-[#0b1220] text-slate-100")}>
      <div ref={gutter} aria-hidden className={cn("select-none overflow-hidden py-3 pl-3 pr-2 text-right tabular-nums", light ? "bg-slate-50 text-slate-400" : "bg-[#0a101c] text-slate-500")}>
        {Array.from({ length: lines }, (_, i) => <div key={i} className={i + 1 === cursor.line ? (light ? "text-slate-700" : "text-slate-200") : ""}>{i + 1}</div>)}
      </div>
      <textarea
        ref={ref}
        aria-label={label}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        onChange={(e) => { onChange(e.target.value); updateCursor(e.target); }}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => updateCursor(e.currentTarget)}
        onClick={(e) => updateCursor(e.currentTarget)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        className="min-h-0 flex-1 resize-none whitespace-pre bg-transparent px-3 py-3 outline-none [tab-size:4]"
        wrap="off"
      />
      <span className={cn("pointer-events-none absolute bottom-1.5 right-3 text-[10px]", light ? "text-slate-400" : "text-slate-500")}>Ln {cursor.line}, Col {cursor.col}</span>
    </div>
  );
}
