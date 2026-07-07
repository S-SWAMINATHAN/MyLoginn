import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to enroll" }, { status: 401 });
  }

  const { courseId } = (await req.json()) as { courseId?: string };
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You're already enrolled in this course" }, { status: 409 });
  }

  const amount = course.price * 100; // paise
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `course_${course.id}_${Date.now()}`,
    notes: { courseId: course.id, userId: user.id },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
