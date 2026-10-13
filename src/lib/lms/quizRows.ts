import type { StoredQuestion } from "./quiz";

type Row = { id: string; type: string; prompt: string; options: unknown; correct: unknown; explanation: string | null; points: number };

/** Converts a QuizQuestion row into the engine's StoredQuestion shape (server side only). */
export const toStored = (q: Row): StoredQuestion => ({
  id: q.id,
  type: q.type,
  prompt: q.prompt,
  options: q.options as StoredQuestion["options"],
  correct: q.correct as string[],
  explanation: q.explanation,
  points: q.points,
});
