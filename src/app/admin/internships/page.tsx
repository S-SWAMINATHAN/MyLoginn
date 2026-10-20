import { redirect } from "next/navigation";

/** Internships are written and managed as structured postings in Careers. */
export default function AdminInternshipsPage() {
  redirect("/admin/careers?tab=internships");
}
