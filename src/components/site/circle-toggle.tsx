import type { CatalogBook } from "@/lib/catalog-types";
import { toWishlistEntry } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/**
 * The hand-drawn ring readers put around a book while browsing. Place inside a
 * `relative` wrapper around the cover: it draws the ring over the cover and
 * puts a small pencil button at the corner.
 */
export function CircleToggle({
  book,
  circled,
  onToggle,
  className,
}: {
  book: CatalogBook;
  circled: boolean;
  onToggle: (entry: ReturnType<typeof toWishlistEntry>) => void;
  className?: string;
}) {
  return (
    <>
      {circled && (
        <span aria-hidden="true" className="pointer-events-none absolute -inset-2 z-10">
          <svg viewBox="0 0 100 150" preserveAspectRatio="none" className="size-full">
            <ellipse
              cx="50"
              cy="75"
              rx="46"
              ry="70"
              fill="none"
              stroke="var(--clay)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="150 8 220 10"
              transform="rotate(-3 50 75)"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>
      )}
      <button
        type="button"
        aria-pressed={circled}
        aria-label={circled ? `Remove ${book.title} from your list` : `Circle ${book.title}`}
        onClick={() => onToggle(toWishlistEntry(book))}
        className={cn(
          "absolute -bottom-2 -right-2 z-20 grid size-8 place-items-center rounded-full border-2 border-cocoa text-[0.85rem] leading-none shadow-[2px_2px_0_0_var(--cocoa)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa",
          circled ? "bg-clay text-card" : "bg-card text-cocoa",
          className,
        )}
      >
        {circled ? "✓" : "○"}
      </button>
    </>
  );
}
