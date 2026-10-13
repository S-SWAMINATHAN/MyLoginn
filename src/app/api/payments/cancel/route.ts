import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelOrder, PaymentError } from "@/lib/lms/paymentService";

/** The learner dismissed the checkout window. Only an untouched ("created") order becomes "cancelled". */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { orderId?: unknown } | null;
  if (typeof body?.orderId !== "string") return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  try {
    await cancelOrder(user.id, body.orderId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not cancel" }, { status: 500 });
  }
}
