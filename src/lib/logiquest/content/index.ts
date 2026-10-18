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
  "verbal-ability": withExtra(() => import("./verbal-ability"), () => import("./extra/verbal-ability")),
  "logical-reasoning": withExtra(() => import("./logical-reasoning"), () => import("./extra/logical-reasoning")),
  "verbal-reasoning": withExtra(() => import("./verbal-reasoning"), () => import("./extra/verbal-reasoning")),
  "non-verbal-reasoning": () => import("./non-verbal-reasoning"),
  "c-programming": withExtra(() => import("./c-programming"), () => import("./extra/c-programming")),
  "cpp-programming": withExtra(() => import("./cpp-programming"), () => import("./extra/cpp-programming")),
  "csharp-programming": withExtra(() => import("./csharp-programming"), () => import("./extra/csharp-programming")),
  "java-programming": withExtra(() => import("./java-programming"), () => import("./extra/java-programming")),
  "python-programming": withExtra(() => import("./python-programming"), () => import("./extra/python-programming")),
  database: withExtra(() => import("./database"), () => import("./extra/database")),
  networking: withExtra(() => import("./networking"), () => import("./extra/networking")),
  "operating-systems": withExtra(() => import("./operating-systems"), () => import("./extra/operating-systems")),
  "computer-fundamentals": withExtra(() => import("./computer-fundamentals"), () => import("./extra/computer-fundamentals")),
  "data-structures": withExtra(() => import("./data-structures"), () => import("./extra/data-structures")),
  "software-testing": withExtra(() => import("./software-testing"), () => import("./extra/software-testing")),
  "software-engineering": withExtra(() => import("./software-engineering"), () => import("./extra/software-engineering")),
  "digital-electronics": withExtra(() => import("./digital-electronics"), () => import("./extra/digital-electronics")),
  "hr-interview": withExtra(() => import("./hr-interview"), () => import("./extra/hr-interview")),
  "technical-interview": withExtra(() => import("./technical-interview"), () => import("./extra/technical-interview")),
  "group-discussion": withExtra(() => import("./group-discussion"), () => import("./extra/group-discussion")),
  "general-knowledge": withExtra(() => import("./general-knowledge"), () => import("./extra/general-knowledge")),
  "general-science": withExtra(() => import("./general-science"), () => import("./extra/general-science")),
  "mechanical-engineering": withExtra(() => import("./mechanical-engineering"), () => import("./extra/mechanical-engineering")),
  "civil-engineering": withExtra(() => import("./civil-engineering"), () => import("./extra/civil-engineering")),
  "electronics-and-communication": withExtra(() => import("./electronics-and-communication"), () => import("./extra/electronics-and-communication")),
  "electrical-engineering": withExtra(() => import("./electrical-engineering"), () => import("./extra/electrical-engineering")),
  "chemical-engineering": withExtra(() => import("./chemical-engineering"), () => import("./extra/chemical-engineering")),
  "computer-science-engineering": withExtra(() => import("./computer-science-engineering"), () => import("./extra/computer-science-engineering")),
  puzzles: withExtra(() => import("./puzzles"), () => import("./extra/puzzles")),
};
