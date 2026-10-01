import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, UserRound, Zap } from "lucide-react";
import ContactArtwork from "@/images/Contact us header.png";
import { createPageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/services/LeadForm";
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
const contactCards = [
  { icon: "email", title: "Email Us", description: "For admissions, partnerships, or general questions", linkText: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, theme: "blue" },
  { icon: "phone", title: "Call Us", description: "Speak to our team directly", linkText: CONTACT_PHONES.map((item) => item.display).join(" · "), href: phoneLink(CONTACT_PHONES[0]?.tel ?? ""), theme: "mint" },
  { icon: "whatsapp", title: "WhatsApp", description: "Chat with us instantly on WhatsApp", linkText: "Start WhatsApp Chat", href: toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I have a question.") ?? "#", theme: "mint" },
  { icon: "enquiry", title: "General Enquiry", description: "Have a question? We’re here to help.", linkText: "Use enquiry form", href: "#contact-form", theme: "violet" },
];

export default function ContactPage() {
  return (
    <div className="overflow-hidden bg-white text-[#17233e]">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: contactFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      <div className="relative mx-auto w-full max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11 lg:px-0">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 -z-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(91,157,255,.11),rgba(255,255,255,0)_70%)]" />
        <div className="relative z-10 grid items-start gap-8 lg:grid-cols-[.9fr_1fr] lg:gap-[5.2rem]">
          <div className="min-w-0">
            <div className="relative min-h-[225px] sm:min-h-[245px]">
              <div className="relative z-10 max-w-[400px] pt-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eff5ff] px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#145bea]"><span className="h-2 w-2 rounded-full bg-[#2164f5]" /> GET IN TOUCH</span>
                <h1 className="mt-5 max-w-[400px] text-[2.15rem] font-semibold leading-[1.16] tracking-[-.045em] sm:text-[2.55rem]">Let’s Build Something Amazing <span className="text-[#2164f5]">Together</span></h1>
                <p className="mt-4 max-w-[410px] text-[13px] leading-[1.8] text-[#62708d] sm:text-sm">Have a project idea, need guidance, or want to collaborate? We&apos;d love to hear from you!</p>
              </div>
              <Image src={ContactArtwork} alt="3D blue envelope with a message, paper plane and communication symbols" priority className="pointer-events-none absolute -right-10 top-12 z-0 h-[165px] w-[165px] object-contain mix-blend-screen sm:-right-12 sm:top-9 sm:h-[190px] sm:w-[190px] lg:-right-16" />
            </div>

            <a href="#contact-form" className="group mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#dfe8fb] bg-[#f9fbff] px-5 py-4 transition hover:border-[#a9c4ff] hover:shadow-[0_8px_26px_rgba(50,100,210,.08)] sm:px-6">
              <span><span className="block text-sm font-semibold">Have a project in mind?</span><span className="mt-1 block text-xs leading-5 text-[#687694] sm:text-[13px]">Share your requirements and we&apos;ll get back to you</span></span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2164f5] text-white transition group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span>
            </a>

            <div className="grid gap-4 sm:grid-cols-2">
              {contactCards.map(({ icon, title, description, linkText, href, theme }) => (
                <a key={title} href={href} target={title === "WhatsApp" ? "_blank" : undefined} rel={title === "WhatsApp" ? "noopener noreferrer" : undefined} className="group flex min-h-[174px] flex-col rounded-[1.2rem] border border-[#e7ebf3] bg-white p-4.5 shadow-[0_7px_22px_rgba(28,48,84,.045)] transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(28,48,84,.1)] sm:p-5">
                  <span className={`grid h-12 w-12 place-items-center rounded-full ${theme === "blue" ? "bg-[#eff5ff]" : theme === "violet" ? "bg-[#f6f1ff]" : "bg-[#edfbf7]"}`}><Image src={`/contact-icons/${icon}.png`} alt="" width={64} height={64} className="h-11 w-11 object-contain" /></span>
                  <h2 className="mt-3 text-[15px] font-semibold">{title}</h2>
                  <p className="mt-1 text-xs leading-[1.6] text-[#697692]">{description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[12px] font-medium text-[#075bf5]">{linkText}<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </a>
              ))}
            </div>
          </div>

          <div id="contact-form" className="relative z-10 scroll-mt-24">
            <div className="rounded-[1.3rem] border border-[#e8ecf3] bg-white p-4 shadow-[0_18px_58px_rgba(28,48,84,.10)] sm:p-6 lg:p-7 [&_button[type=submit]]:mt-1 [&_button[type=submit]]:rounded-lg [&_button[type=submit]]:bg-[#2164f5] [&_button[type=submit]]:py-3 [&_button[type=submit]]:text-sm [&_button[type=submit]]:shadow-[0_7px_18px_rgba(33,100,245,.2)] [&_form]:gap-3.5 [&_input]:rounded-lg [&_input]:py-2.5 [&_textarea]:rounded-lg">
              <LeadForm service="General Inquiry" variant="contact" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#d9dfeb] rounded-b-[1.1rem] border-x border-b border-[#edf0f5] bg-[#fbfcff] px-2 py-3 text-[10px] text-[#34415d] sm:px-4 sm:text-[11px]">
              <span className="flex items-center justify-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#3973f6]" /> Quick Response</span>
              <span className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#3973f6]" /> 100% Confidential</span>
              <span className="flex items-center justify-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-[#3973f6]" /> Expert Support</span>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex min-h-[104px] flex-wrap items-center gap-x-8 gap-y-4 overflow-hidden rounded-xl border border-[#d8e5ff] bg-[linear-gradient(100deg,#f4f8ff_0%,#edf4ff_55%,#f8fbff_100%)] px-5 py-5 sm:px-8 lg:mt-9 lg:justify-between">
          <div className="absolute -right-8 -top-20 h-52 w-52 rounded-full border border-[#d9e6ff]" />
          <div className="relative flex items-center gap-4"><Image src="/contact-icons/headset.png" alt="" width={96} height={96} className="h-16 w-16 shrink-0 object-contain sm:h-[4.5rem] sm:w-[4.5rem]" /><div><h2 className="text-base font-semibold sm:text-lg">We’re here to help you succeed</h2><p className="mt-1 text-xs text-[#697692] sm:text-[13px]">From idea to execution — our team supports you at every step.</p></div></div>
          <div className="relative flex items-center gap-3"><Link href="/services" className="relative inline-flex items-center gap-3 rounded-lg border border-[#cfddfb] bg-white/80 px-4 py-3 text-xs font-medium text-[#075bf5] transition hover:bg-white">Explore Our Services <ArrowUpRight className="h-4 w-4" /></Link><Image src="/contact-icons/rocket.png" alt="" width={112} height={112} className="hidden h-20 w-20 object-contain sm:block" /></div>
        </div>

        <section aria-labelledby="contact-faq" className="mx-auto mt-12 max-w-3xl border-t border-[#edf0f5] pt-8">
          <div className="mb-4 text-center"><p className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#3569df]">A few quick answers</p><h2 id="contact-faq" className="mt-2 text-2xl font-semibold tracking-tight">Before you hit send</h2></div>
          <div className="divide-y divide-[#e9edf4] border-y border-[#e9edf4]">
            {contactFaqs.map(({ question, answer }) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#23304a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3569df]"><span>{question}</span><span className="text-lg text-[#3569df] transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-[#707d93]">{answer}</p></details>)}
          </div>
        </section>
      </div>
    </div>
  );
}
