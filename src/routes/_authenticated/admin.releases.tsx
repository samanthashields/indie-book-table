import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownText } from "@/components/markdown-text";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteReleaseNote, useReleaseNotes, useSaveReleaseNote, type ReleaseNote } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/admin/releases")({ component: AdminReleases });

type Draft = { id?: string; title: string; label: string; body: string; highlight: boolean; released_on: string };

const emptyDraft = (): Draft => ({ title: "", label: "New", body: "", highlight: false, released_on: new Date().toISOString().slice(0, 10) });

function AdminReleases() {
  const releases = useReleaseNotes();
  const save = useSaveReleaseNote();
  const remove = useDeleteReleaseNote();
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const edit = (note: ReleaseNote) =>
    setDraft({ id: note.id, title: note.title, label: note.label ?? "", body: note.body, highlight: note.highlight, released_on: note.released_on });

  const commit = (status: "draft" | "published") => {
    if (!draft.title.trim()) {
      toast.error("Give the update a title");
      return;
    }
    save.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title.trim(),
        label: draft.label.trim() || null,
        body: draft.body,
        highlight: draft.highlight,
        released_on: draft.released_on,
        status,
      },
      {
        onSuccess: () => { toast.success(status === "published" ? "Update published" : "Draft saved"); setDraft(emptyDraft()); },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn’t save that update"),
      },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border-2 border-sun/50 bg-sun/10 p-6">
        <h2 className="font-serif text-2xl font-normal">{draft.id ? "Edit update" : "New update"}</h2>
        <Input placeholder="Title" aria-label="Update title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Label (New, Fixed…)" aria-label="Label" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />
          <Input type="date" aria-label="Release date" value={draft.released_on} onChange={(event) => setDraft({ ...draft, released_on: event.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={draft.highlight} onChange={(event) => setDraft({ ...draft, highlight: event.target.checked })} />
          Highlight this one in the Help Center
        </label>
        <MarkdownEditor rows={10} value={draft.body} onChange={(body) => setDraft({ ...draft, body })} placeholder="What changed…" label="Update body" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={save.isPending} onClick={() => commit("draft")}>Save draft</Button>
          <Button disabled={save.isPending} onClick={() => commit("published")}><Plus />Publish</Button>
          {draft.id && <Button variant="ghost" onClick={() => setDraft(emptyDraft())}>Start a new one</Button>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-normal">All updates</h2>
        {releases.isLoading && <p className="text-sm text-muted-foreground">Loading updates…</p>}
        {(releases.data ?? []).map((note) => (
          <article key={note.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {note.label && <StatusPill tone="good">{note.label}</StatusPill>}
              <StatusPill tone={note.status === "published" ? "good" : "warm"}>{note.status === "published" ? "Published" : "Draft"}</StatusPill>
              <span className="text-xs text-muted-foreground">{new Date(note.released_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <h3 className="mt-2 font-serif text-xl font-normal">{note.title}</h3>
            <div className="mt-2 text-sm"><MarkdownText body={note.body} /></div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => edit(note)}>Edit</Button>
              <Button size="icon" variant="ghost" aria-label={`Delete ${note.title}`} onClick={() => remove.mutate(note.id, { onSuccess: () => toast.success("Update deleted") })}><Trash2 /></Button>
            </div>
          </article>
        ))}
        {!releases.isLoading && (releases.data ?? []).length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No updates yet.</p>
        )}
      </section>
    </div>
  );
}
