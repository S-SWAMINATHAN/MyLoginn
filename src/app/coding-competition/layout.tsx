import { getCurrentUser } from "@/lib/auth";
import { CompetitionNav } from "@/components/competition/CompetitionNav";
import { getCurrentCompetition } from "@/lib/competition/server/competitions";
import { getRegistration } from "@/lib/competition/server/registration";

export default async function CodingCompetitionLayout({ children }: { children: React.ReactNode }) {
  const [user, competition] = await Promise.all([getCurrentUser(), getCurrentCompetition()]);
  const registered = !!(user && competition && (await getRegistration(competition.id, user.id).catch(() => null)));
  return (
    <>
      <CompetitionNav registered={registered} />
      {children}
    </>
  );
}
