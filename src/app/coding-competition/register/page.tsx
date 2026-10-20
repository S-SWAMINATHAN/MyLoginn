import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NoCompetition } from "@/components/competition/Landing";
import { RegisterFlow } from "@/components/competition/RegisterFlow";
import { getCurrentCompetition, publicView } from "@/lib/competition/server/competitions";
import { getRegistration } from "@/lib/competition/server/registration";

export const dynamic = "force-dynamic";
export const metadata = { title: "Register — Coding Competition", description: "Register for the MyLoginn coding competition in a minute. No OTP needed." };

export default async function RegisterPage() {
  const [c, user] = await Promise.all([getCurrentCompetition(), getCurrentUser()]);
  if (!c) return <NoCompetition signedIn={!!user} />;
  if (user && (await getRegistration(c.id, user.id))) redirect("/coding-competition/dashboard");
  const v = publicView(c);
  return (
    <RegisterFlow
      c={{
        title: v.title,
        timezone: v.timezone,
        startsAt: v.startsAt,
        endsAt: v.endsAt,
        registrationClosesAt: v.registrationClosesAt,
        resultsPublishAt: v.resultsPublishAt,
        durationMinutes: v.durationMinutes,
        questionCount: v.questionCount,
        maxScore: v.maxScore,
        registrationCount: v.registrationCount,
        maxParticipants: v.maxParticipants,
        registrationOpen: v.registrationOpen,
        screenShareRequired: v.screenShareRequired,
        reward: v.reward && { role: v.reward.role, stipendAmount: v.reward.stipendAmount, stipendCurrency: v.reward.stipendCurrency, stipendPeriod: v.reward.stipendPeriod, durationText: v.reward.durationText },
      }}
      signedIn={user ? { name: user.name, email: user.email, phone: user.phone } : null}
      serverNow={new Date().toISOString()}
    />
  );
}
