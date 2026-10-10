import { pythonChallenges } from "@/lib/challenge-data/python";
import { htmlChallenges } from "@/lib/challenge-data/html";
import { cssChallenges } from "@/lib/challenge-data/css";
import { sqlChallenges } from "@/lib/challenge-data/sql";
import { mysqlChallenges } from "@/lib/challenge-data/mysql";
import { javaChallenges } from "@/lib/challenge-data/java";
import { jsChallenges } from "@/lib/challenge-data/javascript";
import { reactChallenges } from "@/lib/challenge-data/react";
import { cChallenges } from "@/lib/challenge-data/c";
import { cppChallenges } from "@/lib/challenge-data/cpp";
import { phpChallenges } from "@/lib/challenge-data/php";

/**
 * Hand-authored, topic-specific challenges. Every entry has its own scenario, data and expected output, so no two
 * topics share a brief. Entry: [topic title, task, solution code, expected output, optional sample input / stdin].
 */
export type AuthoredChallenge = { task: string; code: string; output: string; given?: string[]; stdin?: string };
export type ChallengeEntry = [title: string, task: string, code: string, output: string, stdin?: string];

const topicKey = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(entries: ChallengeEntry[]) {
  const map: Record<string, AuthoredChallenge> = {};
  for (const [title, task, code, output, stdin] of entries) map[topicKey(title)] = { task, code, output, stdin, given: stdin !== undefined ? stdin.split("\n") : undefined };
  return map;
}

export const authoredChallenges: Record<string, Record<string, AuthoredChallenge>> = {
  "python-fundamentals": build(pythonChallenges),
  "html-fundamentals": build(htmlChallenges),
  "css-fundamentals": build(cssChallenges),
  "sql-fundamentals": build(sqlChallenges),
  "mysql-fundamentals": build(mysqlChallenges),
  "java-fundamentals": build(javaChallenges),
  "javascript-fundamentals": build(jsChallenges),
  "react-fundamentals": build(reactChallenges),
  "c-fundamentals": build(cChallenges),
  "cpp-fundamentals": build(cppChallenges),
  "php-fundamentals": build(phpChallenges),
};
