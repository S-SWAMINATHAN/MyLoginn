/**
 * LOCAL DEVELOPMENT ONLY. Loads the starter bank (after verifying every reference solution on the local judge) and
 * creates a demo competition with registration open, so the pages can be tried end to end.
 *
 *   JUDGE_ALLOW_UNSAFE_LOCAL=1 npx tsx --require ./tests/setup.cjs --require ./tests/competition/setup.cjs scripts/cc-seed-dev.ts [--live]
 *
 * --live: also closes registration, generates assignments and puts the competition live now (for arena testing).
 * Refuses to run against anything but a localhost database.
 */
import { prisma } from "../src/lib/prisma";
import { createQuestion, generateAssignments } from "../src/lib/competition/server/bank";
import { advance, createCompetition, transition } from "../src/lib/competition/server/lifecycle";
import { upsertReward } from "../src/lib/competition/server/rewards";
import { outputsMatch } from "../src/lib/competition/scoring";
import { localUnsafeExecutor } from "../judge-worker/executors.mjs";
import { STARTER_BANK } from "./cc-starter-bank";

if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "")) throw new Error("Refusing to run: DATABASE_URL is not a local database.");

const min = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

async function main() {
  const live = process.argv.includes("--live");
  const executor = localUnsafeExecutor();
  for (const p of STARTER_BANK) {
    if (await prisma.ccQuestion.findFirst({ where: { family: p.family } })) continue;
    const inputs = [...p.samples, ...p.hidden];
    const run = await executor.execute({ id: p.family, kind: "VERIFY", language: "python", source: p.reference, timeLimitMs: 5000, memoryLimitMb: 512, tests: inputs.map((input, i) => ({ id: String(i), input })) });
    const bad = run.tests.filter((t: { id: string; status: string; stdout: string }) => t.status !== "OK" || !outputsMatch(t.stdout, p.solve(inputs[Number(t.id)])));
    if (!run.compile.ok || bad.length) throw new Error(`${p.family}: reference solution disagrees with the expected output on ${bad.length} test(s).`);
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
        tests: [...p.samples.map((input) => ({ input, expected: p.solve(input), isSample: true, weight: 0 })), ...p.hidden.map((input) => ({ input, expected: p.solve(input), isSample: false, weight: 1 }))],
      },
      "dev-seed"
    );
    console.log(`✔ ${p.family} (reference verified on ${inputs.length} tests)`);
  }

  let c = await prisma.competition.findUnique({ where: { slug: "demo-coding-cup" } });
  if (!c) {
    c = await createCompetition(
      {
        slug: "demo-coding-cup",
        title: "MyLoginn Coding Cup (local demo)",
        description: "Solve three algorithmic problems in 90 minutes. Every candidate gets a unique, balanced set; answers are judged on hidden tests and results are published after review.",
        eligibility: "Open to college students and graduates of 2025–2027 with a valid email address and mobile number. One registration per person.",
        rules: "Compete on your own, on one device, in full screen with your entire screen shared. External help, AI assistants and shared code are not allowed.",
        timezone: "Asia/Kolkata",
        registrationOpensAt: min(-60),
        registrationClosesAt: min(3 * 24 * 60),
        startsAt: min(3 * 24 * 60 + 60),
        endsAt: min(3 * 24 * 60 + 60 + 15 + 90),
        durationMinutes: 90,
        lateJoinMinutes: 15,
        resultsPublishAt: min(5 * 24 * 60),
        maxParticipants: 1000,
        languages: ["python", "javascript", "java", "cpp"],
        blueprint: [
          { difficulty: "EASY", count: 1, marks: 20 },
          { difficulty: "MEDIUM", count: 1, marks: 30 },
          { difficulty: "HARD", count: 1, marks: 50 },
        ],
        negativeMarkPerWrong: 0,
        timeBalanceTolerance: 0.15,
        violationPolicy: {},
        screenShareRequired: true,
        fullscreenRequired: true,
        tieBreakBySubmitTime: true,
        autosaveCountsAsSubmission: true,
        certificateMinPercent: 0,
        candidatePrefix: "MLC",
      },
      "dev-seed"
    );
    await upsertReward(c.id, { role: "Software Engineering Intern", stipendAmount: 10000, stipendCurrency: "INR", stipendPeriod: "per month", durationText: "3 months", expectedStartDate: null, workMode: "Remote", location: "", eligibility: "Currently enrolled student or graduate of 2025–2027; identity and enrolment documents are verified before the offer is sent.", requiredDocuments: "Government ID, college ID or degree certificate", offerValidDays: 14 }, "dev-seed");
    await transition(c.id, "REGISTRATION_OPEN", "dev-seed", true);
    console.log("✔ demo competition with registration open (LOCAL DEMO VALUES — configure real ones in the admin)");
  }
  if (live) {
    await prisma.competition.update({ where: { id: c.id }, data: { registrationClosesAt: new Date(Date.now() - 1000) } });
    await advance(c.id);
    await generateAssignments(c.id, "dev-seed", true);
    await transition(c.id, "SCHEDULED", "dev-seed");
    await prisma.competition.update({ where: { id: c.id }, data: { startsAt: new Date(Date.now() - 1000), endsAt: new Date(Date.now() + (15 + 90) * 60_000), resultsPublishAt: new Date(Date.now() + 2 * 86_400_000) } });
    await advance(c.id);
    console.log("✔ competition is LIVE");
  }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
