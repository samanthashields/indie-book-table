import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Search, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHelpArticles, useHelpCategories, useReleaseNotes } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/help/")({
  component: HelpCenter,
  head: () => ({
    meta: [
      { title: "Help Center · Author’s Workshop" },
      { name: "description", content: "Guides for book cycles, templates and The Indie Author Table, plus what’s new and a way to reach support." },
      { property: "og:title", content: "Help Center · Author’s Workshop" },
      { property: "og:description", content: "Guides for book cycles, templates and The Indie Author Table, plus what’s new and a way to reach support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function HelpCenter() {
  const categories = useHelpCategories();
  const articles = useHelpArticles();
  const releases = useReleaseNotes();
  const [query, setQuery] = useState("");

  const published = useMemo(() => (articles.data ?? []).filter((article) => article.status === "published"), [articles.data]);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return published.filter((article) => `${article.title} ${article.summary ?? ""} ${article.body}`.toLowerCase().includes(needle)).slice(0, 8);
  }, [published, query]);

  const latest = (releases.data ?? []).filter((note) => note.status === "published").slice(0, 3);

  return (
    <AppShell>
      <PageHeading
        title="Help Center"
        description="Guides for every corner of the workshop, what’s new, and a way to reach us."
        action={
          <Button asChild>
            <Link to="/help/support"><LifeBuoy />Contact support</Link>
          </Button>
        }
      />

      <section className="mb-8 rounded-2xl border-2 border-sun/50 bg-sun/10 p-6">
        <label className="block text-sm font-semibold">Search the help articles</label>
        <div className="relative mt-2 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Try “milestone”, “template”, “The Table”…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        {query.trim() && (
          <ul className="mt-4 space-y-2">
            {matches.map((article) => (
              <li key={article.id}>
                <Link to="/help/articles/$slug" params={{ slug: article.slug }} className="block rounded-xl border border-border/70 bg-card px-4 py-3 hover:border-primary">
                  <p className="text-sm font-semibold">{article.title}</p>
                  {article.summary && <p className="text-xs text-muted-foreground">{article.summary}</p>}
                </Link>
              </li>
            ))}
            {matches.length === 0 && <li className="text-sm text-muted-foreground">Nothing matched that. Try another word, or message support.</li>}
          </ul>
        )}
      </section>

      {latest.length > 0 && (
        <section className="mb-8 rounded-2xl border-2 border-teal/40 bg-teal/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-serif text-2xl font-normal"><Sparkles className="size-5" />What’s new</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/help/releases">All release notes</Link></Button>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {latest.map((note) => (
              <li key={note.id} className="rounded-xl bg-card p-4 shadow-xs">
                <div className="flex items-center gap-2">
                  {note.label && <StatusPill tone="good">{note.label}</StatusPill>}
                  <span className="text-xs text-muted-foreground">{new Date(note.released_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{note.title}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-serif text-2xl font-normal">Browse by topic</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(categories.data ?? []).map((category) => {
            const count = published.filter((article) => article.category_id === category.id).length;
            return (
              <Link
                key={category.id}
                to="/help/categories/$categorySlug"
                params={{ categorySlug: category.slug }}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary"
              >
                <h3 className="font-serif text-xl font-normal">{category.name}</h3>
                {category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{count} {count === 1 ? "article" : "articles"}</p>
              </Link>
            );
          })}
          {categories.isLoading && <p className="text-sm text-muted-foreground">Loading topics…</p>}
        </div>
      </section>
    </AppShell>
  );
}
