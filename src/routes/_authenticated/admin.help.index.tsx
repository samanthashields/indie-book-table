import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  slugify,
  useDeleteHelpArticle,
  useDeleteHelpCategory,
  useHelpArticles,
  useHelpCategories,
  useSaveHelpCategory,
} from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/admin/help/")({ component: AdminHelp });

function AdminHelp() {
  const categories = useHelpCategories();
  const articles = useHelpArticles();
  const saveCategory = useSaveHelpCategory();
  const deleteCategory = useDeleteHelpCategory();
  const deleteArticle = useDeleteHelpArticle();
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    saveCategory.mutate(
      { name, slug: slugify(name), description: null, position: (categories.data?.length ?? 0) + 1 },
      { onSuccess: () => { setNewCategory(""); toast.success("Topic added"); }, onError: () => toast.error("Couldn’t add that topic") },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-normal">Help articles</h2>
            <p className="text-sm text-muted-foreground">Everything in the author-facing Help Center.</p>
          </div>
          <Button asChild><Link to="/admin/help/$articleId" params={{ articleId: "new" }}><Plus />New article</Link></Button>
        </div>

        <ul className="space-y-2">
          {articles.isLoading && <li className="text-sm text-muted-foreground">Loading articles…</li>}
          {(articles.data ?? []).map((article) => {
            const category = (categories.data ?? []).find((entry) => entry.id === article.category_id);
            return (
              <li key={article.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
                <span className="min-w-0 flex-1 text-sm font-semibold">{article.title}</span>
                {category && <span className="text-xs text-muted-foreground">{category.name}</span>}
                <StatusPill tone={article.status === "published" ? "good" : "warm"}>{article.status === "published" ? "Published" : "Draft"}</StatusPill>
                <Button size="sm" variant="outline" asChild><Link to="/admin/help/$articleId" params={{ articleId: article.id }}>Edit</Link></Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${article.title}`}
                  onClick={() => deleteArticle.mutate(article.id, { onSuccess: () => toast.success("Article deleted") })}
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
          {!articles.isLoading && (articles.data ?? []).length === 0 && (
            <li className="rounded-xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No articles yet. Write the first one.</li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <h2 className="font-heading text-xl font-normal">Topics</h2>
        <ul className="mt-3 space-y-2">
          {(categories.data ?? []).map((category) => (
            <li key={category.id} className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2">
              <span className="min-w-0 flex-1 text-sm font-semibold">{category.name}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${category.name}`}
                onClick={() => deleteCategory.mutate(category.id, { onSuccess: () => toast.success("Topic deleted") })}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Input placeholder="New topic" aria-label="New topic" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} />
          <Button variant="secondary" onClick={addCategory}><Plus /></Button>
        </div>
      </section>
    </div>
  );
}
