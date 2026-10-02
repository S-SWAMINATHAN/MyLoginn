import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CirclePlay, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";
import aboutHeader from "@/images/About us header.png";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About MyLoginn Tech Private Limited",
  description:
    "Learn about MyLoginn Tech Private Limited, the company behind MyLoginn, and its web and mobile development, AI, digital marketing, courses, and internships.",
  path: "/about",
  keywords: ["about MyLoginn", "MyLoginn Tech Private Limited company", "MyLoginn technology company", "MyLoginn IT company"],
});

const principles = [
  { title: "Innovation", Icon: Target, tone: "blue", description: "We embrace new ideas and modern technology to create better solutions." },
  { title: "Integrity", Icon: ShieldCheck, tone: "mint", description: "We believe in honesty, transparency and doing what’s right, always." },
  { title: "Collaboration", Icon: Users, tone: "violet", description: "We grow together by supporting, sharing and learning from each other." },
  { title: "Impact", Icon: TrendingUp, tone: "amber", description: "We focus on real outcomes for people, businesses and the digital future." },
];

const proofPoints = [
  { value: "10K+", label: "Learners & Growing", icon: "intelligence" },
  { value: "500+", label: "Projects Completed", icon: "innovation" },
  { value: "100%", label: "Practical Learning", icon: "integrity" },
  { value: "4.9/5", label: "Student Satisfaction", icon: "impact" },
];

const faqs = [
  { question: "What is MyLoginn Tech Private Limited?", answer: "MyLoginn Tech Private Limited is an Indian technology company. MYLOGINN is the company’s primary brand spelling." },
  { question: "What does MyLoginn do?", answer: "MyLoginn brings digital product development, applied AI, digital marketing, and practical technology learning together." },
  { question: "Does MyLoginn offer courses and internships?", answer: "Yes. The company offers technology courses, tutoring, and internship opportunities. Visit the Courses and Internships pages for current information." },
  { question: "How can I discuss a project or program?", answer: "Use the Contact page to tell the team about your goals and the kind of support you are looking for." },
];

export default function AboutPage() {
  return (
    <main className="about-page overflow-hidden bg-white text-[#102858]">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
      <style>{`
        @media (min-width: 1024px) and (max-height: 700px) {
          .about-page .about-hero-inner { min-height: 285px; }
          .about-page .about-hero-copy h1 { margin-top: 0.75rem; font-size: 2.35rem; }
          .about-page .about-hero-copy > p { margin-top: 0.8rem; font-size: 0.7rem; line-height: 1.55; }
          .about-page .about-hero-copy > div { margin-top: 1rem; }
          .about-page .about-hero-visual { min-height: 255px; }
          .about-page .about-hero-visual img { max-height: 250px; }
          .about-page .about-who-section { padding-block: 1rem; }
          .about-page .about-who-panel { padding: 1rem; }
          .about-page .about-who-panel > div:first-child h2 { margin-top: 0.75rem; font-size: 1.3rem; }
          .about-page .about-who-panel > div:first-child p { margin-top: 0.75rem; font-size: 0.68rem; line-height: 1.55; }
          .about-page .about-proof-card { min-height: 74px; padding-block: 0.6rem; }
          .about-page .about-team-photo { min-height: 170px; }
          .about-page .about-values-section { padding-block: 1.25rem; }
          .about-page .about-values-section h2 { font-size: 1.35rem; }
          .about-page .about-values-grid { margin-top: 1rem; }
          .about-page .about-value-card { min-height: 76px; padding-block: 0.65rem; }
          .about-page .about-cta-section { padding-bottom: 0; }
          .about-page .about-cta-banner { min-height: 78px; padding-block: 0.65rem; }
        }

        .about-page .about-team-photo { display: none; }

        @media (min-width: 1024px) {
          .about-page .about-who-panel { grid-template-columns: .96fr 1.04fr; }
        }
      `}</style>

      <section className="about-hero relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_78%_46%,rgba(133,181,255,.13),transparent_38%),linear-gradient(180deg,#fff_0%,#f7fbff_100%)]">
        <Container className="about-hero-inner block items-center gap-1 px-5 pt-0 pb-6 sm:px-8 sm:pt-0 sm:pb-8 md:grid lg:min-h-[340px] lg:max-w-[1440px] lg:grid-cols-[.9fr_1.1fr] lg:gap-8 lg:py-8">
          <div className="about-hero-visual relative float-right ml-3 mb-2 block h-24 w-32 max-w-none md:order-2 md:clear-both md:float-none md:mx-auto md:mb-0 md:flex md:min-h-[245px] md:h-auto md:w-full md:max-w-[660px] md:items-center md:justify-center lg:min-h-[300px]"><Image src={aboutHeader} alt="A bright illustration representing ideas becoming digital products and growth" preload sizes="(max-width: 767px) 128px, 58vw" className="h-full max-h-[5rem] w-full object-contain md:h-auto md:max-h-[250px] lg:max-h-[300px]" /></div>
          <div className="about-hero-copy relative z-10 max-w-[480px] py-0 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe0ff] bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#1558d5]"><span className="h-1.5 w-1.5 rounded-full bg-[#1e65ee]" /> About MYLOGINN</span>
            <h1 className="mt-3 text-[2.25rem] font-bold leading-[1.02] sm:text-[2.55rem] lg:text-[2.45rem]">Turning Ideas Into <span className="block bg-gradient-to-r from-[#1559dc] via-[#247cf3] to-[#08a9c4] bg-clip-text text-transparent">Digital Success</span></h1>
            <p className="mt-3 max-w-[365px] text-[11px] leading-[1.6] text-[#536b91] sm:text-xs"><strong className="font-semibold text-[#17376d]">MYLOGINN TECH</strong> is a next-generation digital platform focused on learning, innovation and real-world growth. We help individuals and businesses build skills, create opportunities and achieve more through technology, creativity and practical experience.</p>
            <div className="mt-4 flex flex-wrap gap-2.5"><a href="#who-we-are" className="group inline-flex min-h-8 items-center gap-2.5 rounded-full bg-[#1763e9] px-4 text-[10px] font-semibold text-white shadow-[0_8px_18px_rgba(30,100,233,.2)] transition hover:-translate-y-0.5 hover:bg-[#104fcb]">Our Mission <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></a><Link href="/services" className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#a9c5f2] bg-white/90 px-3.5 text-[10px] font-semibold text-[#184b9c] transition hover:bg-white"><CirclePlay className="h-3.5 w-3.5" /> Explore Services</Link></div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="who-we-are" className="about-who-section bg-white py-0 lg:py-5"><Container className="max-w-[1440px]"><div className="about-who-panel grid items-center gap-3 rounded-xl border border-[#dbe9fc] bg-[linear-gradient(105deg,#f4f9ff_0%,#fbfdff_52%,#edf6ff_100%)] p-3 lg:grid-cols-[.96fr_1fr_1.18fr] lg:gap-5 lg:p-5"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f0ff] px-2 py-1 text-[9px] font-semibold text-[#2460cf]">Who We Are</span><h2 id="who-we-are" className="mt-3 text-[1.22rem] font-bold leading-[1.08] sm:text-[1.35rem]">We’re More Than Just<br />a <span className="text-[#1765eb]">Tech Platform</span></h2><p className="mt-3 text-[10px] leading-[1.6] text-[#5d7092] sm:text-[11px]">MYLOGINN TECH is built with a vision to empower people with the right skills, practical exposure and modern tools. We bridge learning and real-world opportunities, helping you grow with confidence in the digital world.</p></div><div className="about-proof-grid grid grid-cols-2 gap-2 lg:gap-3">{proofPoints.map((point, index) => <div key={point.value} className="about-proof-card flex min-h-[62px] flex-col justify-center rounded-lg border border-[#e1eaf7] bg-white px-2.5 py-1.5 shadow-[0_4px_12px_rgba(42,76,129,.04)] sm:min-h-[68px] sm:px-3 lg:min-h-[84px] lg:px-4"><div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full ${index === 1 ? "bg-[#e7fbf4]" : index === 2 ? "bg-[#fff2e3]" : index === 3 ? "bg-[#f0ecff]" : "bg-[#eaf2ff]"}`}><Image src={`/about/icons/${point.icon}.svg`} alt="" width={22} height={22} className="h-[18px] w-[18px] object-contain" /></span><span className="text-[1.05rem] font-bold leading-none text-[#132e63] sm:text-xl">{point.value}</span></div><span className="mt-1.5 text-[9px] leading-3 text-[#60749a] sm:text-[10px]">{point.label}</span></div>)}</div><div className="about-team-photo relative min-h-[140px] overflow-hidden rounded-lg border border-[#d5e4f7] bg-[#e3efff] sm:min-h-[155px] lg:min-h-[190px]"><Image src="/about/team-collaboration.jpg" alt="A diverse team collaborating around a laptop in a bright workspace" fill sizes="(max-width: 1024px) 100vw, 36vw" className="object-cover object-center" /><div className="absolute right-2 top-2 rounded-md border border-white/70 bg-white/80 px-2 py-1.5 text-[9px] font-semibold leading-3 text-[#22519d] shadow-sm backdrop-blur-md">Learn<br />Collaborate<br />Grow</div></div></div></Container></section>

      <section id="our-values" aria-labelledby="values-title" className="about-values-section py-1 sm:py-2 lg:py-8"><Container className="max-w-[1440px]"><div className="text-center"><span className="inline-flex items-center gap-2 text-[9px] font-semibold text-[#1765e8] sm:text-[10px]"><span className="h-px w-5 bg-[#8db3fa]" /> Our Values <span className="h-px w-5 bg-[#8db3fa]" /></span><h2 id="values-title" className="mt-2 text-[1.25rem] font-bold leading-tight sm:text-[1.4rem]">What Drives Us</h2><p className="mt-2 text-[9px] leading-relaxed text-[#7183a2] sm:text-[10px]">Our values shape how we work, create and support every learner, partner and team member.</p></div><div className="about-values-grid mt-2 grid gap-2 sm:grid-cols-2 lg:mt-5 lg:grid-cols-4 lg:gap-3">{principles.map((principle) => { const PrincipleIcon = principle.Icon; return <article key={principle.title} className={`about-value-card flex min-h-[64px] items-center gap-2 rounded-lg border px-2 py-1.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(34,72,135,.08)] lg:min-h-[82px] lg:px-3 ${principle.tone === "blue" ? "border-[#d8e7ff] bg-[#f7faff]" : principle.tone === "mint" ? "border-[#d3eee3] bg-[#f6fcf9]" : principle.tone === "violet" ? "border-[#e3ddfb] bg-[#faf8ff]" : "border-[#f7e3ce] bg-[#fffaf5]"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${principle.tone === "blue" ? "bg-[#4d8fff]" : principle.tone === "mint" ? "bg-[#45c58b]" : principle.tone === "violet" ? "bg-[#8a70ee]" : "bg-[#ff9449]"}`}><PrincipleIcon aria-hidden="true" className="h-4 w-4" /></span><div><h3 className="text-[10px] font-bold text-[#173264]">{principle.title}</h3><p className="mt-1 text-[8px] leading-[1.5] text-[#64799f] sm:text-[9px]">{principle.description}</p></div></article>; })}</div></Container></section>

      <section className="about-cta-section pb-0"><Container className="max-w-[1440px]"><div className="about-cta-banner relative flex min-h-[66px] flex-wrap items-center justify-between gap-2 overflow-hidden rounded-lg border border-[#d7e6ff] bg-[linear-gradient(105deg,#eaf3ff_0%,#f6fbff_50%,#effaf7_100%)] px-3 py-2 sm:px-4"><div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(125deg,transparent,#d8f5ec)] opacity-70" /><div className="relative flex min-w-0 items-center gap-3"><Image src="/about-icons/paper-plane.svg" alt="" width={72} height={60} className="hidden h-12 w-[68px] shrink-0 object-contain sm:block" /><div><h2 className="text-[12px] font-bold text-[#12316b] sm:text-[13px]">Ready to Build Your Future With Us?</h2><p className="mt-1.5 max-w-[390px] text-[9px] leading-4 text-[#60749a] sm:text-[10px]">Join MYLOGINN TECH and be part of a growing community of learners, creators and digital achievers.</p></div></div><Link href="/contact" className="group relative inline-flex min-h-8 shrink-0 items-center gap-2.5 rounded-full bg-[#1763e9] px-4 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(30,100,233,.2)] transition hover:-translate-y-0.5 hover:bg-[#104fcb]">Get Started <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></Link><span className="relative hidden text-[11px] font-semibold italic text-[#1958cb] lg:block">Let’s Grow<br />Together</span></div></Container></section>

      <section aria-labelledby="about-faq" className="border-t border-[#edf1f7] bg-[#fbfcff] py-14 sm:py-16"><Container className="max-w-4xl"><div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#3c6dcb]">Learn more</p><h2 id="about-faq" className="mt-2 text-2xl font-bold tracking-tight">A few common questions</h2></div><div className="mt-5 divide-y divide-[#e8edf4] rounded-2xl border border-[#e5eaf2] bg-white px-5 sm:px-7">{faqs.map(({ question, answer }) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#23385e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3268e5]"><span>{question}</span><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e3eaf5] text-[#3268e5] transition group-open:rotate-45">+</span></summary><p className="mt-2 max-w-3xl text-sm leading-6 text-[#6a7a96]">{answer}</p></details>)}</div><p className="mt-5 text-center text-xs text-[#74819a]">Have another question? <Link href="/contact" className="font-semibold text-[#2462d7]">Talk to our team</Link> · <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#2462d7]">{CONTACT_EMAIL}</a></p></Container></section>
  </main>
  );
}
