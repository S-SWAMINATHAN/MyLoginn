import { notFound } from "next/navigation";
import { PracticeView, type PracticeParams } from "@/components/logiquest/PracticeView";
import { LQ_CATEGORIES } from "@/lib/logiquest/constants";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<PracticeParams> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const c = LQ_CATEGORIES.find((x) => x.slug === category);
  return { title: c ? `${c.label} Practice · LogiQuest` : "LogiQuest", robots: { index: false, follow: true } };
}

/** Multiple-choice practice for every non-coding category. (Coding challenges live at /logiquest/coding.) */
export default async function CategoryPractice({ params, searchParams }: Props) {
  const { category } = await params;
  if (category === "coding") notFound();
  return <PracticeView category={category} basePath={`/logiquest/${category}`} sp={await searchParams} />;
}
