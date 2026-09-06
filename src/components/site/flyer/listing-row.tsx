import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { PricePill, formatPrice } from "./price-pill";
import { TagChips } from "./tag-chips";
import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";

/**
 * A book-fair poster card: big cover art on a floating white panel with a
 * numbered badge, title block and price pills underneath.
 */
export function ListingRow({
  book,
  listingNumber,
  circled = false,
  onCircle,
}: {
  book: CatalogBook;
  listingNumber?: number | undefined;
  circled?: boolean;
  onCircle?: (entry: WishlistEntry) => void;
}) {
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);
  const isItem = book.tags.includes("item");

  return (
    <article className="poster-panel relative bg-card p-4 sm:p-5">
      {typeof listingNumber === "number" && (
        <span className="absolute -left-2 -top-3 z-10 flex size-9 items-center justify-center rounded-full bg-cocoa text-[0.85rem] font-black text-paper shadow-[0_6px_14px_-6px_var(--cocoa)]">
          {listingNumber}
        </span>
      )}

      <div className="relative">
        <Link
          to="/table/books/$bookId"
          params={{ bookId: book.id }}
          aria-label={`View ${book.title} by ${book.author_name}`}
          className="group relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa"
        >
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={`Cover of ${book.title} by ${book.author_name}`}
              loading="lazy"
              width={672}
              height={992}
              className="aspect-[2/3] w-full rounded-xl object-cover shadow-[0_14px_30px_-16px_var(--cocoa)] transition-transform duration-300 group-hover:-translate-y-1"
            />
          ) : (
            <span className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-paper p-4 text-center font-serif text-lg text-cocoa/60">
              {book.title}
            </span>
          )}
        </Link>
        {onCircle && <CircleToggle book={book} circled={circled} onToggle={onCircle} />}
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold leading-tight text-cocoa">
        <Link to="/table/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
          {book.title}
        </Link>
      </h3>
      <p className="mt-0.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-cocoa/70">
        <Link
          to="/table/authors/$authorId"
          params={{ authorId: book.author_id }}
          className="hover:underline"
        >
          {book.author_name}
        </Link>
      </p>
      <TagChips tags={book.tags} className="mt-1.5" />

      {book.hook && <p className="mt-2 text-[0.82rem] leading-snug text-cocoa/80">{book.hook}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {ebook && !isItem && <PricePill format="ebook" amount={ebook} />}
        {print && <PricePill format={isItem ? "item" : "print"} amount={print} />}
      </div>

      {book.purchase_links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {book.purchase_links.slice(0, 2).map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block rounded-full bg-amber px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-cocoa"
              >
                {link.platform_label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
