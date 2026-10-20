import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { faqStructuredData } from "@/lib/structuredData";
import { CONTACT_EMAIL, CONTACT_PHONES } from "@/lib/contactInfo";

export const metadata = createPageMetadata({
  title: "Services in Tamil Nadu",
  description:
    "MyLoginn builds websites, mobile apps, desktop software, AI agents and digital marketing for businesses across Tamil Nadu.",
  path: "/locations/tamil-nadu",
  keywords: [
    "software company Tamil Nadu", "web development company Tamil Nadu", "app development Tamil Nadu",
    "AI solutions Tamil Nadu", "digital marketing Tamil Nadu", "web development Coimbatore",
  ],
});

// Do not add office or address claims here until the owner confirms them.
const services = [
  { href: "/services/app-web-development", label: "Website, web application, mobile app and custom software development" },
  { href: "/services/ai-development", label: "AI development, AI agents and workflow automation" },
  { href: "/services/testing-automation", label: "Software testing and test automation" },
  { href: "/services/digital-marketing", label: "Digital marketing and SEO" },
];

const faqs = [
  { question: "Which parts of Tamil Nadu do you work with?", answer: "We work with businesses across Tamil Nadu, including Coimbatore, Pollachi, Udumalpet and Erode, and also serve clients elsewhere in India and abroad remotely." },
  { question: "Can you work with a business outside the big cities?", answer: "Yes. Most project work, from discovery calls to delivery, can run online, so location does not limit what we can build." },
  { question: "Do you offer courses and internships for students in Tamil Nadu?", answer: "Yes, through MyLoginn Learn, our separate learning platform, which runs online technology courses and internships. See the courses and internships pages for what is currently open." },
  { question: "How do I start a project?", answer: `Send an enquiry through the contact page or email ${CONTACT_EMAIL}, and the team will follow up to understand your goals before agreeing scope.` },
];

export default function TamilNaduPage() {
  return (
    <Section className="py-14 sm:py-20">
      <JsonLd data={faqStructuredData(faqs)} />
      <Container className="max-w-4xl">
        <h1 className="mt-0 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">Software, AI and digital services for Tamil Nadu businesses</h1>
        <p className="mt-4 text-lg leading-8 text-muted">MyLoginn Tech is an India-based technology company. We help businesses across Tamil Nadu, including Coimbatore, Pollachi, Udumalpet and Erode, build and grow with web, mobile, AI and marketing solutions, and we help students learn practical technology skills.</p>

        <section aria-labelledby="tn-services" className="mt-12">
          <h2 id="tn-services" className="text-2xl font-semibold tracking-tight">What we can do for your business</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((s) => <li key={s.href}><Link href={s.href} className="block h-full rounded-xl border border-border-soft bg-surface p-4 text-sm font-medium hover:border-brand-400">{s.label}</Link></li>)}
          </ul>
        </section>

        <section aria-labelledby="tn-work" className="mt-12">
          <h2 id="tn-work" className="text-2xl font-semibold tracking-tight">Work for a Tamil Nadu client</h2>
          <p className="mt-3 leading-7 text-muted">We built the website for Ooty Nigel Travels, a Tamil Nadu travel agency offering chauffeur-driven taxis and Nilgiris holiday packages. <Link href="/projects/ooty-nigel-travels" className="font-semibold text-brand-600 hover:underline">Read the Ooty Nigel Travels project</Link> or see <Link href="/projects" className="font-semibold text-brand-600 hover:underline">all MyLoginn projects</Link>.</p>
        </section>

        <section aria-labelledby="tn-learn" className="mt-12">
          <h2 id="tn-learn" className="text-2xl font-semibold tracking-tight">Learn with MyLoginn</h2>
          <p className="mt-3 leading-7 text-muted">Students and professionals can explore <Link href="/courses" className="font-semibold text-brand-600 hover:underline">technology courses</Link> and <Link href="/internships" className="font-semibold text-brand-600 hover:underline">internships</Link>.</p>
        </section>

        <section aria-labelledby="tn-faq" className="mt-12">
          <h2 id="tn-faq" className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <FaqAccordion items={faqs} className="mt-5" />
        </section>

        <section aria-labelledby="tn-contact" className="mt-12 rounded-3xl bg-surface-2 p-6 sm:p-8">
          <h2 id="tn-contact" className="text-2xl font-semibold tracking-tight">Talk to the team</h2>
          <p className="mt-3 text-muted">Email <a className="font-semibold text-brand-600" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call <a className="font-semibold text-brand-600" href={`tel:${CONTACT_PHONES[0].tel}`}>{CONTACT_PHONES[0].display}</a>, or use the <Link className="font-semibold text-brand-600 hover:underline" href="/contact">contact page</Link>.</p>
        </section>
      </Container>
    </Section>
  );
}
