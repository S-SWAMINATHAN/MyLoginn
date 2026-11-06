import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { SudokuClient } from "@/components/logiquest/SudokuClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sudoku Puzzles - Easy, Medium and Hard",
  absoluteTitle: true,
  description: "Play free Sudoku puzzles online at easy, medium and hard difficulty levels.",
  path: "/logiquest/sudoku",
  keywords: ["online Sudoku", "easy Sudoku", "hard Sudoku", "Sudoku puzzle"],
});

export default function SudokuPage() {
  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "LogiQuest", href: "/logiquest" }, { label: "Sudoku" }]} />
      <PageTitle title="Sudoku" sub="A fresh puzzle every game, at three levels. Use notes for candidates and Hint when you are stuck." />
      <div className="mt-6"><SudokuClient /></div>
    </Container>
  );
}
