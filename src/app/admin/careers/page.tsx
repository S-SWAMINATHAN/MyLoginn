import { AdminCareers, type CareersTab } from "@/components/admin/careers/AdminCareers";

export const metadata = { title: "Careers — MyLoginn Admin" };

const TABS: CareersTab[] = ["openings", "internships", "applications"];

export default async function AdminCareersPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  const initialTab = TABS.find((t) => t === tab) ?? "openings";
  return <AdminCareers initialTab={initialTab} />;
}
