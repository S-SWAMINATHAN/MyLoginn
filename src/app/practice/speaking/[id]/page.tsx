import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { SpeakingRoom, type ClientItem } from "@/components/practice/SpeakingRoom";
import { getOwnSession } from "@/lib/practice/sessions";
import { MAX_ATTEMPTS_PER_ITEM, SCENES, TWISTER_MODES, challengeSeconds, exerciseByKind, itemById } from "@/lib/practice/speaking/content";
import type { SpeakingConfig, SpeakingState } from "@/lib/practice/speaking/engine";

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

  const config = session.config as unknown as SpeakingConfig;
  const state = session.state as unknown as SpeakingState;
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
    <Container className="max-w-6xl py-6 sm:py-8">
      <h1 className="mb-4 text-xl font-bold text-story-navy sm:text-2xl dark:text-foreground">{session.title}</h1>
      <SpeakingRoom sessionId={session.id} kind={ex.kind} title={session.title} reps={mode?.reps ?? 1} dims={ex.dims} items={items} state={state} maxAttempts={MAX_ATTEMPTS_PER_ITEM} />
    </Container>
  );
}
