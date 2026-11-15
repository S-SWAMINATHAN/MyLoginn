type PracticeFact = { label: string; value: string };

export function PracticeHero({
  eyebrow,
  title,
  description,
  facts,
}: {
  eyebrow: string;
  title: string;
  description: string;
  facts: PracticeFact[];
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#10264A] text-white">
      <span aria-hidden className="absolute left-0 top-0 h-1 w-32 bg-[#65D7C2] sm:w-48" />
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[34%] border-l border-white/10 bg-white/[0.025] lg:block" />
      <div className="relative grid min-w-0 gap-7 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center lg:gap-8 lg:px-12 lg:py-10">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#B9D2FF]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#65D7C2]" />
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,4rem)] font-bold leading-[1.06] tracking-tight">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
        <dl className="grid min-w-0 grid-cols-1 gap-2 min-[768px]:grid-cols-3 lg:grid-cols-1">
          {facts.map((fact) => (
            <div key={fact.label} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-3 sm:px-4 sm:py-3.5">
              <dt className="order-1 min-w-0 text-xs leading-5 text-blue-100/80 sm:text-sm">{fact.label}</dt>
              <dd className="order-2 shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
