import Link from "next/link";
import type { CourseStructure } from "@/lib/lms/state";
import type { CourseView, LessonStatus } from "@/lib/lms/progression";

const STATUS: Record<LessonStatus, { glyph: string; label: string; cls: string }> = {
  completed: { glyph: "✓", label: "Completed", cls: "bg-story-royal text-white" },
  in_progress: { glyph: "●", label: "In progress", cls: "bg-story-royal/15 text-story-royal" },
  available: { glyph: "○", label: "Available", cls: "bg-story-mist text-story-royal" },
  locked: { glyph: "🔒", label: "Locked", cls: "bg-story-mist text-muted" },
};

/** Module/lesson outline with an honest status and a plain-language lock reason for every locked lesson. */
export function Outline({ structure, view, activeLessonId, interactive = true }: { structure: CourseStructure; view: CourseView | null; activeLessonId?: string; interactive?: boolean }) {
  const lessonView = new Map(view?.lessons.map((l) => [l.id, l]));
  return (
    <nav aria-label="Course outline" className="space-y-5">
      {structure.modules.map((m, mi) => {
        const mv = view?.modules.find((x) => x.id === m.id);
        const lessons = structure.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.position - b.position);
        return (
          <section key={m.id}>
            <h3 className="flex items-baseline justify-between gap-2 text-sm font-bold text-story-navy dark:text-foreground">
              <span>Module {mi + 1}: {m.title}{!m.required && <span className="ml-1.5 text-[11px] font-medium text-muted">(optional)</span>}</span>
              {mv && <span className="shrink-0 rounded-full bg-story-mist px-2 py-0.5 text-[11px] font-semibold tabular-nums text-story-royal">{mv.percent}%</span>}
            </h3>
            <ol className="mt-2 space-y-1">
              {lessons.map((l) => {
                const v = lessonView.get(l.id);
                const st = STATUS[v?.status ?? "available"];
                const locked = v?.status === "locked";
                const inner = (
                  <span className="flex items-start gap-2.5">
                    <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${st.cls}`} aria-hidden="true">{st.glyph}</span>
                    <span className="min-w-0">
                      <span className={`block text-sm leading-5 ${l.id === activeLessonId ? "font-semibold text-story-royal" : ""}`}>{l.title}<span className="sr-only"> ({st.label})</span></span>
                      <span className="block text-xs text-muted">{l.estimatedMinutes} min{!l.required ? " · optional" : ""}</span>
                      {locked && v?.lockReason && <span className="mt-0.5 block text-xs text-amber-700 dark:text-amber-400">{v.lockReason}</span>}
                    </span>
                  </span>
                );
                return (
                  <li key={l.id}>
                    {interactive && !locked
                      ? <Link href={`/courses/${structure.course.slug}/learn/${l.slug}`} className={`block rounded-2xl px-2.5 py-2 transition-all duration-200 hover:translate-x-1 hover:bg-story-mist ${l.id === activeLessonId ? "bg-story-royal/10" : ""}`} aria-current={l.id === activeLessonId ? "page" : undefined}>{inner}</Link>
                      : <div className={`rounded-xl px-2.5 py-2 ${locked ? "opacity-80" : ""}`}>{inner}</div>}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}
