import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { createPageMetadata } from "@/lib/seo";
import { organizationStructuredData } from "@/lib/structuredData";

export const metadata = createPageMetadata({
  title: "About MyLoginn Tech Private Limited",
  description:
    "Learn about MyLoginn Tech Private Limited, the company behind MyLoginn, and its web and mobile development, AI, digital marketing, courses, and internships.",
  path: "/about",
  keywords: [
    "about MyLoginn",
    "MyLoginn Tech Private Limited company",
    "MyLoginn technology company",
    "MyLoginn IT company",
  ],
});

const offerings = [
  {
    title: "Web and app development",
    description:
      "Website development, web applications, mobile apps, and custom software for business and product needs.",
    href: "/services/app-web-development",
    link: "Explore app and web development",
  },
  {
    title: "Digital marketing",
    description:
      "Search optimization, paid campaigns, social media, content, and performance analytics.",
    href: "/services/digital-marketing",
    link: "Explore digital marketing",
  },
  {
    title: "Learning and career programs",
    description:
      "Practical technology courses, tutoring, and internship opportunities alongside the company’s technology work.",
    href: "/courses",
    link: "Explore courses",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationStructuredData} />
      <Section className="py-14 sm:py-20">
        <Container className="max-w-5xl">
          <div className="grid items-center gap-8 rounded-[2rem] border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-10 md:grid-cols-[1fr_auto] md:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
                About MyLoginn
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                MyLoginn Tech Private Limited
              </h1>
              <p className="mt-5 max-w-2xl leading-7 text-muted">
                MyLoginn is the technology brand of MyLoginn Tech Private Limited, an Indian technology company. The company builds web and mobile products, custom software, and AI solutions, and provides digital marketing, practical technology learning, tutoring, and internships.
              </p>
            </div>
            <Image
              src="/myloginn-logo.png"
              alt="MyLoginn logo"
              width={160}
              height={160}
              className="mx-auto h-32 w-32 rounded-2xl border border-border-soft bg-white p-2 md:h-36 md:w-36"
            />
          </div>

          <section aria-labelledby="what-we-do" className="mt-14 sm:mt-16">
            <h2 id="what-we-do" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What MyLoginn does
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">
              MyLoginn brings software development, AI, digital growth, and technology education together. Teams can explore each area directly and contact the company to discuss a project or program.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {offerings.map((offering) => (
                <article key={offering.href} className="flex flex-col rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
                  <h3 className="text-lg font-semibold">{offering.title}</h3>
                  <p className="mt-3 flex-1 leading-6 text-muted">{offering.description}</p>
                  <Link className="mt-5 font-semibold text-brand-600 hover:text-brand-700" href={offering.href}>
                    {offering.link} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="how-we-work" className="mt-14 rounded-3xl bg-surface-2 p-6 sm:mt-16 sm:p-9">
            <h2 id="how-we-work" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              From idea to delivery
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">
              The company’s published delivery process covers discovery, planning, design, development, integration, testing, deployment, and ongoing improvement. The exact scope depends on each project.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Discover", "Plan", "Design", "Develop", "Integrate", "Test", "Deploy", "Evolve",
              ].map((step) => (
                <span key={step} className="rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-medium">
                  {step}
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="company-contact" className="mt-14 sm:mt-16">
            <h2 id="company-contact" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contact MyLoginn
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">
              For company, technology service, learning, or internship enquiries, contact MyLoginn Tech Private Limited or follow its official Instagram profile.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <Link className="font-semibold text-brand-600" href="/contact">Contact the team</Link>
              <a className="font-semibold text-brand-600" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a className="font-semibold text-brand-600" href="https://www.instagram.com/myloginntech/" target="_blank" rel="noopener noreferrer">Official Instagram</a>
            </div>
          </section>
        </Container>
      </Section>
    </>
  );
}
