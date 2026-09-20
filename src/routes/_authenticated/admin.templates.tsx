import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhaseEditor, standardPhases } from "@/components/phase-editor";
import { supabase } from "@/integrations/supabase/client";
import type { TemplatePhase } from "@/lib/template-data";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  head: () => ({ meta: [
    { title: "Templates — The Indie Book Table admin" },
    { name: "description", content: "Create, edit, publish and archive the genre templates authors start from." },
    { property: "og:title", content: "Templates — The Indie Book Table admin" },
    { property: "og:description", content: "Create, edit, publish and archive the genre templates authors start from." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminTemplates,
});

type TemplateRow = {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  audience: string | null;
  duration: string | null;
  phases: unknown;
  published: boolean;
  archived: boolean;
  position: number;
};

function AdminTemplates() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({ title: "", description: "", genre: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [draftPhases, setDraftPhases] = useState<TemplatePhase[]>([]);

  const templates = useQuery({
    queryKey: ["admin-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("id, title, description, genre, audience, duration, phases, published, archived, position").order("position");
      if (error) throw error;
      return (data ?? []) as TemplateRow[];
    },
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-templates"] });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { published?: boolean; archived?: boolean; position?: number; title?: string; description?: string | null } }) => {
      const { error } = await supabase.from("templates").update(patch).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success("Template updated"); },
    onError: () => toast.error("Couldn’t update that template"),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const next = (templates.data ?? []).length;
      const { error } = await supabase.from("templates").insert({
        owner_id: userData.user?.id ?? null,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        genre: draft.genre.trim() || null,
        phases: standardPhases,
        published: false,
        position: next,
      });
      if (error) throw error;
    },
    onSuccess: () => { setDraft({ title: "", description: "", genre: "" }); refresh(); toast.success("Template created"); },
    onError: () => toast.error("Couldn’t create that template"),
  });

  const savePhases = useMutation({
    mutationFn: async ({ id, phases }: { id: string; phases: TemplatePhase[] }) => {
      const { error } = await supabase.from("templates").update({ phases: phases as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setEditing(null); toast.success("Phases saved"); },
    onError: () => toast.error("Couldn’t save those phases"),
  });

  const duplicate = useMutation({
    mutationFn: async (template: TemplateRow) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("templates").insert({
        owner_id: userData.user?.id ?? null,
        title: `${template.title} (copy)`,
        description: template.description,
        genre: template.genre,
        audience: template.audience,
        duration: template.duration,
        phases: template.phases as never,
        published: false,
        position: (templates.data ?? []).length,
      });
      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success("Template duplicated"); },
    onError: () => toast.error("Couldn’t duplicate that template"),
  });

  const move = (index: number, direction: -1 | 1) => {
    const rows = templates.data ?? [];
    const target = rows[index + direction];
    const current = rows[index];
    if (!target || !current) return;
    update.mutate({ id: current.id, patch: { position: target.position } });
    update.mutate({ id: target.id, patch: { position: current.position } });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-paper p-6">
        <h2 className="font-serif text-2xl font-normal">New template</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); if (draft.title.trim()) create.mutate(); }}>
          <label className="block text-sm font-semibold">Title<Input className="mt-2" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Children's picture book" required /></label>
          <label className="block text-sm font-semibold">Genre<Input className="mt-2" value={draft.genre} onChange={(event) => setDraft({ ...draft, genre: event.target.value })} placeholder="Children's" /></label>
          <Button type="submit" disabled={create.isPending}><Plus />Create</Button>
          <label className="block text-sm font-semibold md:col-span-3">Description<Textarea className="mt-2 min-h-20" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What kind of book this plan suits." /></label>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-normal">All templates</h2>
        {templates.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading templates…</p>
        ) : (templates.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No templates yet.</p>
        ) : (
          <ul className="space-y-3">
            {(templates.data ?? []).map((template, index) => (
              <li key={template.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <StatusPill tone={template.published ? "good" : "warm"}>{template.published ? "Published" : "Draft"}</StatusPill>
                      {template.archived && <StatusPill tone="danger">Archived</StatusPill>}
                      {template.genre && <StatusPill>{template.genre}</StatusPill>}
                    </div>
                    <p className="font-serif text-xl">{template.title}</p>
                    {template.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{template.description}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon" aria-label="Move down" disabled={index === (templates.data ?? []).length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon" aria-label="Duplicate" onClick={() => duplicate.mutate(template)}><Copy /></Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (editing === template.id) { setEditing(null); return; }
                        setEditing(template.id);
                        setDraftPhases(Array.isArray(template.phases) ? (template.phases as TemplatePhase[]) : []);
                      }}
                    >
                      {editing === template.id ? "Close phases" : "Edit phases"}
                    </Button>
                    <Button variant="outline" onClick={() => update.mutate({ id: template.id, patch: { published: !template.published } })}>{template.published ? "Unpublish" : "Publish"}</Button>
                    <Button variant={template.archived ? "default" : "outline"} onClick={() => update.mutate({ id: template.id, patch: { archived: !template.archived } })}>{template.archived ? "Restore" : "Archive"}</Button>
                  </div>
                </div>

                {editing === template.id && (
                  <div className="mt-6 border-t border-border pt-6">
                    <PhaseEditor phases={draftPhases} onChange={setDraftPhases} />
                    <div className="mt-4 flex gap-2">
                      <Button disabled={savePhases.isPending} onClick={() => savePhases.mutate({ id: template.id, phases: draftPhases })}>Save phases</Button>
                      <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
