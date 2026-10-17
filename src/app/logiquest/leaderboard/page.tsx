import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { EmptyState } from "@/components/logiquest/ui";
import { BoardList, PeriodTabs, Podium } from "@/components/logiquest/LogiQuestVisuals";
import { getLogiQuestLeaderboard, type Period } from "@/lib/logiquest/leaderboard";

export const metadata = { title: "Leaderboard · LogiQuest", robots: { index: false, follow: true } };

const PERIODS: Period[] = ["week", "month", "all"];

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: raw } = await searchParams;
  const period = (PERIODS.find((p) => p === raw) ?? "all") as Period;
  const user = await getCurrentUser();
  const { top, me } = await getLogiQuestLeaderboard(user?.id ?? null, period);
  const meInTop = me && top.some((t) => t.userId === me.userId);
  const podium = top.slice(0, 3);
  const rest = top.slice(3);

  return (
    <Section className="overflow-hidden pb-16 pt-6 sm:pt-10">
      <Container className="max-w-4xl">
        <div className="text-center">
          <SplitHeadline as="h1" text="Leaderboard" className="mt-0 text-4xl font-bold tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              Ranked by skill score: XP from correct first answers (harder questions are worth more) and online tests, plus a bonus for topic variety and accuracy. Only your first answer to a question counts, so re-answering cannot climb the board.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-6 flex justify-center"><PeriodTabs active={period} /></Reveal>
        </div>

        <div key={period} className="mt-14">
          {top.length ? (
            <>
              <Podium top={podium} />
              {(rest.length > 0 || (me && !meInTop)) && <BoardList rows={rest} me={me && !meInTop ? me : null} showHeader />}
            </>
          ) : (
            <EmptyState title="No ranked learners yet" body="Answer questions correctly to earn XP and appear here." cta={<Link href="/logiquest" className="font-semibold text-story-royal">Start practising</Link>} />
          )}
        </div>

        {user ? (
          <p className="mt-5 text-center text-xs text-muted">Other learners see you as first name + last initial. Visibility controls for hiding your profile are coming to your LogiQuest profile.</p>
        ) : (
          <p className="mt-5 text-center text-sm"><Link className="font-semibold text-story-royal" href="/login?next=%2Flogiquest%2Fleaderboard">Log in</Link> to see your own rank.</p>
        )}
      </Container>
    </Section>
  );
}
