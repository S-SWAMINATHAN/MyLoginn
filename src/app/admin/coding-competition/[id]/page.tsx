import { CompetitionConsole } from "@/components/admin/competition/CompetitionConsole";

export const metadata = { title: "Competition — MyLoginn Admin" };

export default async function AdminCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompetitionConsole id={id} />;
}
