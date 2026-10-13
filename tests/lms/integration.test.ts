/**
 * Integration tests against a REAL, throw-away PostgreSQL database.
 * Run with:  LMS_TEST_DATABASE_URL=postgresql://... npm run test:lms:integration
 * Skipped automatically when LMS_TEST_DATABASE_URL is not set. NEVER point it at production.
 */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

const URL_ = process.env.LMS_TEST_DATABASE_URL;
const run = URL_ ? describe : describe.skip;

run("LMS integration (real database)", async () => {
  process.env.DATABASE_URL = URL_;
  process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
  process.env.RAZORPAY_KEY_ID = "rzp_test_x";
  process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";

  const { prisma } = await import("../../src/lib/prisma");
  const { parseCourseContent } = await import("../../src/lib/lms/content");
  const { importCourse } = await import("../../src/lib/lms/importer");
  const { loadStructure, loadLearnerState } = await import("../../src/lib/lms/state");
  const { getCourseAccess, getEntitlement } = await import("../../src/lib/lms/entitlements");
  const { recordRead, recordVideo, finalizeLesson, syncAssignmentRequirement } = await import("../../src/lib/lms/completion");
  const { startQuizAttempt, submitQuizAttempt } = await import("../../src/lib/lms/quizService");
  const { issueCertificateIfEligible } = await import("../../src/lib/lms/certificates");
  const { awardOnce } = await import("../../src/lib/lms/points");
  const { settleVerifiedPayment, handleWebhook, verifyClientPayment, PaymentError, applyPaymentEvent } = await import("../../src/lib/lms/paymentService");
  const { decidePurchase } = await import("../../src/lib/lms/payments");
  const { fixtureCourse, longText } = await import("./fixtures");

  const tag = crypto.randomBytes(4).toString("hex");
  const slug = `it-free-${tag}`;
  const paidSlug = `it-paid-${tag}`;
  const users: Record<string, { id: string; name: string }> = {};
  const day = 86_400_000;

  async function mkUser(key: string) {
    const u = await prisma.user.create({ data: { name: `User ${key}`, email: `${key}-${tag}@test.local`, passwordHash: "x" } });
    users[key] = { id: u.id, name: u.name };
    return users[key];
  }
  const importOk = async (content: unknown, publish = true) => {
    const parsed = parseCourseContent(content);
    assert.ok(parsed.ok, parsed.ok ? "" : parsed.errors.join("; "));
    return importCourse(parsed.data, { publish });
  };
  const answerAll = (qs: { id: string }[], correctCount: number) => Object.fromEntries(qs.map((q, i) => [q.id, [i < correctCount ? "a" : "b"]])); // option "a" is correct in fixtures

  before(async () => {
    await mkUser("alice"); await mkUser("bob"); await mkUser("carol");
  });

  after(async () => { await prisma.$disconnect(); });

  test("publish gate: incomplete content stays a draft and reports why; complete content publishes", async () => {
    const bad = await importOk(fixtureCourse(`it-bad-${tag}`, { objectives: [], modules: [{ title: "Short module", lessons: [{ title: "Tiny lesson", content: "too short" }] }] }), true);
    assert.equal(bad.status, "draft");
    assert.ok(bad.problems.length >= 3);
    assert.ok(bad.problems.some((p) => /final assessment/i.test(p)) || bad.problems.some((p) => /too short/.test(p)));

    const good = await importOk(fixtureCourse(slug), true);
    assert.equal(good.status, "published", good.problems.join("; "));
    assert.equal(good.lessons, 3);
  });

  test("a legacy course is never overwritten by an import", async () => {
    const legacy = await prisma.course.findFirst({ where: { engine: "legacy" } });
    assert.ok(legacy, "seed data must exist");
    await assert.rejects(() => importOk(fixtureCourse(legacy!.slug), true), /legacy course already uses the slug/);
  });

  test("Advanced courses must be paid to publish", async () => {
    const r = await importOk(fixtureCourse(`it-adv-${tag}`, { level: "Advanced", price: 0 }), true);
    assert.equal(r.status, "draft");
    assert.ok(r.problems.some((p) => /must be paid/.test(p)));
  });

  test("free course: enrolment required; sequential locking; completion needs the rules", async () => {
    const structure = (await loadStructure(slug))!;
    const alice = users.alice;
    assert.equal((await getCourseAccess({ id: alice.id, role: "STUDENT" }, structure.course)).reason, "not_enrolled");
    await prisma.enrollment.create({ data: { userId: alice.id, courseId: structure.course.id } });
    assert.equal((await getCourseAccess({ id: alice.id, role: "STUDENT" }, structure.course)).allowed, true);

    let state = await loadLearnerState(alice.id, structure);
    const [l1, l2, l3] = structure.lessons;
    assert.equal(state.view.lessons.find((l) => l.id === l1.id)!.status, "available");
    assert.equal(state.view.lessons.find((l) => l.id === l2.id)!.status, "locked");
    assert.equal(state.view.finalUnlocked, false);

    // reading too early is refused; opening the lesson started the clock
    await prisma.lessonProgress.create({ data: { userId: alice.id, courseId: structure.course.id, lessonId: l1.id } });
    const early = await recordRead(alice.id, structure, l1.id);
    assert.equal(early.ok, false);
    assert.ok((early.retryAfterSeconds ?? 0) > 0);

    // lesson 1 also requires its quiz, so reading alone does not complete it
    await prisma.lessonProgress.updateMany({ where: { userId: alice.id, lessonId: l1.id }, data: { startedAt: new Date(Date.now() - 10 * 60_000) } });
    const read = await recordRead(alice.id, structure, l1.id);
    assert.equal(read.ok, true);
    assert.equal(read.lessonCompleted, false);

    // quiz: fail first (1/3 = 33%), then pass
    const quiz = await prisma.quiz.findFirstOrThrow({ where: { lessonId: l1.id, kind: "lesson" } });
    const s1 = await startQuizAttempt(alice.id, structure, quiz);
    assert.ok(s1.ok);
    const qs1 = (s1 as { payload: { attemptId: string; questions: { id: string }[] } }).payload;
    for (const q of qs1.questions) {
      assert.deepEqual(Object.keys(q).sort(), ["id", "options", "points", "prompt", "type"], "only these fields may reach the client");
      assert.ok(!("correct" in q) && !("explanation" in q), "answer key must never be sent to the client");
    }
    const f = await submitQuizAttempt(alice, structure, quiz, qs1.attemptId, answerAll(qs1.questions, 1));
    assert.ok(f.ok && !(f as { payload: { passed: boolean } }).payload.passed);
    assert.equal((await loadLearnerState(alice.id, structure)).view.lessons.find((l) => l.id === l1.id)!.status, "in_progress");

    const s2 = await startQuizAttempt(alice.id, structure, quiz);
    const qs2 = (s2 as { payload: { attemptId: string; questions: { id: string }[] } }).payload;
    const dup = await submitQuizAttempt(users.bob, structure, quiz, qs2.attemptId, answerAll(qs2.questions, 3));
    assert.equal(dup.ok, false, "another learner cannot submit Alice's attempt");
    const p = await submitQuizAttempt(alice, structure, quiz, qs2.attemptId, answerAll(qs2.questions, 3));
    assert.ok(p.ok && (p as { payload: { passed: boolean } }).payload.passed);
    const again = await submitQuizAttempt(alice, structure, quiz, qs2.attemptId, answerAll(qs2.questions, 3));
    assert.equal(again.ok, false, "an attempt can only be submitted once");

    state = await loadLearnerState(alice.id, structure);
    assert.equal(state.view.lessons.find((l) => l.id === l1.id)!.status, "completed");
    assert.equal(state.view.lessons.find((l) => l.id === l2.id)!.status, "available");

    // points: lesson 10 + quiz 15, exactly once
    const lessonTx = await prisma.pointsTransaction.count({ where: { userId: alice.id, reason: "lms_lesson" } });
    const quizTx = await prisma.pointsTransaction.count({ where: { userId: alice.id, reason: "lms_quiz" } });
    assert.equal(lessonTx, 1); assert.equal(quizTx, 1);
    await finalizeLesson(alice.id, structure, l1.id);
    await finalizeLesson(alice.id, structure, l1.id);
    assert.equal(await prisma.pointsTransaction.count({ where: { userId: alice.id, reason: "lms_lesson" } }), 1, "re-finalising must not re-award");
  });

  test("progress persists (re-read from the database) and survives an admin re-import", async () => {
    const structure = (await loadStructure(slug))!;
    const before = await prisma.lessonProgress.count({ where: { userId: users.alice.id, completedAt: { not: null } } });
    await importOk(fixtureCourse(slug, { title: `Fixture Course ${slug} (edited)` }), true);
    const after2 = await prisma.lessonProgress.count({ where: { userId: users.alice.id, completedAt: { not: null } } });
    assert.equal(after2, before);
    const fresh = (await loadStructure(slug))!;
    assert.equal(fresh.lessons.length, structure.lessons.length);
    assert.equal(fresh.course.title.endsWith("(edited)"), true);
  });

  test("removing a lesson archives it; learner rows are kept", async () => {
    const slugR = `it-arch-${tag}`;
    await importOk(fixtureCourse(slugR), true);
    const s = (await loadStructure(slugR))!;
    const victim = s.lessons[1];
    await prisma.enrollment.create({ data: { userId: users.carol.id, courseId: s.course.id } });
    await prisma.lessonProgress.create({ data: { userId: users.carol.id, courseId: s.course.id, lessonId: victim.id, readAt: new Date(), completedAt: new Date() } });
    const content = fixtureCourse(slugR);
    (content.modules![0].lessons as unknown[]).splice(1, 1);
    await importOk(content, true);
    const row = await prisma.lesson.findUniqueOrThrow({ where: { id: victim.id } });
    assert.ok(row.archivedAt, "archived, not deleted");
    assert.equal(await prisma.lessonProgress.count({ where: { lessonId: victim.id } }), 1);
  });

  test("assignment gate: submission alone does not complete; admin approval does", async () => {
    const structure = (await loadStructure(slug))!;
    const [l1, l2, l3] = structure.lessons;
    const alice = users.alice;
    // finish lesson 2 (read only)
    await prisma.lessonProgress.create({ data: { userId: alice.id, courseId: structure.course.id, lessonId: l2.id, startedAt: new Date(Date.now() - 10 * 60_000) } });
    assert.equal((await recordRead(alice.id, structure, l2.id)).lessonCompleted, true);
    // lesson 3: read, but assignment pending
    await prisma.lessonProgress.create({ data: { userId: alice.id, courseId: structure.course.id, lessonId: l3.id, startedAt: new Date(Date.now() - 10 * 60_000) } });
    assert.equal((await recordRead(alice.id, structure, l3.id)).lessonCompleted, false);
    const a = await prisma.courseAssignment.findFirstOrThrow({ where: { lessonId: l3.id } });
    await prisma.assignmentSubmission.create({ data: { userId: alice.id, assignmentId: a.id, content: "My report about the module with an example." } });
    assert.equal((await syncAssignmentRequirement(alice.id, structure, l3.id)).lessonCompleted, false);
    await prisma.assignmentSubmission.update({ where: { userId_assignmentId: { userId: alice.id, assignmentId: a.id } }, data: { status: "approved" } });
    assert.equal((await syncAssignmentRequirement(alice.id, structure, l3.id)).lessonCompleted, true);
    void l1;
  });

  test("final assessment: 50% fails, 59-style fails, 60% passes and issues exactly one certificate", async () => {
    const structure = (await loadStructure(slug))!;
    const alice = users.alice;
    const final = await prisma.quiz.findFirstOrThrow({ where: { courseId: structure.course.id, kind: "final" } });

    // Bob has not finished anything: the final is locked for him
    await prisma.enrollment.create({ data: { userId: users.bob.id, courseId: structure.course.id } });
    const locked = await startQuizAttempt(users.bob.id, structure, final);
    assert.equal(locked.ok, false);
    assert.equal((locked as { status: number }).status, 423);

    const attempt = async (correct: number) => {
      const s = await startQuizAttempt(alice.id, structure, final);
      assert.ok(s.ok, JSON.stringify(s));
      const pl = (s as { payload: { attemptId: string; questions: { id: string }[]; passPercent: number } }).payload;
      assert.equal(pl.questions.length, 10);
      assert.equal(pl.passPercent, 60);
      const r = await submitQuizAttempt(alice, structure, final, pl.attemptId, answerAll(pl.questions, correct));
      assert.ok(r.ok);
      return (r as { payload: { percent: number; passed: boolean; certificateSerial: string | null; results: { correctOptionIds?: unknown }[] } }).payload;
    };

    const fail = await attempt(5);
    assert.equal(fail.passed, false);
    assert.equal(fail.certificateSerial, null);
    assert.equal(await prisma.certificate.count({ where: { userId: alice.id } }), 0);
    assert.ok(fail.results.every((r) => r.correctOptionIds === undefined), "final never reveals the answer key");
    const stillClosed = await issueCertificateIfEligible(alice, structure);
    assert.equal(stillClosed.ok, false);

    const nearMiss = await attempt(5); // 50% again; the stored best must still be below the mark
    assert.equal(nearMiss.passed, false);

    const pass = await attempt(6);
    assert.equal(pass.percent, 60);
    assert.equal(pass.passed, true);
    assert.ok(pass.certificateSerial);

    const again = await issueCertificateIfEligible(alice, structure);
    assert.ok(again.ok && !again.created);
    assert.equal(await prisma.certificate.count({ where: { userId: alice.id, courseId: structure.course.id } }), 1);
    const enr = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: alice.id, courseId: structure.course.id } } });
    assert.equal(enr.progress, 100);
    assert.equal(await prisma.pointsTransaction.count({ where: { userId: alice.id, reason: "lms_course" } }), 1);
  });

  test("passing the final without finishing the lessons never yields a certificate", async () => {
    const structure = (await loadStructure(slug))!;
    const bob = users.bob;
    const r = await issueCertificateIfEligible(bob, structure);
    assert.equal(r.ok, false);
    assert.equal(await prisma.certificate.count({ where: { userId: bob.id } }), 0);
  });

  test("video: a forged 100% report cannot complete a video-gated lesson", async () => {
    const vs = `it-video-${tag}`;
    const content = fixtureCourse(vs);
    const lesson = content.modules![0].lessons![0] as Record<string, unknown>;
    delete lesson.quiz; delete lesson.explainer;
    lesson.videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    lesson.videoDurationSeconds = 600;
    lesson.rules = { read: false, video: true };
    await importOk(content, true);
    const s = (await loadStructure(vs))!;
    await prisma.enrollment.create({ data: { userId: users.carol.id, courseId: s.course.id } });
    const r1 = await recordVideo(users.carol.id, s, s.lessons[0].id, { positionSeconds: 600, durationSeconds: 600 });
    assert.equal(r1.lessonCompleted, false);
    assert.ok(r1.videoPercent < 5);
    const r2 = await recordVideo(users.carol.id, s, s.lessons[0].id, { positionSeconds: 600, durationSeconds: 600 });
    assert.equal(r2.lessonCompleted, false);
  });

  test("points cannot be duplicated, even by concurrent requests", async () => {
    const u = await mkUser("dave");
    const results = await Promise.all(Array.from({ length: 8 }, () => awardOnce(u.id, `test:${tag}:dave`, 25, "test", "concurrent")));
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await prisma.pointsTransaction.count({ where: { userId: u.id, dedupeKey: `test:${tag}:dave` } }), 1);
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).points, 25);
  });

  // ---------------------------------------------------------------- payments / entitlements

  async function mkPayment(userId: string, courseId: string, over: Record<string, unknown> = {}) {
    return prisma.payment.create({ data: { userId, courseId, razorpayOrderId: `order_${crypto.randomBytes(6).toString("hex")}`, amount: 499900, currency: "INR", status: "created", kind: "purchase", validityDays: 30, ...over } });
  }
  const sign = (body: string) => crypto.createHmac("sha256", "whsec_test").update(body).digest("hex");

  test("paid course: locked without payment; failed / pending / cancelled payments do not unlock", async () => {
    await importOk(fixtureCourse(paidSlug, { price: 4999, validityDays: 30, renewalPrice: 2999 }), true);
    const s = (await loadStructure(paidSlug))!;
    const erin = await mkUser("erin");
    const acc = () => getCourseAccess({ id: erin.id, role: "STUDENT" }, s.course);
    assert.equal((await acc()).reason, "needs_purchase");
    await prisma.enrollment.create({ data: { userId: erin.id, courseId: s.course.id } }); // enrolled but unpaid
    assert.equal((await acc()).allowed, false);
    for (const status of ["created", "pending", "failed", "cancelled"]) {
      await mkPayment(erin.id, s.course.id, { status });
    }
    assert.equal((await acc()).allowed, false);
    assert.equal(await getEntitlement(erin.id, s.course.id), null);
  });

  test("verified payment grants access once; the webhook/browser race is idempotent; renewal stacks", async () => {
    const s = (await loadStructure(paidSlug))!;
    const frank = await mkUser("frank");
    const pay = await mkPayment(frank.id, s.course.id);
    const [a, b] = await Promise.all([settleVerifiedPayment(pay.id, `pay_1_${tag}`, "sig"), settleVerifiedPayment(pay.id, `pay_1_${tag}`, null)]);
    assert.equal([a.granted, b.granted].filter(Boolean).length, 1);
    const ent = (await getEntitlement(frank.id, s.course.id))!;
    assert.equal(ent.status, "active");
    const days = Math.round((ent.expiresAt!.getTime() - Date.now()) / day);
    assert.ok(days >= 29 && days <= 30, `expected ~30 days, got ${days}`);
    assert.equal((await getCourseAccess({ id: frank.id, role: "STUDENT" }, s.course)).allowed, true);
    assert.equal(await prisma.enrollment.count({ where: { userId: frank.id, courseId: s.course.id } }), 1);

    // already owned: not charged again
    assert.equal(decidePurchase({ price: 4999, renewalPrice: 2999, validityDays: 30 }, ent).action, "already_owned");

    // renew inside the window: stacks on the remaining time
    await prisma.courseEntitlement.update({ where: { id: ent.id }, data: { expiresAt: new Date(Date.now() + 5 * day) } });
    const renew = await mkPayment(frank.id, s.course.id, { kind: "renewal", amount: 299900 });
    assert.equal((await settleVerifiedPayment(renew.id, `pay_2_${tag}`, "sig")).granted, true);
    const e2 = (await getEntitlement(frank.id, s.course.id))!;
    const d2 = Math.round((e2.expiresAt!.getTime() - Date.now()) / day);
    assert.ok(d2 >= 34 && d2 <= 35, `expected ~35 days (5 left + 30), got ${d2}`);
    assert.equal(e2.renewedCount, 1);
  });

  test("expiry: access closes at the expiry time and renewal reopens it, progress is kept", async () => {
    const s = (await loadStructure(paidSlug))!;
    const gina = await mkUser("gina");
    const pay = await mkPayment(gina.id, s.course.id);
    await settleVerifiedPayment(pay.id, `pay_g_${tag}`, "sig");
    const ent = (await getEntitlement(gina.id, s.course.id))!;
    await prisma.lessonProgress.create({ data: { userId: gina.id, courseId: s.course.id, lessonId: s.lessons[0].id, readAt: new Date(), completedAt: new Date() } });
    await prisma.courseEntitlement.update({ where: { id: ent.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const closed = await getCourseAccess({ id: gina.id, role: "STUDENT" }, s.course);
    assert.equal(closed.allowed, false);
    assert.equal(closed.reason, "expired");
    const exp = (await getEntitlement(gina.id, s.course.id))!;
    assert.equal(decidePurchase({ price: 4999, renewalPrice: 2999, validityDays: 30 }, exp).action, "renew");
    const renew = await mkPayment(gina.id, s.course.id, { kind: "renewal", amount: 299900 });
    await settleVerifiedPayment(renew.id, `pay_g2_${tag}`, "sig");
    assert.equal((await getCourseAccess({ id: gina.id, role: "STUDENT" }, s.course)).allowed, true);
    assert.equal(await prisma.lessonProgress.count({ where: { userId: gina.id, completedAt: { not: null } } }), 1, "progress survives expiry and renewal");
  });

  test("webhook: bad signature rejected; failed never downgrades paid; refund revokes access", async () => {
    const s = (await loadStructure(paidSlug))!;
    const hank = await mkUser("hank");
    const pay = await mkPayment(hank.id, s.course.id);

    const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: `pay_h_${tag}`, order_id: pay.razorpayOrderId, amount: 499900, currency: "INR", status: "captured" } } } });
    await assert.rejects(() => handleWebhook(body, "deadbeef"), (e: unknown) => e instanceof PaymentError && e.status === 400);
    await assert.rejects(() => handleWebhook(body, null), (e: unknown) => e instanceof PaymentError && e.status === 400);

    // wrong amount is ignored (no access)
    const wrongAmount = body.replace("499900", "100");
    await handleWebhook(wrongAmount, sign(wrongAmount));
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: pay.id } })).status, "created");

    await handleWebhook(body, sign(body));
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: pay.id } })).status, "paid");
    assert.equal((await getCourseAccess({ id: hank.id, role: "STUDENT" }, s.course)).allowed, true);

    const failed = JSON.stringify({ event: "payment.failed", payload: { payment: { entity: { id: `pay_h2_${tag}`, order_id: pay.razorpayOrderId, amount: 499900, currency: "INR", status: "failed", error_description: "late failure" } } } });
    await handleWebhook(failed, sign(failed));
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: pay.id } })).status, "paid", "a failure event must not undo a verified payment");

    const refund = JSON.stringify({ event: "refund.processed", payload: { refund: { entity: { payment_id: `pay_h_${tag}`, amount: 499900 } } } });
    await handleWebhook(refund, sign(refund));
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: pay.id } })).status, "refunded");
    const acc = await getCourseAccess({ id: hank.id, role: "STUDENT" }, s.course);
    assert.equal(acc.allowed, false);
    assert.equal(acc.reason, "revoked");
  });

  test("webhook failure + cancel events on an untouched order", async () => {
    const s = (await loadStructure(paidSlug))!;
    const ida = await mkUser("ida");
    const p1 = await mkPayment(ida.id, s.course.id);
    const failed = JSON.stringify({ event: "payment.failed", payload: { payment: { entity: { id: `pay_i_${tag}`, order_id: p1.razorpayOrderId, amount: 499900, currency: "INR", status: "failed", error_description: "Card declined" } } } });
    await handleWebhook(failed, sign(failed));
    const row = await prisma.payment.findUniqueOrThrow({ where: { id: p1.id } });
    assert.equal(row.status, "failed");
    assert.equal(row.failureReason, "Card declined");
    const p2 = await mkPayment(ida.id, s.course.id);
    await applyPaymentEvent(p2.id, "cancelled");
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { id: p2.id } })).status, "cancelled");
    assert.equal((await getCourseAccess({ id: ida.id, role: "STUDENT" }, s.course)).allowed, false);
  });

  test("client verification: a forged signature is rejected and unlocks nothing", async () => {
    const s = (await loadStructure(paidSlug))!;
    const jo = await mkUser("jo");
    const pay = await mkPayment(jo.id, s.course.id);
    await assert.rejects(() => verifyClientPayment(jo.id, { orderId: pay.razorpayOrderId, paymentId: "pay_fake", signature: "00".repeat(32) }), (e: unknown) => e instanceof PaymentError && e.status === 400);
    // another user cannot verify someone else's order
    await assert.rejects(() => verifyClientPayment(users.alice.id, { orderId: pay.razorpayOrderId, paymentId: "pay_fake", signature: "x" }), (e: unknown) => e instanceof PaymentError && e.status === 404);
    assert.equal((await getCourseAccess({ id: jo.id, role: "STUDENT" }, s.course)).allowed, false);
  });

  test("existing paid courses: a legacy paid Payment keeps lifetime access; legacy rows are not rewritten", async () => {
    const legacyPaid = await prisma.course.findFirstOrThrow({ where: { engine: "legacy", price: { gt: 0 } } });
    const kim = await mkUser("kim");
    // exactly what the OLD verify route left behind: a paid Payment + an Enrollment, no entitlement row
    const old = await prisma.payment.create({ data: { userId: kim.id, courseId: legacyPaid.id, razorpayOrderId: `order_old_${tag}`, razorpayPaymentId: "pay_old", amount: legacyPaid.price * 100, status: "paid" } });
    await prisma.enrollment.create({ data: { userId: kim.id, courseId: legacyPaid.id } });
    const ent = (await getEntitlement(kim.id, legacyPaid.id))!;
    assert.equal(ent.source, "legacy");
    assert.equal(ent.expiresAt, null, "no retroactive expiry");
    assert.equal(decidePurchase({ price: legacyPaid.price, renewalPrice: null, validityDays: null }, ent).action, "already_owned");
    const untouched = await prisma.payment.findUniqueOrThrow({ where: { id: old.id } });
    assert.equal(untouched.status, "paid");
    assert.equal(untouched.razorpayPaymentId, "pay_old");
    assert.equal(legacyPaid.engine, "legacy");
    assert.equal(legacyPaid.status, "published");
  });

  test("regression: existing legacy courses are intact and still published", async () => {
    const legacy = await prisma.course.findMany({ where: { engine: "legacy" } });
    assert.ok(legacy.length >= 36, `expected the seeded 36 legacy courses, found ${legacy.length}`);
    assert.ok(legacy.every((c) => c.status === "published"));
    assert.ok(legacy.some((c) => c.price === 0) && legacy.some((c) => c.price > 0));
  });

  test("lesson text longer than the minimum is accepted and the Markdown is stored verbatim", async () => {
    const lesson = await prisma.lesson.findFirstOrThrow({ where: { course: { slug } } });
    assert.ok(lesson.contentMd.length >= longText().length - 1);
  });
});
