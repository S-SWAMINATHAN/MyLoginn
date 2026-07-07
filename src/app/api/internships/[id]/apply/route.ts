import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { awardPoints } from "@/lib/streak";
import { internshipApplicationSchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to apply" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = internshipApplicationSchema.safeParse({ ...body, internshipId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship) {
    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  }

  const existing = await prisma.internshipApplication.findUnique({
    where: { userId_internshipId: { userId: user.id, internshipId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already applied to this internship" }, { status: 409 });
  }

  const application = await prisma.internshipApplication.create({
    data: {
      userId: user.id,
      internshipId: id,
      coverNote: parsed.data.coverNote || null,
      resumeName: parsed.data.resumeName || null,
    },
  });

  await awardPoints(user.id, { amount: 25, reason: "internship_applied", label: "Internship application bonus" });

  return NextResponse.json({ application });
}
