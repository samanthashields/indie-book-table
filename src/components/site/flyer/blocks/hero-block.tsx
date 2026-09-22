import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";
import { PricePill, formatPrice } from "../price-pill";
import { TagChips } from "../tag-chips";
import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";

/** Full-page spotlight: the issue's featured book, set like a catalog page. */
export function HeroBlock({
  book,
  category,
  hook,
  circled = false,
  onCircle,
}: {
  book: CatalogBook;
  category: string;
  hook?: string | null;
  circled?: boolean;
  onCircle?: (entry: WishlistEntry) => void;
}) {
  const ebook = formatPrice(book.ebook_price);
  const print = formatPrice(book.print_price);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border-2 border-ink bg-ink px-6 py-4 text-center">
        <p className="font-heading text-2xl font-black uppercase tracking-[0.12em] text-on-ink sm:text-4xl">
          Spotlight pick
        </p>
        <p className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.3em] text-on-ink/70">{category}</p>
      </div>

      <div className="relative mt-6 grid items-center gap-6 rounded-2xl border-2 border-ink bg-card p-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:p-7">
        <span
          aria-hidden="true"
          className="absolute -right-4 -top-6 flex -rotate-6 items-center rounded-md border-2 border-ink bg-amber px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.08em] text-ink"
        >
          Don&rsquo;t miss!
        </span>

        <div className="relative">
          <Link
            to="/table/books/$bookId"
            params={{ bookId: book.id }}
            className="group relative block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={`Cover of ${book.title} by ${book.author_name}`}
                loading="lazy"
                width={672}
                height={992}
                className="mx-auto aspect-[2/3] max-h-[38vh] w-full rounded-xl border-2 border-ink object-cover transition-transform duration-300 group-hover:-translate-y-1 sm:max-h-[42vh] sm:w-auto"
              />
            ) : (
              <span className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border-2 border-ink bg-amber-soft p-4 text-center font-heading text-xl text-ink/70">
                {book.title}
              </span>
            )}
          </Link>
          {onCircle && <CircleToggle book={book} circled={circled} onToggle={onCircle} />}
        </div>

        <div>
          <h3 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            <Link to="/table/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Link
              to="/table/authors/$authorId"
              params={{ authorId: book.author_id }}
              className="hover:underline"
            >
              {book.author_name}
            </Link>
          </p>
          <TagChips tags={book.tags} className="mt-2" />

          <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-foreground/85">
            {hook || book.spotlight_blurb || book.hook}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
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
                    className="inline-block rounded-md bg-ink px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-card"
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
