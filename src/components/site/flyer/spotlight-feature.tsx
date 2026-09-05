import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { categoryRibbonColor, panelClass } from "@/lib/flyer-theme";
import { PricePill, formatPrice } from "./price-pill";
import { TagChips } from "./tag-chips";
import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";

/** Full-page spotlight: the issue's featured book, set like a fair poster. */
export function SpotlightFeature({
  book,
  category,
  circled = false,
  onCircle,
}: {
  book: CatalogBook;
  category: string;
  circled?: boolean;
  onCircle?: (entry: WishlistEntry) => void;
}) {
  const panel = panelClass(categoryRibbonColor(category));
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);

  return (
    <div className="mx-auto mt-6 max-w-4xl">
      <div className="relative">
        <span aria-hidden="true" className="banner-wide absolute inset-x-0 top-[4px] block h-full bg-cocoa" />
        <div className={`banner-wide relative flex items-center justify-center py-2.5 ${panel}`}>
          <span className="px-8 text-[0.8rem] font-bold uppercase tracking-[0.22em] sm:text-base">
            Spotlight pick
          </span>
        </div>
      </div>

      <div className="panel-outline paper-grain relative mt-10 grid items-start gap-8 bg-card p-5 sm:grid-cols-[minmax(0,16rem)_1fr] sm:p-7">
        <span
          aria-hidden="true"
          className="absolute -right-5 -top-8 rotate-[9deg] rounded-full border-[3px] border-cocoa bg-amber px-4 py-3 text-center text-[0.6rem] font-bold uppercase leading-tight tracking-[0.1em] text-cocoa shadow-[3px_3px_0_0_var(--cocoa)]"
        >
          Don&rsquo;t
          <br />
          miss!
        </span>

        <div className="relative w-full rotate-[-2deg]">
        <Link
          to="/table/books/$bookId"
          params={{ bookId: book.id }}
          className="group relative block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa"
        >
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={`Cover of ${book.title} by ${book.author_name}`}
              loading="lazy"
              width={672}
              height={992}
              className="aspect-[2/3] w-full border-[3px] border-cocoa object-cover transition-transform duration-300 group-hover:-translate-y-1"
            />
          ) : (
            <span className="flex aspect-[2/3] w-full items-center justify-center border-[3px] border-dashed border-cocoa/50 bg-paper p-4 text-center font-serif text-xl text-cocoa/70">
              {book.title}
            </span>
          )}
        </Link>
        {onCircle && <CircleToggle book={book} circled={circled} onToggle={onCircle} />}
        </div>

        <div>
          <h3 className="font-serif text-3xl leading-tight text-cocoa sm:text-4xl">
            <Link to="/table/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-bold text-cocoa/80">
            by{" "}
            <Link
              to="/table/authors/$authorId"
              params={{ authorId: book.author_id }}
              className="hover:underline"
            >
              {book.author_name}
            </Link>
          </p>
          <TagChips tags={book.tags} className="mt-2" />

          <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-cocoa/85">
            {book.spotlight_blurb ?? book.hook}
          </p>

          <div className="mt-4 flex flex-col items-start gap-1.5">
            {ebook && <PricePill format="ebook" amount={ebook} />}
            {print && <PricePill format="print" amount={print} />}
          </div>

          {book.purchase_links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {book.purchase_links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="panel-outline-thin inline-block bg-amber px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-cocoa"
                  >
                    {link.platform_label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
