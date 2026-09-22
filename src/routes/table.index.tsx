import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/site/public-shell";
import { getCurrentIssue, getSiteCopy } from "@/lib/catalog.functions";
import { siteCopyValue } from "@/lib/site-copy";

const currentIssueQuery = queryOptions({
  queryKey: ["catalog", "current-issue"],
  queryFn: () => getCurrentIssue(),
});

const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

export const Route = createFileRoute("/table/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(currentIssueQuery),
      context.queryClient.ensureQueryData(copyQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "The Table — a shared table for indie books" },
      {
        name: "description",
        content:
          "The Table is where independent authors and readers meet: a monthly issue of hand-picked indie books, and an open invitation to bring your own.",
      },
      { property: "og:title", content: "The Table — a shared table for indie books" },
      {
        property: "og:description",
        content: "Hand-picked indie books every month, and an open invitation to bring your own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TableHomePage,
});

function TableHomePage() {
  const { data: current } = useSuspenseQuery(currentIssueQuery);
  const { data: siteCopy } = useSuspenseQuery(copyQuery);
  const copy = siteCopy.copy ?? {};
  const value = (key: string) => siteCopyValue(copy, key);

  const strip = [
    value("table.home.strip.image1"),
    value("table.home.strip.image2"),
    value("table.home.strip.image3"),
  ].filter(Boolean);

  const steps = [
    value("table.home.steps.1"),
    value("table.home.steps.2"),
    value("table.home.steps.3"),
  ].filter(Boolean);

  return (
    <PublicShell>
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-paper">
        <div className="grid items-center gap-0 md:grid-cols-[1.05fr_1fr]">
          <div className="p-8 md:p-12">
            <span className="inline-flex rounded-full bg-amber/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cocoa">
              The Indie Author Table
            </span>
            <h1 className="mt-4 font-heading text-4xl leading-tight md:text-5xl">
              {value("table.home.hero.title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{value("table.home.hero.subtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {current.issue ? (
                <Button asChild size="lg">
                  <Link to="/table/$issueId" params={{ issueId: current.issue.id }}>
                    {value("table.home.hero.cta")}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link to="/issues">Browse the issues</Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link to="/issues">All issues</Link>
              </Button>
            </div>
          </div>
          <img
            src={value("table.home.hero.image")}
            alt="Books laid out on a long wooden table"
            width={1600}
            height={900}
            className="h-full max-h-[420px] w-full object-cover"
          />
        </div>
      </section>

      {strip.length > 0 && (
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {strip.map((src, index) => (
            <img
              key={src + index}
              src={src}
              alt=""
              width={800}
              height={800}
              loading="lazy"
              className="aspect-square w-full rounded-2xl border border-border/60 object-cover"
            />
          ))}
        </section>
      )}

      <section className="mt-12 grid items-center gap-8 rounded-3xl border border-border/70 bg-sage/15 p-8 md:grid-cols-[1fr_320px] md:p-12">
        <div>
          <h2 className="font-heading text-3xl">{value("table.home.welcome.title")}</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/85">
            {value("table.home.welcome.body")}
          </p>
          <Link to="/mission" className="mt-4 inline-block font-semibold underline">
            Read our mission
          </Link>
        </div>
        <img
          src={value("table.home.welcome.image")}
          alt=""
          width={800}
          height={800}
          loading="lazy"
          className="aspect-square w-full rounded-2xl object-cover"
        />
      </section>

      {steps.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs"
              >
                <span className="grid size-9 place-items-center rounded-full bg-teal/25 font-heading text-lg text-cocoa">
                  {index + 1}
                </span>
                <p className="mt-3 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-amber/15 p-8">
          <h2 className="font-heading text-3xl">{value("table.home.submit.title")}</h2>
          <p className="mt-3 text-lg leading-relaxed text-foreground/85">
            {value("table.home.submit.body")}
          </p>
          <Button asChild className="mt-5">
            <Link to="/submissions">Submit a book</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-8">
          <p className="text-sm font-semibold text-text-inkblue">
            {current.issue ? current.issue.display_label : "Next issue"}
          </p>
          <h2 className="mt-2 font-heading text-3xl">
            {current.issue ? "This month's issue is out" : "The first issue is on its way"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {current.issue
              ? "Flip through it like a magazine — covers, hooks, prices and where to buy."
              : "Subscribe or check back soon to read the first line-up."}
          </p>
          <Button asChild variant="secondary" className="mt-5">
            <Link to="/issues">Go to the issues</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
