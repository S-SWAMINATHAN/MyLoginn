import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { CompetitionLanding, NoCompetition } from "@/components/competition/Landing";
import { getCurrentCompetition, publicView } from "@/lib/competition/server/competitions";
import { getRegistration } from "@/lib/competition/server/registration";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCurrentCompetition();
  return {
    title: c ? `${c.title} — Coding Competition` : "Coding Competition",
    description: c
      ? `Register for ${c.title}: a live, monitored online coding competition by MyLoginn Learn with unique question sets, server-side judging, certificates and a paid internship for the winner.`
      : "Live online coding competitions by MyLoginn Learn with unique question sets, certificates and internship rewards.",
    alternates: { canonical: "/coding-competition" },
  };
}

export default async function CodingCompetitionPage() {
  const [c, user] = await Promise.all([getCurrentCompetition(), getCurrentUser()]);
  if (!c) return <NoCompetition signedIn={!!user} />;
  const reg = user ? await getRegistration(c.id, user.id) : null;
  const attempt = reg ? await prisma.ccAttempt.findUnique({ where: { registrationId: reg.id }, select: { status: true } }) : null;
  return (
    <CompetitionLanding
      c={publicView(c)}
      me={{ signedIn: !!user, registered: !!reg, candidateId: reg?.candidateId ?? null, attemptStatus: attempt?.status ?? null }}
      serverNow={new Date().toISOString()}
    />
  );
}
