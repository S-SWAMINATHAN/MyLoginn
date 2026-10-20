import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postingSaveError } from "@/lib/postings";
import { INTERNSHIP_POST_STATUSES, internshipInputSchema } from "@/lib/jobs";

export const runtime = "nodejs";

const quickSchema = z.object({ quickStatus: z.enum(INTERNSHIP_POST_STATUSES) });

/** Update an internship: a full edit (same shape as creating one) or a one-click status change. There is no end date. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const existing = await prisma.internship.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Internship not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const quick = quickSchema.safeParse(body);
  if (quick.success) {
    const internship = await prisma.internship.update({ where: { id }, data: { status: quick.data.quickStatus, applyDeadline: null }, select: { id: true, status: true } });
    return NextResponse.json({ internship });
  }

  const parsed = internshipInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  try {
    const internship = await prisma.internship.update({ where: { id }, data: { ...parsed.data, applyDeadline: null }, select: { id: true } });
    return NextResponse.json({ internship });
  } catch (error) {
    console.error("[careers] update internship failed", error);
    return NextResponse.json({ error: postingSaveError(error) }, { status: 500 });
  }
}

/** Deleting an internship also removes its applications (they belong to it). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.internship.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  await prisma.$transaction([
    prisma.internshipApplication.deleteMany({ where: { internshipId: id } }),
    prisma.internship.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
