import { PracticeView, type PracticeParams } from "@/components/logiquest/PracticeView";

export const metadata = {
  title: "Coding Quiz · LogiQuest",
  description: "Quick multiple-choice practice: output prediction, debugging, data structures, algorithms and complexity.",
  robots: { index: false, follow: true },
};

/** Multiple-choice coding practice (output prediction, debugging, concepts). Full coding challenges are at /logiquest/coding. */
export default async function CodingQuiz({ searchParams }: { searchParams: Promise<PracticeParams> }) {
  return <PracticeView category="coding" basePath="/logiquest/coding/quiz" sp={await searchParams} />;
}
