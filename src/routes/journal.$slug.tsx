import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { MarkdownText } from "@/components/markdown-text";
import { PublicShell } from "@/components/site/public-shell";
import { getJournalPost } from "@/lib/catalog.functions";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["journal", "post", slug],
    queryFn: () => getJournalPost({ data: { slug } }),
  });

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data.post) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return { meta: [{ title: "Post unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const post = loaderData.post;
    const title = `${post.title} — The Journal`;
    const description = post.excerpt ?? `${post.title}, from The Indie Book Table journal.`;
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
      <h1 className="font-heading text-3xl">That post isn't here</h1>
      <Link to="/journal" className="mt-4 inline-block underline">
        Back to the Journal
      </Link>
    </PublicShell>
  ),
  component: JournalPostPage,
});

function JournalPostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post!;
  

  return (
    <PublicShell>
      <article className="mx-auto max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link to="/journal" className="hover:text-foreground">
            Journal
          </Link>
        </nav>
        <h1 className="mt-4 font-heading text-4xl leading-tight">{post.title}</h1>
        {post.published_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <MarkdownText body={post.body} className="mt-8 text-lg leading-relaxed text-foreground/85" />
      </article>
    </PublicShell>
  );
}
