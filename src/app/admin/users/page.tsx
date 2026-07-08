import { EntityScreen } from "@/components/admin/EntityScreen";

export const metadata = { title: "Users — MyLoginn Admin" };

export default function AdminUsersPage() {
  return <EntityScreen entity="users" />;
}
