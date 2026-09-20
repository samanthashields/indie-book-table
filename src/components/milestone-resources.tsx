import { useRef, useState } from "react";
import { Link2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadBookFile, useFileUrl } from "@/lib/book-files";
import { RESOURCE_KINDS, resourceKindLabel, useAddResource, useDeleteResource, useResources } from "@/lib/resources";
import type { Resource, ResourceKind } from "@/lib/resources";

function ResourceLink({ resource }: { resource: Resource }) {
  const url = useFileUrl(resource.url);
  if (!resource.url) return null;
  if (!url.data) return <p className="mt-1 text-xs text-muted-foreground">Preparing link…</p>;
  return (
    <a href={url.data} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-link underline-offset-2 hover:underline">
      <Link2 className="size-3" />Open
    </a>
  );
}

/** Structured, curated links and files for one milestone — distinct from the freeform Notes thread. */
export function MilestoneResources({ bookId, milestoneId }: { bookId: string; milestoneId: string }) {
  const resources = useResources(bookId);
  const addResource = useAddResource(bookId);
  const deleteResource = useDeleteResource(bookId);
  const [kind, setKind] = useState<ResourceKind>("link");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const list = (resources.data ?? []).filter((resource) => resource.milestone_id === milestoneId);

  const addLinkResource = () => {
    if (!label.trim()) return;
    addResource.mutate(
      { kind, label: label.trim(), url: url.trim() || null, milestoneId },
      { onSuccess: () => { setLabel(""); setUrl(""); toast.success("Resource added"); }, onError: () => toast.error("Couldn’t add that resource") },
    );
  };

  const uploadFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadBookFile(bookId, "resources", file);
      addResource.mutate(
        { kind: "file", label: label.trim() || file.name, url: path, milestoneId },
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
    <section>
      <h3 className="font-serif text-2xl font-semibold">Resources</h3>
      <p className="mt-1 text-sm text-muted-foreground">Working files and reference links for this milestone specifically — rolls up into the book's Resources page.</p>

      {list.length > 0 && (
        <ul className="mt-3 space-y-2">
          {list.map((resource) => (
            <li key={resource.id} className="flex items-start justify-between gap-3 rounded-xl bg-secondary p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{resource.label}</p>
                <p className="text-xs text-muted-foreground">{resourceKindLabel[resource.kind]}</p>
                <ResourceLink resource={resource} />
              </div>
              <Button variant="ghost" size="icon" aria-label={`Remove ${resource.label}`} onClick={() => deleteResource.mutate(resource.id)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
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
  );
}
