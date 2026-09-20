import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { PhaseEditor, standardPhases } from "@/components/phase-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveAuthorTemplate, useTemplates } from "@/lib/book-db";
import type { TemplatePhase } from "@/lib/template-data";

export const Route = createFileRoute("/_authenticated/templates/mine/$templateId")({
  head: () => ({ meta: [
    { title: "Edit Template — The Indie Book Table" },
    { name: "description", content: "Shape your own book cycle template: phases, milestones and the requirement behind each one." },
    { property: "og:title", content: "Edit Template — The Indie Book Table" },
    { property: "og:description", content: "Shape your own book cycle template: phases, milestones and the requirement behind each one." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TemplateEditor,
});

function TemplateEditor() {
  const { templateId } = Route.useParams();
  const isNew = templateId === "new";
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useTemplates();
  const save = useSaveAuthorTemplate();
  const existing = isNew ? undefined : templates.find((entry) => entry.id === templateId);

  const [loaded, setLoaded] = useState(isNew);
  const [title, setTitle] = useState("My book cycle template");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [phases, setPhases] = useState<TemplatePhase[]>(standardPhases);

  useEffect(() => {
    if (!loaded && existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? "");
      setGenre(existing.genre ?? "");
      setPhases(existing.phases);
      setLoaded(true);
    }
  }, [existing, loaded]);

  if (!isNew && isLoading) return <AppShell><p className="text-sm text-muted-foreground">Loading template…</p></AppShell>;
  if (!isNew && !existing) return <AppShell><p className="text-sm text-muted-foreground">This template is no longer available.</p></AppShell>;

  const commit = () => {
    save.mutate(
      { ...(isNew ? {} : { id: templateId }), input: { title: title.trim(), description, genre, phases, details: existing?.details ?? {} } },
      {
        onSuccess: () => { toast.success("Template saved"); void navigate({ to: "/templates" }); },
        onError: () => toast.error("Couldn’t save that template"),
      },
    );
  };

  return (
    <AppShell>
      <PageHeading
        title={isNew ? "New template" : "Edit template"}
        description="Save a path you can reuse for every book you write. Add the phases you want, or invent your own."
        action={<Button disabled={save.isPending || !title.trim()} onClick={commit}>{save.isPending && <Loader2 className="animate-spin" />}Save template</Button>}
      />

      <section className="mb-8 rounded-2xl border border-border bg-paper p-6 shadow-xs">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold">Template name<Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="block text-sm font-semibold">Genre or category<Input className="mt-2" value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Literary fiction, cozy mystery…" /></label>
          <label className="block text-sm font-semibold md:col-span-2">What this path is for<Textarea className="mt-2" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        </div>
      </section>

      <PhaseEditor phases={phases} onChange={setPhases} />
    </AppShell>
  );
}
