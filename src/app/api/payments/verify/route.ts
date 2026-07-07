import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { awardPoints } from "@/lib/streak";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to enroll" }, { status: 401 });
  }

  const body = (await req.json()) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const [, enrollment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "paid", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
    }),
    prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: payment.courseId } },
      update: {},
      create: { userId: user.id, courseId: payment.courseId },
    }),
    prisma.course.update({ where: { id: payment.courseId }, data: { studentsCount: { increment: 1 } } }),
  ]);

  await awardPoints(user.id, { amount: 100, reason: "course_enrolled", label: "Course enrollment bonus" });

  return NextResponse.json({ enrollment });
}
