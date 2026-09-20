import { Link, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { MarkdownText } from "@/components/markdown-text";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { useHelpArticles, useHelpCategories } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/help/articles/$slug")({
  component: HelpArticlePage,
  head: () => ({
    meta: [
      { title: "Help article · Author’s Workshop" },
      { name: "description", content: "A step-by-step help article for writing, running and launching your book cycle." },
      { property: "og:title", content: "Help article · Author’s Workshop" },
      { property: "og:description", content: "A step-by-step help article for writing, running and launching your book cycle." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function HelpArticlePage() {
  const { slug } = Route.useParams();
  const articles = useHelpArticles();
  const categories = useHelpCategories();

  const article = (articles.data ?? []).find((entry) => entry.slug === slug);
  if (articles.isLoading) return <AppShell><p className="text-sm text-muted-foreground">Loading article…</p></AppShell>;
  if (!article) return <AppShell><p className="text-sm text-muted-foreground">That article is no longer available.</p></AppShell>;

  const category = (categories.data ?? []).find((entry) => entry.id === article.category_id);
  const related = (articles.data ?? []).filter((entry) => article.related_ids.includes(entry.id) && entry.status === "published");

  return (
    <AppShell>
      <PageHeading title={article.title} {...(article.summary ? { description: article.summary } : {})} backLabel="Help Center" />
      {category && (
        <p className="-mt-4 mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/help/categories/$categorySlug" params={{ categorySlug: category.slug }} className="hover:text-foreground">{category.name}</Link>
        </p>
      )}

      <article className="max-w-3xl rounded-2xl border border-border bg-card p-7 shadow-xs">
        <MarkdownText body={article.body} />
      </article>

      {related.length > 0 && (
        <section className="mt-6 max-w-3xl rounded-2xl border-2 border-sage/50 bg-sage/10 p-6">
          <h2 className="font-serif text-xl font-normal">Related articles</h2>
          <ul className="mt-3 space-y-2">
            {related.map((entry) => (
              <li key={entry.id}>
                <Link to="/help/articles/$slug" params={{ slug: entry.slug }} className="block rounded-xl bg-card px-4 py-3 text-sm font-semibold shadow-xs hover:text-link">{entry.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-paper p-6 text-center">
        <p className="text-sm text-muted-foreground">Still stuck?</p>
        <Button className="mt-3" asChild><Link to="/help/support">Message support</Link></Button>
      </div>
    </AppShell>
  );
}
