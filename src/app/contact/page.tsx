import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { LeadForm } from "@/components/services/LeadForm";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";

const contactPoints = [
  {
    icon: AnimatedMail,
    title: "Email us",
    description: "For admissions, partnerships, or general questions.",
    value: "mailloginn@gmail.com",
  },
  {
    icon: AnimatedPhone,
    title: "Call us",
    description: "Speak to the team directly on any of these lines.",
    value: "96555 60555 · 8489 202020 · 63817 21061",
  },
  {
    icon: AnimatedChat,
    title: "WhatsApp",
    description: "Fastest way to reach the team during business hours.",
    value: "Message us after submitting the form",
  },
  {
    icon: AnimatedClock,
    title: "Response time",
    description: "We typically reply within one business day.",
    value: "Mon–Sat, 9am–7pm IST",
  },
];

export const metadata = { title: "Contact — MyLoginn" };

export default function ContactPage() {
  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Eyebrow>Get in Touch</Eyebrow>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Contact MyLoginn</h1>
            <p className="mt-4 max-w-xl text-muted">
              Questions about a course, internship, or one of our services? Send us a message and a real
              person will get back to you.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {contactPoints.map((c, i) => (
                <Card
                  key={c.title}
                  className={`animate-fade-up stagger-${i + 1} card-shine relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
                >
                  <c.icon className="h-10 w-10" />
                  <h3 className="mt-4 font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted">{c.description}</p>
                  <p className="mt-2 text-sm font-medium text-brand-500">{c.value}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <LeadForm service="General Inquiry" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
