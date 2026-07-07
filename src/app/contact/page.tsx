import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { LeadForm } from "@/components/services/LeadForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE, CONTACT_HOURS } from "@/lib/contactInfo";

type ContactAction = { label: string; href?: string; external?: boolean };

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
    description: "Fastest way to reach the team during business hours.",
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
    title: "Response time",
    description: "We typically reply within one business day.",
    actions: [{ label: CONTACT_HOURS }],
  },
];

export const metadata = { title: "Contact — MyLoginn" };

export default function ContactPage() {
  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Reveal>
              <Eyebrow>Get in Touch</Eyebrow>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Contact MyLoginn</h1>
              <p className="mt-4 max-w-xl text-muted">
                Questions about a course, internship, or one of our services? Send us a message and a real
                person will get back to you.
              </p>
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
                          {i > 0 && <span className="text-border select-none" aria-hidden>·</span>}
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
    </Section>
  );
}
