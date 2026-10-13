import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseAccess } from "@/lib/lms/entitlements";

/** Free LMS courses only. Paid courses are unlocked solely by a server-verified payment. */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to enroll in this course." }, { status: 401 });
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true, price: true, status: true, engine: true } });
  if (!course || course.engine !== "lms" || course.status !== "published") return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.price !== 0) return NextResponse.json({ error: "This is a paid course. Complete checkout to unlock it.", checkout: `/courses/${slug}/checkout` }, { status: 402 });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: {},
    create: { userId: user.id, courseId: course.id, status: "active", progress: 0 },
  });
  const access = await getCourseAccess(user, course);
  return NextResponse.json({ enrollment, access: { allowed: access.allowed, reason: access.reason } });
}
