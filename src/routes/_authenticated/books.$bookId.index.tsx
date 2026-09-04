import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ChevronDown, Circle, Clock3, FileText, Settings2, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MilestoneBody } from "@/components/milestone-body";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatDate, useBookTree } from "@/lib/book-db";
import type { Milestone } from "@/lib/book-data";
import { phaseStyle } from "@/lib/phase-style";
import { formatRange, pacing } from "@/lib/phase-timeline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/")({
  head: () => ({ meta: [
    { title: "Book Overview — Book Cycles" }, { name: "description", content: "See the phases, milestones, collaborators, and next actions for your book." },
    { property: "og:title", content: "Book Overview — Book Cycles" }, { property: "og:description", content: "See the phases, milestones, collaborators, and next actions for your book." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: BookOverview,
});

const pacingCopy = { done: "Wrapped up", current: "You’re in this phase now", behind: "Running past the suggested window", ahead: "Suggested window" } as const;

function BookOverview() {
  const { bookId } = Route.useParams();
  const { data, isLoading } = useBookTree(bookId);
  const [open, setOpen] = useState<string[]>(["editing"]);
  const [drawer, setDrawer] = useState<{ milestone: Milestone; phaseName: string } | null>(null);
  const toggle = (id: string) => setOpen((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  if (isLoading) return <AppShell><p className="text-sm text-muted-foreground">Loading your book…</p></AppShell>;
  if (!data) return <AppShell><p className="text-sm text-muted-foreground">This book isn’t available for your account.</p></AppShell>;

  const { book, phases, timeline, collaboratorCount } = data;
  const allMilestones = phases.flatMap((phase) => phase.milestones);
  const doneCount = allMilestones.filter((milestone) => milestone.status === "Complete").length;
  const progress = allMilestones.length ? Math.round((doneCount / allMilestones.length) * 100) : 0;
  const next = allMilestones.find((milestone) => milestone.status === "In progress") ?? allMilestones.find((milestone) => milestone.status !== "Complete");
  const target = formatDate(book.target_publication_date) || "No target date";

  return (
    <AppShell>
      <header className="mb-8 flex flex-col gap-6 border-b border-border/70 pb-7 md:flex-row md:items-end md:justify-between">
        <div className="flex gap-5">
          {book.cover_url ? (
            <img src={book.cover_url} alt={`Cover artwork for ${book.title}`} width={768} height={1152} className="aspect-[2/3] w-20 rounded-lg object-cover shadow-sm" />
          ) : (
            <span className="grid aspect-[2/3] w-20 shrink-0 place-items-center rounded-lg bg-teal/15 font-serif text-3xl text-primary shadow-sm">{book.title.charAt(0)}</span>
          )}
          <div>
            <div className="mb-2 flex flex-wrap gap-2"><StatusPill tone="good">{book.status === "active" ? "In progress" : book.status}</StatusPill>{book.genre && <StatusPill tone="warm">{book.genre}</StatusPill>}</div>
            <h1 className="font-serif text-4xl font-normal md:text-5xl">{book.title}</h1>
            <p className="mt-1 text-muted-foreground">by {book.pen_name || "you"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link to="/books/$bookId/details" params={{ bookId }}><Settings2 />Book details</Link></Button>
          <Button variant="outline" asChild><Link to="/books/$bookId/reflection" params={{ bookId }}><FileText />Reflection</Link></Button>
        </div>
      </header>

      <section className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs md:grid-cols-[1fr_2fr]">
        <div><p className="text-sm text-muted-foreground">Overall progress</p><p className="mt-1 font-serif text-4xl font-normal">{progress}%</p><Progress value={progress} className="mt-3" /></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-amber/15 p-4"><CalendarDays className="mb-2 size-4 text-amber" /><p className="text-xs text-muted-foreground">Target publication</p><p className="font-semibold">{target}</p></div>
          <div className="rounded-xl bg-teal/15 p-4"><Clock3 className="mb-2 size-4 text-teal" /><p className="text-xs text-muted-foreground">Next action</p><p className="font-semibold">{next?.name ?? "All done"}</p></div>
          <div className="rounded-xl bg-leaf/18 p-4"><Users className="mb-2 size-4 text-leaf" /><p className="text-xs text-muted-foreground">Team</p><p className="font-semibold">{collaboratorCount === 0 ? "Just you" : `${collaboratorCount} collaborator${collaboratorCount === 1 ? "" : "s"}`}</p></div>
        </div>
      </section>

      {timeline.warnings.length > 0 && <p className="mb-6 rounded-2xl border border-clay/40 bg-clay/12 p-5 text-sm leading-6">{timeline.warnings[0]}</p>}

      <section>
        <div className="mb-5">
          <h2 className="font-serif text-3xl font-normal">Your publishing path</h2>
          <p className="mt-1 text-sm text-muted-foreground">Six phases from private manuscript to published book, paced around {target}.</p>
        </div>
        <div className="relative space-y-4 before:absolute before:bottom-8 before:left-5 before:top-7 before:w-px before:bg-border">
          {phases.map((phase, index) => {
            const style = phaseStyle(phase.id);
            const range = timeline.ranges[phase.id as keyof typeof timeline.ranges];
            const complete = phase.milestones.length > 0 && phase.milestones.every((milestone) => milestone.status === "Complete");
            const state = pacing(range, complete);
            const expanded = open.includes(phase.id);
            return (
              <article key={phase.id} className="relative grid grid-cols-[42px_minmax(0,1fr)] gap-4">
                <span className={cn("z-10 grid size-10 place-items-center rounded-full border-2 font-semibold", state === "ahead" ? "border-border bg-background text-muted-foreground" : style.marker)}>{index + 1}</span>
                <div className={cn("overflow-hidden rounded-2xl border border-border shadow-xs", expanded ? "bg-card" : style.soft)}>
                  <button onClick={() => toggle(phase.id)} aria-expanded={expanded} className="flex w-full items-start gap-3 p-5 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-2xl font-normal">{phase.name}</h3>
                        <StatusPill>{phase.mode}</StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", style.chip)}>{range ? formatRange(range) : complete ? "Finished before this plan" : "Not scheduled"}</span>
                        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", state === "behind" ? "bg-clay/18 text-foreground" : state === "current" ? "bg-teal/20" : state === "done" ? "bg-leaf/20" : "bg-secondary text-muted-foreground")}>{pacingCopy[state]}</span>
                        <span className="text-xs text-muted-foreground">{phase.milestones.filter((m) => m.status === "Complete").length}/{phase.milestones.length} complete</span>
                      </div>
                    </div>
                    <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
                  </button>
                  {expanded && (
                    <div className="animate-in fade-in slide-in-from-top-1 space-y-1 border-t border-border/70 px-5 pb-4 pt-2 duration-200">
                      {phase.milestones.map((milestone) => (
                        <button key={milestone.id} onClick={() => setDrawer({ milestone: { ...milestone }, phaseName: phase.name })} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left text-sm transition-colors hover:bg-secondary hover:text-primary">
                          {milestone.status === "Complete" ? <CheckCircle2 className={cn("size-5", style.dot)} /> : <Circle className="size-5 text-muted-foreground" />}
                          <span className="min-w-0 font-medium">{milestone.name}</span>
                          {milestone.due && <span className="text-muted-foreground">{milestone.due}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Sheet open={Boolean(drawer)} onOpenChange={(next) => { if (!next) setDrawer(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetTitle className="sr-only">{drawer?.milestone.name ?? "Milestone"}</SheetTitle>
          {drawer && <MilestoneBody key={drawer.milestone.id} bookId={bookId} milestone={drawer.milestone} phaseName={drawer.phaseName} compact />}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
