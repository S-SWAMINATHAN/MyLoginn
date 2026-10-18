import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err } from "@/lib/logiquest/http";

type Ctx = { params: Promise<{ id: string }> };

/** Deletes one of the learner's own sessions/reports. Ownership is checked in the query itself. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in.", 401);
  const { id } = await params;
  const removed = await prisma.practiceSession.deleteMany({ where: { id, userId: user.id } });
  if (!removed.count) return err("Report not found.", 404);
  return NextResponse.json({ ok: true });
}
