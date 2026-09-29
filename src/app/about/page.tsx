import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { createPageMetadata } from "@/lib/seo";

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

const faqs = [
  { question: "What is MyLoginn Tech Private Limited?", answer: "MyLoginn Tech Private Limited is an Indian technology company. MYLOGINN is the company’s primary brand spelling." },
  { question: "What services does MyLoginn provide?", answer: "The company offers website and app development, custom software and AI solutions, digital marketing, technology courses, tutoring, and internship programs." },
  { question: "Does MyLoginn develop websites and mobile applications?", answer: "Yes. The development team works on websites, web applications, mobile applications, and related software. Contact the team to discuss a specific scope." },
  { question: "Does MyLoginn provide AI solutions and courses?", answer: "MyLoginn works on AI-related software solutions and offers technology learning. Current course availability is listed on the Courses page." },
  { question: "Does MyLoginn work with businesses outside its local area?", answer: "Enquiries can be made through the Contact page. The team can discuss project requirements and delivery arrangements directly." },
  { question: "How can I contact MyLoginn?", answer: "Use the Contact page to send a project, service, course, tutoring, internship, or general enquiry." },
  { question: "Is the company called MyLogin or MyLoginn?", answer: "The official company name is MyLoginn Tech Private Limited, with two n characters in MyLoginn. MyLogin is a search variation, not the company’s official name." },
];

export default function AboutPage() {
  return (
    <>
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
            <Image src="/myloginn-logo.png" alt="MyLoginn brand mark" width={160} height={160} className="mx-auto h-32 w-32 object-contain md:h-36 md:w-36" />
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

          <section aria-labelledby="company-purpose" className="mt-14 grid gap-4 sm:mt-16 md:grid-cols-2">
            <article className="rounded-3xl border border-border-soft bg-surface p-6 sm:p-8">
              <h2 id="company-purpose" className="text-2xl font-semibold tracking-tight">Our mission</h2>
              <p className="mt-3 leading-7 text-muted">To make useful technology, practical learning, and digital services accessible to the people and organizations that need them.</p>
            </article>
            <article className="rounded-3xl border border-border-soft bg-surface p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">Our vision</h2>
              <p className="mt-3 leading-7 text-muted">To build a connected technology practice where thoughtful software, responsible AI, digital growth, and hands-on education support lasting progress.</p>
            </article>
          </section>

          <section aria-labelledby="our-approach" className="mt-14 rounded-3xl bg-surface-2 p-6 sm:mt-16 sm:p-9">
            <h2 id="our-approach" className="text-2xl font-semibold tracking-tight sm:text-3xl">How we work</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">We begin by understanding the goal, then agree on scope and priorities before design and development. Testing and feedback help shape the delivery, with the exact process tailored to each engagement.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Discover", "Plan", "Design", "Develop", "Integrate", "Test", "Deploy", "Evolve"].map((step) => <li key={step} className="rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm font-medium">{step}</li>)}
            </ul>
          </section>

          <section aria-labelledby="brand-name" className="mt-14 sm:mt-16">
            <h2 id="brand-name" className="text-2xl font-semibold tracking-tight sm:text-3xl">Our name and brand</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted">The official company name is <strong className="font-semibold text-foreground">MyLoginn Tech Private Limited</strong>, and the brand is written <strong className="font-semibold text-foreground">MYLOGINN</strong>. People may search for the company as “MyLogin” or “My Loginn”; those spellings are search variations and do not change the official name.</p>
          </section>

          <section aria-labelledby="about-faq" className="mt-14 sm:mt-16">
            <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
            <h2 id="about-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
              {faqs.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-semibold marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
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
