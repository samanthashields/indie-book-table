import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ChevronDown, Circle, Clock3, FileText, FolderOpen, Settings2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppShell } from "@/components/app-shell";
import { BookDetailsBody } from "@/components/book-details-body";
import { MilestoneBody } from "@/components/milestone-body";
import { MilestoneDisclosure } from "@/components/milestone-disclosure";
import { PostLaunchReflectionSection } from "@/components/post-launch-reflection-section";
import { ResourcesBody } from "@/components/resources-body";
import { TeamBody } from "@/components/team-body";
import { DeleteCycleSection } from "@/components/delete-cycle";
import { CycleHeaderMenu } from "@/components/cycle-header-menu";
import { SetupTasksSection } from "@/components/setup-tasks-section";
import { CycleTour } from "@/components/cycle-tour";
import { PostLaunchTasksSection } from "@/components/post-launch-tasks-section";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatDate, useBookTree } from "@/lib/book-db";
import type { Milestone } from "@/lib/book-data";
import { phaseStyle } from "@/lib/phase-style";
import { formatRange, needsFollowUpLabel, pacing } from "@/lib/phase-timeline";
import type { NeedsFollowUp } from "@/lib/phase-timeline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/")({
  head: () => ({ meta: [
    { title: "Book Overview — The Indie Book Table" }, { name: "description", content: "See the phases, milestones, collaborators, and next actions for your book." },
    { property: "og:title", content: "Book Overview — The Indie Book Table" }, { property: "og:description", content: "See the phases, milestones, collaborators, and next actions for your book." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: BookOverview,
});

const pacingCopy = { done: "Wrapped up", current: "You’re in this phase now", behind: "Running past the suggested window", ahead: "Suggested window" } as const;

type OverviewDrawer =
  | { kind: "milestone"; milestone: Milestone; phaseName: string }
  | { kind: "details" }
  | { kind: "team" }
  | { kind: "resources" };

const needsFollowUpTone: Record<NeedsFollowUp, "neutral" | "good" | "warm" | "danger"> = {
  behind_pace: "danger",
  no_progress: "warm",
  launch_approaching: "warm",
  on_track: "good",
};

function BookOverview() {
  const { bookId } = Route.useParams();
  const { data, isLoading } = useBookTree(bookId);
  const [manualOpen, setManualOpen] = useState<string[] | null>(null);
  const [tourKey, setTourKey] = useState(0);
  const [drawer, setDrawer] = useState<OverviewDrawer | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [reflectionStarted, setReflectionStarted] = useState(false);
  const [phasesOpenWhenEnded, setPhasesOpenWhenEnded] = useState(false);

  if (isLoading) return <AppShell><p className="text-sm text-muted-foreground">Loading your book…</p></AppShell>;
  if (!data) return <AppShell><p className="text-sm text-muted-foreground">This book isn’t available for your account.</p></AppShell>;

  const { book, phases, timeline, collaboratorCount, needsFollowUp } = data;
  // Ending the cycle replaces the phase timeline and setup tasks with the reflection section —
  // once the cycle is actually complete this is permanent, but the author can also step into it
  // early (before answering the closing questions) via the confirmation below.
  const reflecting = book.status === "complete" || reflectionStarted;
  const allMilestones = phases.flatMap((phase) => phase.milestones);
  const doneCount = allMilestones.filter((milestone) => milestone.status === "Complete").length;
  const progress = allMilestones.length ? Math.round((doneCount / allMilestones.length) * 100) : 0;
  const next = allMilestones.find((milestone) => milestone.status === "In progress") ?? allMilestones.find((milestone) => milestone.status !== "Complete");
  const target = formatDate(book.target_publication_date) || "No target date";

  // Open the phase holding the next milestone until the author opens or closes a phase themselves.
  const visiblePhases = phases.filter((phase) => !phase.hidden);
  const nextPhase = visiblePhases.find((phase) => phase.milestones.some((milestone) => milestone.id === next?.id)) ?? visiblePhases.find((phase) => phase.milestones.some((milestone) => milestone.status !== "Complete"));
  const open = manualOpen ?? (nextPhase ? [nextPhase.id] : []);
  const toggle = (id: string) => setManualOpen(open.includes(id) ? open.filter((value) => value !== id) : [...open, id]);

  return (
    <AppShell>
      <header id="tour-header" className="mb-8 flex flex-col gap-6 border-b border-border/70 pb-7">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <StatusPill tone="good">{book.status === "active" ? "In progress" : book.status}</StatusPill>
            {book.genre && <StatusPill tone="warm">{book.genre}</StatusPill>}
            {needsFollowUp !== "on_track" && <StatusPill tone={needsFollowUpTone[needsFollowUp]}>{needsFollowUpLabel[needsFollowUp]}</StatusPill>}
          </div>
          <h1 className="font-heading text-4xl font-normal md:text-5xl">{book.title}</h1>
          <p className="mt-1 text-muted-foreground">by {book.pen_name || "you"}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDrawer({ kind: "details" })}><Settings2 />Book details</Button>
            <Button variant="outline" onClick={() => setDrawer({ kind: "team" })}><Users />Collaborators</Button>
            <Button variant="outline" onClick={() => setDrawer({ kind: "resources" })}><FolderOpen />Resources</Button>
          </div>
          <div className="flex items-center gap-2">
            {!reflecting && <Button variant="secondary" onClick={() => setConfirmEnd(true)}><FileText />End book cycle & reflect</Button>}
            <CycleHeaderMenu
              bookId={bookId}
              authorId={book.author_id}
              title={book.title}
              total={allMilestones.length}
              done={doneCount}
              ended={book.status === "complete"}
              onTour={() => setTourKey((key) => key + 1)}
              onRestart={() => { setReflectionStarted(false); setPhasesOpenWhenEnded(false); }}
            />
          </div>
        </div>
      </header>

      <section id="tour-progress" className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs md:grid-cols-[1fr_2fr]">
        <div><p className="text-sm text-muted-foreground">Overall progress</p><p className="mt-1 font-heading text-4xl font-normal">{progress}%</p><Progress value={progress} className="mt-3" /></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-amber/15 p-4"><CalendarDays className="mb-2 size-4 text-amber" /><p className="text-xs text-muted-foreground">Target publication</p><p className="font-semibold">{target}</p></div>
          <div className="rounded-xl bg-teal/15 p-4"><Clock3 className="mb-2 size-4 text-text-teal" /><p className="text-xs text-muted-foreground">Next action</p><p className="font-semibold">{next?.name ?? "All done"}</p></div>
          <div className="rounded-xl bg-leaf/18 p-4"><Users className="mb-2 size-4 text-text-leaf" /><p className="text-xs text-muted-foreground">Team</p><p className="font-semibold">{collaboratorCount === 0 ? "Just you" : `${collaboratorCount} collaborator${collaboratorCount === 1 ? "" : "s"}`}</p></div>
        </div>
      </section>

      {reflecting && <PostLaunchReflectionSection bookId={bookId} authorId={book.author_id} />}

      {reflecting && <PostLaunchTasksSection bookId={bookId} authorId={book.author_id} />}

      <SetupTasksSection bookId={bookId} authorId={book.author_id} book={book} forceClosed={reflecting} onEditDetails={() => setDrawer({ kind: "details" })} />

      {!reflecting && timeline.warnings.length > 0 && <p className="mb-6 rounded-2xl border border-clay/40 bg-clay/12 p-5 text-sm leading-6">{timeline.warnings[0]}</p>}

      {(() => {
        const phasesList = (
          <div className="relative space-y-4 before:absolute before:bottom-8 before:left-5 before:top-7 before:w-px before:bg-border">
            {phases.filter((phase) => !phase.hidden).map((phase, index) => {
              const style = phaseStyle(phase.id);
              const range = timeline.ranges[phase.id as keyof typeof timeline.ranges];
              const complete = phase.milestones.length > 0 && phase.milestones.every((milestone) => milestone.status === "Complete");
              const state = pacing(range, complete);
              const expanded = open.includes(phase.id);
              return (
                <article key={phase.id} className="relative grid grid-cols-[42px_minmax(0,1fr)] gap-4">
                  <span className={cn("z-10 grid size-10 place-items-center rounded-full border-2 font-semibold", state === "ahead" ? "border-border bg-background text-muted-foreground" : style.marker)}>{index + 1}</span>
                  <div className={cn("overflow-hidden rounded-2xl border border-border shadow-xs bg-card")}>
                    <button onClick={() => toggle(phase.id)} aria-expanded={expanded} className="flex w-full items-start gap-3 p-5 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-2xl font-normal">{phase.name}</h3>
                          <StatusPill>{phase.mode}</StatusPill>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-md border px-3 py-1 text-xs font-semibold", style.chip)}>{range ? formatRange(range) : complete ? "Finished before this plan" : "Not scheduled"}</span>
                          <span className={cn("rounded-md px-3 py-1 text-xs font-semibold", state === "behind" ? "bg-clay/18 text-foreground" : state === "current" ? "bg-teal/20" : state === "done" ? "bg-leaf/20" : "bg-secondary text-muted-foreground")}>{pacingCopy[state]}</span>
                          <span className="text-xs text-muted-foreground">{phase.milestones.filter((m) => m.status === "Complete").length}/{phase.milestones.length} complete</span>
                        </div>
                      </div>
                      <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
                    </button>
                    {expanded && (
                      <div className="animate-in fade-in slide-in-from-top-1 border-t border-border/70 px-5 pb-4 pt-2 duration-200">
                        <MilestoneDisclosure items={phase.milestones} reveal={(milestone) => milestone.id === next?.id} className="space-y-1" renderItem={(milestone) => (
                          <li key={milestone.id}><button onClick={() => setDrawer({ kind: "milestone", milestone: { ...milestone }, phaseName: phase.name })} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left text-sm transition-colors hover:bg-secondary hover:text-link">
                            {milestone.status === "Complete" ? <CheckCircle2 className={cn("size-5", style.dot)} /> : <Circle className="size-5 text-muted-foreground" />}
                            <span className="min-w-0 font-medium">{milestone.name}</span>
                            {milestone.due && <span className="text-muted-foreground">{milestone.due}</span>}
                          </button></li>
                        )} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        );

        if (!reflecting) {
          return (
            <section id="tour-phases" className="mb-10">
              <div className="mb-5">
                <h2 className="font-heading text-3xl font-normal">Your publishing path</h2>
                <p className="mt-1 text-sm text-muted-foreground">Six phases from private manuscript to published book, paced around {target}.</p>
              </div>
              {phasesList}
            </section>
          );
        }

        return (
          <section id="tour-phases" className="mb-10 rounded-2xl border border-border bg-card shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
              <div className="min-w-0">
                <h2 className="font-heading text-2xl font-normal">Your publishing path</h2>
                <p className="mt-1 text-sm text-muted-foreground">Six phases from private manuscript to published book, paced around {target}.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPhasesOpenWhenEnded((value) => !value)} aria-expanded={phasesOpenWhenEnded}>
                {phasesOpenWhenEnded ? "Hide" : "Show"}
                <ChevronDown className={cn("transition-transform duration-200", phasesOpenWhenEnded && "rotate-180")} />
              </Button>
            </div>
            {phasesOpenWhenEnded && <div className="border-t border-border/70 px-6 pb-6 pt-4">{phasesList}</div>}
          </section>
        );
      })()}

      {!reflecting && <PostLaunchTasksSection bookId={bookId} authorId={book.author_id} />}

      <DeleteCycleSection bookId={bookId} authorId={book.author_id} title={book.title} total={allMilestones.length} done={doneCount} />

      <CycleTour replayKey={tourKey} />

      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this book cycle?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm leading-6">
                <p>You’ll answer a few closing questions — whether it was completed and published — plus a short reflection. The phase timeline and recommended tasks step aside while you do.</p>
                <p>Nothing is deleted, and “{book.title}” stays on your shelf either way.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <Button onClick={() => { setReflectionStarted(true); setConfirmEnd(false); }}>
              <FileText />End book cycle
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={Boolean(drawer)} onOpenChange={(next) => { if (!next) setDrawer(null); }}>
        <SheetContent side="right" dim={false} className="w-full overflow-y-auto border-l-2 shadow-2xl sm:max-w-xl">
          <SheetTitle className="sr-only">
            {drawer?.kind === "milestone" ? drawer.milestone.name : drawer?.kind === "details" ? "Book details" : drawer?.kind === "team" ? "Collaborators" : drawer?.kind === "resources" ? "Resources" : "Panel"}
          </SheetTitle>
          {drawer?.kind === "milestone" && <MilestoneBody key={drawer.milestone.id} bookId={bookId} milestone={drawer.milestone} phaseName={drawer.phaseName} compact />}
          {drawer?.kind === "details" && <BookDetailsBody bookId={bookId} compact />}
          {drawer?.kind === "team" && <TeamBody bookId={bookId} compact />}
          {drawer?.kind === "resources" && <ResourcesBody bookId={bookId} compact />}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
