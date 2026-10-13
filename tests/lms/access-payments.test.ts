import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateAccess, isEntitlementActive } from "../../src/lib/lms/access";
import { amountMatches, computeExpiry, decidePurchase, nextPaymentStatus, renewalWindowDays, RENEWAL_WINDOW_DAYS } from "../../src/lib/lms/payments";

const now = new Date("2026-06-01T10:00:00Z");
const day = 86_400_000;
const at = (offsetDays: number) => new Date(now.getTime() + offsetDays * day);
const paid = { status: "published", price: 4999 };
const free = { status: "published", price: 0 };
const ent = (over: Partial<{ status: string; startsAt: Date; expiresAt: Date | null }> = {}) => ({ status: "active", startsAt: at(-10), expiresAt: at(100), ...over });

test("free course requires enrolment, not payment", () => {
  assert.equal(evaluateAccess({ course: free, enrolled: false, entitlement: null, now }).reason, "not_enrolled");
  const ok = evaluateAccess({ course: free, enrolled: true, entitlement: null, now });
  assert.equal(ok.allowed, true);
  assert.equal(ok.reason, "ok_free");
});

test("paid course is locked without a verified entitlement, even if enrolled", () => {
  const d = evaluateAccess({ course: paid, enrolled: true, entitlement: null, now });
  assert.equal(d.allowed, false);
  assert.equal(d.reason, "needs_purchase");
});

test("active, expired, revoked and lifetime entitlements", () => {
  assert.equal(evaluateAccess({ course: paid, enrolled: true, entitlement: ent(), now }).allowed, true);
  assert.equal(evaluateAccess({ course: paid, enrolled: true, entitlement: ent({ expiresAt: null }), now }).allowed, true);
  const expired = evaluateAccess({ course: paid, enrolled: true, entitlement: ent({ expiresAt: at(-1) }), now });
  assert.equal(expired.allowed, false);
  assert.equal(expired.reason, "expired");
  assert.match(expired.message, /Renew/);
  assert.equal(evaluateAccess({ course: paid, enrolled: true, entitlement: ent({ status: "revoked" }), now }).reason, "revoked");
});

test("expiry boundary: access ends at the exact expiry instant", () => {
  assert.equal(isEntitlementActive(ent({ expiresAt: now }), now), false);
  assert.equal(isEntitlementActive(ent({ expiresAt: new Date(now.getTime() + 1) }), now), true);
});

test("drafts are hidden from learners, open to admins; archived stays open to existing learners", () => {
  assert.equal(evaluateAccess({ course: { status: "draft", price: 0 }, enrolled: true, entitlement: null, now }).allowed, false);
  assert.equal(evaluateAccess({ course: { status: "draft", price: 999 }, enrolled: false, entitlement: ent(), now }).allowed, false);
  assert.equal(evaluateAccess({ course: { status: "draft", price: 999 }, enrolled: false, entitlement: null, isAdmin: true, now }).allowed, true);
  assert.equal(evaluateAccess({ course: { status: "archived", price: 0 }, enrolled: true, entitlement: null, now }).allowed, true);
  assert.equal(evaluateAccess({ course: { status: "archived", price: 0 }, enrolled: false, entitlement: null, now }).allowed, false);
});

test("payment state machine: only a verified payment is paid; paid is sticky except refund", () => {
  assert.deepEqual(nextPaymentStatus("created", "verified"), { status: "paid", changed: true });
  assert.deepEqual(nextPaymentStatus("paid", "verified"), { status: "paid", changed: false }); // idempotent
  assert.equal(nextPaymentStatus("paid", "failed").status, "paid");
  assert.equal(nextPaymentStatus("paid", "cancelled").status, "paid");
  assert.equal(nextPaymentStatus("paid", "refunded").status, "refunded");
  assert.equal(nextPaymentStatus("created", "refunded").status, "created");
  assert.equal(nextPaymentStatus("refunded", "verified").status, "refunded");
  assert.equal(nextPaymentStatus("created", "authorized").status, "pending");
  assert.equal(nextPaymentStatus("pending", "failed").status, "failed");
  assert.equal(nextPaymentStatus("failed", "verified").status, "paid"); // retry on the same order succeeds
  assert.equal(nextPaymentStatus("created", "cancelled").status, "cancelled");
});

test("pending / failed / cancelled / refunded payments never unlock content", () => {
  // The access function only looks at the entitlement, which is created solely on a verified payment.
  for (const status of ["created", "pending", "failed", "cancelled", "refunded"] as const) {
    const next = nextPaymentStatus(status, status === "refunded" ? "verified" : "authorized").status;
    assert.notEqual(next, "paid", `${status} must not become paid by a non-verified event`);
  }
});

test("purchase decisions: price comes from the course, owners are not charged twice", () => {
  const course = { price: 4999, renewalPrice: 2999, validityDays: 365 };
  assert.deepEqual(decidePurchase(course, null, now), { action: "purchase", amount: 4999, validityDays: 365, kind: "purchase" });
  assert.equal(decidePurchase(course, ent({ expiresAt: null }), now).action, "already_owned");
  assert.equal(decidePurchase(course, ent({ expiresAt: at(200) }), now).action, "already_owned");
  assert.deepEqual(decidePurchase(course, ent({ expiresAt: at(RENEWAL_WINDOW_DAYS - 1) }), now), { action: "renew", amount: 2999, validityDays: 365, kind: "renewal" });
  assert.equal(decidePurchase(course, ent({ expiresAt: at(-5) }), now).action, "renew");
  assert.equal(decidePurchase(course, ent({ status: "revoked" }), now).action, "purchase");
  assert.equal(decidePurchase({ price: 0, renewalPrice: null, validityDays: null }, null, now).action, "free");
  assert.equal((decidePurchase({ price: 999, renewalPrice: null, validityDays: 30 }, ent({ expiresAt: at(-1) }), now) as { amount: number }).amount, 999); // renewal falls back to price
});

test("expiry: stacking on remaining time, lifetime stays lifetime", () => {
  assert.equal(computeExpiry(now, null, false, null), null);
  assert.equal(computeExpiry(now, null, true, 365), null); // already lifetime: a payment must not shorten it
  assert.equal(computeExpiry(now, undefined, false, 30)!.getTime(), at(30).getTime());
  assert.equal(computeExpiry(now, at(10), true, 30)!.getTime(), at(40).getTime()); // early renewal keeps the 10 days left
  assert.equal(computeExpiry(now, at(-10), false, 30)!.getTime(), at(30).getTime()); // lapsed: restart from now
});

test("amount check: exact paise and currency", () => {
  assert.equal(amountMatches(499900, 499900, "INR"), true);
  assert.equal(amountMatches(499900, 100, "INR"), false);
  assert.equal(amountMatches(499900, 499900, "USD"), false);
  assert.equal(amountMatches(499900, 499900.5, "INR"), false);
});

test("renewal window scales with validity: a fresh 30-day pass cannot be renewed (charged) immediately", () => {
  assert.equal(renewalWindowDays(null), 30);
  assert.equal(renewalWindowDays(365), 30);
  assert.equal(renewalWindowDays(30), 7);
  assert.equal(renewalWindowDays(2), 1);
  const course = { price: 999, renewalPrice: null, validityDays: 30 };
  assert.equal(decidePurchase(course, ent({ expiresAt: at(29.9) }), now).action, "already_owned");
  assert.equal(decidePurchase(course, ent({ expiresAt: at(6) }), now).action, "renew");
});
