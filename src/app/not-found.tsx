import Link from "next/link";
import Image from "next/image";
import { Section, Container } from "@/components/ui/Section";
import errorIllustration from "@/images/404 Error page.png";

const primaryAction = "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export default function NotFound() {
  return (
    <Section className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_18%_55%,rgba(202,190,255,.42),transparent_38%),radial-gradient(ellipse_at_84%_30%,rgba(169,238,250,.5),transparent_38%),radial-gradient(ellipse_at_70%_90%,rgba(201,210,255,.5),transparent_42%),linear-gradient(135deg,#fff 0%,#f8f7ff 52%,#f0fcff 100%)] py-8 sm:py-12 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      <Container className="relative max-w-5xl text-center">
        <div className="mx-auto w-full max-w-[620px]">
          <Image
            src={errorIllustration}
            alt="Friendly robots repair a cracked 404 sign"
            className="mx-auto h-auto w-full drop-shadow-[0_18px_22px_rgba(70,91,184,0.16)]"
            sizes="(max-width: 640px) 100vw, 620px"
          />
        </div>
        <h1 className="mt-2 text-[clamp(2rem,6vw,3.2rem)] font-bold leading-tight tracking-[-0.04em] text-slate-950">
          Opportunity detoured!
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:mt-4 sm:text-base sm:leading-7">
          We couldn&apos;t find the page you requested. It may have moved or may no longer be available. There are plenty of ways to keep exploring MyLoginn.
        </p>
        <nav aria-label="Helpful pages" className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-3 sm:gap-4">
          <Link className={`${primaryAction} brand-gradient-bg text-white shadow-[var(--shadow-lift)]`} href="/">Return to Home</Link>
          <Link className={`${primaryAction} border border-slate-500/70 bg-white/45 text-slate-900 hover:bg-white/75`} href="/internships">Browse Internships</Link>
          <Link className={`${primaryAction} border border-slate-500/70 bg-white/45 text-slate-900 hover:bg-white/75`} href="/projects">Explore Projects</Link>
        </nav>
        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/75 px-5 py-5 text-left shadow-[0_16px_50px_-28px_rgba(45,67,143,.42)] backdrop-blur-md sm:mt-10 sm:flex-row sm:px-7">
          <div>
            <p className="font-semibold text-slate-900">Keep moving forward</p>
            <p className="mt-1 text-sm text-slate-600">Find a course, learn about our services, or get in touch.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-brand-400 hover:text-brand-700" href="/courses">Courses</Link>
            <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-brand-400 hover:text-brand-700" href="/services">Services</Link>
            <Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-brand-400 hover:text-brand-700" href="/contact">Contact</Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
