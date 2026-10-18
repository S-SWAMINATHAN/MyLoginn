import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { InterviewRoom } from "@/components/practice/InterviewRoom";
import { getOwnSession } from "@/lib/practice/sessions";
import { MAX_ANSWER_SECONDS, STAGE_LABEL, personaById, typeById, type InterviewConfig } from "@/lib/practice/interview/config";
import type { InterviewState } from "@/lib/practice/interview/engine";

export const metadata = { title: "AI Mock Interview", robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function InterviewSessionPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/practice/interview/${id}`)}`);
  const session = await getOwnSession(id, user.id);
  if (!session || session.module !== "INTERVIEW") notFound();
  if (session.status === "COMPLETED") redirect(`/practice/reports/${id}`);
  if (session.status === "ABANDONED") redirect("/practice/interview");

  const config = session.config as unknown as InterviewConfig;
  const state = session.state as unknown as InterviewState;
  const type = typeById(config.type)!;
  const persona = personaById(config.persona);

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <h1 className="sr-only">{type.label}</h1>
      <InterviewRoom
        sessionId={session.id}
        title={type.label}
        persona={{ name: persona.name, label: persona.label, voice: persona.voice }}
        plan={state.plan.map((s) => STAGE_LABEL[s])}
        asked={state.asked}
        question={state.current}
        done={state.done}
        coding={config.coding ? { title: config.coding.title, statement: config.coding.statement } : undefined}
        maxAnswerS={MAX_ANSWER_SECONDS}
      />
    </Container>
  );
}
