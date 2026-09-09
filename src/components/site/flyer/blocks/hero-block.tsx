import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { PricePill, formatPrice } from "../price-pill";
import { TagChips } from "../tag-chips";
import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";

/** Full-page spotlight: the issue's featured book, set like a fair poster. */
export function HeroBlock({
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
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="poster-slant rounded-2xl bg-cocoa px-6 py-4 text-center">
        <p className="poster-unslant font-serif text-2xl font-black uppercase tracking-[0.12em] text-paper sm:text-4xl">
          Spotlight pick
        </p>
        <p className="poster-unslant mt-1 text-[0.6rem] font-black uppercase tracking-[0.3em] text-paper/70">
          {category}
        </p>
      </div>

      <div className="poster-panel relative mt-10 grid items-center gap-8 bg-card p-6 sm:grid-cols-[minmax(0,18rem)_1fr] sm:p-9">
        <span
          aria-hidden="true"
          className="starburst absolute -right-4 -top-8 flex size-24 rotate-[8deg] items-center justify-center bg-amber text-center text-[0.6rem] font-black uppercase leading-tight tracking-[0.08em] text-cocoa"
        >
          Don&rsquo;t
          <br />
          miss!
        </span>

        <div className="relative">
          <Link
            to="/table/books/$bookId"
            params={{ bookId: book.id }}
            className="group relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa"
          >
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={`Cover of ${book.title} by ${book.author_name}`}
                loading="lazy"
                width={672}
                height={992}
                className="aspect-[2/3] w-full rounded-2xl object-cover shadow-[0_24px_50px_-22px_var(--cocoa)] transition-transform duration-300 group-hover:-translate-y-1"
              />
            ) : (
              <span className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl bg-paper p-4 text-center font-serif text-xl text-cocoa/70">
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
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-cocoa/75">
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

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {ebook && <PricePill format="ebook" amount={ebook} />}
            {print && <PricePill format="print" amount={print} />}
          </div>

          {book.purchase_links.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {book.purchase_links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-block rounded-full bg-cocoa px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-paper"
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
