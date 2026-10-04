import { redirect } from "next/navigation";
import { Award, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Learning Leaderboard", robots: { index: false, follow: false } };

export default async function LeaderboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?next=%2Fleaderboard");
  const leaders = await prisma.user.findMany({
    where: { role: "STUDENT", points: { gt: 0 } },
    select: { id: true, name: true, points: true },
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    take: 100,
  });

  return <Section className="py-10 sm:py-14"><Container className="max-w-3xl">
    <div className="mb-7 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Trophy className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-brand-600">MyLoginn Learning</p><h1 className="text-2xl font-bold sm:text-3xl">Global leaderboard</h1></div></div>
    <p className="mb-6 text-sm leading-6 text-muted">Ranked by points earned from completed lessons and other MyLoginn learning activities.</p>
    {leaders[0]?.id === currentUser.id && <section role="status" className="mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 dark:border-amber-700 dark:from-amber-950/50 dark:via-yellow-950/30 dark:to-orange-950/40">
      <svg viewBox="0 0 100 110" role="img" aria-label="Animated first place winner badge" className="h-20 w-20 shrink-0 animate-bounce motion-reduce:animate-none">
        <path d="M28 58 22 99l28-13 28 13-6-41" fill="#f59e0b" stroke="#92400e" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="50" cy="42" r="31" fill="#fbbf24" stroke="#b45309" strokeWidth="5" />
        <path d="m50 19 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2 7-14Z" fill="#fff7cc" className="origin-center animate-spin motion-reduce:animate-none" style={{ animationDuration: "8s" }} />
        <text x="50" y="49" textAnchor="middle" fontSize="19" fontWeight="900" fill="#92400e">#1</text>
      </svg>
      <div><p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Leaderboard champion</p><h2 className="mt-1 text-xl font-bold">You’re in first place!</h2><p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">Your learning points put you at the top of the global leaderboard.</p></div>
    </section>}
    <Card className="divide-y divide-border-soft overflow-hidden p-0">
      {leaders.length ? leaders.map((leader, index) => <div key={leader.id} className={`flex items-center gap-4 px-4 py-4 sm:px-6 ${leader.id === currentUser.id ? "bg-brand-50/60 dark:bg-brand-900/10" : ""}`}>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${index < 3 ? "bg-amber-100 text-amber-800" : "bg-surface-2 text-muted"}`}>{index < 3 ? <Award className="h-4 w-4" aria-label={`Rank ${index + 1}`} /> : index + 1}</span>
        <span className="min-w-0 flex-1 truncate font-semibold">{leader.name}{leader.id === currentUser.id ? <span className="ml-2 text-xs font-medium text-brand-600">You</span> : null}</span>
        <span className="whitespace-nowrap text-sm font-bold text-brand-700 dark:text-brand-200">{leader.points.toLocaleString("en-IN")} pts</span>
      </div>) : <div className="px-6 py-12 text-center"><p className="font-semibold">No ranked learners yet</p><p className="mt-1 text-sm text-muted">Earn points through MyLoginn learning activities to appear here.</p></div>}
    </Card>
  </Container></Section>;
}
