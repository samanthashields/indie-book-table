import type { CatalogBook } from "@/lib/catalog-types";
import type { WishlistEntry } from "@/lib/wishlist";
import { cn } from "@/lib/utils";
import { ListingRow } from "../listing-row";

/**
 * A section's books as a catalog grid. With three or more books the first
 * card runs large so the page stops looking like an even spreadsheet of
 * covers.
 */
export function GridBlock({
  books,
  listingNumbers,
  isCircled,
  onCircle,
  featuredBookId,
  compact = false,
}: {
  books: CatalogBook[];
  listingNumbers: Map<string, number>;
  isCircled: (bookId: string) => boolean;
  onCircle: (entry: WishlistEntry) => void;
  doodleSeed?: number;
  featuredBookId?: string | null;
  compact?: boolean;
}) {
  const chosen = featuredBookId ? books.findIndex((book) => book.id === featuredBookId) : -1;
  const featuredIndex = compact ? -1 : chosen >= 0 ? chosen : books.length >= 3 ? 0 : -1;

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book, index) => (
        <div key={book.id} className={cn(index === featuredIndex && "sm:col-span-2")}>
          <ListingRow
            book={book}
            size={index === featuredIndex ? "large" : "standard"}
            listingNumber={listingNumbers.get(book.id)}
            circled={isCircled(book.id)}
            onCircle={onCircle}
          />
        </div>
      ))}
    </div>
  );
}
