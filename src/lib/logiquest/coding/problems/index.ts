import type { CodingProblemDef } from "../types";
import { coreProblems } from "./core";
import { moreProblems } from "./more";
import { sqlProblems } from "./sql";

/** Every coding problem, in display order. */
export const ALL_PROBLEMS: CodingProblemDef[] = [...coreProblems, ...moreProblems, ...sqlProblems];
