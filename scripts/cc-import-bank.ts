/**
 * Imports the starter question bank (scripts/cc-starter-bank.ts) into the database in DATABASE_URL.
 * Questions whose family already exists are skipped, so it is safe to run twice. Admins can edit, version or
 * deactivate the imported questions afterwards (Admin → Coding Competition → Question bank).
 *
 *   npx tsx --require ./tests/setup.cjs --require ./tests/competition/setup.cjs scripts/cc-import-bank.ts
 *
 * The expected outputs are computed by the bank's independent JavaScript implementations; scripts/cc-seed-dev.ts
 * checks every Python reference solution against them on a judge. Use "Verify on judge" in the admin as well.
 */
import { prisma } from "../src/lib/prisma";
import { createQuestion } from "../src/lib/competition/server/bank";
import { STARTER_BANK } from "./cc-starter-bank";

async function main() {
  let added = 0;
  for (const p of STARTER_BANK) {
    if (await prisma.ccQuestion.findFirst({ where: { family: p.family }, select: { id: true } })) {
      console.log(`– ${p.family} already exists, skipped`);
      continue;
    }
    await createQuestion(
      {
        family: p.family,
        title: p.title,
        statement: p.statement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        examples: p.samples.map((input) => ({ input, output: p.solve(input) })),
        difficulty: p.difficulty,
        topic: p.topic,
        expectedMinutes: p.expectedMinutes,
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        languages: ["python", "javascript", "java", "cpp"],
        starterCode: {},
        referenceSolution: p.reference,
        referenceLanguage: "python",
        comparator: "trim",
        active: true,
        tests: [
          ...p.samples.map((input) => ({ input, expected: p.solve(input), isSample: true, weight: 0 })),
          ...p.hidden.map((input) => ({ input, expected: p.solve(input), isSample: false, weight: 1 })),
        ],
      },
      "starter-bank-import"
    );
    added++;
    console.log(`✔ ${p.family}`);
  }
  console.log(`${added} question(s) added.`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
