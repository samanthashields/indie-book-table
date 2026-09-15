import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { phaseStyle } from "@/lib/phase-style";
import { PHASE_DEFS } from "@/lib/phase-timeline";
import { PROVISIONS, REQUIREMENT_TYPES, provisionLabel, requirementLabel } from "@/lib/book-data";
import type { Provision, RequirementType } from "@/lib/book-data";
import type { TemplatePhase } from "@/lib/template-data";

export const blankPhases: TemplatePhase[] = PHASE_DEFS.map((def) => ({ id: def.key, name: def.name, mode: def.mode, summary: def.summary, milestones: [] }));

export function CycleBuilder({ title, description, phases: initial, initialTitle, creating, onBack, onCreate }: {
  title: string;
  description: string;
  phases: TemplatePhase[];
  initialTitle?: string;
  creating?: boolean;
  onBack: () => void;
  onCreate: (input: { title: string; targetDate: string; phases: TemplatePhase[] }) => void;
}) {
  const [phases, setPhases] = useState<TemplatePhase[]>(initial);
  const [bookTitle, setBookTitle] = useState(initialTitle ?? "");
  const [targetDate, setTargetDate] = useState("");

  const updateMilestone = (phaseId: string, index: number, patch: Partial<TemplatePhase["milestones"][number]>) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: phase.milestones.map((milestone, i) => i === index ? { ...milestone, ...patch } : milestone) } : phase));

  const addMilestone = (phaseId: string) =>
    setPhases((current) => current.map((phase) => phase.id === phaseId ? { ...phase, milestones: [...phase.milestones, { localId: crypto.randomUUID(), name: "New milestone", requirement: "attach_a_file" as RequirementType, note: "" }] } : phase));

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
                    <li key={milestone.localId} className="space-y-2 rounded-xl bg-card p-4 shadow-xs">
                      <div className="flex items-center gap-3">
                        <Input className="flex-1" value={milestone.name} aria-label="Milestone name" onChange={(event) => updateMilestone(phase.id, milestoneIndex, { name: event.target.value })} />
                        <Button variant="ghost" size="icon" aria-label={`Remove ${milestone.name}`} onClick={() => removeMilestone(phase.id, milestoneIndex)}><Trash2 /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select className="h-11 rounded-xl border border-input bg-card px-3 text-sm" aria-label="Requirement type" value={milestone.requirement} onChange={(event) => updateMilestone(phase.id, milestoneIndex, { requirement: event.target.value as RequirementType })}>
                          {REQUIREMENT_TYPES.map((type) => <option key={type} value={type}>{requirementLabel[type]}</option>)}
                        </select>
                        <Input
                          className="h-11 w-36"
                          aria-label="Track"
                          placeholder="Track (optional)"
                          value={milestone.track ?? ""}
                          onChange={(event) => updateMilestone(phase.id, milestoneIndex, { track: event.target.value || undefined })}
                        />
                        <select
                          className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                          aria-label="Provision"
                          value={milestone.provision ?? ""}
                          onChange={(event) => updateMilestone(phase.id, milestoneIndex, { provision: (event.target.value || undefined) as Provision | undefined })}
                        >
                          <option value="">Provision (optional)</option>
                          {PROVISIONS.map((p) => <option key={p} value={p}>{provisionLabel[p]}</option>)}
                        </select>
                        <select
                          className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                          aria-label="Depends on"
                          value={milestone.dependsOn?.[0] ?? ""}
                          onChange={(event) => updateMilestone(phase.id, milestoneIndex, { dependsOn: event.target.value ? [event.target.value] : [] })}
                        >
                          <option value="">Depends on… (optional)</option>
                          {phase.milestones.filter((m) => m.localId !== milestone.localId).map((m) => <option key={m.localId} value={m.localId}>{m.name}</option>)}
                        </select>
                      </div>
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
