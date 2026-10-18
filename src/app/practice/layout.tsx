import { PracticeNav } from "@/components/practice/PracticeNav";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PracticeNav />
      {children}
    </>
  );
}
