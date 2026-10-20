import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/competition/LoginForm";
import { getCurrentCompetition } from "@/lib/competition/server/competitions";

export const metadata = { title: "Student Login — Coding Competition", robots: { index: false, follow: true } };

export default async function CompetitionLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const [user, c] = await Promise.all([getCurrentUser(), getCurrentCompetition()]);
  if (user) redirect(next && /^\/coding-competition(\/[\w/-]*)?$/.test(next) ? next : "/coding-competition/dashboard");
  return <LoginForm next={next ?? null} title={c?.title ?? null} />;
}
