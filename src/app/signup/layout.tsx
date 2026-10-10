import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

// Signed-in visitors have no reason to see this page, so send them to their home.
export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return children;
}
