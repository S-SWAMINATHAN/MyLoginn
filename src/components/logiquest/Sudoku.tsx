"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eraser, Lightbulb, PencilLine, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Level = "easy" | "medium" | "hard";
const CLUES: Record<Level, number> = { easy: 40, medium: 32, hard: 26 };

function shuffled<T>(a: T[]) {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const canPlace = (g: number[], i: number, v: number) => {
  const r = Math.floor(i / 9), c = i % 9, br = r - (r % 3), bc = c - (c % 3);
  for (let k = 0; k < 9; k++) if (g[r * 9 + k] === v || g[k * 9 + c] === v || g[(br + Math.floor(k / 3)) * 9 + bc + (k % 3)] === v) return false;
  return true;
};
function fill(g: number[]): boolean {
  const i = g.indexOf(0);
  if (i < 0) return true;
  for (const v of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(g, i, v)) { g[i] = v; if (fill(g)) return true; g[i] = 0; }
  }
  return false;
}
function countSolutions(g: number[], limit = 2): number {
  const i = g.indexOf(0);
  if (i < 0) return 1;
  let n = 0;
  for (let v = 1; v <= 9 && n < limit; v++) if (canPlace(g, i, v)) { g[i] = v; n += countSolutions(g, limit - n); g[i] = 0; }
  return n;
}
/** A full random grid, then cells removed while the puzzle keeps exactly one solution. */
function makePuzzle(level: Level) {
  const solution = Array(81).fill(0);
  fill(solution);
  const puzzle = [...solution];
  let filled = 81;
  for (const i of shuffled([...Array(81).keys()])) {
    if (filled <= CLUES[level]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle]) !== 1) puzzle[i] = keep;
    else filled--;
  }
  return { puzzle, solution };
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Sudoku() {
  const [level, setLevel] = useState<Level>("easy");
  // Rendered client-only (see SudokuClient), so a random puzzle can be generated during the first render.
  const [game, setGame] = useState<{ puzzle: number[]; solution: number[] } | null>(() => makePuzzle("easy"));
  const [cells, setCells] = useState<number[]>(() => (game ? [...game.puzzle] : []));
  const [notes, setNotes] = useState<number[][]>(() => Array.from({ length: 81 }, () => []));
  const [sel, setSel] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [check, setCheck] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);

  const newGame = useCallback((lv: Level) => {
    const g = makePuzzle(lv);
    setGame(g); setCells([...g.puzzle]); setNotes(Array.from({ length: 81 }, () => [])); setSel(null); setSeconds(0); setHints(0); setCheck(false);
  }, []);

  const solved = useMemo(() => Boolean(game && cells.length && cells.every((v, i) => v === game.solution[i])), [cells, game]);
  useEffect(() => {
    if (!game || solved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [game, solved]);
  useEffect(() => {
    if (!solved) return;
    import("canvas-confetti").then((m) => m.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } })).catch(() => {});
  }, [solved]);

  const put = useCallback((v: number) => {
    if (sel === null || !game || game.puzzle[sel] || solved) return;
    if (noteMode && v) {
      setNotes((n) => n.map((x, i) => (i === sel ? (x.includes(v) ? x.filter((y) => y !== v) : [...x, v].sort()) : x)));
      return;
    }
    setCells((c) => c.map((x, i) => (i === sel ? v : x)));
    if (v) setNotes((n) => n.map((x, i) => (i === sel ? [] : x)));
  }, [sel, game, noteMode, solved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sel === null) return;
      if (/^[1-9]$/.test(e.key)) { put(Number(e.key)); e.preventDefault(); }
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { put(0); e.preventDefault(); }
      else if (e.key.startsWith("Arrow")) {
        const d = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key] ?? 0;
        setSel((s) => (s === null ? 0 : (s + d + 81) % 81));
        e.preventDefault();
      } else if (e.key === "n") setNoteMode((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, put]);

  function hint() {
    if (!game || solved) return;
    const target = sel !== null && !game.puzzle[sel] && cells[sel] !== game.solution[sel] ? sel : cells.findIndex((v, i) => v !== game.solution[i]);
    if (target < 0) return;
    setCells((c) => c.map((x, i) => (i === target ? game.solution[target] : x)));
    setSel(target); setHints((h) => h + 1);
  }

  if (!game) return <p className="text-center text-sm text-muted">Generating a puzzle…</p>;
  const sv = sel !== null ? cells[sel] : 0;
  const related = (i: number) => sel !== null && (Math.floor(i / 9) === Math.floor(sel / 9) || i % 9 === sel % 9 || (Math.floor(i / 27) === Math.floor(sel / 27) && Math.floor((i % 9) / 3) === Math.floor((sel % 9) / 3)));

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div>
        <div role="grid" aria-label="Sudoku board" className="mx-auto grid w-full max-w-[29rem] grid-cols-9 overflow-hidden rounded-xl border-2 border-story-navy bg-surface dark:border-foreground">
          {cells.map((v, i) => {
            const r = Math.floor(i / 9), c = i % 9;
            const given = Boolean(game.puzzle[i]);
            const wrong = check && v && v !== game.solution[i];
            return (
              <button
                key={i}
                role="gridcell"
                aria-label={`Row ${r + 1} column ${c + 1}${v ? `, ${v}` : ", empty"}${given ? ", given" : ""}`}
                onClick={() => setSel(i)}
                className={cn(
                  "relative grid aspect-square place-items-center text-lg font-semibold tabular-nums transition-colors sm:text-2xl",
                  c % 3 === 2 && c !== 8 ? "border-r-2 border-r-story-navy dark:border-r-foreground" : c !== 8 ? "border-r border-r-border-soft" : "",
                  r % 3 === 2 && r !== 8 ? "border-b-2 border-b-story-navy dark:border-b-foreground" : r !== 8 ? "border-b border-b-border-soft" : "",
                  i === sel ? "bg-story-royal/25" : sv && v === sv ? "bg-story-royal/15" : related(i) ? "bg-story-mist" : "",
                  given ? "text-story-navy dark:text-foreground" : wrong ? "text-rose-600" : "text-story-royal"
                )}
              >
                {v ? v : notes[i]?.length ? (
                  <span className="grid h-full w-full grid-cols-3 p-0.5 text-[9px] font-medium leading-none text-muted sm:text-[11px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="grid place-items-center">{notes[i].includes(n) ? n : ""}</span>)}
                  </span>
                ) : ""}
              </button>
            );
          })}
        </div>
        <div className="mx-auto mt-3 grid max-w-[29rem] grid-cols-9 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const left = 9 - cells.filter((v) => v === n).length;
            return (
              <button key={n} onClick={() => put(n)} disabled={left <= 0 && !noteMode} className="rounded-lg bg-story-mist py-2 text-lg font-bold text-story-royal transition-colors hover:bg-story-royal hover:text-white disabled:opacity-30">
                {n}<span className="block text-[9px] font-medium opacity-70">{left > 0 ? left : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border-soft bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">New game</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["easy", "medium", "hard"] as Level[]).map((lv) => (
              <button key={lv} onClick={() => { setLevel(lv); newGame(lv); }} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize", level === lv ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal")}>{lv}</button>
            ))}
            <button onClick={() => newGame(level)} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-4 py-1.5 text-sm font-semibold hover:border-story-royal hover:text-story-royal"><RotateCcw className="h-4 w-4" />Restart</button>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tabular-nums">{mmss(seconds)}</p>
          <p className="text-xs text-muted">{hints ? `${hints} hint${hints === 1 ? "" : "s"} used` : "No hints used"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setNoteMode((m) => !m)} aria-pressed={noteMode} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", noteMode ? "bg-violet-500/15 text-violet-700 dark:text-violet-300" : "border border-border-soft")}><PencilLine className="h-4 w-4" />Notes {noteMode ? "on" : "off"}</button>
          <button onClick={() => put(0)} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold"><Eraser className="h-4 w-4" />Erase</button>
          <button onClick={hint} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold"><Lightbulb className="h-4 w-4" />Hint</button>
          <button onClick={() => setCheck((c) => !c)} aria-pressed={check} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold", check ? "bg-rose-500/15 text-rose-700 dark:text-rose-300" : "border border-border-soft")}>Show mistakes</button>
        </div>
        {solved ? (
          <p className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 font-semibold text-emerald-700 dark:text-emerald-300"><Sparkles className="h-5 w-5" />Solved in {mmss(seconds)}{hints ? ` with ${hints} hint${hints === 1 ? "" : "s"}` : ""}!</p>
        ) : null}
        <div className="rounded-2xl border border-border-soft bg-surface p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">How to play</p>
          <p>Fill the grid so every row, every column and every 3×3 box contains the digits 1 to 9 exactly once. Each puzzle has exactly one solution.</p>
          <p className="mt-1">Keyboard: arrows to move, 1–9 to enter, Backspace to erase, N to toggle notes.</p>
        </div>
      </div>
    </div>
  );
}
