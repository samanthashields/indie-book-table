import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MilestoneDisclosure } from "@/components/milestone-disclosure";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { phaseStyle } from "@/lib/phase-style";
import { PHASE_DEFS } from "@/lib/phase-timeline";
import { PROVISIONS, REQUIREMENT_TYPES, provisionLabel, requirementLabel } from "@/lib/book-data";
import type { Provision, RequirementType } from "@/lib/book-data";
import type { TemplatePhase } from "@/lib/template-data";

/** The six phases every standard book cycle uses, ready to drop into a template. */
export const standardPhases: TemplatePhase[] = PHASE_DEFS.map((def) => ({ id: def.key, name: def.name, mode: def.mode, summary: def.summary, milestones: [] }));

/**
 * Full phase and milestone editor shared by the author and admin template editors.
 *
 * Phase-level editing is deliberately limited to display name, display order, and hidden
 * (Group 3 of the reconciliation decisions) — the six phases, their formula weights, and their
 * mode are locked and never added, removed, or invented here. Hiding a phase never deletes its
 * data or excludes it from the timeline math, only what's shown. Milestones within a phase have
 * no such restriction — the object model expects those to be tailored freely.
 */
export function PhaseEditor({ phases, onChange }: { phases: TemplatePhase[]; onChange: (next: TemplatePhase[]) => void }) {
  const patchPhase = (phaseId: string, patch: Partial<TemplatePhase>) =>
    onChange(phases.map((phase) => (phase.id === phaseId ? { ...phase, ...patch } : phase)));

  const movePhase = (index: number, direction: -1 | 1) => {
    const next = [...phases];
    const target = next[index + direction];
    const current = next[index];
    if (!target || !current) return;
    next[index + direction] = current;
    next[index] = target;
    onChange(next);
  };

  const patchMilestone = (phaseId: string, index: number, patch: Partial<TemplatePhase["milestones"][number]>) =>
    onChange(
      phases.map((phase) =>
        phase.id === phaseId
          ? { ...phase, milestones: phase.milestones.map((milestone, i) => (i === index ? { ...milestone, ...patch } : milestone)) }
          : phase,
      ),
    );

  const addMilestone = (phaseId: string) =>
    onChange(
      phases.map((phase) =>
        phase.id === phaseId
          ? { ...phase, milestones: [...phase.milestones, { localId: crypto.randomUUID(), name: "New milestone", requirement: "attach_a_file" as RequirementType, note: "" }] }
          : phase,
      ),
    );

  const removeMilestone = (phaseId: string, index: number) =>
    onChange(phases.map((phase) => (phase.id === phaseId ? { ...phase, milestones: phase.milestones.filter((_, i) => i !== index) } : phase)));

  return (
    <div className="space-y-4">
      {phases.map((phase, index) => {
        const style = phaseStyle(phase.id);
        return (
          <article key={phase.id} className={`grid grid-cols-[42px_minmax(0,1fr)] gap-4 ${phase.hidden ? "opacity-50" : ""}`}>
            <span className={`grid size-10 place-items-center rounded-full border-2 font-semibold ${style.marker}`}>{index + 1}</span>
            <div className={`rounded-2xl border border-border p-5 ${style.soft}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-[220px] flex-1 space-y-2">
                  <Input aria-label="Phase name" value={phase.name} onChange={(event) => patchPhase(phase.id, { name: event.target.value })} />
                  <Textarea rows={2} aria-label="Phase description" placeholder="What happens in this phase" value={phase.summary} onChange={(event) => patchPhase(phase.id, { summary: event.target.value })} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Move ${phase.name} up`} disabled={index === 0} onClick={() => movePhase(index, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Move ${phase.name} down`} disabled={index === phases.length - 1} onClick={() => movePhase(index, 1)}><ArrowDown /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={phase.hidden ? `Show ${phase.name}` : `Hide ${phase.name}`}
                    onClick={() => patchPhase(phase.id, { hidden: !phase.hidden })}
                  >
                    {phase.hidden ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              <MilestoneDisclosure items={phase.milestones} expandOnGrowth className="mt-4 space-y-3" renderItem={(milestone, milestoneIndex) => (
                  <li key={milestone.localId} className="space-y-2 rounded-xl bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <Input className="flex-1" value={milestone.name} aria-label="Milestone name" onChange={(event) => patchMilestone(phase.id, milestoneIndex, { name: event.target.value })} />
                      <Button variant="ghost" size="icon" aria-label={`Remove ${milestone.name}`} onClick={() => removeMilestone(phase.id, milestoneIndex)}><Trash2 /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                        aria-label="Requirement type"
                        value={milestone.requirement}
                        onChange={(event) => patchMilestone(phase.id, milestoneIndex, { requirement: event.target.value as RequirementType })}
                      >
                        {REQUIREMENT_TYPES.map((type) => <option key={type} value={type}>{requirementLabel[type]}</option>)}
                      </select>
                      <Input
                        className="h-11 w-36"
                        aria-label="Track"
                        placeholder="Track (optional)"
                        value={milestone.track ?? ""}
                        onChange={(event) => patchMilestone(phase.id, milestoneIndex, { track: event.target.value || undefined })}
                      />
                      <select
                        className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                        aria-label="Provision"
                        value={milestone.provision ?? ""}
                        onChange={(event) => patchMilestone(phase.id, milestoneIndex, { provision: (event.target.value || undefined) as Provision | undefined })}
                      >
                        <option value="">Provision (optional)</option>
                        {PROVISIONS.map((p) => <option key={p} value={p}>{provisionLabel[p]}</option>)}
                      </select>
                      <select
                        className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                        aria-label="Depends on"
                        value={milestone.dependsOn?.[0] ?? ""}
                        onChange={(event) => patchMilestone(phase.id, milestoneIndex, { dependsOn: event.target.value ? [event.target.value] : [] })}
                      >
                        <option value="">Depends on… (optional)</option>
                        {phase.milestones.filter((m) => m.localId !== milestone.localId).map((m) => <option key={m.localId} value={m.localId}>{m.name}</option>)}
                      </select>
                    </div>
                  </li>
                )} />
              <ul>
                {phase.milestones.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">No milestones yet in this phase.</li>
                )}
              </ul>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => addMilestone(phase.id)}><Plus />Add milestone</Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
