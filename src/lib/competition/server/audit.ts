import "server-only";
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Db = Prisma.TransactionClient | typeof prisma;
type Entry = { competitionId?: string | null; actorId: string; action: string; entity: string; entityId?: string | null; meta?: Prisma.InputJsonValue };

const GENESIS = "0".repeat(64);
/** Key-sorted JSON: jsonb reorders object keys on storage, so the hash must not depend on key order. */
const canonical = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(canonical).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(",")}}`
      : JSON.stringify(v ?? null);
const digest = (prevHash: string, e: Entry, at: Date) =>
  createHash("sha256")
    .update(canonical([prevHash, e.competitionId ?? null, e.actorId, e.action, e.entity, e.entityId ?? null, e.meta ?? null, at.toISOString()]))
    .digest("hex");

/**
 * Appends to the hash-chained audit log. A transaction-scoped advisory lock serialises writers so the chain never
 * forks; call it inside the transaction that makes the change, so the change and its record commit together.
 */
export async function audit(db: Db, e: Entry) {
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('cc_audit_chain'))`;
  const last = await db.ccAuditLog.findFirst({ orderBy: { seq: "desc" }, select: { hash: true } });
  const prevHash = last?.hash ?? GENESIS;
  const createdAt = new Date();
  await db.ccAuditLog.create({
    data: { competitionId: e.competitionId ?? null, actorId: e.actorId, action: e.action, entity: e.entity, entityId: e.entityId ?? null, meta: e.meta, prevHash, hash: digest(prevHash, e, createdAt), createdAt },
  });
}

/** Audits outside an existing transaction. */
export const auditNow = (e: Entry) => prisma.$transaction((tx) => audit(tx, e));

/** Walks the chain and returns the first broken link, or null when every row is intact. */
export async function verifyAuditChain() {
  let prev = GENESIS;
  let cursor: number | undefined;
  for (;;) {
    const rows = await prisma.ccAuditLog.findMany({ where: cursor ? { seq: { gt: cursor } } : {}, orderBy: { seq: "asc" }, take: 1000 });
    if (!rows.length) return null;
    for (const r of rows) {
      const expected = digest(prev, { competitionId: r.competitionId, actorId: r.actorId, action: r.action, entity: r.entity, entityId: r.entityId, meta: (r.meta ?? undefined) as Prisma.InputJsonValue | undefined }, r.createdAt);
      if (r.prevHash !== prev || r.hash !== expected) return { seq: r.seq, id: r.id };
      prev = r.hash;
      cursor = r.seq;
    }
  }
}
