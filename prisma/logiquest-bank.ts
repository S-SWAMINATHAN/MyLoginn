import type { QSeed } from "./logiquest-types";
import { questions as core } from "./logiquest-questions";
import { problemSolving } from "./q-problem-solving";
import { logic } from "./q-logic";
import { coding } from "./q-coding";
import { math } from "./q-math";
import { communication } from "./q-communication";
import { knowledge } from "./q-knowledge";

/** Every multiple-choice question that the seed publishes. */
export const bank: QSeed[] = [...core, ...problemSolving, ...logic, ...coding, ...math, ...communication, ...knowledge];
