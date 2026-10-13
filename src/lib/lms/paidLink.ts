/**
 * TEMPORARY: until in-app payment is switched on, every paid course sends the learner to this
 * hard-coded link. Change PAID_COURSE_BASE_LINK to your real payment / enquiry page.
 * Set ONLINE_CHECKOUT_ENABLED to true later to use the built-in Razorpay checkout again.
 */
export const ONLINE_CHECKOUT_ENABLED = false;
export const PAID_COURSE_BASE_LINK = "/contact";

export function paidCourseHref(slug: string): string {
  return ONLINE_CHECKOUT_ENABLED ? `/courses/${slug}/checkout` : `${PAID_COURSE_BASE_LINK}?course=${encodeURIComponent(slug)}`;
}
