import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCourseView, lessonLockReason, missingRequirements, normalizeRules, type CourseInput, type LessonDef, type ModuleDef } from "../../src/lib/lms/progression";

const mods: ModuleDef[] = [
  { id: "m1", title: "Basics", position: 1, required: true },
  { id: "m2", title: "Advanced", position: 2, required: true },
];
const lesson = (id: string, moduleId: string, position: number, over: Partial<LessonDef> = {}): LessonDef => ({
  id, moduleId, title: id.toUpperCase(), position, required: true, rules: { read: true }, videoMinPercent: 90, prerequisiteIds: [], ...over,
});
const lessons = [lesson("l1", "m1", 1), lesson("l2", "m1", 2), lesson("l3", "m2", 1)];
const base = (over: Partial<CourseInput> = {}): CourseInput => ({
  modules: mods, lessons, sequential: true, progress: {}, hasFinal: true, finalBestPercent: null, passPercent: 60, requiredProjects: [], ...over,
});
const doneAt = new Date("2026-01-01");
const status = (view: ReturnType<typeof computeCourseView>, id: string) => view.lessons.find((l) => l.id === id)!;

test("lesson 2 is locked until lesson 1 completes", () => {
  const v = computeCourseView(base());
  assert.equal(status(v, "l1").status, "available");
  assert.equal(status(v, "l2").status, "locked");
  assert.match(status(v, "l2").lockReason, /previous lesson "L1"/);
  assert.equal(lessonLockReason(v, "l2")?.includes("L1"), true);
  assert.equal(lessonLockReason(v, "l1"), null);
});

test("next module unlocks only after all required lessons of the current module", () => {
  let v = computeCourseView(base({ progress: { l1: { completedAt: doneAt } } }));
  assert.equal(status(v, "l2").status, "available");
  assert.equal(status(v, "l3").status, "locked");
  assert.match(status(v, "l3").lockReason, /module "Basics"/);
  v = computeCourseView(base({ progress: { l1: { completedAt: doneAt }, l2: { completedAt: doneAt } } }));
  assert.equal(status(v, "l3").status, "available");
});

test("optional lessons and optional modules do not block later content", () => {
  const ls = [lesson("l1", "m1", 1), lesson("opt", "m1", 2, { required: false }), lesson("l3", "m2", 1)];
  const v = computeCourseView(base({ lessons: ls, progress: { l1: { completedAt: doneAt } } }));
  assert.equal(status(v, "l3").status, "available");
  const m = [{ ...mods[0], required: false }, mods[1]];
  const v2 = computeCourseView(base({ modules: m }));
  assert.equal(status(v2, "l3").status, "available");
  assert.equal(v2.requiredTotal, 1);
});

test("explicit prerequisites apply even when sequential progression is off", () => {
  const ls = [lesson("l1", "m1", 1), lesson("l2", "m1", 2, { prerequisiteIds: ["l1"] }), lesson("l3", "m2", 1)];
  const v = computeCourseView(base({ lessons: ls, sequential: false }));
  assert.equal(status(v, "l3").status, "available"); // free path
  assert.equal(status(v, "l2").status, "locked");
  assert.match(status(v, "l2").lockReason, /prerequisite lesson "L1"/);
});

test("completion rules: read, video, quiz, code, assignment are each enforced", () => {
  const rules = normalizeRules({ read: true, video: true, quiz: true, code: true, assignment: true });
  const l = { rules, videoMinPercent: 90 };
  assert.equal(missingRequirements(l, undefined).length, 5);
  const almost = { readAt: doneAt, videoPercent: 89, quizPassedAt: doneAt, codePassedAt: doneAt, assignmentApprovedAt: doneAt };
  assert.deepEqual(missingRequirements(l, almost), ["Watch at least 90% of the video"]);
  assert.deepEqual(missingRequirements(l, { ...almost, videoPercent: 90 }), []);
  // opening a video is not completing it
  assert.equal(missingRequirements({ rules: { video: true }, videoMinPercent: 90 }, { videoPercent: 0 }).length, 1);
  assert.deepEqual(normalizeRules({}), { read: true, video: false, quiz: false, code: false, assignment: false });
});

test("final assessment unlocks only after every required lesson is done", () => {
  let v = computeCourseView(base({ progress: { l1: { completedAt: doneAt }, l2: { completedAt: doneAt } } }));
  assert.equal(v.finalUnlocked, false);
  assert.match(v.finalLockReason, /2\/3/);
  v = computeCourseView(base({ progress: { l1: { completedAt: doneAt }, l2: { completedAt: doneAt }, l3: { completedAt: doneAt } } }));
  assert.equal(v.finalUnlocked, true);
  assert.equal(v.percent, 100);
});

const allDone = { l1: { completedAt: doneAt }, l2: { completedAt: doneAt }, l3: { completedAt: doneAt } };

test("certificate: 60% is the pass mark (59 fails, 60 passes), never before the final", () => {
  assert.equal(computeCourseView(base({ progress: allDone, finalBestPercent: null })).certificateEligible, false);
  const fail = computeCourseView(base({ progress: allDone, finalBestPercent: 59 }));
  assert.equal(fail.certificateEligible, false);
  assert.match(fail.certificateLockReason, /at least 60%/);
  assert.equal(computeCourseView(base({ progress: allDone, finalBestPercent: 60 })).certificateEligible, true);
  assert.equal(computeCourseView(base({ progress: allDone, finalBestPercent: 100 })).certificateEligible, true);
});

test("certificate: passing the final without finishing the lessons is not enough", () => {
  const v = computeCourseView(base({ progress: { l1: { completedAt: doneAt } }, finalBestPercent: 95 }));
  assert.equal(v.certificateEligible, false);
});

test("certificate: required project must be approved; course without a final cannot certify", () => {
  const pending = computeCourseView(base({ progress: allDone, finalBestPercent: 80, requiredProjects: [{ id: "p", title: "Capstone", approved: false }] }));
  assert.equal(pending.certificateEligible, false);
  assert.match(pending.certificateLockReason, /Capstone/);
  assert.equal(computeCourseView(base({ progress: allDone, finalBestPercent: 80, requiredProjects: [{ id: "p", title: "Capstone", approved: true }] })).certificateEligible, true);
  assert.equal(computeCourseView(base({ progress: allDone, hasFinal: false })).certificateEligible, false);
});

test("a custom pass mark per course is honoured", () => {
  const v = computeCourseView(base({ progress: allDone, finalBestPercent: 70, passPercent: 75 }));
  assert.equal(v.certificateEligible, false);
  assert.equal(computeCourseView(base({ progress: allDone, finalBestPercent: 75, passPercent: 75 })).certificateEligible, true);
});

test("completed lessons stay completed after an admin tightens the rules", () => {
  const strict = lessons.map((l) => ({ ...l, rules: { read: true, quiz: true } }));
  const v = computeCourseView(base({ lessons: strict, progress: { l1: { completedAt: doneAt } } }));
  assert.equal(status(v, "l1").status, "completed");
  assert.equal(status(v, "l2").status, "available");
});

test("next lesson prefers in-progress, then first available; locked lessons are never suggested", () => {
  assert.equal(computeCourseView(base()).nextLessonId, "l1");
  assert.equal(computeCourseView(base({ progress: { l1: { completedAt: doneAt }, l2: { readAt: doneAt } } })).nextLessonId, "l2");
  assert.equal(computeCourseView(base({ progress: allDone })).nextLessonId, null);
});
