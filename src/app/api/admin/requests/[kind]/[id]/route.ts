import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const leadUpdate = z.object({ status: z.enum(["new", "contacted", "closed"]) });
const projectUpdate = z.object({
  status: z.enum(["new", "contacted", "requirement_discussion", "proposal_sent", "negotiation", "approved", "in_development", "completed", "rejected", "on_hold"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().trim().max(100).optional().nullable(),
  internalNotes: z.string().trim().max(5000).optional().nullable(),
});

type Ctx = { params: Promise<{ kind: string; id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { kind, id } = await params;
  const body = await req.json().catch(() => null);
  try {
    if (kind === "lead") {
      const parsed = leadUpdate.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
      await prisma.lead.update({ where: { id }, data: parsed.data });
    } else if (kind === "project") {
      const parsed = projectUpdate.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
      await prisma.projectRequest.update({ where: { id }, data: parsed.data });
    } else {
      return NextResponse.json({ error: "Unknown request type" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { kind, id } = await params;
  // Project requests are business records and are never deleted (matches the previous admin screen).
  if (kind !== "lead") return NextResponse.json({ error: "Only contact submissions can be deleted" }, { status: 405 });
  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
}
