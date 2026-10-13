import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PaymentError, verifyClientPayment } from "@/lib/lms/paymentService";

/**
 * Browser callback after Razorpay checkout. Access is granted only after the server has verified the
 * signature AND confirmed the capture with Razorpay; "pending" means money is not confirmed yet and nothing is unlocked.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to enroll" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown } | null;
  if (typeof body?.razorpay_order_id !== "string" || typeof body.razorpay_payment_id !== "string" || typeof body.razorpay_signature !== "string") {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  try {
    const result = await verifyClientPayment(user.id, { orderId: body.razorpay_order_id, paymentId: body.razorpay_payment_id, signature: body.razorpay_signature });
    return NextResponse.json(result.status === "paid" ? { status: "paid" } : { status: "pending", message: "Your payment is being confirmed. Access unlocks as soon as it is verified." }, { status: result.status === "paid" ? 200 : 202 });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("payment verify failed", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
