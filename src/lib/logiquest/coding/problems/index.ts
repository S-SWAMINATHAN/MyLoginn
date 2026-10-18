import type { CodingProblemDef } from "../types";
import { arrayProblems } from "./arrays";
import { coreProblems } from "./core";
import { dpProblems } from "./dp";
import { greedyGraphProblems } from "./greedy-graphs";
import { implementationProblems } from "./implementation";
import { matrixBitProblems } from "./matrix-bits";
import { moreProblems } from "./more";
import { numberTheoryProblems } from "./number-theory";
import { searchingProblems } from "./searching";
import { sqlProblems } from "./sql";
import { sqlProblems2 } from "./sql2";
import { treeListProblems } from "./trees-lists";
import { windowIntervalProblems } from "./windows-intervals";
import { stringMathProblems } from "./strings-math";
import { stackRecursionProblems } from "./stacks-recursion";
import { stringProblems } from "./strings";

/** Every coding problem, in display order. */
export const ALL_PROBLEMS: CodingProblemDef[] = [...coreProblems, ...moreProblems, ...arrayProblems, ...stringProblems, ...numberTheoryProblems, ...searchingProblems, ...stackRecursionProblems, ...dpProblems, ...greedyGraphProblems, ...matrixBitProblems, ...implementationProblems, ...treeListProblems, ...windowIntervalProblems, ...stringMathProblems, ...sqlProblems, ...sqlProblems2];
