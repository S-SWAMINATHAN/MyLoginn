import Link from "next/link";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/logiquest/ui";
import { cn } from "@/lib/cn";
import { getLogiQuestLeaderboard, type LqLeaderEntry, type Period } from "@/lib/logiquest/leaderboard";

export const metadata = { title: "Leaderboard · LogiQuest", robots: { index: false, follow: true } };

const PERIODS: { id: Period; label: string }[] = [{ id: "week", label: "Weekly" }, { id: "month", label: "Monthly" }, { id: "all", label: "All time" }];

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: raw } = await searchParams;
  const period = (PERIODS.find((p) => p.id === raw)?.id ?? "all") as Period;
  const user = await getCurrentUser();
  const { top, me } = await getLogiQuestLeaderboard(user?.id ?? null, period);
  const meInTop = me && top.some((t) => t.userId === me.userId);

  return (
    <Section className="py-8 sm:py-12">
      <Container className="max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Trophy className="h-6 w-6" /></span>
          <div><Link href="/logiquest" className="text-xs font-bold uppercase tracking-wider text-brand-600">LogiQuest</Link><h1 className="text-2xl font-bold sm:text-3xl">Leaderboard</h1></div>
        </div>
        <p className="mb-4 text-sm text-muted">Ranked by skill score: XP earned from first solves (harder challenges are worth more), plus a bonus for topic variety and accuracy. Re-submitting a solved challenge earns nothing, so volume alone cannot climb the board.</p>
        <div role="tablist" aria-label="Time period" className="mb-4 inline-flex rounded-xl border border-border-soft bg-surface p-1">
          {PERIODS.map((p) => (
            <Link key={p.id} role="tab" aria-selected={p.id === period} href={`/logiquest/leaderboard?period=${p.id}`} className={cn("rounded-lg px-4 py-1.5 text-sm font-semibold", p.id === period ? "bg-brand-600 text-white" : "text-muted hover:text-foreground")}>{p.label}</Link>
          ))}
        </div>
        <Card className="overflow-x-auto p-0">
          {top.length ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border-soft text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Rank</th><th>Learner</th><th className="text-right">Score</th><th className="text-right">XP</th><th className="text-right">Solved</th><th className="text-right">Accuracy</th><th className="px-4 text-right">Streak</th></tr></thead>
              <tbody className="divide-y divide-border-soft">
                {top.map((e) => <Row key={e.userId} e={e} />)}
                {me && !meInTop ? <><tr><td colSpan={7} className="px-4 py-1 text-center text-xs text-muted">···</td></tr><Row e={me} /></> : null}
              </tbody>
            </table>
          ) : <EmptyState title="No ranked learners yet" body="Solve a challenge to earn XP and appear here." cta={<Link href="/logiquest/coding" className="font-semibold text-brand-600">Start your first challenge</Link>} />}
        </Card>
        {user ? <p className="mt-4 text-xs text-muted">Other learners see you as first name + last initial. Visibility controls for hiding your profile are coming to your LogiQuest profile.</p> : <p className="mt-4 text-sm"><Link className="font-semibold text-brand-600" href="/login?next=%2Flogiquest%2Fleaderboard">Log in</Link> to see your own rank.</p>}
      </Container>
    </Section>
  );
}

function Row({ e }: { e: LqLeaderEntry }) {
  return (
    <tr className={cn(e.isYou && "bg-brand-50/60 dark:bg-brand-900/10")}>
      <td className="px-4 py-3 font-bold tabular-nums">{e.rank}</td>
      <td className="py-3"><span className="flex items-center gap-2.5">
        {e.avatarUrl ? <img src={e.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white" style={{ background: e.avatarColor ?? "#94a3b8" }}>{e.name.charAt(0)}</span>}
        <span className="font-semibold">{e.name}{e.isYou ? <span className="ml-2 text-xs font-medium text-brand-600">You</span> : null}</span>
      </span></td>
      <td className="py-3 text-right font-bold tabular-nums text-brand-700 dark:text-brand-200">{e.score.toLocaleString("en-IN")}</td>
      <td className="py-3 text-right tabular-nums">{e.xp.toLocaleString("en-IN")}</td>
      <td className="py-3 text-right tabular-nums">{e.solved}</td>
      <td className="py-3 text-right tabular-nums">{e.accuracy}%</td>
      <td className="px-4 py-3 text-right tabular-nums">{e.streak > 0 ? `🔥 ${e.streak}` : "—"}</td>
    </tr>
  );
}
