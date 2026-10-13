import { test } from "node:test";
import assert from "node:assert/strict";
import { canStartAttempt, drawQuestions, gradeAttempt, hasPassed, isAnswerCorrect, toClientQuestion, type StoredQuestion } from "../../src/lib/lms/quiz";
import { badgeEarned, DEFAULT_REWARDS, resolveRewards, rewardKey } from "../../src/lib/lms/rewards";
import { applyVideoReport } from "../../src/lib/lms/video";

const q = (id: string, correct: string[], type = "single", points = 1): StoredQuestion => ({
  id, type, prompt: id, points, explanation: "because", correct,
  options: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }],
});

test("client questions never contain the answer key or explanation", () => {
  const c = toClientQuestion(q("q1", ["a"])) as Record<string, unknown>;
  assert.equal("correct" in c, false);
  assert.equal("explanation" in c, false);
  assert.equal(JSON.stringify(c).includes("because"), false);
});

test("grading: single, multiple (exact set), unknown ids and blanks", () => {
  assert.equal(isAnswerCorrect(q("1", ["a"]), "a"), true);
  assert.equal(isAnswerCorrect(q("1", ["a"]), ["a"]), true);
  assert.equal(isAnswerCorrect(q("1", ["a"]), "b"), false);
  assert.equal(isAnswerCorrect(q("1", ["a"]), undefined), false);
  assert.equal(isAnswerCorrect(q("1", ["a"]), []), false);
  assert.equal(isAnswerCorrect(q("1", ["a"]), ["a", "zzz"]), false);
  assert.equal(isAnswerCorrect(q("m", ["a", "b"], "multiple"), ["b", "a"]), true);
  assert.equal(isAnswerCorrect(q("m", ["a", "b"], "multiple"), ["a"]), false); // no partial credit
  assert.equal(isAnswerCorrect(q("m", ["a", "b"], "multiple"), ["a", "b", "c"]), false);
});

test("scoring only counts served questions and weights by points", () => {
  const served = [q("1", ["a"], "single", 1), q("2", ["b"], "single", 3)];
  const r = gradeAttempt(served, { "1": "a", "2": "c", "999": "a" });
  assert.equal(r.scorePoints, 1);
  assert.equal(r.maxPoints, 4);
  assert.equal(r.percent, 25);
});

test("60% pass mark in integers: 3/5 passes, 59.9% fails", () => {
  assert.equal(hasPassed(3, 5, 60), true);
  assert.equal(hasPassed(2, 5, 60), false);
  assert.equal(hasPassed(599, 1000, 60), false);
  assert.equal(hasPassed(600, 1000, 60), true);
  assert.equal(hasPassed(0, 0, 60), false); // an empty quiz can never pass
  assert.equal(hasPassed(10, 10, 100), true);
});

test("question draw is a subset of the bank without duplicates", () => {
  const bank = Array.from({ length: 20 }, (_, i) => q(`q${i}`, ["a"]));
  const drawn = drawQuestions(bank, 5);
  assert.equal(drawn.length, 5);
  assert.equal(new Set(drawn.map((d) => d.id)).size, 5);
  assert.equal(drawQuestions(bank, null).length, 20);
  assert.equal(drawQuestions(bank, 99).length, 20);
});

const now = new Date("2026-06-01T10:00:00Z");
const mins = (m: number) => new Date(now.getTime() + m * 60_000);

test("attempt limits, cooldown and resume", () => {
  const policy = { maxAttempts: 2, cooldownMinutes: 60, timeLimitMinutes: 30 };
  assert.deepEqual(canStartAttempt([], policy, now), { ok: true, resume: false });
  assert.deepEqual(canStartAttempt([{ status: "in_progress", startedAt: mins(-5), submittedAt: null }], policy, now), { ok: true, resume: true });
  const submitted = { status: "submitted", startedAt: mins(-90), submittedAt: mins(-30) };
  const cool = canStartAttempt([submitted], policy, now);
  assert.equal(cool.ok, false);
  assert.equal(canStartAttempt([{ ...submitted, submittedAt: mins(-61) }], policy, now).ok, true);
  const two = [{ ...submitted, submittedAt: mins(-600) }, { ...submitted, submittedAt: mins(-500) }];
  const limit = canStartAttempt(two, policy, now);
  assert.equal(limit.ok, false);
  // abandoning a timed attempt does not hand out a free retry
  const abandoned = [{ status: "in_progress", startedAt: mins(-120), submittedAt: null }, { ...submitted, submittedAt: mins(-600) }];
  assert.equal(canStartAttempt(abandoned, policy, now).ok, false);
});

test("reward config: defaults, overrides and malformed input", () => {
  assert.deepEqual(resolveRewards(undefined), DEFAULT_REWARDS);
  const r = resolveRewards({ lesson: 5, quiz: -1, challenge: "x", module: 1.5, course: 250, streakMilestones: { "7": 80, "abc": 9 } });
  assert.equal(r.lesson, 5);
  assert.equal(r.quiz, DEFAULT_REWARDS.quiz);
  assert.equal(r.challenge, DEFAULT_REWARDS.challenge);
  assert.equal(r.module, DEFAULT_REWARDS.module);
  assert.equal(r.course, 250);
  assert.deepEqual(r.streakMilestones, { "7": 80 });
});

test("reward idempotency keys are stable per user+item and differ otherwise", () => {
  assert.equal(rewardKey.lesson("u1", "l1"), rewardKey.lesson("u1", "l1"));
  assert.notEqual(rewardKey.lesson("u1", "l1"), rewardKey.lesson("u2", "l1"));
  assert.notEqual(rewardKey.lesson("u1", "l1"), rewardKey.quiz("u1", "l1"));
});

test("badge rules", () => {
  const stats = { lessonsCompleted: 10, coursesCompleted: 0, longestStreak: 7, points: 100, perfectQuizzes: 0 };
  assert.equal(badgeEarned({ type: "lessons_completed", threshold: 10 }, stats), true);
  assert.equal(badgeEarned({ type: "courses_completed", threshold: 1 }, stats), false);
  assert.equal(badgeEarned({ type: "streak", threshold: 7 }, stats), true);
  assert.equal(badgeEarned({ type: "points", threshold: 0 }, stats), false); // zero threshold never auto-awards
});

test("video: opening is not watching; forged 100% cannot complete", () => {
  const first = applyVideoReport({ watchedSeconds: 0, lastReportAt: null }, { positionSeconds: 600, durationSeconds: 600 }, now);
  assert.ok(first.percent < 5, `first report gave ${first.percent}%`);
  const forged = applyVideoReport({ watchedSeconds: 0, lastReportAt: now }, { positionSeconds: 600, durationSeconds: 600 }, new Date(now.getTime() + 5000));
  assert.ok(forged.percent < 5);
});

test("video: honest playback accumulates and reaches 100%", () => {
  let state = { watchedSeconds: 0, lastReportAt: null as Date | null };
  let t = now.getTime();
  let result = { watchedSeconds: 0, percent: 0, accepted: true };
  for (let pos = 10; pos <= 120; pos += 10) {
    t += 10_000;
    result = applyVideoReport(state, { positionSeconds: pos, durationSeconds: 120 }, new Date(t));
    state = { watchedSeconds: result.watchedSeconds, lastReportAt: new Date(t) };
  }
  assert.equal(result.percent >= 90, true);
});

test("video: seeking back never loses progress; trusted duration overrides the player's claim", () => {
  const back = applyVideoReport({ watchedSeconds: 100, lastReportAt: now }, { positionSeconds: 10, durationSeconds: 200 }, new Date(now.getTime() + 1000));
  assert.equal(back.watchedSeconds, 100);
  const trusted = applyVideoReport({ watchedSeconds: 50, lastReportAt: now }, { positionSeconds: 60, durationSeconds: 5 }, new Date(now.getTime() + 20_000), 1000);
  assert.equal(trusted.percent, 6);
});
