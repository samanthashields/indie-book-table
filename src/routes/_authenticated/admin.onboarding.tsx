import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, ImageUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { OPEN_WORKSHOP_TOUR, OPEN_WORKSHOP_WELCOME } from "@/components/workshop-onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteWorkshopTourStep,
  getAdminWorkshopOnboarding,
  reorderWorkshopTourSteps,
  saveWorkshopTourStep,
  saveWorkshopWelcome,
} from "@/lib/workshop-onboarding.functions";
import { resolveOnboardingMedia, uploadOnboardingMedia, type WorkshopTourStep, type WorkshopWelcome } from "@/lib/workshop-onboarding";

export const Route = createFileRoute("/_authenticated/admin/onboarding")({
  head: () => ({ meta: [
    { title: "Workshop onboarding — Admin" },
    { name: "description", content: "Manage the Author’s Workshop welcome and guided walkthrough." },
    { property: "og:title", content: "Workshop onboarding — Admin" },
    { property: "og:description", content: "Manage the Author’s Workshop welcome and guided walkthrough." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminOnboarding,
});

type MediaKind = "none" | "image" | "video";
type StepDraft = Omit<WorkshopTourStep, "created_at" | "updated_at" | "id"> & { id?: string };

const destinations = [
  ["None", ""], ["My Books", "/"], ["My Cycles", "/cycles"], ["Templates", "/templates"],
  ["Collaborations", "/collaborations"], ["My Submissions", "/submissions"], ["Pen", "/pen"],
] as const;

function MediaFields({ kind, value, onChange }: { kind: MediaKind; value: string; onChange: (kind: MediaKind, value: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  useEffect(() => {
    let current = true;
    if (!value) { setPreview(""); return; }
    void resolveOnboardingMedia(value).then((url) => { if (current) setPreview(url); }).catch(() => { if (current) setPreview(""); });
    return () => { current = false; };
  }, [value]);

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadOnboardingMedia(file);
      onChange(file.type.startsWith("video/") ? "video" : "image", path);
      toast.success("Media uploaded — save to use it");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That file couldn’t be uploaded");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  return <div className="space-y-3">
    {preview && kind === "image" ? <img src={preview} alt="Onboarding preview" className="aspect-video w-full max-w-lg rounded-lg object-cover" /> : null}
    {preview && kind === "video" ? <video src={preview} controls className="aspect-video w-full max-w-lg rounded-lg bg-foreground object-contain" /> : null}
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
      <Select value={kind} onValueChange={(next: MediaKind) => onChange(next, next === "none" ? "" : value)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="none">No media</SelectItem><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
      </Select>
      {kind === "video" ? <Input value={value} onChange={(event) => onChange("video", event.target.value)} placeholder="Upload a video or paste a direct https video link" /> : <div />}
    </div>
    {kind !== "none" ? <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}><ImageUp />{uploading ? "Uploading…" : `Upload ${kind}`}</Button>
      {value ? <Button type="button" variant="ghost" size="sm" onClick={() => onChange("none", "")}>Remove media</Button> : null}
      <input ref={input} type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif"} className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
    </div> : null}
  </div>;
}

function StepEditor({ initial, onSaved, onDelete }: { initial: StepDraft; onSaved: () => void; onDelete?: () => void }) {
  const [draft, setDraft] = useState(initial);
  const save = useMutation({ mutationFn: () => saveWorkshopTourStep({ data: draft }), onSuccess: () => { toast.success("Walkthrough screen saved"); onSaved(); }, onError: (error) => toast.error(error.message) });
  const update = <K extends keyof StepDraft>(key: K, value: StepDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return <article className="rounded-lg border border-border bg-card p-5">
    <div className="grid gap-4 lg:grid-cols-2">
      <div><Label>Title</Label><Input className="mt-1" value={draft.title} onChange={(event) => update("title", event.target.value)} /></div>
      <div><Label>Destination</Label><Select value={draft.destination_path || "none"} onValueChange={(path) => { const match = destinations.find((item) => item[1] === (path === "none" ? "" : path)); update("destination_path", match?.[1] ?? ""); update("destination_label", match?.[0] === "None" ? "" : `Open ${match?.[0] ?? "page"}`); }}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{destinations.map(([label, path]) => <SelectItem key={label} value={path || "none"}>{label}</SelectItem>)}</SelectContent></Select></div>
      <div className="lg:col-span-2"><Label>Message</Label><Textarea className="mt-1" rows={4} value={draft.body} onChange={(event) => update("body", event.target.value)} /></div>
      <div className="lg:col-span-2"><Label>Media</Label><div className="mt-2"><MediaFields kind={draft.media_kind as MediaKind} value={draft.media_value} onChange={(kind, value) => setDraft((current) => ({ ...current, media_kind: kind, media_value: value }))} /></div></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Switch checked={draft.published} onCheckedChange={(checked) => update("published", checked)} aria-label="Published" /><span className="text-sm">{draft.published ? "Published" : "Draft"}</span>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>Save screen</Button>
      {onDelete ? <Button variant="ghost" onClick={onDelete}><Trash2 />Remove</Button> : null}
    </div>
  </article>;
}

function AdminOnboarding() {
  const queryClient = useQueryClient();
  const content = useQuery({ queryKey: ["admin-workshop-onboarding"], queryFn: () => getAdminWorkshopOnboarding() });
  const [welcome, setWelcome] = useState<WorkshopWelcome | null>(null);
  const [adding, setAdding] = useState(false);
  const currentWelcome = welcome ?? content.data?.welcome ?? null;
  const refresh = () => { setAdding(false); void queryClient.invalidateQueries({ queryKey: ["admin-workshop-onboarding"] }); void queryClient.invalidateQueries({ queryKey: ["workshop-onboarding"] }); };
  const saveWelcome = useMutation({ mutationFn: () => currentWelcome ? saveWorkshopWelcome({ data: currentWelcome }) : Promise.reject(new Error("Welcome content is still loading")), onSuccess: () => { toast.success("Welcome saved"); refresh(); }, onError: (error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: (id: string) => deleteWorkshopTourStep({ data: { id } }), onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const move = useMutation({ mutationFn: (ids: string[]) => reorderWorkshopTourSteps({ data: { ids } }), onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const steps = content.data?.steps ?? [];

  if (!currentWelcome) return <p className="text-sm text-muted-foreground">Loading onboarding…</p>;
  const updateWelcome = (patch: Partial<WorkshopWelcome>) => setWelcome({ ...currentWelcome, ...patch });

  return <div className="space-y-8">
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-serif text-2xl font-normal">First-visit welcome</h2><p className="mt-1 text-sm text-muted-foreground">Shown when an author first enters the Workshop.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_WORKSHOP_WELCOME, { detail: { preview: true } }))}><Eye />Preview</Button><label className="flex items-center gap-2 text-sm"><Switch checked={currentWelcome.enabled} onCheckedChange={(enabled) => updateWelcome({ enabled })} />{currentWelcome.enabled ? "On" : "Off"}</label></div></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2"><Label>Heading</Label><Input className="mt-1" value={currentWelcome.heading} onChange={(event) => updateWelcome({ heading: event.target.value })} /></div>
        <div className="lg:col-span-2"><Label>Message</Label><Textarea className="mt-1" rows={5} value={currentWelcome.body} onChange={(event) => updateWelcome({ body: event.target.value })} /></div>
        <div><Label>Walkthrough button</Label><Input className="mt-1" value={currentWelcome.primary_label} onChange={(event) => updateWelcome({ primary_label: event.target.value })} /></div>
        <div><Label>Continue button</Label><Input className="mt-1" value={currentWelcome.secondary_label} onChange={(event) => updateWelcome({ secondary_label: event.target.value })} /></div>
        <div className="lg:col-span-2"><Label>Introduction media</Label><div className="mt-2"><MediaFields kind={currentWelcome.media_kind as MediaKind} value={currentWelcome.media_value} onChange={(kind, value) => updateWelcome({ media_kind: kind, media_value: value })} /></div></div>
      </div>
      <Button className="mt-5" onClick={() => saveWelcome.mutate()} disabled={saveWelcome.isPending}>Save welcome</Button>
    </section>

    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl font-normal">Walkthrough screens</h2><p className="mt-1 text-sm text-muted-foreground">Order and publish the screens authors see.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_WORKSHOP_TOUR, { detail: { preview: true } }))}><Eye />Preview published</Button><Button onClick={() => setAdding(true)}><Plus />Add screen</Button></div></div>
      <div className="space-y-4">
        {adding ? <StepEditor initial={{ title: "", body: "", media_kind: "none", media_value: "", destination_label: "", destination_path: "", position: steps.length, published: false }} onSaved={refresh} /> : null}
        {steps.map((step, index) => <div key={step.id} className="grid gap-2 sm:grid-cols-[40px_minmax(0,1fr)]"><div className="flex gap-1 sm:flex-col"><Button variant="ghost" size="icon" disabled={index === 0 || move.isPending} onClick={() => { const previous = steps[index - 1]; if (!previous) return; const ids = steps.map((item) => item.id); ids[index - 1] = step.id; ids[index] = previous.id; move.mutate(ids); }} aria-label="Move screen up"><ArrowUp /></Button><Button variant="ghost" size="icon" disabled={index === steps.length - 1 || move.isPending} onClick={() => { const next = steps[index + 1]; if (!next) return; const ids = steps.map((item) => item.id); ids[index] = next.id; ids[index + 1] = step.id; move.mutate(ids); }} aria-label="Move screen down"><ArrowDown /></Button></div><StepEditor initial={step} onSaved={refresh} onDelete={() => remove.mutate(step.id)} /></div>)}
      </div>
    </section>
  </div>;
}