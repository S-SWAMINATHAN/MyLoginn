import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";

export const metadata = createPageMetadata({
  title: "Terms of Use",
  description: "Terms for using myloginn.com, its courses, internships and services.",
  path: "/terms",
});

// DRAFT: have a qualified lawyer review this before relying on it.
const sections = [
  { h: "Using the site", p: "Use myloginn.com lawfully. Do not attempt to disrupt the service, access other users' data, or upload malicious files." },
  { h: "Accounts", p: "Keep your login details confidential. You are responsible for activity on your account." },
  { h: "Courses and internships", p: "Content is provided for learning. Course certificates confirm completion of a MyLoginn course and are not a government or third-party accreditation. Prices and availability are shown at checkout." },
  { h: "Project and service work", p: "Scope, timelines, fees and deliverables for development, marketing and other services are agreed in writing for each engagement. We do not guarantee specific business results." },
  { h: "Intellectual property", p: "Site content belongs to MyLoginn Tech Private Limited or its licensors. Work product for client projects is governed by the agreement for that project." },
  { h: "Liability", p: "To the extent permitted by law, the site is provided as is and MyLoginn is not liable for indirect losses arising from its use." },
  { h: "Contact", p: `Questions about these terms: ${CONTACT_EMAIL}. These terms are governed by the laws of India.` },
];

export default function TermsPage() {
  return (
    <Section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Use</h1>
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
