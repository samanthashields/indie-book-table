import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { CatalogBookCard } from "@/components/site/catalog-book-card";
import { getAuthorShelf } from "@/lib/catalog.functions";

const shelfQuery = (authorId: string) =>
  queryOptions({
    queryKey: ["catalog", "author", authorId],
    queryFn: () => getAuthorShelf({ data: { authorId } }),
  });

export const Route = createFileRoute("/table/authors/$authorId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(shelfQuery(params.authorId));
    if (!data.shelf) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.shelf) {
      return { meta: [{ title: "Author unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const name = loaderData.shelf.author.name;
    const title = `${name} — The Table`;
    const description = `Books by ${name} featured on The Table.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <h1 className="font-heading text-3xl">We couldn't find that author</h1>
      <Link to="/table" className="mt-4 inline-block underline">
        Back to The Table
      </Link>
    </PublicShell>
  ),
  component: AuthorPage,
});

function AuthorPage() {
  const { authorId } = Route.useParams();
  const { data } = useSuspenseQuery(shelfQuery(authorId));
  const shelf = data.shelf!;

  return (
    <PublicShell>
      <nav className="text-sm text-muted-foreground">
        <Link to="/table" className="hover:text-foreground">
          The Table
        </Link>
        <span className="px-2">/</span>
        <span>{shelf.author.name}</span>
      </nav>

      <header className="mt-4 rounded-3xl border border-border/70 bg-teal/12 p-8">
        <h1 className="font-heading text-4xl">{shelf.author.name}</h1>
        {shelf.author.bio && <p className="mt-3 max-w-2xl text-muted-foreground">{shelf.author.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          {shelf.author.website && (
            <a
              href={shelf.author.website}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-card px-4 py-2 hover:bg-secondary"
            >
              Website
            </a>
          )}
          {shelf.author.instagram_handle && (
            <span className="rounded-full bg-card px-4 py-2">{shelf.author.instagram_handle}</span>
          )}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">On the table</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {shelf.books.map((book) => (
            <CatalogBookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
