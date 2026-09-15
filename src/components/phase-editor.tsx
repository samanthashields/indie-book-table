import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { phaseStyle } from "@/lib/phase-style";
import { PHASE_DEFS } from "@/lib/phase-timeline";
import { REQUIREMENT_TYPES, requirementLabel } from "@/lib/book-data";
import type { RequirementType } from "@/lib/book-data";
import type { TemplatePhase } from "@/lib/template-data";

const modes: TemplatePhase["mode"][] = ["Loop", "Sprint", "Launch window"];

/** The six phases every standard book cycle uses, ready to drop into a template. */
export const standardPhases: TemplatePhase[] = PHASE_DEFS.map((def) => ({ id: def.key, name: def.name, mode: def.mode, summary: def.summary, milestones: [] }));

const slugId = (value: string) =>
  `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "phase"}-${Math.random().toString(36).slice(2, 6)}`;

/** Full phase and milestone editor shared by the author and admin template editors. */
export function PhaseEditor({ phases, onChange }: { phases: TemplatePhase[]; onChange: (next: TemplatePhase[]) => void }) {
  const [customName, setCustomName] = useState("");

  const patchPhase = (phaseId: string, patch: Partial<TemplatePhase>) =>
    onChange(phases.map((phase) => (phase.id === phaseId ? { ...phase, ...patch } : phase)));

  const removePhase = (phaseId: string) => onChange(phases.filter((phase) => phase.id !== phaseId));

  const movePhase = (index: number, direction: -1 | 1) => {
    const next = [...phases];
    const target = next[index + direction];
    const current = next[index];
    if (!target || !current) return;
    next[index + direction] = current;
    next[index] = target;
    onChange(next);
  };

  const addStandard = (id: string) => {
    const preset = standardPhases.find((phase) => phase.id === id);
    if (!preset || phases.some((phase) => phase.id === preset.id)) return;
    onChange([...phases, { ...preset, milestones: [] }]);
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    onChange([...phases, { id: slugId(name), name, mode: "Sprint", summary: "", milestones: [] }]);
    setCustomName("");
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
          ? { ...phase, milestones: [...phase.milestones, { name: "New milestone", requirement: "attach_a_file" as RequirementType, note: "" }] }
          : phase,
      ),
    );

  const removeMilestone = (phaseId: string, index: number) =>
    onChange(phases.map((phase) => (phase.id === phaseId ? { ...phase, milestones: phase.milestones.filter((_, i) => i !== index) } : phase)));

  const unused = standardPhases.filter((preset) => !phases.some((phase) => phase.id === preset.id));

  return (
    <div className="space-y-4">
      {phases.map((phase, index) => {
        const style = phaseStyle(phase.id);
        return (
          <article key={phase.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
            <span className={`grid size-10 place-items-center rounded-full border-2 font-semibold ${style.marker}`}>{index + 1}</span>
            <div className={`rounded-2xl border border-border p-5 ${style.soft}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-[220px] flex-1 space-y-2">
                  <Input aria-label="Phase name" value={phase.name} onChange={(event) => patchPhase(phase.id, { name: event.target.value })} />
                  <Textarea rows={2} aria-label="Phase description" placeholder="What happens in this phase" value={phase.summary} onChange={(event) => patchPhase(phase.id, { summary: event.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    aria-label="Phase type"
                    className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
                    value={phase.mode}
                    onChange={(event) => patchPhase(phase.id, { mode: event.target.value as TemplatePhase["mode"] })}
                  >
                    {modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Share of the cycle
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      aria-label="Share of the cycle in percent"
                      className="mt-1 h-10"
                      value={phase.ratio ?? ""}
                      placeholder="auto"
                      onChange={(event) => patchPhase(phase.id, { ratio: event.target.value === "" ? undefined : Number(event.target.value) })}
                    />
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Move ${phase.name} up`} disabled={index === 0} onClick={() => movePhase(index, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Move ${phase.name} down`} disabled={index === phases.length - 1} onClick={() => movePhase(index, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${phase.name}`} onClick={() => removePhase(phase.id)}><Trash2 /></Button>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {phase.milestones.map((milestone, milestoneIndex) => (
                  <li key={`${phase.id}-${milestoneIndex}`} className="grid gap-3 rounded-xl bg-card p-4 shadow-xs sm:grid-cols-[minmax(0,1fr)_260px_auto] sm:items-center">
                    <Input value={milestone.name} aria-label="Milestone name" onChange={(event) => patchMilestone(phase.id, milestoneIndex, { name: event.target.value })} />
                    <select
                      className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
                      aria-label="Requirement type"
                      value={milestone.requirement}
                      onChange={(event) => patchMilestone(phase.id, milestoneIndex, { requirement: event.target.value as RequirementType })}
                    >
                      {REQUIREMENT_TYPES.map((type) => <option key={type} value={type}>{requirementLabel[type]}</option>)}
                    </select>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${milestone.name}`} onClick={() => removeMilestone(phase.id, milestoneIndex)}><Trash2 /></Button>
                  </li>
                ))}
                {phase.milestones.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">No milestones yet in this phase.</li>
                )}
              </ul>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => addMilestone(phase.id)}><Plus />Add milestone</Button>
            </div>
          </article>
        );
      })}

      {phases.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">
          No phases yet. Add one of the standard phases, or invent your own.
        </p>
      )}

      <section className="rounded-2xl border-2 border-sage/50 bg-sage/10 p-5">
        <h3 className="font-serif text-xl font-normal">Add a phase</h3>
        {unused.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {unused.map((preset) => (
              <button key={preset.id} type="button" onClick={() => addStandard(preset.id)} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary">
                <Plus className="mr-1 inline size-3.5" />{preset.name}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            aria-label="New phase name"
            placeholder="Your own phase, e.g. Audiobook"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }}
          />
          <Button variant="secondary" onClick={addCustom}><Plus />Add my own phase</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          <StatusPill>Tip</StatusPill> <span className="ml-2">Leave the share blank and the workshop spaces the phase out for you.</span>
        </p>
      </section>
    </div>
  );
}
