import type { RawSubject } from "../types";
import { mergeExtra, type ExtraSubject } from "./extra/merge";

type Mod<T> = Promise<{ default: T }>;
/** A subject module plus its extra-questions module, merged. */
const withExtra = (base: () => Mod<RawSubject>, extra: () => Mod<ExtraSubject>) => async () => {
  const [b, e] = await Promise.all([base(), extra()]);
  return { default: mergeExtra(b.default, e.default) };
};

/** One lazily imported module per subject, so a page only loads the questions it shows. */
export const LOADERS: Record<string, () => Promise<{ default: RawSubject }>> = {
  "arithmetic-aptitude": () => import("./arithmetic-aptitude"),
  "data-interpretation": () => import("./data-interpretation"),
  "verbal-ability": () => import("./verbal-ability"),
  "logical-reasoning": () => import("./logical-reasoning"),
  "verbal-reasoning": () => import("./verbal-reasoning"),
  "non-verbal-reasoning": () => import("./non-verbal-reasoning"),
  "c-programming": withExtra(() => import("./c-programming"), () => import("./extra/c-programming")),
  "cpp-programming": withExtra(() => import("./cpp-programming"), () => import("./extra/cpp-programming")),
  "csharp-programming": () => import("./csharp-programming"),
  "java-programming": () => import("./java-programming"),
  "python-programming": () => import("./python-programming"),
  database: () => import("./database"),
  networking: () => import("./networking"),
  "operating-systems": () => import("./operating-systems"),
  "computer-fundamentals": withExtra(() => import("./computer-fundamentals"), () => import("./extra/computer-fundamentals")),
  "data-structures": () => import("./data-structures"),
  "software-testing": () => import("./software-testing"),
  "software-engineering": () => import("./software-engineering"),
  "digital-electronics": () => import("./digital-electronics"),
  "hr-interview": () => import("./hr-interview"),
  "technical-interview": () => import("./technical-interview"),
  "group-discussion": () => import("./group-discussion"),
  "general-knowledge": withExtra(() => import("./general-knowledge"), () => import("./extra/general-knowledge")),
  "general-science": withExtra(() => import("./general-science"), () => import("./extra/general-science")),
  "mechanical-engineering": () => import("./mechanical-engineering"),
  "civil-engineering": () => import("./civil-engineering"),
  "electronics-and-communication": () => import("./electronics-and-communication"),
  "electrical-engineering": () => import("./electrical-engineering"),
  "chemical-engineering": () => import("./chemical-engineering"),
  "computer-science-engineering": () => import("./computer-science-engineering"),
  puzzles: () => import("./puzzles"),
};
