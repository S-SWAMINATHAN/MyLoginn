/** LogiQuest coding practice: problems are authored in code; expected outputs come from a reference solution. */

export type CodeLang = "python" | "javascript" | "sql";
export type CodeDifficulty = "Easy" | "Medium" | "Hard";

/** A stdin/stdout problem (Python and JavaScript), judged in the learner's browser. */
export type IoProblemDef = {
  kind: "io";
  slug: string;
  title: string;
  difficulty: CodeDifficulty;
  tracks: string[];
  tags: string[];
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  /** Test inputs (without trailing newline). The first `samples` are shown as examples. */
  inputs: string[];
  samples?: number;
  /** Optional explanation per sample, by index. */
  explain?: string[];
  /** Python reference solution: generates the expected outputs (`npm run lq:coding`). */
  ref: string;
  /** Optional JavaScript reference: checked against the same expected outputs. */
  refJs?: string;
  hints: string[];
  editorial: string;
  /** Restrict languages (default: python and javascript). */
  languages?: ("python" | "javascript")[];
  starter?: Partial<Record<"python" | "javascript", string>>;
};

/** A SQL problem, judged on the server against an in-memory SQLite database. */
export type SqlProblemDef = {
  kind: "sql";
  slug: string;
  title: string;
  difficulty: CodeDifficulty;
  tracks: string[];
  tags: string[];
  statement: string;
  /** CREATE TABLE + INSERT statements for the dataset. */
  schema: string;
  /** Reference query: the learner's result must match it. */
  ref: string;
  /** Whether row order matters (only when the task asks for ORDER BY). */
  ordered: boolean;
  hints: string[];
  editorial: string;
};

export type CodingProblemDef = IoProblemDef | SqlProblemDef;

export type IoTest = { input: string; output: string };

/** What the problem page needs (hidden tests are fetched only on Submit). */
export type PublicProblem = {
  kind: "io" | "sql";
  slug: string;
  title: string;
  difficulty: CodeDifficulty;
  tracks: string[];
  tags: string[];
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples: { input: string; output: string; explanation?: string }[];
  languages: CodeLang[];
  starter: Partial<Record<CodeLang, string>>;
  hints: string[];
  editorial: string;
  /** SQL problems: schema shown to the learner. */
  schema?: string;
  /** Reference solution (shown in the Solution tab once solved or after 3 attempts). */
  solution: Partial<Record<CodeLang, string>>;
  testCount: number;
};

export type ProblemSummary = { slug: string; title: string; difficulty: CodeDifficulty; tracks: string[]; tags: string[]; kind: "io" | "sql" };
