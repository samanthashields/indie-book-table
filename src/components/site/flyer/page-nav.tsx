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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        className="panel-outline-thin inline-flex items-center gap-2 bg-card px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-cocoa transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cocoa">
          Page {index + 1} of {total}
        </p>
        <div className="flex max-w-[16rem] flex-wrap items-center justify-center gap-1.5 sm:max-w-none">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to page ${i + 1}: ${label}`}
              aria-current={i === index ? "page" : undefined}
              className={`h-3 w-3 border-2 border-cocoa transition-colors ${
                i === index ? "bg-clay" : "bg-card hover:bg-amber"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={index === total - 1}
        className="panel-outline-thin inline-flex items-center gap-2 bg-card px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-cocoa transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/** Dog-eared paper corner in the bottom-right of the page: tap to turn. */
export function CornerTurn({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      aria-label="Turn to the next page"
      className="group absolute bottom-0 right-0 h-20 w-20 disabled:pointer-events-none disabled:opacity-0"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-full w-full bg-gradient-to-tl from-amber to-card [clip-path:polygon(100%_35%,100%_100%,35%_100%)] transition-transform duration-300 group-hover:scale-110"
      />
      <span className="absolute bottom-2 right-2 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-cocoa">
        Turn
      </span>
    </button>
  );
}
