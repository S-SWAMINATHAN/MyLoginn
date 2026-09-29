import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Check, Sparkles } from "lucide-react";

export function AuthShell({ mode, children }: { mode: "login" | "signup"; children: ReactNode }) {
  const signup = mode === "signup";

  return (
    <section className="auth-stage relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#f6f8fc] px-3 py-2 dark:bg-[#080d19] sm:px-5 sm:py-3 lg:px-8 lg:py-3">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-blue-300/20 blur-[100px] dark:bg-blue-600/10" />
        <div className="absolute -right-36 bottom-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-[110px] dark:bg-cyan-500/10" />
        <div className="absolute inset-0 opacity-[.24] [background-image:radial-gradient(#7b8dad_0.7px,transparent_0.7px)] [background-size:22px_22px] dark:opacity-[.1]" />
      </div>

      <div className={`mx-auto grid w-full overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/80 shadow-[0_32px_100px_-48px_rgba(15,33,75,.34)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1423]/90 ${signup ? "max-w-[min(96vw,56rem)] lg:min-h-[clamp(19rem,calc(100svh-26rem),25rem)] lg:grid-cols-[.88fr_1.12fr]" : "max-w-[min(94vw,48rem)] lg:min-h-0 lg:grid-cols-[.82fr_1.18fr]"}`}>
        <aside className="relative isolate flex min-h-[170px] flex-col justify-between overflow-hidden bg-[#10234d] px-5 py-5 text-white sm:min-h-[190px] sm:px-7 sm:py-7 lg:min-h-full lg:px-8 lg:py-8">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_0%,rgba(84,121,255,.72),transparent_48%),radial-gradient(ellipse_at_100%_100%,rgba(4,192,205,.42),transparent_42%),linear-gradient(145deg,#142653,#09152f_76%)]" />
          <div aria-hidden className="absolute -right-28 top-32 hidden h-[28rem] w-[28rem] rounded-full border border-white/10 lg:block" />
          <div aria-hidden className="absolute -right-10 top-52 hidden h-[20rem] w-[20rem] rounded-full border border-white/10 lg:block" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.08] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.17em] text-cyan-100 sm:text-xs">
              <Sparkles className="h-4 w-4" /> Your next chapter
            </span>
            <h2 className="mt-3 max-w-xl text-[1.7rem] font-semibold leading-[1.03] tracking-[-.045em] sm:mt-5 sm:text-3xl lg:mt-7 lg:text-[2.5rem]">
              {signup ? <>Make room for <span className="text-cyan-200">what&apos;s next.</span></> : <>Good to have you <span className="text-cyan-200">back.</span></>}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-5 text-indigo-100/80 sm:leading-6">
              {signup
                ? "One account brings your learning, expert guidance and new opportunities together."
                : "Your courses, progress and next opportunity are right where you left them."}
            </p>
          </div>

          {signup && <div className="relative z-10 mt-5 hidden max-w-md lg:block">
            <div className="rounded-2xl border border-white/15 bg-white/[.08] p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/90">A path that moves with you</p>
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${signup ? "bg-cyan-300/15 text-cyan-200" : "bg-emerald-300/15 text-emerald-200"}`}><Sparkles className="h-4 w-4" /></span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <JourneyTile icon={<BookOpen className="h-4 w-4" />} label="Learn" />
                <JourneyTile icon={<Sparkles className="h-4 w-4" />} label="Build" />
                <JourneyTile icon={<BriefcaseBusiness className="h-4 w-4" />} label="Grow" />
              </div>
              <p className="mt-3 text-xs leading-5 text-indigo-100/65">Small steps. Real progress. New possibilities.</p>
            </div>
            <p className="mt-5 text-xs font-medium text-indigo-100/60">MyLoginn <span className="px-1 text-cyan-200">·</span> Learn, create and move forward.</p>
          </div>}
        </aside>

        <div className="flex min-w-0 items-center justify-center px-4 py-3 sm:px-6 sm:py-4 lg:px-7 lg:py-3">
          <div className="w-full max-w-[400px]">
            {children}
            <div className="mt-5 border-t border-slate-200/80 pt-4 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              {signup ? "Already have an account?" : "New to MyLoginn?"}{" "}
              <Link href={signup ? "/login" : "/signup"} className="inline-flex items-center font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300">
                {signup ? "Log in" : "Create an account"}<ArrowUpRight className="ml-0.5 h-4 w-4" />
              </Link>
            </div>
            {signup && <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Your details are protected and kept private.
            </p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyTile({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-xs font-medium text-indigo-50/85"><span className="text-cyan-200">{icon}</span>{label}</div>;
}
