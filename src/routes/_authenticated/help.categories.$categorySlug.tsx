import { Link, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { useHelpArticles, useHelpCategories } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/help/categories/$categorySlug")({
  component: HelpCategoryPage,
  head: () => ({
    meta: [
      { title: "Help topic · Author’s Workshop" },
      { name: "description", content: "Every help article in this topic of the Author’s Workshop Help Center." },
      { property: "og:title", content: "Help topic · Author’s Workshop" },
      { property: "og:description", content: "Every help article in this topic of the Author’s Workshop Help Center." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function HelpCategoryPage() {
  const { categorySlug } = Route.useParams();
  const categories = useHelpCategories();
  const articles = useHelpArticles();

  const category = (categories.data ?? []).find((entry) => entry.slug === categorySlug);
  const list = (articles.data ?? []).filter((article) => article.status === "published" && article.category_id === category?.id);

  if (categories.isLoading) return <AppShell><p className="text-sm text-muted-foreground">Loading topic…</p></AppShell>;
  if (!category) return <AppShell><p className="text-sm text-muted-foreground">That topic no longer exists.</p></AppShell>;

  return (
    <AppShell>
      <PageHeading title={category.name} description={category.description ?? undefined} backLabel="Help Center" />
      <ul className="max-w-3xl space-y-3">
        {list.map((article) => (
          <li key={article.id}>
            <Link to="/help/articles/$slug" params={{ slug: article.slug }} className="block rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary">
              <p className="font-serif text-xl font-normal">{article.title}</p>
              {article.summary && <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p>}
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No articles here yet.</li>}
      </ul>
    </AppShell>
  );
}
