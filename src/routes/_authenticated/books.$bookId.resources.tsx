import { useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FolderOpen, Link2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookTree } from "@/lib/book-db";
import { uploadBookFile, useFileUrl } from "@/lib/book-files";
import { RESOURCE_KINDS, resourceKindLabel, useAddResource, useDeleteResource, useResources } from "@/lib/resources";
import type { Resource, ResourceKind } from "@/lib/resources";

export const Route = createFileRoute("/_authenticated/books/$bookId/resources")({
  head: () => ({ meta: [
    { title: "Resources — Book Cycles" },
    { name: "description", content: "Every working file and reference link for this book, in one place." },
    { property: "og:title", content: "Resources — Book Cycles" },
    { property: "og:description", content: "Every working file and reference link for this book, in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResourcesPage,
});

function ResourceRow({ resource, milestoneLabel, onRemove }: { resource: Resource; milestoneLabel: string | null; onRemove: () => void }) {
  const url = useFileUrl(resource.url);
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{resource.label}</p>
        <p className="text-xs text-muted-foreground">{resourceKindLabel[resource.kind]}{milestoneLabel ? ` — ${milestoneLabel}` : ""}</p>
        {resource.url && (url.data ? (
          <a href={url.data} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-2 hover:underline">
            <Link2 className="size-3" />Open
          </a>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">Preparing link…</p>
        ))}
      </div>
      <Button variant="ghost" size="icon" aria-label={`Remove ${resource.label}`} onClick={onRemove}><Trash2 /></Button>
    </li>
  );
}

function ResourcesPage() {
  const { bookId } = Route.useParams();
  const book = useBookTree(bookId);
  const resources = useResources(bookId);
  const addResource = useAddResource(bookId);
  const deleteResource = useDeleteResource(bookId);
  const [kind, setKind] = useState<ResourceKind>("link");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const milestoneNames = new Map((book.data?.phases ?? []).flatMap((phase) => phase.milestones.map((milestone) => [milestone.id, `${phase.name} — ${milestone.name}`] as const)));
  const list = resources.data ?? [];
  const bookLevel = list.filter((resource) => !resource.milestone_id);
  const milestoneScoped = list.filter((resource) => resource.milestone_id);

  const addLinkResource = () => {
    if (!label.trim()) return;
    addResource.mutate(
      { kind, label: label.trim(), url: url.trim() || null },
      { onSuccess: () => { setLabel(""); setUrl(""); toast.success("Resource added"); }, onError: () => toast.error("Couldn’t add that resource") },
    );
  };

  const uploadFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadBookFile(bookId, "resources", file);
      addResource.mutate(
        { kind: "file", label: label.trim() || file.name, url: path },
        { onSuccess: () => { setLabel(""); toast.success("File added"); }, onError: () => toast.error("Couldn’t add that file") },
      );
    } catch {
      toast.error("Couldn’t upload that file");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <AppShell>
      <PageHeading
        title="Resources"
        description={`Working files and reference material for ${book.data?.book.title ?? "this book"} — book-level, plus everything rolled up from individual milestones.`}
      />

      <section className="rounded-2xl border border-border bg-paper p-6 shadow-xs">
        <h2 className="font-serif text-2xl font-normal">Add a book-level resource</h2>
        <p className="mt-2 text-sm text-muted-foreground">Not tied to one milestone — comps, style guides, vendor lists, anything worth keeping with the whole cycle.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select className="h-10 rounded-xl border border-input bg-card px-3 text-sm" aria-label="Resource kind" value={kind} onChange={(event) => setKind(event.target.value as ResourceKind)}>
            {RESOURCE_KINDS.map((k) => <option key={k} value={k}>{resourceKindLabel[k]}</option>)}
          </select>
          <Input className="h-10 min-w-40 flex-1" aria-label="Resource label" placeholder="Label" value={label} onChange={(event) => setLabel(event.target.value)} />
          {kind === "file" ? (
            <>
              <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}><Paperclip />{uploading ? "Uploading…" : "Choose file"}</Button>
              <input ref={fileInput} type="file" className="sr-only" onChange={(event) => void uploadFile(event.target.files?.[0])} />
            </>
          ) : (
            <>
              <Input className="h-10 min-w-40 flex-1" aria-label="Resource URL" placeholder="https://…" value={url} onChange={(event) => setUrl(event.target.value)} />
              <Button type="button" onClick={addLinkResource} disabled={!label.trim() || addResource.isPending}>Add</Button>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-serif text-2xl font-normal">Book-level</h2>
        {bookLevel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <FolderOpen className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nothing here yet — add one above, or attach resources to individual milestones.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {bookLevel.map((resource) => <ResourceRow key={resource.id} resource={resource} milestoneLabel={null} onRemove={() => deleteResource.mutate(resource.id)} />)}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-serif text-2xl font-normal">From your milestones</h2>
        {milestoneScoped.length === 0 ? (
          <p className="text-sm text-muted-foreground">Resources you add to a specific milestone show up here too.</p>
        ) : (
          <ul className="space-y-2">
            {milestoneScoped.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                milestoneLabel={milestoneNames.get(resource.milestone_id!) ?? null}
                onRemove={() => deleteResource.mutate(resource.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/books/$bookId" params={{ bookId }} className="font-semibold text-primary underline-offset-2 hover:underline">Back to the book overview</Link>
      </p>
    </AppShell>
  );
}
