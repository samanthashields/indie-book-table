import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bold, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, Type } from "lucide-react";
import { toast } from "sonner";

import { BackButton } from "@/components/page-heading";
import { MarkdownText } from "@/components/markdown-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { signCatalogCover, uploadCatalogCover } from "@/lib/catalog-covers";

export const Route = createFileRoute("/_authenticated/admin/journal/$postId")({ component: PostEditor });

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Draft = { title: string; slug: string; excerpt: string; body: string; cover_image_url: string | null; published_at: string | null };

const empty: Draft = { title: "", slug: "", excerpt: "", body: "", cover_image_url: null, published_at: null };

function PostEditor() {
  const { postId } = Route.useParams();
  const isNew = postId === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [loaded, setLoaded] = useState(isNew);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const existing = useQuery({
    queryKey: ["catalog-admin", "post", postId],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_posts")
        .select("id, title, slug, excerpt, body, cover_image_url, status, published_at")
        .eq("id", postId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loaded && existing.data) {
      setDraft({
        title: existing.data.title,
        slug: existing.data.slug,
        excerpt: existing.data.excerpt ?? "",
        body: existing.data.body,
        cover_image_url: existing.data.cover_image_url,
        published_at: existing.data.published_at,
      });
      setLoaded(true);
    }
  }, [existing.data, loaded]);

  useEffect(() => {
    const value = draft.cover_image_url;
    if (!value) { setCoverPreview(null); return; }
    if (/^https?:\/\//.test(value)) { setCoverPreview(value); return; }
    let alive = true;
    void signCatalogCover(value).then((url) => { if (alive) setCoverPreview(url); }).catch(() => setCoverPreview(null));
    return () => { alive = false; };
  }, [draft.cover_image_url]);

  /** Wraps or inserts markdown around the current selection in the body field. */
  const wrap = (before: string, after = "", placeholder = "") => {
    const field = bodyRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = draft.body.slice(start, end) || placeholder;
    const next = `${draft.body.slice(0, start)}${before}${selected}${after}${draft.body.slice(end)}`;
    setDraft((current) => ({ ...current, body: next }));
    requestAnimationFrame(() => {
      field.focus();
      field.selectionStart = start + before.length;
      field.selectionEnd = start + before.length + selected.length;
    });
  };

  const uploadImage = async (file: File | undefined, target: "cover" | "body") => {
    if (!file) return;
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sign in again to upload images.");
      const path = await uploadCatalogCover(userData.user.id, file);
      if (target === "cover") setDraft((current) => ({ ...current, cover_image_url: path }));
      else {
        const url = await signCatalogCover(path, 60 * 60 * 24 * 365);
        setDraft((current) => ({ ...current, body: `${current.body}\n\n![${file.name.replace(/\.[a-z0-9]+$/i, "")}](${url})\n` }));
      }
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t upload that image");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (status: "draft" | "published") => {
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugify(draft.title),
      excerpt: draft.excerpt.trim() || null,
      body: draft.body,
      cover_image_url: draft.cover_image_url,
      status,
      published_at: status === "published" ? (draft.published_at ?? new Date().toISOString()) : null,
    };
    if (!payload.title || !payload.body) {
      toast.error("A post needs a title and some words");
      return;
    }
    setBusy(true);
    try {
      const query = isNew
        ? supabase.from("catalog_posts").insert(payload)
        : supabase.from("catalog_posts").update(payload).eq("id", postId);
      const { error } = await query;
      if (error) throw error;
      toast.success(status === "published" ? "Post published" : "Draft saved");
      void queryClient.invalidateQueries({ queryKey: ["catalog-admin"] });
      void navigate({ to: "/admin/journal" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t save that post");
    } finally {
      setBusy(false);
    }
  };

  if (!isNew && existing.isLoading) return <p className="text-sm text-muted-foreground">Loading post…</p>;

  const tools = [
    { icon: Bold, label: "Bold", run: () => wrap("**", "**", "bold text") },
    { icon: Italic, label: "Italic", run: () => wrap("*", "*", "italic text") },
    { icon: Type, label: "Heading", run: () => wrap("\n## ", "", "Heading") },
    { icon: Quote, label: "Quote", run: () => wrap("\n> ", "", "A line worth pulling out") },
    { icon: List, label: "Bullet list", run: () => wrap("\n- ", "", "First point") },
    { icon: ListOrdered, label: "Numbered list", run: () => wrap("\n1. ", "", "First step") },
    { icon: Link2, label: "Link", run: () => wrap("[", "](https://)", "link text") },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton label="All posts" className="-ml-2 text-muted-foreground" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={busy} onClick={() => void save("draft")}>Save draft</Button>
          <Button disabled={busy} onClick={() => void save("published")}>Publish</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-2xl font-normal">{isNew ? "New journal post" : "Edit post"}</h2>
          <Input placeholder="Title" aria-label="Post title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} />
          <Input placeholder="web-address-slug" aria-label="Post slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          <Textarea rows={2} placeholder="Short teaser" aria-label="Post excerpt" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />

          <div className="rounded-xl border border-border/70 bg-paper p-4">
            <p className="text-sm font-semibold">Cover image</p>
            {coverPreview && <img src={coverPreview} alt="Post cover" className="mt-3 max-h-48 w-full rounded-xl object-cover" />}
            <div className="mt-3 flex flex-wrap gap-3">
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>Upload cover</Button>
              {draft.cover_image_url && <Button type="button" size="sm" variant="ghost" onClick={() => setDraft({ ...draft, cover_image_url: null })}>Remove</Button>}
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadImage(event.target.files?.[0], "cover")} />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-input bg-secondary px-2 py-1.5">
              {tools.map(({ icon: Icon, label, run }) => (
                <button key={label} type="button" title={label} aria-label={label} onClick={run} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground">
                  <Icon className="size-4" />
                </button>
              ))}
              <label className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground" title="Insert image">
                <ImageIcon className="size-4" />
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadImage(event.target.files?.[0], "body")} />
              </label>
            </div>
            <Textarea
              ref={bodyRef}
              rows={16}
              className="rounded-t-none"
              placeholder="Write the post…"
              aria-label="Post body"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
          <h3 className="mt-3 font-serif text-3xl">{draft.title || "Untitled post"}</h3>
          <MarkdownText body={draft.body || "_Nothing written yet._"} className="mt-4 text-[0.98rem] leading-relaxed text-foreground/85" />
        </div>
      </div>
    </section>
  );
}
