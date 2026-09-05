import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { CatalogBookCard } from "@/components/site/catalog-book-card";
import { getCurrentIssue, getSiteCopy, listPublishedIssues } from "@/lib/catalog.functions";

const currentIssueQuery = queryOptions({
  queryKey: ["catalog", "current-issue"],
  queryFn: () => getCurrentIssue(),
});

const issuesQuery = queryOptions({
  queryKey: ["catalog", "issues"],
  queryFn: () => listPublishedIssues(),
});

const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

export const Route = createFileRoute("/table/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(currentIssueQuery),
      context.queryClient.ensureQueryData(issuesQuery),
      context.queryClient.ensureQueryData(copyQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "The Table — indie books worth your shelf" },
      {
        name: "description",
        content:
          "A new issue every month: independent books chosen by our editors, with hooks, prices and where to buy them.",
      },
      { property: "og:title", content: "The Table — indie books worth your shelf" },
      {
        property: "og:description",
        content: "A monthly issue of independent books chosen by the Book Cycles editors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TablePage,
});

function TablePage() {
  const { data: current } = useSuspenseQuery(currentIssueQuery);
  const { data: archive } = useSuspenseQuery(issuesQuery);
  const { data: siteCopy } = useSuspenseQuery(copyQuery);
  const copy = siteCopy.copy;

  const spotlight = current.categories.flatMap((category) => category.books).find((book) => book.is_spotlight);

  return (
    <PublicShell>
      <section className="rounded-3xl border border-border/70 bg-paper p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-inkblue">
          {current.issue ? current.issue.display_label : "Coming soon"}
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
          {copy["table.hero.title"] ?? "A table set for indie books"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {copy["table.hero.subtitle"] ??
            "Every month we lay out a new issue of independent titles — read the flyer, meet the authors, buy the book."}
        </p>
        {current.issue && (
          <Link
            to="/table/$issueId"
            params={{ issueId: current.issue.id }}
            className="mt-6 inline-flex items-center rounded-full bg-cocoa px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-cocoa/90"
          >
            Read the {current.issue.display_label} issue
          </Link>
        )}
      </section>

      {spotlight && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">This month's spotlight</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <CatalogBookCard book={spotlight} />
            {spotlight.spotlight_blurb && (
              <p className="self-center rounded-2xl bg-amber/15 p-6 font-serif text-xl leading-relaxed text-cocoa">
                “{spotlight.spotlight_blurb}”
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Issues</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {archive.issues.map((issue) => (
            <li key={issue.id}>
              <Link
                to="/table/$issueId"
                params={{ issueId: issue.id }}
                className="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-shadow hover:shadow-md"
              >
                <span className="font-serif text-xl">{issue.display_label}</span>
                <span className="mt-2 text-sm text-muted-foreground">{issue.book_count} books</span>
              </Link>
            </li>
          ))}
          {archive.issues.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
              No issues published yet.
            </li>
          )}
        </ul>
      </section>
    </PublicShell>
  );
}
