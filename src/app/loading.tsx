export default function Loading() {
  return (
    <div
      className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center justify-center px-5"
      role="status"
      aria-live="polite"
    >
      <span className="h-1 w-24 overflow-hidden rounded-full bg-brand-100">
        <span className="block h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
      </span>
      <span className="sr-only">Loading page</span>
    </div>
  );
}