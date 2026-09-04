import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { phaseStyle } from "@/lib/phase-style";
import type { RequirementType } from "@/lib/book-data";
import type { TemplatePhase } from "@/lib/template-data";

const requirementTypes: RequirementType[] = [
  "Request a Service",
  "Attach a File",
  "Complete an Activity Outside the Platform",
  "Approve a Deliverable",
];

export const blankPhases: TemplatePhase[] = [
  { id: "writing", name: "Writing & Development", mode: "Loop", summary: "Shape the manuscript, test the premise, and revise with intention.", milestones: [] },
  { id: "editing", name: "Editing", mode: "Loop", summary: "Move from structural clarity to clean, confident prose.", milestones: [] },
  { id: "production", name: "Production", mode: "Sprint", summary: "Turn the manuscript into a book people can hold and read.", milestones: [] },
  { id: "prelaunch", name: "Pre-Launch", mode: "Sprint", summary: "Prepare the listing, early readers, and a realistic launch plan.", milestones: [] },
  { id: "launch", name: "Launch", mode: "Launch window", summary: "Publish, verify every storefront, and invite the first readers.", milestones: [] },
  { id: "growth", name: "Post-Launch & Growth", mode: "Loop", summary: "Learn from the launch and build steady readership.", milestones: [] },
];

export function CycleBuilder({ title, description, phases: initial, creating, onBack, onCreate }: {
  title: string;
  description: string;
  phases: TemplatePhase[];
  creating?: boolean;
  onBack: () => void;
  onCreate: (input: { title: string; targetDate: string; phases: TemplatePhase[] }) => void;
}) {
  const [phases, setPhases] = useState<TemplatePhase[]>(initial);
  const [bookTitle, setBookTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const updateMilestone = (phaseId: string, index: number, patch: Partial<TemplatePhase["milestones"][number]>) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: phase.milestones.map((milestone, i) => i === index ? { ...milestone, ...patch } : milestone) } : phase));

  const addMilestone = (phaseId: string) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: [...phase.milestones, { name: "New milestone", requirement: "Attach a File" as RequirementType, note: "" }] } : phase));

  const removeMilestone = (phaseId: string, index: number) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: phase.milestones.filter((_, i) => i !== index) } : phase));

  const ready = bookTitle.trim().length > 0 && phases.some((phase) => phase.milestones.length > 0);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-paper p-6">
        <h2 className="font-serif text-3xl font-normal">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Working title<Input className="mt-2" value={bookTitle} placeholder="The working title of your book" onChange={(event) => setBookTitle(event.target.value)} /></label>
          <label className="block text-sm font-semibold">Target publication date<Input className="mt-2" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label>
        </div>
      </div>

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
                  {phase.milestones.length === 0 && <li className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">No milestones yet. Add the first thing that has to happen in this phase.</li>}
                </ul>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addMilestone(phase.id)}><Plus />Add milestone</Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!ready && <p className="mr-auto text-sm text-muted-foreground">Add a working title and at least one milestone to continue.</p>}
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button disabled={!ready || creating} onClick={() => onCreate({ title: bookTitle.trim(), targetDate, phases })}>{creating && <Loader2 className="animate-spin" />}Create the book cycle</Button>
      </div>
    </section>
  );
}
