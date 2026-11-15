import { PracticeNav } from "@/components/practice/PracticeNav";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1800px]">
      <PracticeNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
