import Link from "next/link";
import type { CourseStructure } from "@/lib/lms/state";
import type { CourseView } from "@/lib/lms/progression";

/**
 * Lesson sidebar in the same style as the free courses: the module the learner is in, with a numbered circle per
 * lesson (a tick once done), the current lesson highlighted and lessons that are not open yet faded. With no active
 * lesson (the course hub) every module is listed.
 */
export function Outline({ structure, view, activeLessonId, interactive = true }: { structure: CourseStructure; view: CourseView | null; activeLessonId?: string; interactive?: boolean }) {
  const lessonView = new Map(view?.lessons.map((l) => [l.id, l]));
  const activeModuleId = structure.lessons.find((l) => l.id === activeLessonId)?.moduleId;
  const modules = activeModuleId ? structure.modules.filter((m) => m.id === activeModuleId) : structure.modules;
  return (
    <nav aria-label="Course outline" className="space-y-5">
      {modules.map((m) => {
        const lessons = structure.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.position - b.position);
        return (
          <section key={m.id}>
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted">{m.title}{!m.required && <span className="ml-1.5 font-medium normal-case">(optional)</span>}</h3>
            <ol className="mt-2 space-y-0.5">
              {lessons.map((l) => {
                const v = lessonView.get(l.id);
                const done = v?.status === "completed";
                const locked = v?.status === "locked";
                const active = l.id === activeLessonId;
                const number = structure.lessons.findIndex((x) => x.id === l.id) + 1;
                const circle = (
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${done ? "bg-emerald-100 text-emerald-700" : active ? "bg-story-royal text-white" : "bg-story-mist text-muted"}`} aria-hidden="true">{done ? "✓" : number}</span>
                );
                const label = <span className="min-w-0 text-sm leading-5">{l.title}<span className="sr-only"> ({done ? "Completed" : locked ? "Locked" : active ? "Current" : "Available"})</span></span>;
                if (!interactive || locked) {
                  return <li key={l.id}><div aria-disabled="true" title={v?.lockReason || undefined} className="flex cursor-not-allowed items-start gap-3 rounded-xl px-3 py-2.5 text-muted/60">{circle}{label}</div></li>;
                }
                return (
                  <li key={l.id}>
                    <Link href={`/courses/${structure.course.slug}/learn/${l.slug}`} aria-current={active ? "page" : undefined} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:translate-x-0.5 ${active ? "bg-story-royal/10 font-semibold text-story-royal" : "text-foreground/80 hover:bg-story-mist hover:text-foreground"}`}>{circle}{label}</Link>
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
