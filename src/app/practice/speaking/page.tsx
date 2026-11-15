import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { SpeakingPicker } from "@/components/practice/SpeakingPicker";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { EXERCISES } from "@/lib/practice/speaking/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Speaking Lab — Spoken English, Fluency, Pronunciation & Tongue Twisters",
  absoluteTitle: true,
  description: "Improve spoken English for interviews: listen and repeat, image description, storytelling, listening comprehension, grammar speaking, timed fluency training, pronunciation with IPA and tongue-twister games — scored by AI.",
  path: "/practice/speaking",
  keywords: ["spoken English practice", "pronunciation practice", "English fluency"],
});

type Props = { searchParams: Promise<{ kind?: string; group?: string }> };

export default async function SpeakingPage({ searchParams }: Props) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  const exercises = EXERCISES.map(({ kind, title, short, desc, group, perSession, items }) => ({ kind, title, short, desc, group, perSession, itemCount: items.length }));
  return (
    <Container className="max-w-screen-2xl space-y-7 py-6 sm:py-10">
      <PracticeHero
        eyebrow="Speaking lab"
        title="Find a clearer, more confident voice."
        description="Practise pronunciation, fluency, listening and verbal reasoning with focused speaking exercises. Every session is shuffled and gives you useful feedback."
        facts={[
          { value: String(exercises.length), label: "exercise types" },
          { value: String(Math.max(...exercises.map((exercise) => exercise.perSession))), label: "per session" },
          { value: "Word-level", label: "pronunciation feedback" },
        ]}
      />
      <SpeakingPicker exercises={exercises} loggedIn={Boolean(user)} initialKind={sp.kind} initialGroup={sp.group} />
    </Container>
  );
}
