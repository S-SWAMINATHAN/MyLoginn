import { GROUPS, subjectsInGroup } from "@/lib/logiquest/catalog";
import { LqNav } from "@/components/logiquest/LqNav";

export default function LogiQuestLayout({ children }: { children: React.ReactNode }) {
  const groups = GROUPS.map((g) => ({ slug: g.slug, title: g.title, nav: g.nav, desc: g.desc, icon: g.icon, subjects: subjectsInGroup(g.slug).map((s) => ({ slug: s.slug, title: s.title })) }));
  return (
    <>
      <LqNav groups={groups} />
      {children}
    </>
  );
}
