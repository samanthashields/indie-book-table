import { FLYER_TAGS, FORMAT_LEGEND, tagSpec } from "@/lib/flyer-tags";

/** Small tag chips printed next to a listing title. */
export function TagChips({ tags, className = "" }: { tags: string[]; className?: string }) {
  const specs = tags.map(tagSpec).filter((spec) => spec !== null);
  if (specs.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 align-middle ${className}`}>
      {specs.map((spec) => (
        <span
          key={spec.value}
          title={spec.label}
          className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none ${spec.chip}`}
        >
          <span aria-hidden="true">{spec.icon}</span>
          <span className="sr-only">{spec.label}</span>
        </span>
      ))}
    </span>
  );
}

/** The "what do these icons mean" card printed on the flyer cover. */
export function IconLegend() {
  const entries = [
    ...FORMAT_LEGEND.map((entry) => ({ key: entry.label, ...entry })),
    ...FLYER_TAGS.map((tag) => ({ key: tag.value, label: tag.label, icon: tag.icon, chip: tag.chip })),
  ];

  return (
    <section
      aria-label="Icon legend"
      className="mx-auto max-w-3xl rounded-2xl border-2 border-ink bg-card px-5 py-4"
    >
      <h2 className="text-center text-[0.85rem] font-bold uppercase tracking-[0.08em] text-foreground sm:text-base">
        Let&rsquo;s go treasure hunting!
      </h2>
      <p className="mt-1 text-center text-[0.68rem] text-muted-foreground">
        Tap the ring on any cover to circle a book — your list collects at the bottom of the page.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 lg:grid-cols-9">
        {entries.map((entry) => (
          <li key={entry.key} className="flex flex-col items-center gap-1 text-center">
            <span
              aria-hidden="true"
              className={`inline-flex size-8 items-center justify-center rounded-md border-2 border-ink text-[0.95rem] leading-none ${entry.chip}`}
            >
              {entry.icon}
            </span>
            <span className="text-[0.62rem] font-semibold leading-[1.15] text-muted-foreground">
              {entry.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
