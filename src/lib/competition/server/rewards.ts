import "server-only";
import { z } from "zod";
import type { CcOfferStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "../types";
import { audit } from "./audit";
import { notifyUsers } from "./competitions";
import { ApiError } from "./http";

export const rewardSchema = z.object({
  role: z.string().trim().min(3).max(120),
  stipendAmount: z.number().int().min(1, "Enter the stipend amount").max(10_000_000),
  stipendCurrency: z.string().trim().length(3).toUpperCase().default("INR"),
  stipendPeriod: z.enum(["per month", "total"]).default("per month"),
  durationText: z.string().trim().min(2).max(60),
  expectedStartDate: z.string().datetime().nullable().optional(),
  workMode: z.enum(["Remote", "On-site", "Hybrid"]),
  location: z.string().trim().max(120).default(""),
  eligibility: z.string().trim().min(10).max(4000),
  requiredDocuments: z.string().trim().max(4000).default(""),
  offerValidDays: z.number().int().min(3).max(90).default(14),
});

/**
 * The reward is part of what candidates sign up for, so its terms are fixed once registration opens.
 * Opening registration requires a configured reward (server/lifecycle.ts).
 */
export async function upsertReward(competitionId: string, input: z.infer<typeof rewardSchema>, actorId: string) {
  const c = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!c) throw new ApiError(404, "Competition not found.");
  if (c.status !== "DRAFT") throw new ApiError(409, "Reward terms are locked once registration opens: candidates registered on these terms.");
  const data = { ...input, expectedStartDate: input.expectedStartDate ? new Date(input.expectedStartDate) : null };
  return prisma.$transaction(async (tx) => {
    const r = await tx.ccInternshipReward.upsert({ where: { competitionId }, create: { competitionId, ...data }, update: data });
    await audit(tx, { competitionId, actorId, action: "reward.update", entity: "CcInternshipReward", entityId: r.id, meta: { stipendAmount: r.stipendAmount, durationText: r.durationText } });
    return r;
  });
}

/**
 * After publication: opens an offer in ELIGIBILITY_CHECK for each first-place candidate (a shared first place gets
 * one each; the admin decides under the published rules). Nothing is sent until an admin approves.
 */
export async function createWinnerOffers(competitionId: string) {
  const reward = await prisma.ccInternshipReward.findUnique({ where: { competitionId } });
  if (!reward) return 0;
  const snap = await prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId, publishedAt: { not: null } }, orderBy: { version: "desc" } });
  const winners = ((snap?.entries ?? []) as unknown as LeaderboardEntry[]).filter((e) => e.rank === 1);
  const regs = await prisma.ccRegistration.findMany({ where: { competitionId, candidateId: { in: winners.map((w) => w.candidateId) } } });
  const terms = { role: reward.role, stipendAmount: reward.stipendAmount, stipendCurrency: reward.stipendCurrency, stipendPeriod: reward.stipendPeriod, durationText: reward.durationText, expectedStartDate: reward.expectedStartDate?.toISOString() ?? null, workMode: reward.workMode, location: reward.location, eligibility: reward.eligibility, requiredDocuments: reward.requiredDocuments };
  for (const r of regs)
    await prisma.ccInternshipOffer.upsert({ where: { competitionId_registrationId: { competitionId, registrationId: r.id } }, create: { competitionId, registrationId: r.id, terms }, update: {} });
  return regs.length;
}

const TRANSITIONS: Record<string, { from: CcOfferStatus[]; to: CcOfferStatus }> = {
  approve: { from: ["ELIGIBILITY_CHECK"], to: "APPROVED" },
  send: { from: ["APPROVED"], to: "SENT" },
  withdraw: { from: ["ELIGIBILITY_CHECK", "APPROVED", "SENT"], to: "WITHDRAWN" },
};

/** Admin steps: approve (eligibility verified, notes required) → send (starts the expiry clock) / withdraw. */
export async function offerAction(offerId: string, action: keyof typeof TRANSITIONS, notes: string, actorId: string) {
  const t = TRANSITIONS[action];
  if (!t) throw new ApiError(400, "Unknown action.");
  if ((action === "approve" || action === "withdraw") && notes.trim().length < 10) throw new ApiError(400, "Record the eligibility check or the reason (at least 10 characters).");
  const offer = await prisma.ccInternshipOffer.findUnique({ where: { id: offerId }, include: { registration: true, competition: { include: { reward: true } } } });
  if (!offer) throw new ApiError(404, "Offer not found.");
  if (!t.from.includes(offer.status)) throw new ApiError(409, `This offer is ${offer.status.toLowerCase().replace("_", " ")}.`);
  const now = new Date();
  const validDays = offer.competition.reward?.offerValidDays ?? 14;
  await prisma.$transaction(async (tx) => {
    await tx.ccInternshipOffer.update({
      where: { id: offerId },
      data: {
        status: t.to,
        ...(action === "approve" ? { approvedById: actorId, approvedAt: now, eligibilityNotes: notes.trim() } : {}),
        ...(action === "send" ? { sentAt: now, expiresAt: new Date(now.getTime() + validDays * 86_400_000) } : {}),
        ...(action === "withdraw" ? { eligibilityNotes: `${offer.eligibilityNotes ?? ""}\nWithdrawn: ${notes.trim()}`.trim() } : {}),
      },
    });
    await audit(tx, { competitionId: offer.competitionId, actorId, action: `offer.${action}`, entity: "CcInternshipOffer", entityId: offerId, meta: { notes: notes.trim() || null } });
  });
  if (action === "send")
    await notifyUsers([offer.registration.userId], "Internship offer from MyLoginn Tech", `Congratulations! Your internship offer for ${offer.competition.title} is on your competition dashboard. Please respond within ${validDays} days.`);
}

/** Candidate response, only to their own sent, unexpired offer. */
export async function respondToOffer(offerId: string, userId: string, accept: boolean) {
  const offer = await prisma.ccInternshipOffer.findUnique({ where: { id: offerId }, include: { registration: true } });
  if (!offer || offer.registration.userId !== userId) throw new ApiError(404, "Offer not found.");
  if (offer.status !== "SENT") throw new ApiError(409, "This offer is not awaiting a response.");
  if (offer.expiresAt && offer.expiresAt < new Date()) throw new ApiError(409, "This offer has expired.");
  await prisma.$transaction(async (tx) => {
    const moved = await tx.ccInternshipOffer.updateMany({ where: { id: offerId, status: "SENT" }, data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() } });
    if (!moved.count) throw new ApiError(409, "This offer is not awaiting a response.");
    await audit(tx, { competitionId: offer.competitionId, actorId: userId, action: accept ? "offer.accept" : "offer.decline", entity: "CcInternshipOffer", entityId: offerId });
  });
}

export async function expireOffers() {
  const r = await prisma.ccInternshipOffer.updateMany({ where: { status: "SENT", expiresAt: { lt: new Date() } }, data: { status: "EXPIRED" } });
  return r.count;
}
