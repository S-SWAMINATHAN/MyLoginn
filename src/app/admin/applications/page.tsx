import { EntityScreen } from "@/components/admin/EntityScreen";

export const metadata = { title: "Applications — MyLoginn Admin" };

export default function AdminApplicationsPage() {
  return <EntityScreen entity="applications" />;
}
