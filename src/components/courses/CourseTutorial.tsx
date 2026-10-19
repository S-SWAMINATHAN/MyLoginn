import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpenCheck, ChevronRight, Lightbulb, Play } from "lucide-react";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { DownloadLessonMaterial } from "@/components/courses/DownloadLessonMaterial";
import { getCourseModules } from "@/lib/freeCourseCurriculum";
import { CodeIDE } from "@/components/courses/CodeIDE";
import { SqlExampleResult } from "@/components/courses/SqlExampleResult";
import { TopicProgressControl } from "@/components/courses/TopicProgressControl";
import { LessonNextLink } from "@/components/courses/LessonNextLink";
import { AnimatedLessonWalkthrough } from "@/components/courses/AnimatedLessonWalkthrough";
import { LessonQuiz } from "@/components/courses/LessonQuiz";
import { ScrollActiveIntoView } from "@/components/courses/ScrollActiveIntoView";
import { ChallengeBrief } from "@/components/courses/ChallengeBrief";
import { LessonVideo } from "@/components/courses/LessonVideo";
import { ChallengeCelebration } from "@/components/courses/ChallengeCelebration";

type Props = { courseTitle: string; courseSlug: string; learnerName?: string; topics: string[]; index: number; completedTopicSlugs: string[]; courseProgress: number };

function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  const matches = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!matches.length) return <>{text}</>;
  const pattern = new RegExp(`(${matches.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(pattern).map((part, index) => matches.some((term) => term.toLowerCase() === part.toLowerCase())
    ? <strong key={`${part}-${index}`} className="font-semibold text-brand-700 dark:text-brand-200">{part}</strong>
    : part)}</>;
}

// Keep video lessons optional: the course can grow its library without making
// every topic depend on a video. These are the walkthroughs supplied for this lesson.
function getWalkthroughVideo(courseSlug: string, title: string) {
  if (courseSlug !== "python-fundamentals") return null;
  if (/recursion/i.test(title)) return {
    title: "Python recursion walkthrough",
    src: "https://cdn.programiz.pro/programiz-static/programiz-blog/python-recursion-zoomed-in.mp4",
  };
  if (/merge.?sort/i.test(title)) return {
    title: "Merge sort visual walkthrough",
    src: "https://cdn.programiz.pro/programiz-static/programiz-blog/merge-sort-visualizer-without-nav-zoomed-in.mp4",
  };
  return null;
}

export function CourseTutorial({ courseTitle, courseSlug, learnerName = "MyLoginn", topics, index, completedTopicSlugs, courseProgress }: Props) {
  const title = topics[index];
  const lesson = buildTutorialLesson(courseSlug, title, index);
  const video = getWalkthroughVideo(courseSlug, title);
  const isPythonIntroduction = courseSlug === "python-fundamentals" && /^(what is python|introduction to python)$/i.test(title.trim());
  const isPythonInstallation = courseSlug === "python-fundamentals" && /^python installation$/i.test(title.trim());
  const modules = getCourseModules(courseSlug, topics);
  const currentModule = modules.find((module) => module.topics.includes(title));
  const currentModuleIndex = modules.findIndex((module) => module.topics.includes(title));
  const moduleNavigation = modules.map((module) => ({
    ...module,
    topics: module.topics.map((topic) => ({ topic, index: topics.indexOf(topic) })),
  }));
  const previous = index > 0 ? `/courses/${courseSlug}/learn/${toTopicSlug(topics[index - 1])}` : null;
  const next = index < topics.length - 1 ? `/courses/${courseSlug}/learn/${toTopicSlug(topics[index + 1])}` : `/courses/${courseSlug}`;
  const completedSet = new Set(completedTopicSlugs);
  let unlockedIndex = 0;
  while (unlockedIndex < topics.length && (completedSet.has(toTopicSlug(topics[unlockedIndex])) || !buildTutorialLesson(courseSlug, topics[unlockedIndex], unlockedIndex).requiresCodeChallenge)) unlockedIndex += 1;
  const currentCompleted = completedSet.has(toTopicSlug(title));
  const canRunPython = courseSlug === "python-fundamentals" && lesson.kind !== "packages";
  const canRunSql = courseSlug === "sql-fundamentals" || courseSlug === "mysql-fundamentals";

  const topicList = <nav aria-label={`${courseTitle} topics`} className="max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto pr-1">
    {moduleNavigation.map((module, moduleIndex) => <section key={`${module.title}-${moduleIndex}`}>
      <h3 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted">{module.title}</h3>
      <div className="space-y-1">{module.topics.map(({ topic, index: topicIndex }) => {
      const active = topicIndex === index;
      const completed = completedTopicSlugs.includes(toTopicSlug(topic));
      if (topicIndex > unlockedIndex) return <div key={`${topic}-${topicIndex}`} aria-disabled="true" className="flex cursor-not-allowed items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-muted/60"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px]">{topicIndex + 1}</span><span>{topic}</span></div>;
      return <Link key={`${topic}-${topicIndex}`} href={`/courses/${courseSlug}/learn/${toTopicSlug(topic)}`} aria-current={active ? "page" : undefined} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-200" : "text-foreground/75 hover:bg-surface-2 hover:text-foreground"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${completed ? "bg-emerald-100 text-emerald-700" : active ? "bg-brand-600 text-white" : "bg-surface-2 text-muted"}`}>{completed ? "✓" : topicIndex + 1}</span><span>{topic}</span></Link>;
    })}</div>
    </section>)}
    <ScrollActiveIntoView />
  </nav>;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-sky-50/80 to-indigo-50/80 px-3.5 py-3 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 sm:px-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs md:flex-nowrap md:overflow-x-auto md:whitespace-nowrap">
            <Link href="/" className="rounded-md px-1.5 py-1 font-medium text-slate-500 hover:bg-white hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800">Home</Link><ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <Link href="/courses" className="hidden rounded-md px-1.5 py-1 font-medium text-slate-500 hover:bg-white hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:block">Courses</Link><ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" />
            <Link href={`/courses/${courseSlug}`} className="max-w-[9rem] truncate rounded-md px-1.5 py-1 font-semibold text-blue-700 hover:bg-white dark:text-blue-300 dark:hover:bg-slate-800 sm:max-w-40">{courseTitle}</Link><ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span title={currentModule?.title} className="hidden max-w-36 truncate rounded-md px-1.5 py-1 font-medium text-slate-600 dark:text-slate-300 md:block">{currentModule?.title ?? "Course lessons"}</span><ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 md:block" />
            <span aria-current="page" title={title} className="min-w-0 max-w-[11rem] truncate rounded-md bg-blue-100/80 px-2 py-1 font-bold text-blue-900 dark:bg-blue-900/40 dark:text-blue-100 sm:max-w-56">{title}</span>
          </nav>
          <p className="mt-1.5 pl-1 text-xs text-slate-500 dark:text-slate-400 md:truncate">Welcome back, {learnerName} <span aria-hidden="true">·</span> Your learning workspace</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end [&>*]:min-w-[8.5rem] [&>*]:flex-1 md:[&>*]:flex-none"><Link href="/leaderboard" className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-blue-950">Leaderboard</Link><div className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-blue-100 bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-900/15"><BookOpenCheck className="h-4 w-4" /> Lesson {index + 1} of {topics.length}</div></div>
      </div>

      <TopicProgressControl courseSlug={courseSlug} topicSlug={toTopicSlug(title)} requiresCodeChallenge={lesson.requiresCodeChallenge} initialCompleted={completedTopicSlugs.includes(toTopicSlug(title))} initialProgress={courseProgress} initialCount={completedTopicSlugs.length} totalTopics={topics.length} />

      <div className="grid items-start gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden rounded-2xl border border-border-soft bg-surface p-3 lg:block">
          <h2 className="px-3 pb-3 pt-2 text-sm font-bold">{courseTitle}</h2>{topicList}
        </aside>

        <details className="rounded-2xl border border-border-soft bg-surface p-3 lg:hidden">
          <summary className="cursor-pointer list-none px-2 py-1 text-sm font-semibold">Course topics <span className="ml-1 text-xs font-normal text-muted">({index + 1} of {topics.length})</span></summary>
          <div className="mt-3 border-t border-border-soft pt-3">{topicList}</div>
        </details>

        <main className="min-w-0 rounded-2xl border border-border-soft bg-surface p-5 sm:p-8 lg:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-900/25 dark:text-brand-200">{currentModule?.title ?? `${courseTitle.replace(/ Fundamentals$/i, "")} Basics`}</span><span className="text-xs text-muted">Module {currentModuleIndex + 1} of {modules.length}</span></div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{isPythonIntroduction ? "Python Introduction" : title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{lesson.introduction}</p>
          {lesson.articleSections.length > 0 ? <div className="mt-7 max-w-4xl space-y-7">{lesson.articleSections.map((section) => <section key={section.title} className="rounded-2xl border border-border-soft bg-background p-5 sm:p-6"><h2 className="text-xl font-bold">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-base leading-7 text-foreground/85"><HighlightText text={paragraph} terms={lesson.keywords} /></p>)}{section.bullets && <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-7 text-foreground/85">{section.bullets.map((bullet) => <li key={bullet}><HighlightText text={bullet} terms={lesson.keywords} /></li>)}</ul>}{section.code && <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"><code>{section.code}</code></pre>}{section.links && <ul className="mt-4 grid gap-3 sm:grid-cols-2">{section.links.map((link) => <li key={link.href} className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:bg-brand-950/20"><a href={link.href} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-200">{link.label}</a><p className="mt-1 text-sm leading-6 text-foreground/75">{link.detail}</p></li>)}</ul>}</section>)}</div> : <>
            <section className="mt-6 max-w-4xl" aria-labelledby="lesson-overview"><h2 id="lesson-overview" className="text-xl font-bold">{title}: Overview</h2><p className="mt-3 text-base leading-7 text-foreground/85"><HighlightText text={lesson.overview} terms={lesson.keywords} /></p></section>
            <section className="relative mt-5 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-background to-cyan-50 p-5 shadow-sm dark:border-brand-400/30 dark:from-brand-950/40 dark:to-cyan-950/20 sm:p-7" aria-labelledby="lesson-definition">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl" />
              <h2 id="lesson-definition" className="relative text-[11px] font-extrabold uppercase tracking-[.2em] text-brand-700 dark:text-brand-200">In plain words</h2>
              <p className="relative mt-2 text-xl font-bold leading-8 tracking-tight text-foreground sm:text-2xl sm:leading-9">{lesson.plain.simple}</p>
              <div className="relative mt-4 flex gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3.5 dark:border-amber-400/20 dark:bg-amber-400/10"><Lightbulb aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><p className="text-sm leading-6 text-foreground/85"><strong className="font-semibold">Think of it like this: </strong>{lesson.plain.analogy}</p></div>
              <div className="relative mt-4 border-t border-border-soft pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Formal definition</p><p className="mt-1 text-sm leading-6 text-foreground/80"><HighlightText text={lesson.definition} terms={lesson.keywords} /></p>{lesson.keywords.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{lesson.keywords.slice(0, 5).map((word) => <span key={word} className="rounded-full border border-brand-200 bg-background px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:border-brand-400/30 dark:text-brand-200">{word}</span>)}</div>}</div>
            </section>
            <details className="group mt-6 rounded-2xl border border-border-soft bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
                <span className="text-lg">Key Ideas</span><span className="flex items-center gap-3 text-xs font-medium text-muted"><span>{lesson.keyPoints.length} ideas · click to explore</span><span aria-hidden="true" className="text-base transition-transform group-open:rotate-180">⌄</span></span>
              </summary>
              <ul className="grid gap-3 border-t border-border-soft p-4 sm:grid-cols-2">{lesson.keyPoints.map((point) => <li key={point.title} className="rounded-xl border border-border-soft bg-surface p-4"><h3 className="font-semibold">{point.title}</h3><p className="mt-1 text-sm leading-6 text-foreground/75"><HighlightText text={point.detail} terms={lesson.keywords} /></p></li>)}</ul>
            </details>
          </>}
          {video && <section className="mt-8 overflow-hidden rounded-2xl border border-border-soft bg-background" aria-label={video.title}>
            <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3 sm:px-5">
              <Play className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <div><h2 className="text-sm font-bold">Video walkthrough: {video.title}</h2><p className="text-[11px] text-muted">Reference video provided for this topic</p></div>
            </div>
            <div className="relative">
              <video className="aspect-video w-full bg-slate-950" controls preload="metadata" playsInline>
                <source src={video.src} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
              <div className="pointer-events-none absolute bottom-10 right-3 flex items-center gap-1.5 rounded-full bg-slate-950/35 px-2 py-1 opacity-65" aria-label="MyLoginn watermark">
                <Image src="/myloginn-logo.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                <span className="text-[10px] font-semibold text-white">MyLoginn Learning</span>
              </div>
            </div>
            <p className="px-4 py-3 text-xs leading-5 text-muted sm:px-5">Watch how the example changes step by step, then use the visual explanation and code below to review the idea.</p>
          </section>}
          {/* Every topic gets an animated video built from its own lesson data, so new courses need no extra work. */}
          {!video && <LessonVideo data={{ courseTitle, title, lessonNumber: index + 1, lessonCount: topics.length, plain: lesson.plain, visualNodes: lesson.visual.nodes, visualSummary: lesson.visual.summary, steps: lesson.steps, output: lesson.output, takeaways: lesson.takeaways, mistake: lesson.mistake }} />}

          {!isPythonInstallation && <details className="group mt-8 rounded-2xl border border-border-soft bg-background">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
              <span><span className="block">Animated lesson walkthrough</span><span className="mt-1 block text-xs font-normal text-muted">Expand to step through the code and use playback controls.</span></span><span aria-hidden="true" className="shrink-0 text-base text-muted transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-border-soft p-2 sm:p-3"><AnimatedLessonWalkthrough courseSlug={courseSlug} title={title} steps={lesson.steps} output={lesson.output} sqlQuery={canRunSql ? lesson.code : undefined} /></div>
          </details>}

          <section className="mt-8 max-w-3xl">
            <h2 className="text-xl font-bold">Explanation: how it works</h2>
            <p className="mt-3 leading-7 text-foreground/85">{lesson.explanation}</p>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border-soft bg-background p-5"><h2 className="font-bold">Why it matters</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{lesson.realWorld}</p></div>
            <div className="rounded-2xl border border-border-soft bg-background p-5"><h2 className="font-bold">Best practice</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{lesson.bestPractice}</p></div>
          </section>


          {!isPythonInstallation && <section className="mt-8 max-w-3xl"><h2 className="text-xl font-bold">{isPythonIntroduction ? "Example" : lesson.exampleTitle}</h2><p className="mt-2 text-sm leading-6 text-foreground/80">{lesson.exampleIntroduction}</p></section>}
          {!isPythonInstallation && <>
          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><h2 className="text-sm font-semibold">{lesson.exampleTitle}</h2><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">{courseTitle.replace(/ Fundamentals$/i, "")}</span></div>
            <div className="border-b border-white/10 bg-white/5 px-4 py-3 sm:px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Syntax pattern</p><code className="mt-1 block font-mono text-sm text-amber-200">{lesson.syntax}</code></div>
            <pre className="max-h-[480px] overflow-x-auto p-4 text-sm leading-6 sm:p-6"><code>{lesson.code}</code></pre>
            <div className="border-t border-white/10 bg-white/5 px-4 py-4 sm:px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{canRunSql ? "Query result · practice database" : "Expected result"}</p>{canRunSql ? <SqlExampleResult query={lesson.code} fallback={lesson.output} /> : <pre className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6 text-emerald-300">{lesson.output}</pre>}</div>
          </section>

          {courseSlug === "python-fundamentals" && lesson.kind === "intro" && <ul className="mt-6 max-w-4xl list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/80"><li><code>print()</code> is a built-in Python function that displays text.</li><li><code>&quot;Hello, World!&quot;</code> is a string enclosed in quotation marks.</li><li><code>#</code> begins a comment; Python ignores it when running the program.</li><li>Python uses indentation to mark code blocks instead of braces.</li></ul>}
          </>}

          <LessonQuiz quiz={lesson.quiz} />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:bg-emerald-950/15"><h2 className="font-bold text-emerald-900 dark:text-emerald-200">Remember</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">{lesson.takeaways.map((point) => <li key={point} className="flex gap-2"><span className="font-bold text-emerald-600">✓</span><span>{point}</span></li>)}</ul></section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:bg-amber-950/15"><h2 className="font-bold text-amber-900 dark:text-amber-200">Common mistake</h2><p className="mt-3 text-sm leading-6 text-foreground/80">{lesson.mistake}</p></section>
          </div>

          {lesson.requiresCodeChallenge && <section className="mt-8 rounded-3xl border border-border-soft bg-background p-5 shadow-sm sm:p-6" aria-label="Try it yourself">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center text-amber-700 dark:text-amber-300"><Lightbulb className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Step 1 of 2 · Warm up</p><h2 className="font-bold leading-tight">Try it yourself</h2></div></div>
            <p className="mt-3 text-sm leading-6 text-foreground/80">{lesson.practice}</p>
          </section>}

          {lesson.requiresCodeChallenge && <>
            <ChallengeBrief title={title} task={lesson.challenge} given={lesson.challengeGiven} expectedOutput={lesson.challengeOutput} hintCount={lesson.challengeHints.length} needsInput={/\binput\s*\(/i.test(lesson.challengeCode)} />
            <CodeIDE courseSlug={courseSlug} courseTitle={courseTitle} topicSlug={toTopicSlug(title)} moduleTitle={currentModule?.title ?? courseTitle} isLastTopicInModule={currentModule?.topics.at(-1) === title} nextHref={next} starterCode={lesson.challengeStarter} solutionCode={lesson.challengeCode} expectedOutput={lesson.challengeOutput} canRunPython={canRunPython} canRunSql={canRunSql} needsInput={/\binput\s*\(/i.test(lesson.challengeCode)} hints={lesson.challengeHints} kind={lesson.kind} challengeTitle={title} sampleInput={lesson.challengeGiven} stdinDefault={lesson.challengeStdin} />
            <ChallengeCelebration topicSlug={toTopicSlug(title)} />
          </>}

          <div className="mt-6"><DownloadLessonMaterial courseTitle={courseTitle} title={title} lesson={lesson} /></div>

          <div className="mt-8 grid gap-3 border-t border-border-soft pt-6 sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-between [&>*]:w-full [&>*]:justify-center [&>span:empty]:hidden sm:[&>*]:w-auto">
            {previous ? <Link href={previous} className="inline-flex items-center gap-2 rounded-full border border-border-soft px-5 py-3 text-sm font-semibold hover:bg-surface-2"><ArrowLeft className="h-4 w-4" /> Previous lesson</Link> : <span />}
            {index < topics.length - 1 ? <LessonNextLink href={next} label="Next lesson" courseSlug={courseSlug} topicSlug={toTopicSlug(title)} requiresCodeChallenge={lesson.requiresCodeChallenge} initiallyUnlocked={currentCompleted || !lesson.requiresCodeChallenge} initiallyCompleted={currentCompleted} /> : <Link href={next} className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)]">Back to course<ArrowRight className="h-4 w-4" /></Link>}
          </div>
        </main>
      </div>
    </div>
  );
}
