import { FLYER_TAGS, FORMAT_LEGEND, tagSpec } from "@/lib/flyer-tags";

/** Small icon chips printed next to a listing title. */
export function TagChips({ tags, className = "" }: { tags: string[]; className?: string }) {
  const specs = tags.map(tagSpec).filter((spec) => spec !== null);
  if (specs.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 align-middle ${className}`}>
      {specs.map((spec) => (
        <span
          key={spec.value}
          title={spec.label}
          className={`inline-flex size-5 items-center justify-center rounded-full border-2 border-cocoa text-[0.6rem] leading-none ${spec.chip}`}
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
      className="panel-outline mx-auto max-w-3xl rounded-[2rem] bg-card px-5 py-4"
    >
      <h2 className="text-center text-[0.85rem] font-bold uppercase tracking-[0.08em] text-cocoa sm:text-base">
        Let&rsquo;s go treasure hunting!
      </h2>
      <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 lg:grid-cols-9">
        {entries.map((entry) => (
          <li key={entry.key} className="flex flex-col items-center gap-1 text-center">
            <span
              aria-hidden="true"
              className={`inline-flex size-8 items-center justify-center rounded-full border-2 border-cocoa text-[0.95rem] leading-none ${entry.chip}`}
            >
              {entry.icon}
            </span>
            <span className="text-[0.62rem] font-semibold leading-[1.15] text-cocoa/85">
              {entry.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
