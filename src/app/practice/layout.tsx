import { PracticeNav } from "@/components/practice/PracticeNav";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full min-w-0 max-w-[1800px] flex-col lg:flex-row">
      <PracticeNav />
      <main className="min-w-0 w-full flex-1">{children}</main>
    </div>
  );
}
