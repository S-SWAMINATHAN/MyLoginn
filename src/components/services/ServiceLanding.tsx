import Link from "next/link";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { LeadForm } from "@/components/services/LeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { faqStructuredData, serviceStructuredData } from "@/lib/structuredData";

export type ServiceLandingProps = {
  path: string;
  eyebrow: string;
  h1: string;
  intro: string;
  schemaName: string;
  serviceType: string;
  leadService: string;
  areas: { title: string; text: string }[];
  steps: string[];
  tools: string[];
  faqs: { question: string; answer: string }[];
  related: { href: string; label: string }[];
};

/** Shared layout for service pages: one H1, semantic sections, Service + FAQ schema, enquiry form. */
export function ServiceLanding(p: ServiceLandingProps) {
  return (
    <Section className="pt-6 sm:pt-10">
      <JsonLd data={serviceStructuredData({ name: p.schemaName, description: p.intro, path: p.path, serviceType: p.serviceType })} />
      <JsonLd data={faqStructuredData(p.faqs)} />
      <Container className="max-w-7xl">
        <Eyebrow>{p.eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{p.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{p.intro}</p>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <section aria-labelledby="svc-areas">
              <h2 id="svc-areas" className="text-2xl font-semibold tracking-tight">What we can build and deliver</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {p.areas.map((a) => (
                  <article key={a.title} className="rounded-2xl border border-border-soft bg-surface p-5">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{a.text}</p>
                  </article>
                ))}
              </div>
            </section>
            <section aria-labelledby="svc-tools" className="mt-12">
              <h2 id="svc-tools" className="text-2xl font-semibold tracking-tight">Technologies we work with</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.tools.map((t) => <li key={t} className="rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-sm">{t}</li>)}
              </ul>
            </section>
            <section aria-labelledby="svc-process" className="mt-12 rounded-3xl bg-surface-2 p-6 sm:p-8">
              <h2 id="svc-process" className="text-2xl font-semibold tracking-tight">How an engagement works</h2>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {p.steps.map((step, i) => <li key={step} className="flex gap-3 rounded-xl border border-border-soft bg-surface p-4 text-sm"><span className="font-semibold text-brand-600">0{i + 1}</span><span>{step}</span></li>)}
              </ol>
            </section>
            <section aria-labelledby="svc-who" className="mt-12">
              <h2 id="svc-who" className="text-2xl font-semibold tracking-tight">Who we work with</h2>
              <p className="mt-3 leading-7 text-muted">MyLoginn Tech Private Limited is an India-based technology company. We work with startups, small and mid-sized businesses and organisations across India, and serve clients in other countries remotely. Scope, timelines and deliverables are agreed in writing before work begins.</p>
            </section>
            <section aria-labelledby="svc-faq" className="mt-12">
              <h2 id="svc-faq" className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <FaqAccordion items={p.faqs} className="mt-5" />
            </section>
            <nav aria-label="Related MyLoginn services" className="mt-12">
              <h2 className="text-lg font-semibold">Related services</h2>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                {p.related.map((r) => <li key={r.href}><Link className="text-brand-600 hover:underline" href={r.href}>{r.label}</Link></li>)}
              </ul>
            </nav>
          </div>
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24"><LeadForm service={p.leadService} /></div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
