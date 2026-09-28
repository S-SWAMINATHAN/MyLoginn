import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course checkout",
  robots: { index: false, follow: false },
};

export default function CourseCheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
