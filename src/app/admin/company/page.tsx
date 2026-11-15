import { CompanyManager } from "@/components/admin/CompanyManager";

export const metadata = { title: "Team & Reviews — MyLoginn Admin", robots: { index: false, follow: false } };

export default function CompanyManagementPage() {
  return <CompanyManager />;
}
