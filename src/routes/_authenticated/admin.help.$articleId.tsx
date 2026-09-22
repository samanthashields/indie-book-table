import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownText } from "@/components/markdown-text";
import { BackButton } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify, useHelpArticles, useHelpCategories, useSaveHelpArticle } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/admin/help/$articleId")({ component: HelpArticleEditor });

type Draft = { title: string; slug: string; summary: string; category_id: string; body: string; related_ids: string[] };

const empty: Draft = { title: "", slug: "", summary: "", category_id: "", body: "", related_ids: [] };

function HelpArticleEditor() {
  const { articleId } = Route.useParams();
  const isNew = articleId === "new";
  const navigate = useNavigate();
  const articles = useHelpArticles();
  const categories = useHelpCategories();
  const save = useSaveHelpArticle();
  const [draft, setDraft] = useState<Draft>(empty);
  const [loaded, setLoaded] = useState(isNew);

  const existing = (articles.data ?? []).find((entry) => entry.id === articleId);

  useEffect(() => {
    if (!loaded && existing) {
      setDraft({
        title: existing.title,
        slug: existing.slug,
        summary: existing.summary ?? "",
        category_id: existing.category_id ?? "",
        body: existing.body,
        related_ids: existing.related_ids,
      });
      setLoaded(true);
    }
  }, [existing, loaded]);

  const commit = (status: "draft" | "published") => {
    const title = draft.title.trim();
    if (!title || !draft.body.trim()) {
      toast.error("An article needs a title and some words");
      return;
    }
    save.mutate(
      {
        ...(isNew ? {} : { id: articleId }),
        title,
        slug: draft.slug.trim() || slugify(title),
        summary: draft.summary.trim() || null,
        category_id: draft.category_id || null,
        body: draft.body,
        related_ids: draft.related_ids,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      },
      {
        onSuccess: () => { toast.success(status === "published" ? "Article published" : "Draft saved"); void navigate({ to: "/admin/help" }); },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn’t save that article"),
      },
    );
  };

  const toggleRelated = (id: string) =>
    setDraft((current) => ({
      ...current,
      related_ids: current.related_ids.includes(id) ? current.related_ids.filter((entry) => entry !== id) : [...current.related_ids, id],
    }));

  if (!isNew && articles.isLoading) return <p className="text-sm text-muted-foreground">Loading article…</p>;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton label="All articles" className="-ml-2 text-muted-foreground" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={save.isPending} onClick={() => commit("draft")}>Save draft</Button>
          <Button disabled={save.isPending} onClick={() => commit("published")}>Publish</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-2xl font-normal">{isNew ? "New help article" : "Edit article"}</h2>
          <Input placeholder="Title" aria-label="Article title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: draft.slug || slugify(event.target.value) })} />
          <Input placeholder="web-address-slug" aria-label="Article slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
          <Textarea rows={2} placeholder="One-line summary" aria-label="Article summary" value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} />
          <label className="block text-sm font-semibold">
            Topic
            <select
              className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
              value={draft.category_id}
              onChange={(event) => setDraft({ ...draft, category_id: event.target.value })}
            >
              <option value="">No topic</option>
              {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>

          <MarkdownEditor value={draft.body} onChange={(body) => setDraft({ ...draft, body })} placeholder="Write the article…" label="Article body" />

          <div className="rounded-xl border border-border/70 bg-paper p-4">
            <p className="text-sm font-semibold">Related articles</p>
            <ul className="mt-3 space-y-2">
              {(articles.data ?? []).filter((entry) => entry.id !== articleId).map((entry) => (
                <li key={entry.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={draft.related_ids.includes(entry.id)} onChange={() => toggleRelated(entry.id)} />
                    {entry.title}
                  </label>
                </li>
              ))}
              {(articles.data ?? []).length <= 1 && <li className="text-sm text-muted-foreground">Write another article to link them together.</li>}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
          <h3 className="mt-3 font-heading text-3xl">{draft.title || "Untitled article"}</h3>
          {draft.summary && <p className="mt-2 text-sm text-muted-foreground">{draft.summary}</p>}
          <div className="mt-4"><MarkdownText body={draft.body} /></div>
        </div>
      </div>
    </section>
  );
}
