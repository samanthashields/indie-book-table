import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveSiteCopy, useSiteCopy } from "@/lib/catalog-admin";

export const Route = createFileRoute("/_authenticated/admin/journal")({ component: AdminJournal });

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  status: string;
  published_at: string | null;
};

const emptyPost = { id: "", title: "", slug: "", excerpt: "", body: "", status: "draft", published_at: null } as Post;

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function usePosts() {
  return useQuery({
    queryKey: ["catalog-admin", "posts"],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase
        .from("catalog_posts")
        .select("id, title, slug, excerpt, body, status, published_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });
}

function AdminJournal() {
  const queryClient = useQueryClient();
  const posts = usePosts();
  const copy = useSiteCopy();
  const [draft, setDraft] = useState<Post>(emptyPost);
  const [copyEdits, setCopyEdits] = useState<Record<string, string>>({});

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["catalog-admin"] });

  const savePost = async (status: "draft" | "published") => {
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugify(draft.title),
      excerpt: draft.excerpt?.trim() || null,
      body: draft.body,
      status,
      published_at: status === "published" ? (draft.published_at ?? new Date().toISOString()) : null,
    };
    if (!payload.title || !payload.body) {
      toast.error("A post needs a title and some words");
      return;
    }
    try {
      const query = draft.id
        ? supabase.from("catalog_posts").update(payload).eq("id", draft.id)
        : supabase.from("catalog_posts").insert(payload);
      const { error } = await query;
      if (error) throw error;
      toast.success(status === "published" ? "Post published" : "Draft saved");
      setDraft(emptyPost);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t save that post");
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-2xl font-normal">{draft.id ? "Edit post" : "New journal post"}</h2>
          <div className="mt-4 space-y-4">
            <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Post title" />
            <Input placeholder="web-address-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} aria-label="Post slug" />
            <Textarea rows={2} placeholder="Short teaser" value={draft.excerpt ?? ""} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} aria-label="Post excerpt" />
            <Textarea rows={10} placeholder="Write the post…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} aria-label="Post body" />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void savePost("draft")}>Save draft</Button>
              <Button onClick={() => void savePost("published")}>Publish</Button>
              {draft.id && <Button variant="ghost" onClick={() => setDraft(emptyPost)}>Cancel</Button>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-2xl font-normal">All posts</h2>
          <ul className="mt-4 space-y-2">
            {(posts.data ?? []).map((post) => (
              <li key={post.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-paper px-4 py-3">
                <span className="min-w-0 flex-1 text-sm font-semibold">{post.title}</span>
                <StatusPill tone={post.status === "published" ? "good" : "warm"}>{post.status === "published" ? "Published" : "Draft"}</StatusPill>
                <Button size="sm" variant="outline" onClick={() => setDraft(post)}>Edit</Button>
              </li>
            ))}
            {(posts.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">No posts yet.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-2xl font-normal">Site words</h2>
        <p className="mt-1 text-sm text-muted-foreground">Short pieces of copy shown across The Table.</p>
        <ul className="mt-4 space-y-4">
          {(copy.data ?? []).map((row) => (
            <li key={row.key}>
              <label className="block text-sm font-semibold">
                {row.key.replace(/_/g, " ")}
                <Textarea
                  className="mt-2"
                  rows={3}
                  value={copyEdits[row.key] ?? row.value}
                  onChange={(e) => setCopyEdits((current) => ({ ...current, [row.key]: e.target.value }))}
                />
              </label>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() =>
                  void saveSiteCopy(row.key, copyEdits[row.key] ?? row.value)
                    .then(() => toast.success("Saved"))
                    .catch(() => toast.error("Couldn’t save that"))
                }
              >
                Save
              </Button>
            </li>
          ))}
          {(copy.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">Nothing to edit yet.</li>}
        </ul>
      </div>
    </section>
  );
}
