import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { CatalogCoverArt } from "@/components/site/catalog-book-card";
import { getCatalogBook } from "@/lib/catalog.functions";
import { AUDIENCE_LABELS, TAG_LABELS } from "@/lib/catalog-types";

const bookQuery = (bookId: string) =>
  queryOptions({
    queryKey: ["catalog", "book", bookId],
    queryFn: () => getCatalogBook({ data: { bookId } }),
  });

export const Route = createFileRoute("/table/books/$bookId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(bookQuery(params.bookId));
    if (!data.book) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.book) {
      return { meta: [{ title: "Book unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const book = loaderData.book;
    const title = `${book.title} by ${book.author_name} — The Table`;
    const description = book.hook ?? `${book.title}, an independent book on The Table.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "book" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <h1 className="font-heading text-3xl">We couldn't find that book</h1>
      <Link to="/table" className="mt-4 inline-block underline">
        Back to The Table
      </Link>
    </PublicShell>
  ),
  component: BookPage,
});

function BookPage() {
  const { bookId } = Route.useParams();
  const { data } = useSuspenseQuery(bookQuery(bookId));
  const book = data.book!;

  const credits = [
    ["Editing", book.editors],
    ["Illustration", book.illustrators],
    ["Cover design", book.cover_designer],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <PublicShell>
      <nav className="text-sm text-muted-foreground">
        <Link to="/table" className="hover:text-foreground">
          The Table
        </Link>
        <span className="px-2">/</span>
        <span>{book.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-[240px_1fr]">
        <div>
          <CatalogCoverArt book={book} />
        </div>
        <div>
          <h1 className="font-heading text-4xl leading-tight">{book.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            by{" "}
            <Link to="/table/authors/$authorId" params={{ authorId: book.author_id }} className="hover:underline">
              {book.author_name}
            </Link>
          </p>
          <p className="mt-3 text-sm font-semibold text-text-inkblue">
            {book.genre ?? "Indie"} · {AUDIENCE_LABELS[book.target_audience] ?? book.target_audience}
            {book.explicit_content ? " · Mature content" : ""}
          </p>

          {book.hook && <p className="mt-6 font-heading text-2xl leading-relaxed">{book.hook}</p>}

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {book.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-secondary px-3 py-1 font-semibold">
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {book.ebook_price != null && (
              <span className="rounded-md bg-leaf/25 px-4 py-2 text-sm font-semibold text-cocoa">
                eBook ${book.ebook_price.toFixed(2)}
              </span>
            )}
            {book.print_price != null && (
              <span className="rounded-md bg-teal/25 px-4 py-2 text-sm font-semibold text-cocoa">
                Print ${book.print_price.toFixed(2)}
              </span>
            )}
          </div>

          {book.purchase_links.length > 0 && (
            <div className="mt-8">
              <h2 className="font-heading text-xl">Where to buy</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {book.purchase_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-md bg-inverse px-4 py-2 text-sm font-semibold text-on-inverse transition-colors hover:bg-inverse/90"
                  >
                    {link.platform_label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {credits.length > 0 && (
            <div className="mt-8 rounded-2xl bg-secondary/60 p-5">
              <h2 className="font-heading text-xl">Made with</h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                {credits.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {book.awards_reviews_text && (
            <p className="mt-8 border-l-4 border-amber pl-4 text-muted-foreground italic">
              {book.awards_reviews_text}
            </p>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
