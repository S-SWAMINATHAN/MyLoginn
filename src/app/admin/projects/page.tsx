import { EntityScreen } from "@/components/admin/EntityScreen";
import { ClientPortfolioManager } from "@/components/admin/ClientPortfolioManager";

export const metadata = { title: "Projects — MyLoginn Admin" };

export default function AdminProjectsPage() {
  return (
    <div className="space-y-10">
      <ClientPortfolioManager />
      <section aria-label="Student project assignments">
        <EntityScreen entity="projects" />
      </section>
    </div>
  );
}
