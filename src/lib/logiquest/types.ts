/** Shared LogiQuest content types. Questions are authored in code (./content) and never stored in the database. */

export type Level = 1 | 2 | 3;

/** A shape inside a non-verbal reasoning figure tile (100 x 100 canvas, origin top-left). */
export type Shape = {
  k: "circle" | "square" | "triangle" | "arrow" | "star" | "line" | "dot" | "plus" | "pentagon" | "hexagon" | "diamond" | "semicircle" | "text";
  x?: number;
  y?: number;
  /** Size (radius-like); default 18. */
  r?: number;
  /** Rotation in degrees, clockwise. */
  rot?: number;
  fill?: boolean;
  /** Text for k = "text". */
  t?: string;
  /** Mirror the whole shape: h = left-right (mirror image), v = top-bottom (water image). */
  flip?: "h" | "v" | "hv";
  /** For text only: mirror each glyph in place but keep the reading order (a common wrong answer). */
  glyphFlip?: boolean;
};
export type Fig = Shape[];

export type Media =
  | { type: "table"; caption?: string; head: string[]; rows: (string | number)[][] }
  | { type: "bar" | "line"; caption?: string; unit?: string; labels: string[]; series: { name: string; values: number[] }[] }
  | { type: "pie"; caption?: string; slices: { label: string; value: number }[]; note?: string }
  /** Problem figures; a null entry renders as the "?" tile. Options (if any) replace the text options with figures. */
  | { type: "figs"; problem: (Fig | null)[]; options?: Fig[]; grid?: number }
  /** A fixed SVG diagram described in code (clock face, dice net...). */
  | { type: "clock"; h: number; m: number };

export type FormulaBlock = { h?: string; p?: string; points?: string[]; example?: string };

/** One authored question before it is finalized (ids assigned, options shuffled). */
export type RawQ = {
  q: string;
  /** Options for multiple choice; absent for a question-and-answer item (interview / short answer). */
  o?: string[];
  /** Index of the correct option. When given explicitly the written order is kept; when omitted, option 0 is correct and options are shuffled. */
  a?: number;
  /** Model answer text for a question-and-answer item. */
  ans?: string;
  /** Explanation shown with the answer. */
  e?: string;
  d?: Level;
  media?: Media;
  /** Machine check run by `npm run lq:validate`: "<python expression>", "py:<python program>" or "java:<java program>". */
  check?: string;
  /** Keep the written option order even though `a` was not given (for options like "Only I follows"). */
  keep?: boolean;
};
export type RawSet = { set: true; passage?: string; media?: Media; items: RawQ[] };
export type RawItem = RawQ | RawSet;

export type RawExercise = { slug: string; title: string; items: RawItem[] };
export type RawTopic = { intro?: string; formulas?: FormulaBlock[]; exercises: RawExercise[] };
export type RawSubject = Record<string, RawTopic>;

export type Question = {
  id: string;
  subject: string;
  topic: string;
  exercise: string;
  /** 1-based position inside its exercise (the number shown to learners). */
  n: number;
  kind: "mcq" | "qa";
  q: string;
  o: string[];
  /** Correct option index (mcq); -1 for qa. */
  a: number;
  ans?: string;
  e: string;
  d: Level;
  passage?: string;
  media?: Media;
  check?: string;
  /** Set when a practice page shuffled the options: displayed option i is canonical option order[i]. */
  order?: number[];
};

export type Exercise = { slug: string; title: string; questions: Question[] };
export type TopicContent = { intro?: string; formulas?: FormulaBlock[]; exercises: Exercise[] };
export type SubjectContent = Record<string, TopicContent>;
