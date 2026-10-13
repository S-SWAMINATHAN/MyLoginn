import { prisma } from "@/lib/prisma";

/** Append-only administrator audit trail. Never throws: auditing must not break the admin action itself. */
export async function audit(actorId: string, action: string, entity: string, entityId?: string | null, meta?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({ data: { actorId, action, entity, entityId: entityId ?? null, meta: (meta ?? undefined) as never } });
  } catch (error) {
    console.error("audit log write failed", action, entity, error);
  }
}
