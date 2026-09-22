import { Link } from "@tanstack/react-router";

import { CircleToggle } from "@/components/site/circle-toggle";
import type { WishlistEntry } from "@/lib/wishlist";
import { AUDIENCE_LABELS, TAG_LABELS, type CatalogBook } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

const tagTone: Record<string, string> = {
  award_winner: "bg-amber/25 text-cocoa",
  school_themed: "bg-leaf/25 text-cocoa",
  hidden_gem: "bg-teal/25 text-cocoa",
  needs_love: "bg-clay/25 text-cocoa",
  spicy: "bg-destructive/15 text-destructive",
  preorder: "bg-inkblue/15 text-text-inkblue",
  item: "bg-secondary text-foreground",
};

export function CatalogCoverArt({ book, className }: { book: CatalogBook; className?: string }) {
  if (book.cover_image_url?.startsWith("http")) {
    return (
      <img
        src={book.cover_image_url}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        className={cn("aspect-[2/3] w-full rounded-xl object-cover shadow-sm", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid aspect-[2/3] w-full place-items-center overflow-hidden hyphens-auto break-words rounded-xl bg-teal/15 p-2 text-center font-heading text-sm leading-tight text-cocoa shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      {book.title}
    </span>
  );
}

export function CatalogBookCard({
  book,
  circled = false,
  onCircle,
}: {
  book: CatalogBook;
  circled?: boolean;
  onCircle?: (entry: WishlistEntry) => void;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-md",
        book.is_spotlight && "border-amber bg-amber/10",
      )}
    >
      <div className="flex gap-4">
        <div className="relative w-24 shrink-0">
          <Link
            to="/table/books/$bookId"
            params={{ bookId: book.id }}
            className="block"
            aria-label={`Open ${book.title}`}
          >
            <CatalogCoverArt book={book} />
          </Link>
          {onCircle && <CircleToggle book={book} circled={circled} onToggle={onCircle} />}
        </div>
        <div className="min-w-0">
          {book.is_spotlight && (
            <span className="mb-1 inline-block rounded-md bg-amber px-2 py-0.5 text-[11px] font-semibold text-ink">
              Spotlight
            </span>
          )}
          <h3 className="font-heading text-lg leading-tight">
            <Link to="/table/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            by{" "}
            <Link
              to="/table/authors/$authorId"
              params={{ authorId: book.author_id }}
              className="hover:underline"
            >
              {book.author_name}
            </Link>
          </p>
          <p className="mt-2 text-sm font-semibold text-text-inkblue">
            {book.genre ?? "Indie"} · {AUDIENCE_LABELS[book.target_audience] ?? book.target_audience}
          </p>
        </div>
      </div>

      {book.hook && <p className="text-sm leading-relaxed text-foreground/80">{book.hook}</p>}

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
        {book.tags.map((tag) => (
          <span
            key={tag}
            className={cn("rounded-md px-2 py-1 font-semibold", tagTone[tag] ?? "bg-secondary text-foreground")}
          >
            {TAG_LABELS[tag] ?? tag}
          </span>
        ))}
        {book.ebook_price != null && (
          <span className="rounded-md bg-leaf/25 px-2 py-1 font-semibold text-cocoa">
            eBook ${book.ebook_price.toFixed(2)}
          </span>
        )}
        {book.print_price != null && (
          <span className="rounded-md bg-teal/25 px-2 py-1 font-semibold text-cocoa">
            Print ${book.print_price.toFixed(2)}
          </span>
        )}
      </div>
    </article>
  );
}
