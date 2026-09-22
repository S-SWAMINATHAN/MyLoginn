import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "requirement_discussion", "proposal_sent", "negotiation", "approved", "in_development", "completed", "rejected", "on_hold"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().trim().max(100).optional().nullable(),
  internalNotes: z.string().trim().max(5000).optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  try {
    const { id } = await params;
    const request = await prisma.projectRequest.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
}
