import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { PricePill, formatPrice } from "./price-pill";
import { TagChips } from "./tag-chips";

/**
 * A dense flyer listing: small cover on the left, title / author / hook and
 * price pills stacked to the right. Tapping the cover opens the book page.
 */
export function ListingRow({
  book,
  listingNumber,
}: {
  book: CatalogBook;
  listingNumber?: number | undefined;
}) {
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);
  const isItem = book.tags.includes("item");

  return (
    <article className="flex items-start gap-3">
      <Link
        to="/table/books/$bookId"
        params={{ bookId: book.id }}
        aria-label={`View ${book.title} by ${book.author_name}`}
        className="group relative block w-[5.5rem] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa sm:w-[6.5rem]"
      >
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={`Cover of ${book.title} by ${book.author_name}`}
            loading="lazy"
            width={672}
            height={992}
            className="aspect-[2/3] w-full border-2 border-cocoa object-cover shadow-[3px_3px_0_0_var(--cocoa)] transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        ) : (
          <span className="flex aspect-[2/3] w-full items-center justify-center border-2 border-dashed border-cocoa/50 bg-paper p-2 text-center text-[0.6rem] font-bold uppercase tracking-[0.08em] text-cocoa/60">
            {book.title}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="text-[0.82rem] font-bold uppercase leading-[1.12] text-cocoa">
          {typeof listingNumber === "number" && (
            <span className="mr-1 text-cocoa/55">{listingNumber}.</span>
          )}
          <Link to="/table/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
            {book.title}
          </Link>{" "}
          <TagChips tags={book.tags} className="ml-1" />
        </h3>
        <p className="mt-0.5 text-[0.76rem] font-bold text-cocoa/80">
          by{" "}
          <Link
            to="/table/authors/$authorId"
            params={{ authorId: book.author_id }}
            className="hover:underline"
          >
            {book.author_name}
          </Link>
        </p>
        {book.hook && <p className="mt-1 text-[0.78rem] leading-[1.25] text-cocoa/75">{book.hook}</p>}

        <div className="mt-1.5 flex flex-col items-start gap-1">
          {ebook && !isItem && <PricePill format="ebook" amount={ebook} />}
          {print && <PricePill format={isItem ? "item" : "print"} amount={print} />}
        </div>

        {book.purchase_links.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {book.purchase_links.slice(0, 2).map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-cocoa underline decoration-2 underline-offset-2"
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
