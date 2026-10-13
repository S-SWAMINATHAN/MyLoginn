import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";
import { getRequiredServerEnv } from "@/lib/env";
import { awardOnce } from "./points";
import { getEntitlement } from "./entitlements";
import { isEntitlementActive } from "./access";
import { amountMatches, computeExpiry, decidePurchase, nextPaymentStatus, type PaymentEvent } from "./payments";

export class PaymentError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

const hmac = (secret: string, payload: string) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

/** Creates a Razorpay order whose amount, validity and kind are decided on the server only. */
export async function createCourseOrder(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "published") throw new PaymentError("Course not found", 404);

  const entitlement = await getEntitlement(userId, course.id);
  const decision = decidePurchase({ price: course.price, renewalPrice: course.renewalPrice, validityDays: course.validityDays }, entitlement);
  if (decision.action === "free") throw new PaymentError("This course is free. Enroll without payment.", 400);
  if (decision.action === "already_owned") throw new PaymentError(decision.message, 409);

  const amount = decision.amount * 100; // paise
  let order;
  try {
    order = await getRazorpayClient().orders.create({
      amount,
      currency: "INR",
      receipt: `c_${course.id.slice(-10)}_${Date.now()}`.slice(0, 40),
      notes: { courseId: course.id, userId, kind: decision.kind },
    });
  } catch (error) {
    console.error("razorpay order creation failed", error);
    throw new PaymentError("We couldn't start the payment right now. Please try again in a moment.", 502);
  }

  await prisma.payment.create({
    data: { userId, courseId: course.id, razorpayOrderId: order.id, amount, currency: "INR", status: "created", kind: decision.kind, validityDays: decision.validityDays },
  });
  return { orderId: order.id as string, amount, currency: "INR", keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, kind: decision.kind, validityDays: decision.validityDays };
}

/**
 * Moves a payment to `paid` and grants access, exactly once. The conditional update is the
 * guard: whichever of the browser callback / webhook gets there first grants access, the other
 * sees count 0 and does nothing.
 */
export async function settleVerifiedPayment(paymentId: string, razorpayPaymentId: string, signature: string | null): Promise<{ granted: boolean }> {
  const now = new Date();
  const outcome = await prisma.$transaction(async (tx) => {
    const flipped = await tx.payment.updateMany({
      where: { id: paymentId, status: { in: ["created", "pending", "failed", "cancelled"] } },
      data: { status: "paid", razorpayPaymentId, razorpaySignature: signature, verifiedAt: now, failureReason: null },
    });
    if (flipped.count === 0) return null;

    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const existing = await tx.courseEntitlement.findUnique({ where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } } });
    const active = isEntitlementActive(existing, now);
    const expiresAt = computeExpiry(now, existing?.expiresAt, active, payment.validityDays);

    await tx.courseEntitlement.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      create: { userId: payment.userId, courseId: payment.courseId, status: "active", source: "payment", paymentId: payment.id, startsAt: now, expiresAt },
      update: { status: "active", source: "payment", paymentId: payment.id, expiresAt, ...(payment.kind === "renewal" ? { renewedCount: { increment: 1 } } : {}) },
    });

    const enrollment = await tx.enrollment.findUnique({ where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } }, select: { id: true } });
    if (!enrollment) {
      await tx.enrollment.create({ data: { userId: payment.userId, courseId: payment.courseId } });
      await tx.course.update({ where: { id: payment.courseId }, data: { studentsCount: { increment: 1 } } });
    }
    return payment;
  });

  if (!outcome) return { granted: false };
  await awardOnce(outcome.userId, `enroll:${outcome.userId}:${outcome.courseId}`, 100, "course_enrolled", "Course enrollment bonus");
  await prisma.notification
    .create({ data: { userId: outcome.userId, title: outcome.kind === "renewal" ? "Course access renewed" : "Payment received", body: "Your payment was verified and your course access is active." } })
    .catch(() => undefined);
  return { granted: true };
}

export type ClientVerification = { orderId: string; paymentId: string; signature: string };

/**
 * Browser callback after checkout. The browser's word is never enough: we check the HMAC
 * signature AND ask Razorpay's API for the payment (captured, same order, same amount).
 */
export async function verifyClientPayment(userId: string, input: ClientVerification): Promise<{ status: "paid" | "pending"; granted: boolean }> {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment || payment.userId !== userId) throw new PaymentError("Payment not found", 404);
  if (payment.status === "paid") return { status: "paid", granted: false }; // idempotent re-verify
  if (payment.status === "refunded") throw new PaymentError("This payment was refunded.", 409);

  const expected = hmac(getRequiredServerEnv("RAZORPAY_KEY_SECRET"), `${input.orderId}|${input.paymentId}`);
  if (!safeEqual(expected, input.signature)) throw new PaymentError("Payment verification failed", 400);

  let remote: { order_id?: string; status?: string; amount?: number | string; currency?: string };
  try {
    remote = (await getRazorpayClient().payments.fetch(input.paymentId)) as typeof remote;
  } catch (error) {
    console.error("razorpay payment fetch failed", error);
    // Signature is valid but we couldn't confirm capture: stay pending; the webhook will settle it.
    return { status: "pending", granted: false };
  }
  if (remote.order_id !== input.orderId || !amountMatches(payment.amount, Number(remote.amount), String(remote.currency), payment.currency)) {
    throw new PaymentError("Payment details did not match the order.", 400);
  }
  if (remote.status === "authorized") {
    await applyPaymentEvent(payment.id, "authorized");
    return { status: "pending", granted: false };
  }
  if (remote.status !== "captured") {
    throw new PaymentError("Payment was not completed.", 402);
  }
  const { granted } = await settleVerifiedPayment(payment.id, input.paymentId, input.signature);
  return { status: "paid", granted };
}

/** Applies a non-paid event through the transition table (never downgrades a paid payment). */
export async function applyPaymentEvent(paymentId: string, event: PaymentEvent, failureReason?: string) {
  const current = await prisma.payment.findUnique({ where: { id: paymentId }, select: { status: true } });
  if (!current) return;
  const next = nextPaymentStatus(current.status as never, event);
  if (!next.changed) return;
  await prisma.payment.updateMany({
    where: { id: paymentId, status: current.status },
    data: { status: next.status, ...(event === "failed" ? { failureReason: failureReason?.slice(0, 300) ?? "Payment failed" } : {}), ...(event === "refunded" ? { refundedAt: new Date() } : {}) },
  });
}

/** Learner closed the checkout window. Only an untouched order can be cancelled. */
export async function cancelOrder(userId: string, orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId }, select: { id: true, userId: true } });
  if (!payment || payment.userId !== userId) throw new PaymentError("Payment not found", 404);
  await applyPaymentEvent(payment.id, "cancelled");
}

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string; status?: string; error_description?: string } };
    refund?: { entity?: { payment_id?: string; amount?: number } };
  };
};

/** Verifies and processes a Razorpay webhook. Throws PaymentError(400) only for a bad signature. */
export async function handleWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new PaymentError("Webhook is not configured", 503);
  if (!signature || !safeEqual(hmac(secret, rawBody), signature)) throw new PaymentError("Invalid signature", 400);

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    throw new PaymentError("Invalid payload", 400);
  }
  const event = body.event ?? "";
  const entity = body.payload?.payment?.entity;

  if (event === "payment.captured" || event === "order.paid") {
    if (!entity?.order_id || !entity.id) return;
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: entity.order_id } });
    if (!payment) return;
    if (!amountMatches(payment.amount, Number(entity.amount), String(entity.currency), payment.currency)) {
      console.error("razorpay webhook amount mismatch", entity.order_id);
      return;
    }
    await settleVerifiedPayment(payment.id, entity.id, null);
  } else if (event === "payment.authorized" || event === "payment.failed") {
    if (!entity?.order_id) return;
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: entity.order_id }, select: { id: true } });
    if (payment) await applyPaymentEvent(payment.id, event === "payment.failed" ? "failed" : "authorized", entity.error_description);
  } else if (event === "refund.processed" || event === "payment.refunded") {
    const razorpayPaymentId = body.payload?.refund?.entity?.payment_id ?? entity?.id;
    if (!razorpayPaymentId) return;
    const payment = await prisma.payment.findFirst({ where: { razorpayPaymentId } });
    if (!payment) return;
    const refunded = body.payload?.refund?.entity?.amount ?? entity?.amount ?? 0;
    if (refunded < payment.amount) return; // partial refunds keep access; an admin decides
    await applyPaymentEvent(payment.id, "refunded");
    // Revoke only if this was the learner's last paid payment for the course.
    const otherPaid = await prisma.payment.count({ where: { userId: payment.userId, courseId: payment.courseId, status: "paid", id: { not: payment.id } } });
    if (otherPaid === 0) {
      await prisma.courseEntitlement.updateMany({ where: { userId: payment.userId, courseId: payment.courseId }, data: { status: "revoked" } });
    }
  }
}
