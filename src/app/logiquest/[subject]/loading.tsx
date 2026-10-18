import { Container } from "@/components/ui/Section";

export default function SubjectLoading() {
  return (
    <Container className="max-w-6xl py-6 sm:py-10" aria-label="Loading subject">
      <div className="animate-pulse space-y-6" aria-hidden="true">
        <div className="h-4 w-40 rounded bg-story-mist" />
        <div className="h-10 max-w-lg rounded-xl bg-story-mist" />
        <div className="h-4 max-w-2xl rounded bg-story-mist" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 rounded-3xl border border-border-soft bg-surface" />)}
        </div>
      </div>
      <p className="sr-only">Loading subject content…</p>
    </Container>
  );
}
