/**
 * Payment rules for LMS courses. Pure: the Razorpay calls and database writes live in
 * lib/lms/paymentService.ts and call into these functions for every decision.
 *
 * Razorpay Orders are one-time payments. There is no automatic recurring billing here:
 * "renewal" is a manual re-purchase that extends the access window.
 */
import { isEntitlementActive, type AccessEntitlement } from "./access";

export type PaymentStatus = "created" | "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type PaymentEvent =
  | "verified" // server confirmed signature AND Razorpay reports the payment as captured with the right amount
  | "authorized" // Razorpay reports authorized but not captured yet
  | "failed" // Razorpay reports payment.failed
  | "cancelled" // checkout dismissed by the learner
  | "refunded"; // Razorpay reports a full refund

/**
 * Transition table. `paid` is sticky (only a refund moves it), but money that was really
 * received always wins over an earlier failed / cancelled state: a learner can fail once and
 * succeed on retry against the same order.
 */
export function nextPaymentStatus(current: PaymentStatus, event: PaymentEvent): { status: PaymentStatus; changed: boolean } {
  let next: PaymentStatus = current;
  switch (event) {
    case "verified":
      if (current !== "refunded") next = "paid";
      break;
    case "authorized":
      if (current === "created") next = "pending";
      break;
    case "failed":
      if (current === "created" || current === "pending") next = "failed";
      break;
    case "cancelled":
      if (current === "created") next = "cancelled";
      break;
    case "refunded":
      if (current === "paid") next = "refunded";
      break;
  }
  return { status: next, changed: next !== current };
}

/** The only statuses that may unlock content. */
export const isPaidStatus = (status: string) => status === "paid";

export type PurchaseCourse = {
  price: number;
  renewalPrice: number | null;
  validityDays: number | null;
};

export type PurchaseDecision =
  | { action: "purchase" | "renew"; amount: number; validityDays: number | null; kind: "purchase" | "renewal" }
  | { action: "free" }
  | { action: "already_owned"; message: string };

/** Renewal opens at most this many days before the access window ends. */
export const RENEWAL_WINDOW_DAYS = 30;

/**
 * Renewal window for a course: 30 days for long validities, but never more than a quarter of the
 * validity itself, so a 30-day pass bought today cannot be "renewed" (charged again) straight away.
 */
export function renewalWindowDays(validityDays: number | null): number {
  if (!validityDays) return RENEWAL_WINDOW_DAYS;
  return Math.max(1, Math.min(RENEWAL_WINDOW_DAYS, Math.floor(validityDays / 4)));
}
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * What may this learner be charged right now? A learner who already owns active access is
 * never charged again; renewal is allowed once the access has expired or is about to.
 * The amount always comes from the course row on the server, never from the client.
 */
export function decidePurchase(course: PurchaseCourse, entitlement: AccessEntitlement, now: Date = new Date()): PurchaseDecision {
  if (course.price === 0) return { action: "free" };

  const active = isEntitlementActive(entitlement, now);
  if (active && entitlement) {
    if (entitlement.expiresAt === null) {
      return { action: "already_owned", message: "You already have lifetime access to this course." };
    }
    const msLeft = entitlement.expiresAt.getTime() - now.getTime();
    const window = renewalWindowDays(course.validityDays);
    if (msLeft > window * DAY_MS) {
      return { action: "already_owned", message: `Your access is active. Renewal opens in the last ${window} day${window === 1 ? "" : "s"} of your access window.` };
    }
    return renewal(course);
  }

  // Not active: either never bought / revoked (new purchase) or expired (renewal).
  const wasPurchased = entitlement !== null && entitlement.status === "active";
  return wasPurchased ? renewal(course) : { action: "purchase", amount: course.price, validityDays: course.validityDays, kind: "purchase" };
}

function renewal(course: PurchaseCourse): PurchaseDecision {
  return { action: "renew", amount: course.renewalPrice ?? course.price, validityDays: course.validityDays, kind: "renewal" };
}

/**
 * New expiry after a verified payment. Renewing early stacks on top of the remaining time,
 * so nobody loses days by renewing before the deadline. Lifetime stays lifetime.
 */
export function computeExpiry(now: Date, currentExpiresAt: Date | null | undefined, currentActive: boolean, validityDays: number | null): Date | null {
  if (validityDays === null) return null;
  if (currentActive && currentExpiresAt === null) return null; // already lifetime
  const base = currentActive && currentExpiresAt && currentExpiresAt.getTime() > now.getTime() ? currentExpiresAt : now;
  return new Date(base.getTime() + validityDays * DAY_MS);
}

/** Server-side amount check: paise on the Razorpay payment must equal what we ordered. */
export function amountMatches(orderedPaise: number, razorpayPaise: number, razorpayCurrency: string, orderedCurrency = "INR") {
  return Number.isInteger(razorpayPaise) && razorpayPaise === orderedPaise && razorpayCurrency === orderedCurrency;
}
