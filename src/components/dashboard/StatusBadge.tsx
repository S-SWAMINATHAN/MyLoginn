const statusStyles: Record<string, string> = {
  active: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  in_progress: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  new: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  confirmed: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  student: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  submitted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  under_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  created: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  admin: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepted: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  mentor: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  failed: "bg-danger/10 text-danger",
  cancelled: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors duration-300 ${
        statusStyles[status] ?? "bg-surface-2 text-muted"
      }`}
    >
      {label}
    </span>
  );
}
