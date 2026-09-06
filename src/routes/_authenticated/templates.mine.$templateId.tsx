import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { blankPhases } from "@/components/cycle-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveAuthorTemplate, useTemplates } from "@/lib/book-db";
import { phaseStyle } from "@/lib/phase-style";
import type { RequirementType } from "@/lib/book-data";
import type { TemplatePhase } from "@/lib/template-data";

export const Route = createFileRoute("/_authenticated/templates/mine/$templateId")({
  head: () => ({ meta: [
    { title: "Edit Template — Book Cycles" },
    { name: "description", content: "Shape your own book cycle template: phases, milestones and the requirement behind each one." },
    { property: "og:title", content: "Edit Template — Book Cycles" },
    { property: "og:description", content: "Shape your own book cycle template: phases, milestones and the requirement behind each one." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TemplateEditor,
});

const requirementTypes: RequirementType[] = [
  "Request a Service",
  "Attach a File",
  "Complete an Activity Outside the Platform",
  "Approve a Deliverable",
];

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
  const [phases, setPhases] = useState<TemplatePhase[]>(blankPhases);

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

  const updateMilestone = (phaseId: string, index: number, patch: Partial<TemplatePhase["milestones"][number]>) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: phase.milestones.map((milestone, i) => i === index ? { ...milestone, ...patch } : milestone) } : phase));
  const addMilestone = (phaseId: string) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: [...phase.milestones, { name: "New milestone", requirement: "Attach a File" as RequirementType, note: "" }] } : phase));
  const removeMilestone = (phaseId: string, index: number) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: phase.milestones.filter((_, i) => i !== index) } : phase));

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
        description="Save a path you can reuse for every book you write. Only you can see it."
        action={<Button disabled={save.isPending || !title.trim()} onClick={commit}>{save.isPending && <Loader2 className="animate-spin" />}Save template</Button>}
      />

      <section className="mb-8 rounded-2xl border border-border bg-paper p-6 shadow-xs">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold">Template name<Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="block text-sm font-semibold">Genre or category<Input className="mt-2" value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Literary fiction, cozy mystery…" /></label>
          <label className="block text-sm font-semibold md:col-span-2">What this path is for<Textarea className="mt-2" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        </div>
      </section>

      <div className="space-y-4">
        {phases.map((phase, index) => {
          const style = phaseStyle(phase.id);
          return (
            <article key={phase.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
              <span className={`grid size-10 place-items-center rounded-full border-2 font-semibold ${style.marker}`}>{index + 1}</span>
              <div className={`rounded-2xl border border-border p-5 ${style.soft}`}>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-normal">{phase.name}</h3><StatusPill>{phase.mode}</StatusPill></div>
                <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                <ul className="mt-4 space-y-3">
                  {phase.milestones.map((milestone, milestoneIndex) => (
                    <li key={`${phase.id}-${milestoneIndex}`} className="grid gap-3 rounded-xl bg-card p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_260px_auto] sm:items-center">
                      <Input value={milestone.name} aria-label="Milestone name" onChange={(event) => updateMilestone(phase.id, milestoneIndex, { name: event.target.value })} />
                      <select className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" aria-label="Requirement type" value={milestone.requirement} onChange={(event) => updateMilestone(phase.id, milestoneIndex, { requirement: event.target.value as RequirementType })}>
                        {requirementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${milestone.name}`} onClick={() => removeMilestone(phase.id, milestoneIndex)}><Trash2 /></Button>
                    </li>
                  ))}
                  {phase.milestones.length === 0 && <li className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">No milestones yet in this phase.</li>}
                </ul>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addMilestone(phase.id)}><Plus />Add milestone</Button>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
