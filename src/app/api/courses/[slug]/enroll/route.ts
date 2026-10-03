import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to enroll in this course." }, { status: 401 });

  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true, price: true } });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.price !== 0) return NextResponse.json({ error: "This course requires the regular checkout." }, { status: 400 });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: {},
    create: { userId: user.id, courseId: course.id, status: "active", progress: 0 },
  });
  return NextResponse.json({ enrollment });
}
