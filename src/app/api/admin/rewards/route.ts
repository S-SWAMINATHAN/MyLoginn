import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/streak";

export const runtime = "nodejs";

/** Points programme overview: totals, the all-time leaderboard (full names for admins) and the latest ledger entries. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [earned, spent, activeStreaks, topStreak, board, ledger] = await Promise.all([
    prisma.pointsTransaction.aggregate({ where: { amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.pointsTransaction.aggregate({ where: { amount: { lt: 0 } }, _sum: { amount: true } }),
    prisma.user.count({ where: { currentStreak: { gt: 0 } } }),
    prisma.user.aggregate({ _max: { longestStreak: true } }),
    prisma.pointsTransaction.groupBy({ by: ["userId"], where: { amount: { gt: 0 } }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take: 20 }),
    prisma.pointsTransaction.findMany({ take: 25, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
  ]);

  const users = await prisma.user.findMany({
    where: { id: { in: board.map((b) => b.userId) } },
    select: { id: true, name: true, email: true, role: true, currentStreak: true, longestStreak: true, points: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    totals: {
      pointsEarned: earned._sum.amount ?? 0,
      pointsSpent: Math.abs(spent._sum.amount ?? 0),
      activeStreaks,
      longestStreak: topStreak._max.longestStreak ?? 0,
    },
    leaderboard: board.flatMap((b, i) => {
      const u = byId.get(b.userId);
      return u ? [{ rank: i + 1, id: u.id, name: u.name, email: u.email, role: u.role, earned: b._sum.amount ?? 0, balance: u.points, streak: u.currentStreak, best: u.longestStreak }] : [];
    }),
    ledger: ledger.map((t) => ({ id: t.id, user: t.user.name, email: t.user.email, amount: t.amount, label: t.label, reason: t.reason, at: t.createdAt.toISOString() })),
  });
}

const adjustSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter the learner's email"),
  amount: z.number().int().refine((n) => n !== 0, "Amount cannot be zero").refine((n) => Math.abs(n) <= 5000, "Adjust up to 5,000 points at a time"),
  label: z.string().trim().min(3, "Add a short reason").max(80, "Keep the reason under 80 characters"),
});

/** Manually award or deduct points; recorded in the ledger as an admin adjustment. */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = adjustSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, name: true, points: true } });
  if (!user) return NextResponse.json({ error: "No account uses that email" }, { status: 404 });
  if (parsed.data.amount < 0 && user.points + parsed.data.amount < 0) {
    return NextResponse.json({ error: `${user.name} only has ${user.points} points to deduct` }, { status: 400 });
  }

  await awardPoints(user.id, { amount: parsed.data.amount, reason: "admin_adjustment", label: parsed.data.label });
  return NextResponse.json({ ok: true, user: user.name });
}
