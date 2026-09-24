import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} MyLoginn. All rights reserved.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          <Link href="/courses" className="transition-colors hover:text-foreground">Courses</Link>
          <Link href="/projects" className="transition-colors hover:text-foreground">Projects</Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
