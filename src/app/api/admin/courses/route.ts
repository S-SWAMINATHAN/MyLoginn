import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const courseInputSchema = z.object({
  title: z.string().trim().min(3),
  category: z.string().trim().min(2).max(40),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  description: z.string().trim().min(10),
  instructor: z.string().trim().min(2),
  durationWeeks: z.coerce.number().int().min(1).max(52),
  price: z.coerce.number().int().min(0),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = courseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const course = await prisma.course.create({
    data: {
      ...data,
      slug,
      tags: JSON.stringify([]),
      syllabus: JSON.stringify([]),
    },
  });

  return NextResponse.json({ course });
}
