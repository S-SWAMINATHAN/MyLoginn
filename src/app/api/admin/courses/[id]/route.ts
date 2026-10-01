import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const courseUpdateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  category: z.string().trim().min(2).max(40).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  description: z.string().trim().min(10).optional(),
  instructor: z.string().trim().min(2).optional(),
  durationWeeks: z.coerce.number().int().min(1).max(52).optional(),
  price: z.coerce.number().int().min(0).optional(),
  originalPrice: z.coerce.number().int().min(1).optional(),
  featured: z.coerce.boolean().optional(),
}).refine((course) => course.originalPrice === undefined || course.price === undefined || course.originalPrice > course.price, {
  message: "Original price must be greater than the final course price",
  path: ["originalPrice"],
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = courseUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { id } = await params;
  const course = await prisma.course.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ course });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.enrollment.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
