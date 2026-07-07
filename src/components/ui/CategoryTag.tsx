import { ContentIcon } from "@/components/ui/ContentIcon";

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="group inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      <ContentIcon keyword={category} className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
      {category}
    </span>
  );
}
