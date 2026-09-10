import { Link } from "@tanstack/react-router";

import type { CatalogBook } from "@/lib/catalog-types";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Featured-author page: a round portrait (photo upload arrives with the admin
 * builder — until then a warm initial badge), a short bio, and the author's
 * books in this issue.
 */
export function AuthorBlock({
  authorId,
  authorName,
  bio,
  books,
  photoUrl,
}: {
  authorId: string;
  authorName: string;
  bio: string | null;
  books: CatalogBook[];
  photoUrl?: string | null;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="poster-slant rounded-2xl bg-cocoa px-6 py-4 text-center">
        <p className="poster-unslant font-serif text-2xl font-black uppercase tracking-[0.12em] text-paper sm:text-4xl">
          Meet the author
        </p>
      </div>

      <section className="poster-panel mt-10 bg-card p-6 text-center sm:p-10">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Portrait of ${authorName}`}
            loading="lazy"
            className="mx-auto size-24 rounded-full border-[3px] border-cocoa object-cover shadow-[3px_4px_0_0_var(--cocoa)]"
          />
        ) : (
        <span
          aria-hidden="true"
          className="mx-auto grid size-24 place-items-center rounded-full border-[3px] border-cocoa bg-amber font-serif text-3xl font-black text-cocoa shadow-[3px_4px_0_0_var(--cocoa)]"
        >
          {initialsOf(authorName)}
        </span>
        )}
        <h3 className="mt-4 font-serif text-3xl font-black text-cocoa sm:text-4xl">
          <Link to="/table/authors/$authorId" params={{ authorId }} className="hover:underline">
            {authorName}
          </Link>
        </h3>

        {bio && <p className="mx-auto mt-4 max-w-prose text-[0.95rem] leading-relaxed text-cocoa/85">{bio}</p>}

        <p className="mt-6 text-[0.62rem] font-black uppercase tracking-[0.28em] text-cocoa/60">
          In this issue
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-center gap-5">
          {books.map((book) => (
            <Link
              key={book.id}
              to="/table/books/$bookId"
              params={{ bookId: book.id }}
              className="group w-24 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa sm:w-28"
            >
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                  width={224}
                  height={336}
                  className="aspect-[2/3] w-full rounded-lg object-cover shadow-[0_10px_22px_-12px_var(--cocoa)] transition-transform duration-300 group-hover:-translate-y-1"
                />
              ) : (
                <span className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-paper p-2 text-center font-serif text-[0.72rem] text-cocoa/60">
                  {book.title}
                </span>
              )}
              <span className="mt-1.5 block text-[0.72rem] font-semibold leading-tight text-cocoa group-hover:underline">
                {book.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
