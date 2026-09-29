import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";

export const metadata = createPageMetadata({
  title: "IT & Technology Services",
  description: "Explore MyLoginn Tech Private Limited services for website and app development, custom software, AI solutions, UI/UX, and digital marketing.",
  path: "/services",
  keywords: [
    "MyLoginn IT services", "IT services", "technology services",
    "software solutions", "software development services", "digital solutions",
    "AI technology solutions", "business technology solutions",
  ],
});

const services = [
  { title: "App & Web Development", text: "Website development, web applications, mobile apps, and custom software built around your product needs.", href: "/services/app-web-development" },
  { title: "Digital Marketing", text: "SEO, paid campaigns, social media, content, and performance analytics for business growth.", href: "/services/digital-marketing" },
];

export default function ServicesPage() {
  return (
    <Section className="py-16 sm:py-24">
      <Container className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">MyLoginn Tech Private Limited</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">IT and technology services</h1>
        <p className="mt-5 max-w-3xl text-lg text-muted">MyLoginn provides website and app development, custom software, AI-driven technology solutions, UI/UX, and digital marketing. Explore our service areas and contact the team to discuss a project.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.href} className="rounded-3xl border border-border-soft bg-surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold">{service.title}</h2>
              <p className="mt-3 text-muted">{service.text}</p>
              <Link className="mt-5 inline-flex font-semibold text-brand-600" href={service.href}>Explore {service.title} <span aria-hidden="true">&rarr;</span></Link>
            </article>
          ))}
        </div>
        <nav aria-label="More from MyLoginn" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link href="/projects">Projects</Link><Link href="/courses">Technology courses</Link><Link href="/internships">Internships</Link><Link href="/contact">Contact MyLoginn</Link>
        </nav>
      </Container>
    </Section>
  );
}
