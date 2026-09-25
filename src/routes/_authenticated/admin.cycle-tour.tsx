import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CoachMark } from "@/components/coach-mark";
import { CYCLE_TOUR_DEFAULTS, cycleTourQueryKey, penImageQueryKey, savePenImagePath, useCycleTourPenImage, useCycleTourSteps, type CycleTourStep } from "@/lib/cycle-tour";
import { uploadOnboardingMedia } from "@/lib/workshop-onboarding";

export const Route = createFileRoute("/_authenticated/admin/cycle-tour")({
  head: () => ({ meta: [
    { title: "Book Cycle tour — Admin" },
    { name: "description", content: "Edit the words on the first-visit Book Cycle tour." },
    { property: "og:title", content: "Book Cycle tour — Admin" },
    { property: "og:description", content: "Edit the words on the first-visit Book Cycle tour." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminCycleTour,
});

const WHERE: Record<string, string> = {
  welcome: "Opening welcome window",
  header: "Points at the book header and its buttons",
  progress: "Points at the progress card",
  setup_tasks: "Points at Set Up Recommended Tasks (optional)",
  phases: "Points at Your publishing path",
  post_launch: "Points at Post Launch Recommended Tasks (optional)",
};

function StepEditor({ initial }: { initial: CycleTourStep }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(initial);
  const fallback = CYCLE_TOUR_DEFAULTS.find((step) => step.key === initial.key)!;
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cycle_tour_steps").upsert({ key: draft.key, title: draft.title.trim(), body: draft.body.trim(), position: draft.position, enabled: draft.enabled });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Tour screen saved"); void queryClient.invalidateQueries({ queryKey: cycleTourQueryKey }); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn’t save that screen"),
  });
  const valid = draft.title.trim().length > 0 && draft.body.trim().length > 0;
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{WHERE[draft.key] ?? draft.key}</p>
      <div className="mt-3 grid gap-4">
        <div><Label htmlFor={`title-${draft.key}`}>Title</Label><Input id={`title-${draft.key}`} className="mt-1" maxLength={80} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
        <div><Label htmlFor={`body-${draft.key}`}>Message</Label><Textarea id={`body-${draft.key}`} className="mt-1" rows={3} maxLength={400} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} aria-label="Show this screen" />
        <span className="text-sm">{draft.enabled ? "Shown" : "Hidden"}</span>
        <Button onClick={() => save.mutate()} disabled={!valid || save.isPending}>Save screen</Button>
        <Button variant="ghost" onClick={() => setDraft({ ...draft, title: fallback.title, body: fallback.body })}>Restore original words</Button>
      </div>
    </article>
  );
}

function PenImageEditor() {
  const queryClient = useQueryClient();
  const image = useCycleTourPenImage().data;
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: penImageQueryKey });

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      await savePenImagePath(await uploadOnboardingMedia(file));
      toast.success("Pen’s picture updated");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That picture couldn’t be uploaded");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await savePenImagePath(null);
      toast.success("Went back to the built-in mark");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t remove that picture");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="mt-6 flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card p-5">
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-card text-link">
        {image ? <img src={image.url} alt="Pen" className="size-full object-contain p-1" /> : <CoachMark className="size-9" />}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold">Pen’s picture</h3>
        <p className="mt-1 text-sm text-muted-foreground">Shown next to Pen’s words on every tour screen, shown whole inside a circle, never cropped. A square PNG or WebP with a transparent background, about 512 px, looks best; without one, the book mark is used.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Working…" : image ? "Replace picture" : "Upload picture"}</Button>
        {image ? <Button variant="ghost" disabled={busy} onClick={() => void remove()}>Use the book mark</Button> : null}
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} />
    </article>
  );
}

function AdminCycleTour() {
  const steps = useCycleTourSteps({ includeDisabled: true });
  return (
    <section className="max-w-3xl">
      <h2 className="font-heading text-2xl font-normal">Book Cycle tour</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The words on the welcome window and on each screen Pen shows as an author opens their first Book Cycle. The order and the part of the page each screen points at are fixed; you can change the words or hide a screen. Changes reach authors within a minute.
      </p>
      <PenImageEditor />
      {steps.isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading…</p> : (
        <div className="mt-6 space-y-4">
          {(steps.data ?? []).map((step) => <StepEditor key={`${step.key}:${step.title}:${step.body}:${step.enabled}`} initial={step} />)}
        </div>
      )}
    </section>
  );
}
