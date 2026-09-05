import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { getSiteCopy, listJournalPosts } from "@/lib/catalog.functions";

const postsQuery = queryOptions({
  queryKey: ["journal", "posts"],
  queryFn: () => listJournalPosts(),
});

const copyQuery = queryOptions({
  queryKey: ["catalog", "site-copy"],
  queryFn: () => getSiteCopy(),
});

export const Route = createFileRoute("/journal/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(postsQuery),
      context.queryClient.ensureQueryData(copyQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "The Journal — notes on indie publishing" },
      {
        name: "description",
        content: "Craft, curation and publishing notes from the editors behind The Table.",
      },
      { property: "og:title", content: "The Journal — notes on indie publishing" },
      {
        property: "og:description",
        content: "Craft, curation and publishing notes from the editors behind The Table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalIndex,
});

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function JournalIndex() {
  const { data } = useSuspenseQuery(postsQuery);
  const { data: siteCopy } = useSuspenseQuery(copyQuery);
  const copy = siteCopy.copy;

  return (
    <PublicShell>
      <header className="rounded-3xl border border-border/70 bg-leaf/15 p-8 md:p-12">
        <h1 className="font-serif text-4xl md:text-5xl">{copy["journal.hero.title"] ?? "The Journal"}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {copy["journal.hero.subtitle"] ?? "Notes on publishing, craft and the books on our table."}
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {data.posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-md">
            <p className="text-sm font-semibold text-inkblue">
              {formatDate(post.published_at)}
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-tight">
              <Link to="/journal/$slug" params={{ slug: post.slug }} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            {post.excerpt && <p className="mt-3 text-muted-foreground">{post.excerpt}</p>}
            <Link
              to="/journal/$slug"
              params={{ slug: post.slug }}
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Read the post
            </Link>
          </article>
        ))}
        {data.posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
            No posts published yet.
          </p>
        )}
      </div>
    </PublicShell>
  );
}
