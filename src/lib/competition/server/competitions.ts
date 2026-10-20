import "server-only";
import { Prisma, type Competition, type CcInternshipReward } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPETITION_LANGUAGES, toLanguageList } from "../languages";
import { describePolicy, parsePolicy } from "../policy";
import { describeTieBreak } from "../scoring";
import { registrationOpenNow } from "../state";
import { blueprintMaxScore, blueprintQuestionCount, parseBlueprint, type CompetitionStatus } from "../types";

export type CompetitionWithReward = Competition & { reward: CcInternshipReward | null };

/** The competition the public pages show: the most recent one that is neither a draft nor archived. */
export async function getCurrentCompetition(): Promise<CompetitionWithReward | null> {
  try {
    return await prisma.competition.findFirst({
      where: { status: { notIn: ["DRAFT", "ARCHIVED"] } },
      orderBy: { startsAt: "desc" },
      include: { reward: true },
    });
  } catch (error) {
    // Until the competition tables exist in this database (they are created by `prisma db push` in the deploy
    // build), there is simply no competition to show. Say so once instead of failing every page view.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      if (!warnedMissingTables) console.warn("Coding competition: tables not created in this database yet; showing no competition.");
      warnedMissingTables = true;
      return null;
    }
    console.error("getCurrentCompetition: database unreachable", error);
    return null;
  }
}
let warnedMissingTables = false;

export const getCompetition = (id: string) => prisma.competition.findUnique({ where: { id }, include: { reward: true } });

/** Everything a visitor may see. No question data, no counts other than verified registrations. */
export function publicView(c: CompetitionWithReward, now = new Date()) {
  const blueprint = parseBlueprint(c.blueprint);
  const policy = parsePolicy(c.violationPolicy);
  const status = c.status as CompetitionStatus;
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    eligibility: c.eligibility,
    rules: c.rules,
    timezone: c.timezone,
    status,
    registrationOpensAt: c.registrationOpensAt.toISOString(),
    registrationClosesAt: c.registrationClosesAt.toISOString(),
    startsAt: c.startsAt.toISOString(),
    endsAt: c.endsAt.toISOString(),
    lateJoinMinutes: c.lateJoinMinutes,
    durationMinutes: c.durationMinutes,
    resultsPublishAt: c.resultsPublishAt.toISOString(),
    languages: toLanguageList(c.languages).map((key) => ({ key, label: COMPETITION_LANGUAGES[key].label })),
    blueprint,
    questionCount: blueprintQuestionCount(blueprint),
    maxScore: blueprintMaxScore(blueprint),
    negativeMarkPerWrong: c.negativeMarkPerWrong,
    registrationCount: c.registrationCount,
    maxParticipants: c.maxParticipants,
    seatsLeft: Math.max(0, c.maxParticipants - c.registrationCount),
    registrationOpen: registrationOpenNow(status, c, now) && c.registrationCount < c.maxParticipants,
    screenShareRequired: c.screenShareRequired,
    fullscreenRequired: c.fullscreenRequired,
    monitoringRules: describePolicy(policy, c),
    tieBreak: describeTieBreak(c.tieBreakBySubmitTime),
    certificateMinPercent: c.certificateMinPercent,
    autosaveCountsAsSubmission: c.autosaveCountsAsSubmission,
    resultsPublished: status === "RESULTS_PUBLISHED" || (status === "ARCHIVED" && !!c.resultsPublishedAt),
    reward: c.reward
      ? {
          role: c.reward.role,
          stipendAmount: c.reward.stipendAmount,
          stipendCurrency: c.reward.stipendCurrency,
          stipendPeriod: c.reward.stipendPeriod,
          durationText: c.reward.durationText,
          expectedStartDate: c.reward.expectedStartDate?.toISOString() ?? null,
          workMode: c.reward.workMode,
          location: c.reward.location,
          eligibility: c.reward.eligibility,
          requiredDocuments: c.reward.requiredDocuments,
          offerValidDays: c.reward.offerValidDays,
        }
      : null,
  };
}

export type PublicCompetition = ReturnType<typeof publicView>;

/** In-app notifications (the existing Notification model). */
export async function notifyUsers(userIds: string[], title: string, body: string) {
  const ids = [...new Set(userIds)];
  for (let i = 0; i < ids.length; i += 500)
    await prisma.notification.createMany({ data: ids.slice(i, i + 500).map((userId) => ({ userId, title, body })) });
}
