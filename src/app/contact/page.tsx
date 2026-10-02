import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";
import ContactArtwork from "@/images/Contact us header.png";
import { createPageMetadata } from "@/lib/seo";
import { ContactEnquiryTabs } from "@/components/services/ContactEnquiryTabs";
import { JsonLd } from "@/components/seo/JsonLd";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";

export const metadata = createPageMetadata({
  title: "Contact MyLoginn",
  description: "Contact MyLoginn Tech Private Limited about software development, AI, digital marketing, courses, tutoring, and internships.",
  path: "/contact",
  keywords: ["contact MyLoginn", "MyLoginn contact", "software development enquiry", "digital marketing enquiry"],
});

const contactFaqs = [
  { question: "How do I request app or web development?", answer: "Use the project enquiry form or visit the App & Web Development service page to describe your project." },
  { question: "How do I enquire about digital marketing?", answer: "Visit the Digital Marketing service page and share your goals and channels with our team." },
  { question: "Where can I ask about courses or internships?", answer: "Browse the Courses or Internships pages for current listings, or use the enquiry form on this page." },
  { question: "What should I include in a project enquiry?", answer: "Share your goal, expected users, key requirements, relevant links and any timing constraints you know." },
];

const phoneLink = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const quickLinks = [
  { title: "Explore courses", description: "Browse learning paths and course details.", href: "/courses", tone: "blue" },
  { title: "Create an account", description: "Set up your MyLoginn learner profile.", href: "/signup", tone: "mint" },
  { title: "Find an internship", description: "Explore current internship opportunities.", href: "/internships", tone: "violet" },
  { title: "Discuss a project", description: "Tell us about a product or marketing need.", href: "/services", tone: "blue" },
  { title: "Get tutoring support", description: "Explore one-to-one tutoring options.", href: "/tutoring", tone: "mint" },
];

export default function ContactPage() {
  return (
    <div className="overflow-hidden bg-white text-[#17233e]">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: contactFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      <div className="relative mx-auto w-full max-w-[1160px] px-5 py-4 sm:px-8 sm:py-11 lg:px-0">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 -z-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(91,157,255,.11),rgba(255,255,255,0)_70%)]" />
        <header className="relative z-10 grid items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eff5ff] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#145bea]"><span className="h-2 w-2 rounded-full bg-[#2164f5]" /> Contact &amp; Support</span>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] sm:text-[2.8rem]">We&apos;re here to <span className="text-[#2164f5]">help you</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#62708d] sm:text-base">Course questions, project ideas, tutoring, or internships — tell us what you need and we&apos;ll point you in the right direction.</p>
          </div>
          <Image src={ContactArtwork} alt="Message envelope and paper plane" priority className="hidden h-36 w-40 object-contain sm:block lg:h-44 lg:w-48" />
        </header>

        <section aria-label="MyLoginn support" className="relative z-10 mt-7 grid grid-cols-2 overflow-hidden rounded-xl border border-[#e5ebf6] bg-white sm:grid-cols-4">
          {[
            { label: "Course guidance", value: "Learning paths" },
            { label: "Career support", value: "Internships" },
            { label: "Business enquiries", value: "Project services" },
            { label: "Personal learning", value: "Tutoring" },
          ].map(({ label, value }, index) => (
            <div key={label} className={`px-4 py-4 sm:px-5 ${index % 2 === 1 ? "border-l border-[#edf0f5] sm:border-l" : ""} ${index > 1 ? "border-t border-[#edf0f5] sm:border-t-0" : ""} ${index === 2 ? "sm:border-l" : ""}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#74819a]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#23304a]">{value}</p>
            </div>
          ))}
        </section>

        <section className="relative z-10 mt-7 grid items-start gap-5 lg:grid-cols-[1.1fr_.9fr] lg:gap-7">
          <div id="contact-form" className="scroll-mt-24 rounded-[1.1rem] border border-[#e8ecf3] bg-white p-4 shadow-[0_16px_48px_rgba(28,48,84,.08)] sm:p-6 lg:p-7 [&_button[type=submit]]:mt-1 [&_button[type=submit]]:rounded-lg [&_button[type=submit]]:bg-[#2164f5] [&_button[type=submit]]:py-3 [&_button[type=submit]]:text-sm [&_button[type=submit]]:shadow-[0_7px_18px_rgba(33,100,245,.2)] [&_form]:gap-3.5 [&_textarea]:rounded-lg">
            <ContactEnquiryTabs />
            <div className="mt-4 flex items-center gap-2 border-t border-[#edf0f5] pt-3 text-xs text-[#697692]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#3973f6]" /> Your contact details are used only to respond to your enquiry.</div>
          </div>

          <aside className="grid gap-5">
            <section aria-labelledby="contact-information" className="rounded-[1.1rem] border border-[#e8ecf3] bg-white p-5 sm:p-6">
              <h2 id="contact-information" className="text-lg font-semibold">Contact information</h2>
              <div className="mt-4 divide-y divide-[#edf0f5]">
                <div className="flex gap-3 py-3 first:pt-0">
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eff5ff] text-[#2164f5]"><Mail className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#74819a]">Email</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-[#075bf5] hover:underline">{CONTACT_EMAIL}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" /></a>
                  </div>
                </div>
                <div className="flex gap-3 py-3">
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edfbf7] text-[#13866b]"><Phone className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#74819a]">Call us</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {CONTACT_PHONES.map((phone) => <a key={phone.tel} href={phoneLink(phone.tel)} className="text-sm font-medium text-[#075bf5] hover:underline">{phone.display}</a>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 py-3 pb-0">
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edfbf7]">
                    <Image src="/contact-icons/whatsapp.png" alt="" width={24} height={24} className="h-5 w-5 object-contain" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#74819a]">WhatsApp</p>
                    <a href={toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I have a question.") ?? "#contact-form"} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#075bf5] hover:underline">Start a chat<ArrowUpRight className="h-3.5 w-3.5" /></a>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="contact-faq" className="rounded-[1.1rem] border border-[#e8ecf3] bg-[#f9fbff] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3569df]">Quick answers</p>
              <h2 id="contact-faq" className="mt-1 text-lg font-semibold">Before you get in touch</h2>
              <div className="mt-3 divide-y divide-[#e4eaf4]">
                {contactFaqs.map(({ question, answer }) => <details key={question} className="group py-3"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-[#23304a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3569df]"><span>{question}</span><span aria-hidden="true" className="text-lg leading-4 text-[#3569df] transition group-open:rotate-45">+</span></summary><p className="mt-2 text-sm leading-6 text-[#707d93]">{answer}</p></details>)}
              </div>
            </section>
          </aside>
        </section>

        <section aria-labelledby="quick-access" className="relative z-10 mt-12 border-t border-[#e9edf4] pt-8 sm:mt-14">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3569df]">Quick access</p>
            <h2 id="quick-access" className="mt-2 text-2xl font-semibold tracking-tight">Choose your next step</h2>
            <p className="mt-2 text-sm leading-6 text-[#697692]">Go straight to the MyLoginn area that matches what you&apos;re looking for.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ title, description, href, tone }) => (
              <Link key={title} href={href} className="group flex min-h-32 flex-col rounded-xl border border-[#e7ebf3] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#c8d7f6] hover:shadow-[0_10px_28px_rgba(28,48,84,.08)]">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone === "blue" ? "bg-[#eff5ff] text-[#2164f5]" : tone === "mint" ? "bg-[#edfbf7] text-[#13866b]" : "bg-[#f6f1ff] text-[#7350b5]"}`}><ArrowUpRight className="h-4 w-4" /></span>
                <span className="mt-3 text-sm font-semibold text-[#23304a]">{title}</span>
                <span className="mt-1 text-xs leading-5 text-[#697692]">{description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
