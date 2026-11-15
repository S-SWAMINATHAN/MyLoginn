import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { SpeakingRoom, type ClientItem } from "@/components/practice/SpeakingRoom";
import { getOwnSession, toJson } from "@/lib/practice/sessions";
import { prisma } from "@/lib/prisma";
import { MAX_ATTEMPTS_PER_ITEM, SCENES, TWISTER_MODES, challengeSeconds, exerciseByKind, itemById } from "@/lib/practice/speaking/content";
import { expandSpeakingConfig, type SpeakingConfig, type SpeakingState } from "@/lib/practice/speaking/engine";

export const metadata = { title: "Speaking Lab", robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

const HIDDEN_TEXT = new Set(["listen", "comprehension"]);

export default async function SpeakingSessionPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/practice/speaking/${id}`)}`);
  const session = await getOwnSession(id, user.id);
  if (!session || session.module !== "SPEAKING") notFound();
  if (session.status === "COMPLETED") redirect(`/practice/reports/${id}`);
  if (session.status === "ABANDONED") redirect("/practice/speaking");

  let config = session.config as unknown as SpeakingConfig;
  let state = session.state as unknown as SpeakingState;
  const expandedConfig = expandSpeakingConfig(config);
  if (expandedConfig !== config) {
    const updated = await prisma.practiceSession.updateMany({
      where: { id: session.id, userId: user.id, status: "ACTIVE", config: { equals: toJson(session.config) } },
      data: { config: toJson(expandedConfig) },
    });
    if (updated.count) config = expandedConfig;
    else {
      const latest = await prisma.practiceSession.findFirst({ where: { id: session.id, userId: user.id } });
      if (!latest || latest.status === "COMPLETED") redirect(`/practice/reports/${id}`);
      if (latest.status === "ABANDONED") redirect("/practice/speaking");
      config = latest.config as unknown as SpeakingConfig;
      state = latest.state as unknown as SpeakingState;
    }
  }
  const ex = exerciseByKind(config.kind)!;
  const mode = config.mode ? TWISTER_MODES.find((m) => m.id === config.mode)! : null;
  // Only what the learner may see goes to the browser: never the evaluator's reference (expected answers, scene facts).
  const items: ClientItem[] = config.items.map((itemId) => {
    const it = itemById(itemId)!;
    return {
      id: it.id, display: it.display, speak: it.speak, target: it.target, scene: it.scene, sceneTitle: it.scene ? SCENES[it.scene]?.title : undefined,
      guide: it.guide, focus: it.focus, seconds: it.seconds, hidden: HIDDEN_TEXT.has(ex.kind),
      limit: mode?.limit && it.target ? challengeSeconds(it.target, mode.reps) : undefined,
    };
  });

  return (
    <Container className="max-w-screen-2xl space-y-5 py-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">{session.title}</h1>
      <SpeakingRoom sessionId={session.id} kind={ex.kind} title={session.title} reps={mode?.reps ?? 1} dims={ex.dims} items={items} state={state} maxAttempts={MAX_ATTEMPTS_PER_ITEM} />
    </Container>
  );
}
