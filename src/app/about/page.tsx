import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Lightbulb, ShieldCheck, Sparkles, Target, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ReviewSection } from "@/components/about/ReviewSection";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About MyLoginn",
  absoluteTitle: true,
  description: "Meet MyLoginn Tech: a technology partner building websites, apps, custom software, AI solutions and digital growth experiences.",
  path: "/about",
  keywords: ["about MyLoginn", "MyLoginn Tech company", "MyLoginn technology company", "MyLoginn IT company"],
});
export const dynamic = "force-dynamic";

const offerings = [
  { title: "Website development", text: "Websites, platforms and portals designed around how your customers work.", href: "/services/app-web-development", icon: "webdev" },
  { title: "Mobile app development", text: "Useful Android, iOS and cross-platform experiences for your customers.", href: "/services/app-web-development", icon: "mobile" },
  { title: "Custom software", text: "Purpose-built systems for the workflows and needs of your business.", href: "/services/app-web-development", icon: "software" },
  { title: "Desktop applications", text: "Dependable applications for focused day-to-day business operations.", href: "/services/app-web-development", icon: "software" },
  { title: "Digital marketing", text: "Search, paid campaigns and content that help customers find you.", href: "/services/digital-marketing", icon: "marketing" },
  { title: "AI solutions", text: "Practical automation and agents that make repetitive work easier.", href: "/services/ai-development", icon: "ai" },
];

const pillars: { title: string; description: string; Icon: LucideIcon }[] = [
  { title: "People first", Icon: Users, description: "We start with the people who will use and rely on what we build." },
  { title: "Impact driven", Icon: Target, description: "We keep the business goal visible through each project decision." },
  { title: "Ready to grow", Icon: TrendingUp, description: "We plan for solutions that can evolve with the work ahead." },
];

const faqs = [
  { question: "What is MyLoginn Tech?", answer: "MyLoginn Tech is an India-based technology company building digital products and growth solutions for businesses." },
  { question: "What does MyLoginn do?", answer: "MyLoginn builds websites, mobile apps, desktop applications and AI solutions, and provides custom software development and digital marketing." },
  { question: "How can I start a project with MyLoginn?", answer: "Use the Contact page to tell the team about your business, your goals and what you want to build. We will reply with next steps and a proposed scope." },
];

const teamSocials = [
  { key: "facebookUrl", label: "Facebook", platform: "facebook" },
  { key: "instagramUrl", label: "Instagram", platform: "instagram" },
  { key: "xUrl", label: "X", platform: "x" },
  { key: "profileUrl", label: "LinkedIn", platform: "linkedin" },
] as const;

function TeamSocialIcon({ platform }: { platform: (typeof teamSocials)[number]["platform"] }) {
  if (platform === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.5-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V10H7v3h2.9v8h3.5Z" /></svg>;
  if (platform === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2.5" className="fill-current" /><path className="fill-white" d="M7.3 10h2.5v7H7.3v-7Zm1.25-1a1.45 1.45 0 1 1 0-2.9 1.45 1.45 0 0 1 0 2.9ZM11 10h2.4v1h.04c.34-.64 1.16-1.3 2.39-1.3 2.55 0 3.02 1.68 3.02 3.86V17h-2.5v-3.05c0-.73-.02-1.67-1.02-1.67-1.02 0-1.18.8-1.18 1.62V17H11v-7Z" /></svg>;
  if (platform === "x") return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current"><path d="M18.9 3h2.9l-6.4 7.3L23 21h-5.8l-4.6-6.1L7.2 21H4.3l6.9-7.9L3.8 3h6l4.2 5.6L18.9 3Zm-1 16h1.6L9 4.9H7.3L17.9 19Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.7" cy="6.6" r="1" className="fill-current stroke-none" /></svg>;
}

export default async function AboutPage() {
  const [profile, teamResult, reviews] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { id: "main" } }).catch(() => null),
    prisma.teamCategory.findMany({ where: { active: true, members: { some: { active: true } } }, include: { members: { where: { active: true }, orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
      .then((categories) => ({ categories, unavailable: false }))
      .catch((error) => {
        console.warn("Unable to load About page team profiles; using the unavailable state.", error);
        return { categories: [], unavailable: true };
      }),
    prisma.customerReview.findMany({ where: { status: "APPROVED", published: true }, orderBy: [{ sortOrder: "asc" }, { submittedAt: "desc" }], select: { id: true, name: true, company: true, rating: true, content: true, submittedAt: true } }).catch(() => []),
  ]);
  const { categories, unavailable: teamUnavailable } = teamResult;
  const seenMembers = new Set<string>();
  const uniqueCategories = categories.map((category) => ({
    ...category,
    members: category.members.filter((member) => {
      const key = [member.firstName, member.lastName, member.designation].map((value) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase()).join("|");
      if (seenMembers.has(key)) return false;
      seenMembers.add(key);
      return true;
    }),
  })).filter((category) => category.members.length > 0);

  return (
    <main className="overflow-hidden bg-white text-story-navy dark:bg-background dark:text-foreground">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      {/* Hero */}
      <section className="relative isolate border-b border-border-soft bg-[linear-gradient(115deg,#fff_0%,#fff_64%,#f1f6ff_100%)] dark:bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
          <div className="w-full max-w-5xl">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-300">About Myloginn</p>
            <h1 className="mt-4 max-w-[22ch] text-4xl font-bold leading-[1.08] tracking-[-.04em] text-story-navy sm:text-5xl lg:text-[4.5rem] dark:text-foreground">We build digital solutions that move business forward.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{profile?.introduction || "We bring strategy, engineering and growth together to help businesses solve real problems with dependable technology."}</p>
          </div>
        </div>
      </section>

      {/* Team: portrait cards follow the reference layout and use admin-managed profiles. */}
      <section className="bg-[#f5f6f8] px-4 py-9 sm:px-6 sm:py-12 lg:px-8 dark:bg-surface-2" aria-labelledby="team-title">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mx-auto mb-6 max-w-2xl text-center sm:mb-8"><span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-brand-700 shadow-sm dark:border-brand-800 dark:bg-surface dark:text-brand-300"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> OUR TEAM <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /></span><h2 id="team-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"><span className="text-brand-600">Team</span> members</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Meet the people bringing thoughtful technology and practical ideas to every project.</p></header>
          {uniqueCategories.length ? <><div className="team-department-marquee" aria-label="Team departments moving continuously"><div className="team-department-track">{[0, 1].map((copy) => <div key={copy} className="team-department-set" aria-hidden={copy === 1} inert={copy === 1}><div className="team-department-groups">{uniqueCategories.map((category) => { const columns = Math.min(category.members.length, 4); const gridStyle = { "--team-columns": columns, "--team-tablet-columns": Math.min(columns, 2), width: `min(88vw, ${columns * 280 + (columns - 1) * 20}px)` } as CSSProperties; return <section key={category.id} style={gridStyle} className="team-department-group"><h3 className="mb-4 text-center text-sm font-bold tracking-wide text-story-navy dark:text-foreground">{category.name}</h3><div className="team-member-grid mx-auto gap-x-5 gap-y-6">{category.members.map((member) => <article key={member.id} className="team-member-card group overflow-hidden rounded-[1.35rem] border border-white bg-white p-2.5 shadow-[0_14px_34px_-28px_rgba(11,31,77,.42)] dark:border-border-soft dark:bg-surface">
              <div className="team-member-portrait relative aspect-[.9] overflow-visible rounded-[1.05rem] bg-[#edf1f7] dark:bg-surface-2">
                <div className="team-member-image-window absolute inset-0 overflow-hidden rounded-[1.05rem]">
                  {member.imageUrl ? <Image src={member.imageUrl} alt={`${member.firstName} ${member.lastName}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 44vw, 280px" className="team-member-photo rounded-[1.05rem] object-cover" /> : <div className="team-member-initials grid h-full place-items-center rounded-[1.05rem] text-5xl font-bold text-brand-500">{member.firstName[0]}{member.lastName[0]}</div>}
                  <div className="team-member-shade" aria-hidden="true" />
                </div>
                <div className="team-member-nameplate absolute inset-x-2 bottom-0 z-[2] translate-y-1/2 rounded-2xl bg-brand-600 px-3 py-3 text-center text-white shadow-[0_8px_18px_-10px_rgba(31,86,214,.8)]"><h4 className="truncate text-sm font-bold">{member.firstName} {member.lastName}</h4><p className="mt-0.5 truncate text-xs font-medium text-blue-100">{member.designation}</p></div>
              </div>
              <div className="relative z-[2] px-3 pb-4 pt-8">
                {member.biography.trim() && <p className="mb-3 line-clamp-3 text-center text-xs leading-5 text-muted">{member.biography}</p>}
                <div className="flex min-h-10 items-center justify-center gap-2">
                  {teamSocials.map(({ key, label, platform }) => {
                    const url = member[key];
                    const icon = <TeamSocialIcon platform={platform} />;
                    return url
                      ? <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={`${member.firstName} ${member.lastName} on ${label}`} className="team-member-social grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-soft bg-white text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:bg-surface">{icon}</a>
                      : <span key={key} aria-label={`${label} profile not provided`} title={`Add a ${label} URL in team member settings to enable this link`} className="team-member-social grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-soft bg-white text-muted opacity-40 dark:bg-surface">{icon}</span>;
                  })}
                </div>
              </div>
            </article>)}</div></section>})}</div></div>)}</div></div></> : <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-brand-200 bg-white/80 px-6 py-8 text-center dark:border-brand-800 dark:bg-surface"><p className="text-lg font-semibold">{teamUnavailable ? "Team profiles are temporarily unavailable." : "Our team profiles are coming soon."}</p><p className="mt-2 text-sm leading-6 text-muted">We’ll introduce our people here as they are added. For now, tell us what you’re working on and we’ll connect you with the right team.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Talk to our team <ArrowRight className="h-4 w-4" /></Link></div>}
        </div>
      </section>

      {/* Brand story */}
      <section className="border-y border-border-soft bg-[#f5f8ff] dark:bg-surface-2">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-7 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-12 lg:px-8">
          <div className="max-w-xl"><p className="text-xs font-bold tracking-[.16em] text-brand-700">OUR JOURNEY</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A technology partner, from first idea to what’s next.</h2><p className="mt-5 leading-7 text-muted">{profile?.approach || "Myloginn brings product development and digital growth under one roof. We work alongside clients to understand the problem, make the important decisions clear, and deliver useful solutions in focused stages."}</p><p className="mt-4 leading-7 text-muted">The work is collaborative by design: listen carefully, share progress early, and keep building toward outcomes people can use.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:gap-3 dark:text-brand-300">Talk with our team <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="relative min-h-[220px] overflow-hidden rounded-[1.75rem] bg-brand-100 sm:min-h-[340px]"><Image src="/about/team-collaboration.jpg" alt="A team collaborating around software and product work" fill sizes="(max-width: 1024px) 100vw, 620px" className="object-cover object-center" /></div>
        </div>
      </section>

      {/* Mission, vision and values */}
      <section id="our-vision" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold tracking-[.16em] text-brand-700">OUR VISION</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Build a better digital future.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">{profile?.vision || "We see a future where good technology helps more businesses create meaningful connections, solve real problems and grow with confidence."}</p></div>
        <div className="mt-10 grid divide-y divide-border-soft border-y border-border-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">{pillars.map(({ title, description, Icon }) => <article key={title} className="px-5 py-7 text-center sm:px-8 sm:py-9"><Icon className="mx-auto h-7 w-7 text-brand-600" strokeWidth={1.7} /><h3 className="mt-4 font-bold">{title}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">{description}</p></article>)}</div>
        <div className="mt-10 grid gap-4 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div><p className="text-xs font-bold tracking-[.16em] text-brand-700">OUR MISSION</p><h3 className="mt-3 text-2xl font-bold">Make technology useful.</h3><p className="mt-3 max-w-md leading-7 text-muted">{profile?.mission || "We help businesses move forward through thoughtful software, clear collaboration and technology that serves a real purpose."}</p></div><div className="grid gap-3 sm:grid-cols-2">{[[Lightbulb, "Curiosity", "Ask better questions before choosing a solution."], [ShieldCheck, "Integrity", "Be clear about decisions, progress and trade-offs."], [Users, "Partnership", "Work as a close extension of each client’s team."], [TrendingUp, "Impact", "Keep attention on the difference the work makes."]].map(([Icon, title, text]) => { const ValueIcon = Icon as LucideIcon; return <div key={title as string} className="flex gap-3 rounded-xl bg-[#f5f8ff] p-4 dark:bg-surface-2"><ValueIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><div><h4 className="text-sm font-bold">{title as string}</h4><p className="mt-1 text-xs leading-5 text-muted">{text as string}</p></div></div>; })}</div></div>
      </section>

      {/* Services and USP */}
      <section className="bg-[#f5f8ff] dark:bg-surface-2">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-8 max-w-2xl"><p className="text-left text-xs font-bold tracking-[.16em] text-brand-700">WHAT WE DO</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Solutions that move work forward.</h2><p className="mt-3 text-left leading-7 text-muted">From a first digital product to the next stage of growth, bring the right capabilities together.</p></div>
          <div className="grid gap-4 lg:grid-cols-[1.7fr_.8fr]">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{offerings.map((item) => <Link key={item.title} href={item.href} className="group rounded-xl border border-border-soft bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/60 dark:bg-surface dark:hover:bg-brand-900/20"><span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"><ContentIcon keyword={item.icon} className="h-6 w-6" /></span><h3 className="mt-4 font-bold">{item.title}</h3><p className="mt-2 text-left text-sm leading-6 text-muted">{item.text}</p><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 group-hover:gap-2.5 dark:text-brand-300">Explore service <ArrowRight className="h-3.5 w-3.5" /></span></Link>)}</div>
            <aside className="relative overflow-hidden rounded-2xl bg-[#1249a5] p-6 text-white sm:p-8"><span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/5" /><div className="relative"><p className="text-xs font-bold tracking-[.16em] text-blue-200">WHY MYLOGINN</p><h3 className="mt-3 text-2xl font-bold leading-tight">One team for the whole digital journey.</h3><p className="mt-3 text-left text-sm leading-6 text-blue-100">Strategy, engineering and growth work better when they share context and direction.</p><ul className="mt-6 space-y-4 text-left text-sm">{["Start with your goals and users", "Keep communication clear", "Build in visible, focused stages", "Connect product decisions to growth"].map((point) => <li key={point} className="flex gap-3"><span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/15"><span className="h-1.5 w-1.5 rounded-full bg-cyan-200" /></span><span>{point}</span></li>)}</ul><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-brand-800 transition-colors hover:bg-blue-50">Start a conversation <ArrowRight className="h-4 w-4" /></Link></div></aside>
          </div>
        </div>
      </section>

      {/* Social proof: only approved, published reviews are supplied. */}
      <section className="py-16 sm:py-24"><ReviewSection reviews={reviews.map((review) => ({ ...review, submittedAt: review.submittedAt.toISOString() }))} /></section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-[#1452b8] text-white"><span aria-hidden className="absolute -right-20 -top-32 h-[30rem] w-[30rem] rounded-full border-[70px] border-white/[.045]" /><span aria-hidden className="absolute -bottom-40 left-[15%] h-[24rem] w-[24rem] rounded-full border-[55px] border-white/[.04]" /><div className="relative mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-20"><Sparkles className="mx-auto h-7 w-7 text-cyan-200" /><p className="mt-4 text-xs font-bold tracking-[.16em] text-blue-100">LET’S BUILD SOMETHING USEFUL</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Ready to create impact together?</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">Tell us what you want to make possible. We’ll help shape a clear next step.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-brand-800 transition-colors hover:bg-blue-50">Start a project <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8"><h2 className="text-2xl font-bold">A few common questions</h2><FaqAccordion items={faqs} className="mt-6" /><p className="mt-5 text-sm text-muted">Have another question? <Link href="/contact" className="font-semibold text-brand-700">Talk to our team</Link> · <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-700">{CONTACT_EMAIL}</a></p></section>
    </main>
  );
}
