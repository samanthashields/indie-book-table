import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/site/public-shell";
import { CatalogBookCard } from "@/components/site/catalog-book-card";
import { getCurrentIssue, listPublishedIssues } from "@/lib/catalog.functions";
import issuesHero from "@/assets/issues-hero.jpg";
import issuesArchive from "@/assets/issues-archive.jpg";

const currentIssueQuery = queryOptions({
  queryKey: ["catalog", "current-issue"],
  queryFn: () => getCurrentIssue(),
});

const issuesQuery = queryOptions({
  queryKey: ["catalog", "issues"],
  queryFn: () => listPublishedIssues(),
});

export const Route = createFileRoute("/issues/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(currentIssueQuery),
      context.queryClient.ensureQueryData(issuesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Issues — The Table" },
      {
        name: "description",
        content:
          "Every issue of The Table: independent books chosen by our editors, with hooks, prices and where to buy them.",
      },
      { property: "og:title", content: "Issues — The Table" },
      {
        property: "og:description",
        content: "Read the current issue and browse the archive of past issues of The Table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IssuesPage,
});

function IssuesPage() {
  const { data: current } = useSuspenseQuery(currentIssueQuery);
  const { data: archive } = useSuspenseQuery(issuesQuery);

  const spotlight = current.categories
    .flatMap((category) => category.books)
    .find((book) => book.is_spotlight);

  return (
    <PublicShell>
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-paper">
        <div className="grid items-stretch gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-12">
            <p className="text-sm font-semibold text-text-inkblue">
              {current.issue ? current.issue.display_label : "Coming soon"}
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl">The issues</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Every month we lay out a new issue of independent titles — read the flyer, meet the
              authors, buy the book.
            </p>
            {current.issue && (
              <Button asChild size="lg" className="mt-6">
                <Link to="/table/$issueId" params={{ issueId: current.issue.id }}>
                  Read the {current.issue.display_label} issue
                </Link>
              </Button>
            )}
          </div>
          <img
            src={issuesHero}
            alt="A cosy reading nook stacked with independently published paperbacks"
            width={1600}
            height={900}
            className="h-56 w-full object-cover md:h-full"
          />
        </div>
      </section>

      {spotlight && (
        <section className="mt-10">
          <h2 className="font-heading text-2xl">This month's spotlight</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <CatalogBookCard book={spotlight} />
            {spotlight.spotlight_blurb && (
              <p className="self-center rounded-2xl border border-border bg-card p-6 font-heading text-xl leading-relaxed text-foreground">
                “{spotlight.spotlight_blurb}”
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mt-12">
        <img
          src={issuesArchive}
          alt="A wooden crate holding past issues of The Table"
          loading="lazy"
          width={1200}
          height={600}
          className="h-40 w-full rounded-3xl object-cover md:h-52"
        />
        <h2 className="mt-8 font-heading text-2xl">All issues</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {archive.issues.map((issue) => (
            <li key={issue.id}>
              <Link
                to="/table/$issueId"
                params={{ issueId: issue.id }}
                className="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-shadow hover:shadow-md"
              >
                <span className="font-heading text-xl">{issue.display_label}</span>
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
