/**
 * Seeds LogiQuest challenges. Run with: npm run db:seed:logiquest
 *
 * Quality gate (automated part of the publishing workflow): the Python reference solution is executed on every public
 * and hidden input. A challenge is only published if every run succeeds and produces output. Expected outputs come
 * from the reference, so test data and official solution can never disagree. Human technical review is still required
 * before adding new content in bulk.
 */
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { challenges, type Seed } from "./logiquest-content";
import { questions } from "./logiquest-questions";

const prisma = new PrismaClient();
const XP = { EASY: 10, MEDIUM: 20, HARD: 40 } as const;
const LANGS = ["python", "javascript", "java", "c", "cpp", "csharp", "go", "php", "kotlin"];

const STARTERS: Record<string, string> = {
  python: `import sys\n\n\ndef main():\n    data = sys.stdin.read().split("\\n")\n    # Write your solution here and print the answer\n\n\nmain()\n`,
  javascript: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");\n// Write your solution here and console.log the answer\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        // Write your solution here and print the answer\n    }\n}\n`,
  c: `#include <stdio.h>\n\nint main(void) {\n    // Write your solution here and print the answer\n    return 0;\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Write your solution here and print the answer\n    return 0;\n}\n`,
  csharp: `using System;\n\npublic class MainClass {\n    public static void Main() {\n        // Write your solution here and print the answer\n    }\n}\n`,
  go: `package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\treader := bufio.NewReader(os.Stdin)\n\t_ = reader\n\t_ = fmt.Sprint\n\t// Write your solution here and print the answer\n}\n`,
  php: `<?php\n$lines = explode("\\n", stream_get_contents(STDIN));\n// Write your solution here and echo the answer\n`,
  kotlin: `fun main() {\n    // Write your solution here and print the answer\n}\n`,
};

function runReference(dir: string, code: string, input: string) {
  const file = join(dir, "ref.py");
  writeFileSync(file, code);
  const r = spawnSync(process.env.PYTHON ?? "python", ["-I", file], { input: input.endsWith("\n") ? input : `${input}\n`, encoding: "utf8", timeout: 20000, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`reference failed: ${r.stderr?.slice(0, 300) || r.error}`);
  return r.stdout.replace(/\r\n/g, "\n").replace(/\s+$/, "");
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), "lq-seed-"));
  try {
    for (const c of challenges as Seed[]) {
      if (c.examples.length < 3) throw new Error(`${c.slug}: needs at least 3 public examples`);
      if (c.hints.length < 3) throw new Error(`${c.slug}: needs 3 hints`);
      const cases = [
        ...c.examples.map((e, i) => ({ input: e.input, isPublic: true, isEdge: false, label: `Example ${i + 1}` })),
        ...c.hidden.map((h) => ({ input: h.input, isPublic: false, isEdge: Boolean(h.edge), label: h.label ?? null })),
      ].map((t, position) => {
        const expected = runReference(dir, c.ref, t.input);
        return { ...t, position, expected };
      });
      for (const t of cases) if (!t.expected) throw new Error(`${c.slug}: reference printed nothing for a test case`);

      const starter = Object.fromEntries(LANGS.map((l) => [l, STARTERS[l]]));
      const examplesJson = c.examples.map((e, i) => ({ input: e.input, output: cases[i].expected, explanation: e.explanation }));
      const data = {
        title: c.title, category: "CODING" as const, difficulty: c.difficulty, topic: c.topic, subtopic: c.subtopic, tags: c.tags, style: c.style,
        statement: c.statement, scenario: c.scenario, constraints: c.constraints, inputFormat: c.inputFormat, outputFormat: c.outputFormat, notes: c.notes,
        examples: examplesJson, estimatedMinutes: c.minutes, xp: XP[c.difficulty], languages: LANGS, starterCode: starter, hints: c.hints,
        solution: {
          explanation: c.solution.explanation, approach: c.solution.approach, algorithm: c.solution.algorithm,
          timeComplexity: c.solution.timeComplexity, spaceComplexity: c.solution.spaceComplexity, alternative: c.solution.alternative,
          edgeCases: c.solution.edgeCases, code: { python: c.ref }, lineByLine: { python: c.solution.lineByLine },
        },
        status: "PUBLISHED" as const, publishedAt: new Date(),
      };
      const row = await prisma.lqChallenge.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: { ...data, publishedAt: undefined } });
      await prisma.lqTestCase.deleteMany({ where: { challengeId: row.id } });
      await prisma.lqTestCase.createMany({ data: cases.map((t) => ({ challengeId: row.id, position: t.position, input: t.input, expected: t.expected, isPublic: t.isPublic, isEdge: t.isEdge, label: t.label })) });
      console.log(`✔ ${c.difficulty.padEnd(6)} ${c.slug} (${cases.length} tests)`);
    }
    for (const [category, difficulty, topic, prompt, options, correctIndex, explanation] of questions) {
      if (correctIndex < 0 || correctIndex >= options.length || new Set(options).size !== options.length) throw new Error(`bad question: ${prompt.slice(0, 40)}`);
      const slug = `${category.toLowerCase().replace(/_/g, "-")}-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}`;
      const data = { category, difficulty, topic, prompt, options, correctIndex, explanation, xp: XP[difficulty], status: "PUBLISHED" as const };
      await prisma.lqQuestion.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    }
    console.log(`✔ ${questions.length} practice questions`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
