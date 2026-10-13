import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/**
 * Awards points exactly once per `dedupeKey`. The ledger row is created first inside the
 * transaction; a repeated key violates the unique index, the whole transaction rolls back
 * (so the balance is not incremented) and false is returned.
 */
export async function awardOnce(userId: string, dedupeKey: string, amount: number, reason: string, label: string): Promise<boolean> {
  if (!Number.isInteger(amount) || amount <= 0) return false;
  try {
    await prisma.$transaction([
      prisma.pointsTransaction.create({ data: { userId, amount, reason, label, dedupeKey } }),
      prisma.user.update({ where: { id: userId }, data: { points: { increment: amount } } }),
    ]);
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
