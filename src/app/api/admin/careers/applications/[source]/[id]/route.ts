import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { reviewSchema, statusesFor, type ApplicationSource } from "@/lib/jobs";

export const runtime = "nodejs";

/** Review an application: change its status, rate the candidate (1 to 5, 0 clears it) and keep private notes. */
export async function PATCH(req: Request, { params }: { params: Promise<{ source: string; id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { source, id } = await params;
  if (source !== "job" && source !== "internship") return NextResponse.json({ error: "Unknown application type" }, { status: 400 });
  const kind = source as ApplicationSource;

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { status, rating, notes } = parsed.data;
  if (status && !statusesFor(kind).some((s) => s.id === status)) return NextResponse.json({ error: "That status is not valid for this application" }, { status: 400 });

  const data = {
    ...(status ? { status } : {}),
    ...(rating !== undefined ? { rating: rating === 0 ? null : rating } : {}),
    ...(notes !== undefined ? { notes: notes || null } : {}),
    reviewedAt: new Date(),
  };

  try {
    if (kind === "job") await prisma.jobApplication.update({ where: { id }, data });
    else await prisma.internshipApplication.update({ where: { id }, data });
  } catch {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
