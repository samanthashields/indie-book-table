import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import type { WishlistEntry } from "@/lib/wishlist";
import { PricePill, formatPrice } from "../price-pill";
import { CoverStickers } from "../sticker";
import { CircleToggle } from "@/components/site/circle-toggle";

/**
 * Several books by one author, fanned out like a hand of cards with a shared
 * heading, instead of repeating identical cards in a grid.
 */
export function FanOutBlock({
  authorId,
  authorName,
  books,
  heading,
  isCircled,
  onCircle,
}: {
  authorId: string;
  authorName: string;
  heading?: string | null;
  books: CatalogBook[];
  isCircled: (bookId: string) => boolean;
  onCircle?: (entry: WishlistEntry) => void;
}) {
  return (
    <section className="poster-panel mt-6 bg-card p-6 sm:p-9">
      <p className="text-center text-[0.62rem] font-black uppercase tracking-[0.3em] text-cocoa/60">
        {heading || "More from one author"}
      </p>
      <h3 className="mt-1 text-center font-serif text-2xl font-black text-cocoa sm:text-3xl">
        <Link to="/table/authors/$authorId" params={{ authorId }} className="hover:underline">
          {authorName}
        </Link>
      </h3>

      <div className="mt-8 flex flex-wrap items-start justify-center gap-y-6">
        {books.map((book, index) => {
          const rotation = (index - (books.length - 1) / 2) * 6;
          return (
            <div
              key={book.id}
              className="relative -ml-5 first:ml-0"
              style={{ transform: `rotate(${rotation.toFixed(1)}deg)` }}
            >
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
                    width={320}
                    height={480}
                    className="aspect-[2/3] w-32 rounded-xl object-cover shadow-[0_16px_34px_-16px_var(--cocoa)] transition-transform duration-300 group-hover:-translate-y-1.5 sm:w-40"
                  />
                ) : (
                  <span className="flex aspect-[2/3] w-32 items-center justify-center rounded-xl bg-paper p-3 text-center font-serif text-sm text-cocoa/60 sm:w-40">
                    {book.title}
                  </span>
                )}
              </Link>
              <CoverStickers tags={book.tags} max={1} />
              {onCircle && <CircleToggle book={book} circled={isCircled(book.id)} onToggle={onCircle} />}
            </div>
          );
        })}
      </div>

      <ul className="mx-auto mt-8 max-w-xl space-y-2">
        {books.map((book) => {
          const ebook = formatPrice(book.ebook_price);
          const print = formatPrice(book.print_price);
          return (
            <li
              key={book.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-cocoa/25 pb-2"
            >
              <span>
                <Link
                  to="/table/books/$bookId"
                  params={{ bookId: book.id }}
                  className="font-serif text-base font-bold text-cocoa hover:underline"
                >
                  {book.title}
                </Link>
                {book.hook && <span className="block text-[0.8rem] text-cocoa/75">{book.hook}</span>}
              </span>
              <span className="flex items-center gap-3">
                {ebook && <PricePill format="ebook" amount={ebook} />}
                {print && <PricePill format="print" amount={print} />}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
