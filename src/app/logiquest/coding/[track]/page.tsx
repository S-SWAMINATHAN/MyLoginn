import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { ProblemTable } from "@/components/logiquest/coding/ProblemTable";
import { problemRows } from "@/lib/logiquest/coding/listing";
import { TRACKS, TRACK_BY_SLUG } from "@/lib/logiquest/coding/tracks";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props) {
  const slug = (await params).track;
  const t = TRACK_BY_SLUG.get(slug);
  if (!t) return { title: "Coding · LogiQuest" };
  return createPageMetadata({
    title: `${t.title} Coding Problems | LogiQuest`,
    absoluteTitle: true,
    description: `${t.desc} Solve them in Python, JavaScript or SQL in the browser and get instant results.`,
    path: `/logiquest/coding/${slug}`,
    keywords: [`${t.title} problems`, `${t.title} practice`, "coding practice online"],
  });
}

export default async function TrackPage({ params }: Props) {
  const { track } = await params;
  const t = TRACK_BY_SLUG.get(track);
  if (!t) notFound();
  const user = await getCurrentUser();
  const rows = (await problemRows(user?.id ?? null)).filter((r) => r.tracks.includes(track));
  const solved = rows.filter((r) => r.status === "solved").length;

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Coding", href: "/logiquest/coding" }, { label: t.title }]} />
      <PageTitle title={t.title} sub={t.desc} />
      <p className="mt-2 text-sm text-muted">{rows.length} problems{user ? ` · ${solved} solved` : ""}</p>
      <div className="mt-6"><ProblemTable rows={rows} tracks={TRACKS.map((x) => ({ slug: x.slug, title: x.title }))} fixedTrack={track} /></div>
    </Container>
  );
}
