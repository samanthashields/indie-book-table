import { useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/site/public-shell";
import { CatalogBookCard } from "@/components/site/catalog-book-card";
import { WishlistBar } from "@/components/site/wishlist-bar";
import { SubscribeGateModal } from "@/components/site/subscribe-gate-modal";
import { useWishlist, useWishlistGate, type WishlistEntry } from "@/lib/wishlist";
import { getIssueCatalog, getIssuePreview } from "@/lib/catalog.functions";

const issueCatalogQuery = (issueId: string) =>
  queryOptions({
    queryKey: ["catalog", "issue", issueId],
    queryFn: () => getIssueCatalog({ data: { issueId } }),
  });

const issuePreviewQuery = (issueId: string) =>
  queryOptions({
    queryKey: ["catalog", "issue-preview", issueId],
    queryFn: () => getIssuePreview({ data: { issueId } }),
  });

export const Route = createFileRoute("/table/$issueId")({
  validateSearch: (search: Record<string, unknown>): { preview?: boolean } =>
    search["preview"] === "1" || search["preview"] === true ? { preview: true } : {},
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ context, params, deps }) => {
    if (deps.preview) return null;
    const data = await context.queryClient.ensureQueryData(issueCatalogQuery(params.issueId));
    if (!data.issue) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.issue) {
      return { meta: [{ title: "Issue unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const label = loaderData.issue.display_label;
    const title = `${label} issue — The Table`;
    const description = `Flip through the ${label} issue of The Table: curated indie books, hooks, prices and where to buy them.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <h1 className="font-serif text-3xl">No such issue</h1>
      <p className="mt-3 text-muted-foreground">This issue isn't published — or never existed.</p>
      <Link to="/table" className="mt-4 inline-block underline">
        Browse published issues
      </Link>
    </PublicShell>
  ),
  component: IssuePage,
});

function IssuePage() {
  const { entries, toggle, clear, isCircled } = useWishlist();
  const { unlocked, unlock } = useWishlistGate();
  const [gateOpen, setGateOpen] = useState(false);
  const pendingCircle = useRef<WishlistEntry | null>(null);

  const handleCircle = (entry: WishlistEntry) => {
    if (!unlocked) {
      pendingCircle.current = entry;
      setGateOpen(true);
      return;
    }
    toggle(entry);
  };

  const { issueId } = Route.useParams();
  const { preview } = Route.useSearch();
  const { data } = useSuspenseQuery(preview ? issuePreviewQuery(issueId) : issueCatalogQuery(issueId));
  const issue = data.issue;

  return (
    <PublicShell>
      <nav className="text-sm text-muted-foreground">
        <Link to="/table" className="hover:text-foreground">
          The Table
        </Link>
        <span className="px-2">/</span>
        <span>{issue?.display_label}</span>
      </nav>

      <header className="mt-4 rounded-3xl border border-border/70 bg-amber/15 p-8 md:p-10">
        <p className="text-sm font-semibold text-inkblue">Issue</p>
        <h1 className="mt-2 font-serif text-4xl">{issue?.cover_headline ?? issue?.display_label}</h1>
        {issue?.cover_tagline && (
          <p className="mt-3 max-w-2xl text-lg text-cocoa/80">{issue.cover_tagline}</p>
        )}
        {issue && (
          <Button asChild className="mt-5">
            <Link to="/table/$issueId/flyer" params={{ issueId: issue.id }}>
              Read the flyer <span aria-hidden="true">→</span>
            </Link>
          </Button>
        )}
      </header>

      {data.categories.map((category) => (
        <section key={category.category} className="mt-10">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-2xl">{category.category}</h2>
            <span className="text-sm text-muted-foreground">{category.books.length} books</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {category.books.map((book) => (
              <CatalogBookCard
                key={book.id}
                book={book}
                circled={isCircled(book.id)}
                onCircle={handleCircle}
              />
            ))}
          </div>
        </section>
      ))}
      <WishlistBar entries={entries} onClear={clear} />

      <SubscribeGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        onSubscribed={() => {
          unlock();
          setGateOpen(false);
          if (pendingCircle.current) {
            toggle(pendingCircle.current);
            pendingCircle.current = null;
          }
        }}
      />
    </PublicShell>
  );
}
