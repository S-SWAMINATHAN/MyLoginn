import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { LeadForm } from "@/components/services/LeadForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProjectRequestTrigger } from "@/components/services/ProjectRequestTrigger";

type ContactAction = { label: string; href?: string; external?: boolean };

export const metadata = createPageMetadata({
  title: "Contact MyLoginn",
  description: "Contact MyLoginn Tech Private Limited about software development, AI, digital marketing, courses, tutoring, and internships.",
  path: "/contact",
  keywords: [
    "contact MyLoginn", "MyLoginn contact", "MyLoginn Tech contact",
    "contact MyLoginn Tech Private Limited", "IT company contact",
    "software development enquiry", "digital marketing enquiry",
  ],
});

const contactPoints: { icon: typeof AnimatedMail; title: string; description: string; actions: ContactAction[] }[] = [
  {
    icon: AnimatedMail,
    title: "Email us",
    description: "For admissions, partnerships, or general questions.",
    actions: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
  },
  {
    icon: AnimatedPhone,
    title: "Call us",
    description: "Speak to the team directly on any of these lines.",
    actions: CONTACT_PHONES.map((p) => ({ label: p.display, href: `tel:${p.tel}` })),
  },
  {
    icon: AnimatedChat,
    title: "WhatsApp",
    description: "Send a message to the MyLoginn team through WhatsApp.",
    actions: [
      {
        label: "Chat with us on WhatsApp",
        href: toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I have a question.") ?? undefined,
        external: true,
      },
    ],
  },
  {
    icon: AnimatedClock,
    title: "Enquiry details",
    description: "Share the service or program you are asking about and any useful context.",
    actions: [{ label: "Use the enquiry form" }],
  },
];

const contactFaqs = [
  { question: "How do I request app or web development?", answer: "Use the project requirements form on this page or visit the App & Web Development service page to describe your project." },
  { question: "How do I enquire about digital marketing?", answer: "Visit the Digital Marketing service page and use its marketing enquiry form to share your goals and channels." },
  { question: "Where can I ask about courses or internships?", answer: "Browse the Courses or Internships pages for current listings and their details, or use the general enquiry form on this page." },
  { question: "What should I include in a project enquiry?", answer: "Share the goal, expected users, key requirements, relevant links and any timing constraints you already know." },
];

export default function ContactPage() {
  return (
    <Section className="mobile-page-glow pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Reveal>
              <Eyebrow>Get in Touch</Eyebrow>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Contact MyLoginn</h1>
              <p className="mt-4 max-w-xl text-muted">
                Questions about a course, internship, or one of our services? Send us a message and a real
                team can review your request.
              </p>
              <ProjectRequestTrigger service="software" label="Open project requirements form" className="mt-5" />
            </Reveal>

            <RevealGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {contactPoints.map((c) => (
                <RevealItem key={c.title}>
                  <Card className="card-shine group relative h-full overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                    <span className="inline-flex transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      <c.icon className="h-10 w-10" />
                    </span>
                    <h3 className="mt-4 font-semibold">{c.title}</h3>
                    <p className="mt-2 text-sm text-muted">{c.description}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      {c.actions.map((a, i) => (
                        <span key={a.label} className="inline-flex items-center gap-2">
                          {i > 0 && <span className="text-border select-none" aria-hidden>Â·</span>}
                          {a.href ? (
                            <a
                              href={a.href}
                              {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              className="text-brand-500 underline-offset-4 transition-all duration-200 hover:text-brand-600 hover:underline"
                            >
                              {a.label}
                            </a>
                          ) : (
                            <span className="text-brand-500">{a.label}</span>
                          )}
                        </span>
                      ))}
                    </p>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <Reveal direction="left" delay={0.15}>
                <LeadForm service="General Inquiry" />
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
      <Container>
        <section aria-labelledby="contact-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: contactFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="contact-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Contact FAQs</h2>
          <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
            {contactFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
          </div>
          <nav aria-label="More contact options" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
            <Link href="/courses" className="text-brand-600">Explore courses</Link>
            <Link href="/internships" className="text-brand-600">View internships</Link>
            <Link href="/services/digital-marketing" className="text-brand-600">Digital marketing enquiries</Link>
            <Link href="/services/app-web-development" className="text-brand-600">App and web development enquiries</Link>
          </nav>
        </section>
      </Container>
    </Section>
  );
}
