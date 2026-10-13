import { getCurrentUser } from "@/lib/auth";
import { AdminHome } from "@/components/admin/AdminHome";

export const metadata = { title: "Dashboard — MyLoginn Admin" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  return <AdminHome name={user?.name ?? "Admin"} />;
}
