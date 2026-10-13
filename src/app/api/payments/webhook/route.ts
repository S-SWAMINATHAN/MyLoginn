import { NextResponse } from "next/server";
import { handleWebhook, PaymentError } from "@/lib/lms/paymentService";

export const runtime = "nodejs";

/**
 * Razorpay webhook (configure at Dashboard > Webhooks with events payment.authorized, payment.captured,
 * payment.failed, order.paid, refund.processed and the secret in RAZORPAY_WEBHOOK_SECRET). The HMAC is
 * computed over the RAW body, so the body is read as text and never re-serialised.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  try {
    await handleWebhook(raw, req.headers.get("x-razorpay-signature"));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("razorpay webhook failed", error);
    // 500 makes Razorpay retry, which is what we want for a transient database error.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
