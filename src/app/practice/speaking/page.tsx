import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { PageTitle } from "@/components/logiquest/ui";
import { SpeakingPicker } from "@/components/practice/SpeakingPicker";
import { EXERCISES } from "@/lib/practice/speaking/content";

export const metadata = {
  title: "Speaking Lab — Spoken English, Fluency, Pronunciation & Tongue Twisters",
  description: "Improve spoken English for interviews: listen and repeat, image description, storytelling, listening comprehension, grammar speaking, timed fluency training, pronunciation with IPA and tongue-twister games — scored by AI.",
};

type Props = { searchParams: Promise<{ kind?: string; group?: string }> };

export default async function SpeakingPage({ searchParams }: Props) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  const exercises = EXERCISES.map(({ kind, title, short, desc, group, perSession }) => ({ kind, title, short, desc, group, perSession }));
  return (
    <Container className="max-w-7xl space-y-6 py-6 sm:py-10">
      <PageTitle eyebrow="Speaking Lab" title="Become a confident, clear English speaker." sub="Short spoken exercises with feedback on every word: pronunciation, grammar, fluency, vocabulary and structure." />
      <SpeakingPicker exercises={exercises} loggedIn={Boolean(user)} initialKind={sp.kind} initialGroup={sp.group} />
    </Container>
  );
}
