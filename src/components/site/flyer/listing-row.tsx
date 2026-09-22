import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { PricePill, formatPrice } from "./price-pill";
import { CoverStickers } from "./sticker";
import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/**
 * A book-fair poster card: cover art with sticker badges on a floating panel,
 * title block and price pills underneath. `large` lays the card out sideways
 * so a grid can feature one book without a separate template.
 */
export function ListingRow({
  book,
  listingNumber,
  circled = false,
  onCircle,
  size = "standard",
}: {
  book: CatalogBook;
  listingNumber?: number | undefined;
  circled?: boolean;
  onCircle?: (entry: WishlistEntry) => void;
  size?: "standard" | "large";
}) {
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);
  const isItem = book.tags.includes("item");
  const large = size === "large";

  return (
    <article
      className={cn(
        "poster-panel relative h-full bg-card p-4 sm:p-5",
        large && "sm:grid sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-5",
      )}
    >
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
            <span className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-paper p-4 text-center font-heading text-lg text-cocoa/60">
              {book.title}
            </span>
          )}
        </Link>
        <CoverStickers tags={book.tags} />
        {onCircle && <CircleToggle book={book} circled={circled} onToggle={onCircle} />}
      </div>

      <div>
        <h3
          className={cn(
            "mt-3 font-heading font-bold leading-tight text-cocoa sm:mt-0",
            large ? "text-2xl" : "text-lg sm:mt-3",
          )}
        >
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

        {book.hook && (
          <p className={cn("mt-2 leading-snug text-cocoa/80", large ? "text-[0.95rem]" : "text-[0.82rem]")}>
            {book.hook}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {ebook && !isItem && <PricePill format="ebook" amount={ebook} />}
          {print && <PricePill format={isItem ? "item" : "print"} amount={print} />}
        </div>

        {book.purchase_links.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {(large ? book.purchase_links : book.purchase_links.slice(0, 2)).map((link) => (
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
      </div>
    </article>
  );
}
