import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { ContactEnquiryTabs } from "@/components/services/ContactEnquiryTabs";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ContactInfoCard } from "@/components/pages/ContactInfoCard";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ContactHeroVisual } from "@/components/pages/PageHeroVisuals";
import contactArtwork from "@/images/Contact us header.png";
import { CONTACT_EMAIL, CONTACT_HOURS, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";

export const metadata = createPageMetadata({
  title: "Contact MyLoginn",
  absoluteTitle: true,
  description: "Start a project with MyLoginn Tech: web development, app development, desktop applications, AI agents and digital marketing.",
  path: "/contact",
  keywords: ["contact MyLoginn", "MyLoginn contact", "software development enquiry", "digital marketing enquiry"],
});

const contactFaqs = [
  { question: "What should I include in a project enquiry?", answer: "Share your goal, expected users, key requirements, relevant links and any timing constraints you know." },
  { question: "What happens after I send an enquiry?", answer: "Our team reviews it and contacts you with next steps, usually starting with a short discovery conversation." },
  { question: "Can you work with an existing website or system?", answer: "Yes. We can improve, extend, integrate with or migrate what you already have, as well as build new." },
  { question: "Where can I ask about MyLoginn Learn?", answer: "Use the Learn tab in the form on this page for course, fee and payment questions." },
];

const phoneLink = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const supportAreas = [
  { label: "Build", value: "Web & apps", icon: "webdev" },
  { label: "Software", value: "Desktop applications", icon: "software" },
  { label: "Automate", value: "AI agents", icon: "ai" },
  { label: "Grow", value: "Digital marketing", icon: "marketing" },
];

const quickLinks = [
  { title: "Explore solutions", description: "Web, app, desktop, AI and marketing services.", href: "/services", icon: "webdev", color: "#2563eb", cta: "View solutions" },
  { title: "See our work", description: "Websites and products we have built and launched.", href: "/projects", icon: "business", color: "#7c3aed", cta: "View projects" },
  { title: "Join our team", description: "Open roles across development, AI and marketing.", href: "/careers", icon: "career", color: "#059669", cta: "View careers" },
  { title: "MyLoginn Learn", description: "Our separate platform for technology courses.", href: "/courses", icon: "student", color: "#d97706", cta: "Go to Learn" },
];

export default function ContactPage() {
  return (
    <div className="overflow-hidden bg-white text-[#17233e]">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: contactFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      <div className="relative mx-auto w-full max-w-[1160px] px-5 py-4 sm:px-8 sm:py-11 lg:px-0">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 -z-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(91,157,255,.11),rgba(255,255,255,0)_70%)]" />
        <header className="relative z-10 grid items-center gap-10 py-4 sm:py-6 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <SplitHeadline as="h1" text="Let's build something together" className="mt-0 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl" />
            <Reveal direction="up" delay={0.15}>
              <p className="mt-5 max-w-lg text-base leading-8 text-[#62708d] sm:text-lg">Tell us about your business and what you want to build. We&apos;ll come back to you with next steps.</p>
            </Reveal>
            <Reveal direction="up" delay={0.25} className="mt-7 flex justify-center lg:justify-start">
              <ArrowLink href="#contact-form">Start a project</ArrowLink>
            </Reveal>
          </div>
          <Reveal direction="left" delay={0.15} className="min-w-0">
            <ContactHeroVisual
              email={CONTACT_EMAIL}
              phones={CONTACT_PHONES.map((p) => ({ display: p.display, tel: phoneLink(p.tel) .replace("tel:", "") }))}
              whatsappHref={toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I have a question.") ?? "#contact-form"}
              hours={CONTACT_HOURS}
              accent={contactArtwork}
            />
          </Reveal>
        </header>

        <RevealGroup className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.07}>
          {supportAreas.map(({ label, value, icon }, i) => (
            <RevealItem key={label}>
              <div className="group flex h-full items-center gap-3 rounded-2xl border border-border-soft bg-surface p-3 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/50 hover:shadow-[var(--shadow-soft)] sm:p-4">
                <IconBadge size="sm" delay={i * 0.05} className="!h-11 !w-11"><ContentIcon keyword={icon} className="h-9 w-9" /></IconBadge>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-story-navy">{value}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <section className="relative z-10 mt-8 grid items-start gap-6 lg:grid-cols-[1.1fr_.9fr] lg:gap-8">
          <div id="contact-form" className="scroll-mt-24 min-w-0">
            <ContactEnquiryTabs />
            <div className="mt-4 flex items-center gap-2 px-1 text-xs text-muted"><ShieldCheck className="h-4 w-4 shrink-0 text-story-royal" /> Your contact details are used only to respond to your enquiry.</div>
          </div>

          <aside className="grid gap-6">
            <ContactInfoCard
              email={CONTACT_EMAIL}
              phones={CONTACT_PHONES.map((p) => ({ display: p.display, tel: phoneLink(p.tel).replace("tel:", "") }))}
              whatsappHref={toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I have a question.") ?? "#contact-form"}
              hours={CONTACT_HOURS}
            />

            <section aria-labelledby="contact-faq" className="rounded-3xl border border-border-soft bg-story-mist/60 p-5 sm:p-6">
              <span className="story-eyebrow">Quick answers</span>
              <h2 id="contact-faq" className="mt-2 text-xl font-semibold tracking-tight text-story-navy">Before you get in touch</h2>
              <FaqAccordion items={contactFaqs} className="mt-4" />
            </section>
          </aside>
        </section>

        <section aria-labelledby="quick-access" className="relative z-10 mt-20 sm:mt-24">
          <Reveal><span className="story-eyebrow">Quick access</span></Reveal>
          <h2 id="quick-access" className="story-subheading mt-3 text-story-navy">Choose your next step</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">Go straight to the MyLoginn area that matches what you&apos;re looking for.</p>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {quickLinks.map(({ title, description, href, icon, color, cta }, i) => (
              <RevealItem key={title} className="h-full">
                <Link
                  href={href}
                  style={{ "--c": color } as React.CSSProperties}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--c)] hover:shadow-[0_18px_36px_-22px_var(--c)]"
                >
                  <span className="flex flex-1 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-story-navy">{title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
                    </span>
                    <IconBadge size="sm" delay={i * 0.05} className="!h-12 !w-12 shrink-0"><ContentIcon keyword={icon} className="h-10 w-10" /></IconBadge>
                  </span>
                  <span className="mt-5 flex items-center justify-between border-t border-border-soft pt-3.5">
                    <span className="text-sm font-semibold text-[var(--c)]">{cta}</span>
                    <span aria-hidden className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] transition-colors duration-300 group-hover:bg-[var(--c)] group-hover:text-white">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[180%]">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -translate-x-[180%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </span>
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </div>
    </div>
  );
}
