import type { RawSubject } from "../types";
import { part1 } from "./aptitude/part1";
import { part2 } from "./aptitude/part2";
import { part3 } from "./aptitude/part3";

const subject: RawSubject = { ...part1, ...part2, ...part3 };
export default subject;
