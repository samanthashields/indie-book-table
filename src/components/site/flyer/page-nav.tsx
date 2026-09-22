export function PageNav({
  index,
  total,
  onPrev,
  onNext,
  onJump,
  labels,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  labels: string[];
}) {
  return (
    <div className="sticky bottom-3 z-30 mt-6 flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-card px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-card"
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <div className="flex min-w-0 flex-col items-center gap-1.5">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-foreground sm:text-[0.65rem] sm:tracking-[0.2em]">
          <span className="hidden sm:inline">Page </span>
          {index + 1} of {total}
        </p>
        <div className="flex max-w-[10rem] flex-wrap items-center justify-center gap-1.5 sm:max-w-none">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to page ${i + 1}: ${label}`}
              aria-current={i === index ? "page" : undefined}
              className={`h-2.5 w-2.5 rounded-sm border-2 border-ink transition-colors ${
                i === index ? "bg-primary" : "bg-card hover:bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={index === total - 1}
        className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-card px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-card"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/** Corner control in the bottom-right of the page: tap to turn. */
export function CornerTurn({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      aria-label="Turn to the next page"
      className="group absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border-2 border-ink bg-amber px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink transition-transform disabled:pointer-events-none disabled:opacity-0"
    >
      Turn
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );
}
