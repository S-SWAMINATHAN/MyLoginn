import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCourseOrder, PaymentError } from "@/lib/lms/paymentService";

/**
 * Starts a Razorpay order. The amount, validity and purchase-vs-renewal are decided on the server
 * from the course row and the learner's entitlement; nothing price-related is read from the request.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to enroll" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { courseId?: unknown } | null;
  if (typeof body?.courseId !== "string" || !body.courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await createCourseOrder(user.id, body.courseId));
  } catch (error) {
    if (error instanceof PaymentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("create-order failed", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
