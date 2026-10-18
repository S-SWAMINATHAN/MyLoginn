import { Container } from "@/components/ui/Section";

export default function TopicLoading() {
  return (
    <Container className="max-w-6xl py-6 sm:py-10" aria-label="Loading practice questions">
      <div className="animate-pulse space-y-6" aria-hidden="true">
        <div className="h-4 w-48 rounded bg-story-mist" />
        <div className="h-10 max-w-lg rounded-xl bg-story-mist" />
        <div className="h-14 rounded-2xl bg-story-mist" />
        {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-36 rounded-3xl border border-border-soft bg-surface" />)}
      </div>
      <p className="sr-only">Loading practice questions…</p>
    </Container>
  );
}
