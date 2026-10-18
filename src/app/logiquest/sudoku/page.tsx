import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { SudokuClient } from "@/components/logiquest/SudokuClient";

export const metadata = { title: "Sudoku Puzzles - Easy, Medium and Hard · LogiQuest", description: "Play free Sudoku puzzles online. Every puzzle has exactly one solution." };

export default function SudokuPage() {
  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Puzzles", href: "/logiquest/puzzles" }, { label: "Sudoku" }]} />
      <PageTitle title="Sudoku" sub="A fresh puzzle every game, at three levels. Use notes for candidates and Hint when you are stuck." />
      <div className="mt-6"><SudokuClient /></div>
    </Container>
  );
}
