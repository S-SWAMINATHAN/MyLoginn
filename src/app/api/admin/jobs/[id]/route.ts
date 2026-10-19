import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jobInputSchema } from "@/lib/jobs";

export const runtime = "nodejs";

const quickSchema = z.object({ quickStatus: z.enum(["open", "closed", "draft"]) });

/**
 * Update an opening: either a full edit (same shape as creating one) or a one-click status change.
 * Reopening a role whose last application day has already passed clears that date, so it really opens.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const existing = await prisma.jobOpening.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Opening not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const quick = quickSchema.safeParse(body);
  if (quick.success) {
    const status = quick.data.quickStatus;
    const closeBy = status === "open" && existing.closeBy && existing.closeBy.getTime() + 86_400_000 <= Date.now() ? null : existing.closeBy;
    const openFrom = status === "open" ? null : existing.openFrom;
    const job = await prisma.jobOpening.update({ where: { id }, data: { status, closeBy, openFrom } });
    return NextResponse.json({ job });
  }

  const parsed = jobInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const job = await prisma.jobOpening.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ job });
}

/** Deleting an opening keeps its applications (they become open applications) so no candidate record is lost. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const existing = await prisma.jobOpening.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Opening not found" }, { status: 404 });
  await prisma.jobOpening.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
