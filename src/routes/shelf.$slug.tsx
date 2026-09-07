import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { getTableShare } from "@/lib/table-share.functions";

export const Route = createFileRoute("/shelf/$slug")({
  loader: async ({ params }) => {
    const share = await getTableShare({ data: { slug: params.slug } });
    if (!share) throw notFound();
    return { share, imageUrl: `/api/public/shelf-image/${params.slug}` };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.share.authorName ?? "An author";
    const title = `${name}'s writing table — The Indie Book Table`;
    const description = `${name} has ${loaderData?.share.bookCount ?? 0} published books on their writing table.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <PublicShell>
      <p className="py-20 text-center text-sm text-muted-foreground">That table couldn’t be loaded.</p>
    </PublicShell>
  ),
  notFoundComponent: () => (
    <PublicShell>
      <p className="py-20 text-center text-sm text-muted-foreground">This table link isn’t available any more.</p>
    </PublicShell>
  ),
  component: SharedShelf,
});

function SharedShelf() {
  const { share, imageUrl } = Route.useLoaderData();
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-serif text-4xl font-normal">{share.authorName ?? "An author"}’s writing table</h1>
        <p className="mt-2 text-sm text-muted-foreground">{share.bookCount} published {share.bookCount === 1 ? "book" : "books"}.</p>
        <img src={imageUrl} alt={`${share.authorName ?? "An author"}'s writing table with their published books`} width={1200} height={630} className="mt-6 w-full rounded-2xl border border-border shadow-sm" />
        <div className="mt-8">
          <Button asChild><Link to="/table">Visit The Indie Book Table</Link></Button>
        </div>
      </div>
    </PublicShell>
  );
}
