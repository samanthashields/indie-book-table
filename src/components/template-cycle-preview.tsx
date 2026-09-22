import { useState } from "react";
import { ChevronDown, Circle, Info } from "lucide-react";

import { MilestoneDisclosure } from "@/components/milestone-disclosure";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { requirementLabel } from "@/lib/book-data";
import { phaseStyle } from "@/lib/phase-style";
import type { TemplatePhase } from "@/lib/template-data";
import { cn } from "@/lib/utils";

/**
 * A read-only look at a template, laid out like a real book cycle. Only the first
 * phase is open; the author can open the others, but nothing here can be edited.
 */
export function TemplateCyclePreview({
  title,
  description,
  genre,
  phases,
  onBack,
  onUse,
}: {
  title: string;
  description: string;
  genre?: string | null | undefined;
  phases: TemplatePhase[];
  onBack: () => void;
  onUse: () => void;
}) {
  const visible = phases.filter((phase) => !phase.hidden);
  const [open, setOpen] = useState<string[]>(visible[0] ? [visible[0].id] : []);
  const toggle = (id: string) => setOpen((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-paper p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              {genre && <StatusPill tone="warm">{genre}</StatusPill>}
              <StatusPill>{visible.length} phases</StatusPill>
            </div>
            <h2 className="font-heading text-3xl font-normal">{title}</h2>
            {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
          </div>
          <Button className="shrink-0" onClick={onUse}>Use this template</Button>
        </div>
      </div>

      <div role="note" className="flex gap-3 rounded-2xl border border-teal/40 bg-teal/10 p-5 text-sm leading-6">
        <Info className="mt-0.5 size-5 shrink-0 text-text-teal" />
        <p>
          <span className="font-semibold">You’re looking at a preview.</span> If you use this template, you can then make the
          revisions and edits you need: rename, remove, or add milestones in any phase, and set your book’s title and target
          date, before your cycle is created. You can keep editing each milestone after that, too.
        </p>
      </div>

      <div className="relative space-y-4 before:absolute before:bottom-8 before:left-5 before:top-7 before:w-px before:bg-border">
        {visible.map((phase, index) => {
          const style = phaseStyle(phase.id);
          const expanded = open.includes(phase.id);
          const count = phase.milestones.length;
          return (
            <article key={phase.id} className="relative grid grid-cols-[42px_minmax(0,1fr)] gap-4">
              <span className={cn("z-10 grid size-10 place-items-center rounded-full border-2 font-semibold", index === 0 ? style.marker : "border-border bg-background text-muted-foreground")}>{index + 1}</span>
              <div className={cn("overflow-hidden rounded-2xl border border-border shadow-xs bg-card")}>
                <button type="button" onClick={() => toggle(phase.id)} aria-expanded={expanded} className="flex w-full items-start gap-3 p-5 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-2xl font-normal">{phase.name}</h3>
                      <StatusPill>{phase.mode}</StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", style.chip)}>{count} {count === 1 ? "milestone" : "milestones"}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
                </button>
                {expanded && (
                  <div className="animate-in fade-in slide-in-from-top-1 border-t border-border/70 px-5 pb-4 pt-2 duration-200">
                    {count === 0 ? (
                      <p className="py-3 text-sm text-muted-foreground">No milestones in this phase yet. You can add some when you customise it.</p>
                    ) : (
                      <MilestoneDisclosure items={phase.milestones} className="space-y-1" renderItem={(milestone, milestoneIndex) => (
                        <li key={`${milestone.localId}-${milestoneIndex}`} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl px-2 py-3 text-sm">
                          <Circle className="mt-0.5 size-5 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="font-medium">{milestone.name}</p>
                            {milestone.note && <p className="mt-0.5 text-muted-foreground">{milestone.note}</p>}
                            <p className="mt-1 text-xs text-muted-foreground">{requirementLabel[milestone.requirement]}</p>
                          </div>
                        </li>
                      )} />
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>Back to templates</Button>
        <Button onClick={onUse}>Use this template</Button>
      </div>
    </section>
  );
}
