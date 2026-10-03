import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Lightbulb } from "lucide-react";
import { buildTutorialLesson, toTopicSlug, type LessonKind } from "@/lib/freeCourseTutorial";

type Props = { courseTitle: string; courseSlug: string; topics: string[]; index: number };

function LessonVisual({ kind, title }: { kind: LessonKind; title: string }) {
  if (kind === "condition") return (
    <div className="grid gap-3 sm:grid-cols-[1.2fr_auto_1fr_1fr] sm:items-center" aria-label="Condition flow diagram">
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center dark:bg-brand-900/20"><span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Check</span><p className="mt-1 font-semibold">Is the condition true?</p></div>
      <span className="hidden text-xl font-bold text-brand-500 sm:block">→</span>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:bg-emerald-900/15"><span className="text-xs font-semibold text-emerald-700">YES</span><p className="mt-1 text-sm">Run this branch</p></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center dark:bg-amber-900/15"><span className="text-xs font-semibold text-amber-700">NO</span><p className="mt-1 text-sm">Choose another branch</p></div>
    </div>
  );
  if (kind === "loop") return (
    <div aria-label="Loop iteration diagram">
      <p className="mb-3 text-sm text-muted">One loop, three passes:</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">{[1, 2, 3].map((step) => <div key={step} className="rounded-xl border border-brand-200 bg-brand-50 px-2 py-4 text-center dark:bg-brand-900/20"><span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600">Iteration {step}</span><span className="mt-1 block font-mono text-sm">number = {step}</span></div>)}</div>
      <p className="mt-3 text-center text-sm font-medium">Update → check → repeat → stop</p>
    </div>
  );
  if (["variables", "types", "numbers", "strings", "object", "collection"].includes(kind)) return (
    <div aria-label="Value representation diagram" className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-border-soft bg-surface-2 p-4 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Name</span><p className="mt-1 font-mono font-semibold">student</p></div>
      <span className="text-center text-lg font-bold text-brand-500">→</span>
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:bg-brand-900/20"><span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Value</span><p className="mt-1 font-mono font-semibold">&quot;Maya&quot;</p></div>
      <span className="text-center text-lg font-bold text-brand-500">→</span>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:bg-emerald-900/15"><span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Meaning</span><p className="mt-1 font-semibold">Text value</p></div>
      <p className="sm:col-span-5 text-center text-sm text-muted">{title} lets a program organize and work with information.</p>
    </div>
  );
  if (kind === "query" || kind === "filter" || kind === "join" || kind === "database") return (
    <div aria-label="SQL query flow diagram" className="grid gap-2 sm:grid-cols-3">
      {["Tables", "SQL instruction", "Result rows"].map((label, index) => <div key={label} className="flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-2 p-4 text-center"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{index + 1}</span><span className="text-sm font-semibold">{label}</span></div>)}
    </div>
  );
  return (
    <div aria-label="Program flow diagram" className="grid gap-2 sm:grid-cols-3">
      {["Input", "Instruction", "Result"].map((label, index) => <div key={label} className="rounded-xl border border-border-soft bg-surface-2 p-4 text-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Step {index + 1}</span><p className="mt-1 font-semibold">{label}</p></div>)}
    </div>
  );
}

export function CourseTutorial({ courseTitle, courseSlug, topics, index }: Props) {
  const title = topics[index];
  const lesson = buildTutorialLesson(courseSlug, title, index);
  const previous = index > 0 ? `/courses/${courseSlug}/learn/${toTopicSlug(topics[index - 1])}` : null;
  const next = index < topics.length - 1 ? `/courses/${courseSlug}/learn/${toTopicSlug(topics[index + 1])}` : `/courses/${courseSlug}`;

  const topicList = <nav aria-label={`${courseTitle} topics`} className="max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-1">
    {topics.map((topic, topicIndex) => {
      const active = topicIndex === index;
      return <Link key={`${topic}-${topicIndex}`} href={`/courses/${courseSlug}/learn/${toTopicSlug(topic)}`} aria-current={active ? "page" : undefined} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-200" : "text-foreground/75 hover:bg-surface-2 hover:text-foreground"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${active ? "bg-brand-600 text-white" : "bg-surface-2 text-muted"}`}>{topicIndex + 1}</span><span>{topic}</span></Link>;
    })}
  </nav>;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0"><Link href={`/courses/${courseSlug}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"><ArrowLeft className="h-3.5 w-3.5" /> {courseTitle}</Link><p className="mt-1 truncate text-xs text-muted">Free Fundamentals Tutorial</p></div>
        <div className="flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold"><BookOpenCheck className="h-4 w-4 text-brand-600" /> Lesson {index + 1} of {topics.length}</div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden rounded-2xl border border-border-soft bg-surface p-3 lg:block">
          <h2 className="px-3 pb-3 pt-2 text-sm font-bold">{courseTitle}</h2>{topicList}
        </aside>

        <details className="rounded-2xl border border-border-soft bg-surface p-3 lg:hidden">
          <summary className="cursor-pointer list-none px-2 py-1 text-sm font-semibold">Course topics <span className="ml-1 text-xs font-normal text-muted">({index + 1} of {topics.length})</span></summary>
          <div className="mt-3 border-t border-border-soft pt-3">{topicList}</div>
        </details>

        <main className="min-w-0 rounded-2xl border border-border-soft bg-surface p-5 sm:p-8 lg:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-900/25 dark:text-brand-200">{courseTitle.replace(/ Fundamentals$/i, "")} Basics</span><span className="text-xs text-muted">{index + 1} / {topics.length}</span></div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/80">{lesson.introduction}</p>

          <section className="mt-8 rounded-2xl border border-border-soft bg-background p-4 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Lightbulb className="h-5 w-5 text-amber-500" /> Visual explanation</h2>
            <LessonVisual kind={lesson.kind} title={title} />
          </section>

          <section className="mt-8 max-w-3xl">
            <h2 className="text-xl font-bold">How it works</h2>
            <p className="mt-3 leading-7 text-foreground/85">{lesson.explanation}</p>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><h2 className="text-sm font-semibold">Example</h2><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">{courseTitle.replace(/ Fundamentals$/i, "")}</span></div>
            <pre className="max-h-[480px] overflow-x-auto p-4 text-sm leading-6 sm:p-6"><code>{lesson.code}</code></pre>
            <div className="border-t border-white/10 bg-white/5 px-4 py-4 sm:px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected result</p><pre className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6 text-emerald-300">{lesson.output}</pre></div>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:bg-emerald-950/15"><h2 className="font-bold text-emerald-900 dark:text-emerald-200">Remember</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">{lesson.takeaways.map((point) => <li key={point} className="flex gap-2"><span className="font-bold text-emerald-600">✓</span><span>{point}</span></li>)}</ul></section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:bg-amber-950/15"><h2 className="font-bold text-amber-900 dark:text-amber-200">Common mistake</h2><p className="mt-3 text-sm leading-6 text-foreground/80">{lesson.mistake}</p></section>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border-soft pt-6">
            {previous ? <Link href={previous} className="inline-flex items-center gap-2 rounded-full border border-border-soft px-5 py-3 text-sm font-semibold hover:bg-surface-2"><ArrowLeft className="h-4 w-4" /> Previous lesson</Link> : <span />}
            <Link href={next} className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)]">{index === topics.length - 1 ? "Back to course" : "Next lesson"}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </main>
      </div>
    </div>
  );
}
