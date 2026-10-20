import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How MyLoginn Tech collects, uses and protects personal information on myloginn.com.",
  path: "/privacy",
});

// DRAFT: have a qualified lawyer review this before relying on it, and keep it in sync with the
// providers actually configured (see .env.example).
const sections = [
  { h: "Who we are", p: `This website is operated by MyLoginn Tech, an India-based technology company. Contact: ${CONTACT_EMAIL}.` },
  { h: "Information we collect", p: "Account details (name, email, phone), enquiry and project-request details you submit, course progress and enrolment records, payment status, and technical data such as browser type needed to run and secure the site." },
  { h: "How we use it", p: "To provide accounts, courses and internships; respond to enquiries; verify your email or phone with one-time codes; process payments; secure the site and prevent abuse; and improve our services." },
  { h: "Service providers", p: "We use third-party providers to deliver the service, for example for payments, email, SMS or phone verification, hosting, and AI-assisted chat. They receive only the data needed for their function. We do not sell personal information." },
  { h: "Security", p: "Passwords are stored hashed, traffic is served over HTTPS, and access to administration features is restricted. No online service can guarantee absolute security." },
  { h: "Retention and your choices", p: `You can ask us to access, correct or delete your personal information by emailing ${CONTACT_EMAIL}. We keep records only as long as needed for the purposes above or as required by law.` },
  { h: "Changes", p: "We may update this policy; the current version is always on this page." },
];

export default function PrivacyPage() {
  return (
    <Section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        {sections.map((s) => (
          <section key={s.h} className="mt-8">
            <h2 className="text-xl font-semibold">{s.h}</h2>
            <p className="mt-2 leading-7 text-muted">{s.p}</p>
          </section>
        ))}
      </Container>
    </Section>
  );
}
