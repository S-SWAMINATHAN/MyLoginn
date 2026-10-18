"use client";

import dynamic from "next/dynamic";

/** Sudoku generates a random puzzle, so it renders only in the browser (no server/client mismatch). */
export const SudokuClient = dynamic(() => import("./Sudoku").then((m) => m.Sudoku), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-sm text-muted">Generating a puzzle…</p>,
});
