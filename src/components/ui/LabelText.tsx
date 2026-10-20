/** Field label text: a trailing "*" is drawn in the danger colour so required fields stand out. */
export function LabelText({ children }: { children: string }) {
  const m = /^(.*?)\s*\*$/.exec(children);
  if (!m) return <>{children}</>;
  return (
    <span>
      {m[1]} <span aria-hidden className="font-bold text-danger">*</span>
      <span className="sr-only">(required)</span>
    </span>
  );
}
