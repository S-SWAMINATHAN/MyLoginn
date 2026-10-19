import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;
const schema = z.object({ action: z.enum(["close", "reopen"]), days: z.number().int().min(1).max(365).optional() });

/**
 * Open or close an internship's applications. Internships are open while their deadline has not passed, so closing sets
 * the deadline to yesterday and reopening sets it to a number of days from now (30 by default). Everything else about an
 * internship is edited in the Internships manager.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const applyDeadline = new Date(parsed.data.action === "close" ? Date.now() - 2 * DAY : Date.now() + (parsed.data.days ?? 30) * DAY);
  try {
    const internship = await prisma.internship.update({ where: { id }, data: { applyDeadline }, select: { id: true, applyDeadline: true } });
    return NextResponse.json({ internship: { id: internship.id, applyDeadline: internship.applyDeadline.toISOString() } });
  } catch {
    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  }
}
