import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Check, Eye, Loader2, MessageSquareText, X } from "lucide-react";
import { toast } from "sonner";
import { CoachMark } from "@/components/coach-mark";
import { MilestoneDisclosure } from "@/components/milestone-disclosure";
import { AppShell } from "@/components/app-shell";
import { CoachConversation } from "@/components/coach-conversation";
import { CycleBuilder, blankPhases } from "@/components/cycle-builder";
import { TemplateCyclePreview } from "@/components/template-cycle-preview";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlanStream } from "@/lib/use-plan-stream";
import { toPayload, toManuscriptStatus, toFormats } from "@/lib/coach-intake";
import type { Answers } from "@/lib/coach-intake";
import { useCurrentUser } from "@/lib/use-current-user";
import { useBooks, useCreateBookCycle, useTemplates } from "@/lib/book-db";
import type { TemplatePhase } from "@/lib/template-data";
import { PHASE_DEFS, suggestPhaseRanges } from "@/lib/phase-timeline";
import type { ManuscriptStatus } from "@/lib/phase-timeline";
import { requirementLabel } from "@/lib/book-data";
import { cn } from "@/lib/utils";
import { UseTemplateButton } from "@/components/use-template-dialog";

type PathId = "coach" | "template" | "scratch";
type Search = { path?: PathId; template?: string; book?: string; customise?: boolean };

export const Route = createFileRoute("/_authenticated/books/new")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const path = search["path"];
    const template = search["template"];
    const book = search["book"];
    const customise = search["customise"];
    return {
      ...(path === "coach" || path === "template" || path === "scratch" ? { path } : {}),
      ...(typeof template === "string" ? { template } : {}),
      ...(typeof book === "string" ? { book } : {}),
      ...(customise === true || customise === "true" ? { customise: true } : {}),
    };
  },
  head: () => ({ meta: [
    { title: "Create a Book Cycle — The Indie Book Table" }, { name: "description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:title", content: "Create a Book Cycle — The Indie Book Table" }, { property: "og:description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: CreateBook,
});

const paths = [
  { id: "coach" as const, title: "Plan with Pen", copy: "Talk through your book, budget, and timing. Pen will draft the cycle.", icon: CoachMark, tint: "bg-teal/10" },
  { id: "template" as const, title: "Start from a template", copy: "Choose a genre-specific path and tailor every milestone.", icon: BookOpen, tint: "bg-amber/12" },
  { id: "scratch" as const, title: "Build from scratch", copy: "Shape each phase and milestone yourself, one at a time.", icon: MessageSquareText, tint: "bg-leaf/12" },
];

function CreateBook() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const selected: PathId = search.path ?? "coach";
  const started = Boolean(search.path);
  const [pending, setPending] = useState<PathId>(selected);
  const { plan, isStreaming, error, canceled, start, cancel } = usePlanStream();
  const phases = plan?.phases ?? [];
  const templates = useTemplates();
  const createCycle = useCreateBookCycle();
  const [coachTitle, setCoachTitle] = useState("");
  const [coachDate, setCoachDate] = useState("");
  const [coachAnswers, setCoachAnswers] = useState<Answers>({});
  const currentUser = useCurrentUser();
  const isPaid = currentUser.data?.profile?.plan === "paid";


  const books = useBooks();
  const existingBook = search.book ? books.data?.find((entry) => entry.id === search.book) : undefined;

  const go = (next: Search) => void navigate({ to: "/books/new", search: { ...next, ...(search.book ? { book: search.book } : {}) } });
  const backToChooser = () => void navigate({ to: "/books/new", search: { ...(search.book ? { book: search.book } : {}) } });

  const create = (input: {
    title: string;
    targetDate: string;
    phases: TemplatePhase[];
    templateId?: string;
    genre?: string;
    illustrated?: boolean;
    manuscriptStatus?: ManuscriptStatus;
    budget?: number;
    formats?: string[];
  }) => {
    createCycle.mutate(
      {
        title: input.title,
        phases: input.phases,
        ...(input.targetDate ? { targetDate: input.targetDate } : {}),
        ...(input.templateId ? { templateId: input.templateId } : {}),
        ...(input.genre ? { genre: input.genre } : {}),
        ...(input.illustrated !== undefined ? { illustrated: input.illustrated } : {}),
        ...(input.manuscriptStatus ? { manuscriptStatus: input.manuscriptStatus } : {}),
        ...(input.budget !== undefined ? { budget: input.budget } : {}),
        ...(input.formats && input.formats.length > 0 ? { formats: input.formats } : {}),
        ...(search.book ? { bookId: search.book } : {}),
      },
      {
        onSuccess: (bookId) => void navigate({ to: "/books/$bookId", params: { bookId } }),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn’t create the book cycle"),
      },
    );
  };

  if (!started) {
    return (
      <AppShell coachContext="create">
        <PageHeading title={existingBook ? `Start a cycle for “${existingBook.title}”` : "Create a Book Cycle"} description="Begin with what you know. You can adjust the plan as the book changes." />
        <div className="grid gap-4 md:grid-cols-3">
          {paths.map(({ id, title, copy, icon: Icon, tint }) => (
            <button key={id} onClick={() => setPending(id)} className={cn("relative min-h-52 rounded-2xl border p-6 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", tint, pending === id ? "border-2 border-primary" : "border-border")}>
              <Icon className="mb-8 size-7 text-link" />
              <h2 className="font-heading text-2xl font-normal">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              {pending === id && <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={() => go({ path: pending })}>Continue</Button></div>
      </AppShell>
    );
  }

  if (selected === "template") {
    // Only published, non-archived templates are offered here — matches templates.index.tsx's
    // own filtering. Unpublished drafts (including ones mid-authoring) must not surface in the
    // real create-flow just because a row exists in the table.
    const templateList = (templates.data ?? []).filter((template) => template.published && !template.archived);
    if (!search.template) {
      return (
        <AppShell coachContext="create">
          <PageHeading title="Choose a template" description="Each path is shaped around how that kind of book is really made." />
          {templates.isLoading ? <p className="text-sm text-muted-foreground">Loading templates…</p> : (
            <div className="grid gap-6 lg:grid-cols-2">
              {templateList.map((template, index) => (
                <article key={template.id} className={cn("overflow-hidden rounded-2xl border border-border p-6 shadow-xs", index === 0 ? "bg-amber/8" : "bg-teal/8")}>
                  <div className="mb-3 flex flex-wrap gap-2"><StatusPill tone={index === 0 ? "warm" : "good"}>{template.genre}</StatusPill><StatusPill>{template.phases.length} phases</StatusPill></div>
                  <h2 className="font-heading text-2xl font-normal">{template.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="outline" asChild><Link to="/templates/$templateId" params={{ templateId: template.id }}><Eye />Preview</Link></Button>
                    <UseTemplateButton template={template} bookId={search.book} />
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-start"><Button variant="outline" onClick={backToChooser}>Back</Button></div>
        </AppShell>
      );
    }
    const template = templateList.find((entry) => entry.id === search.template);
    if (templates.isLoading) return <AppShell coachContext="create"><p className="text-sm text-muted-foreground">Loading template…</p></AppShell>;
    if (!template) return <AppShell coachContext="create"><p className="text-sm text-muted-foreground">This template is no longer available.</p></AppShell>;
    if (!search.customise) {
      return (
        <AppShell coachContext="create">
          <PageHeading title={`Preview the ${template.title}`} description="This is how your book cycle will look. Nothing is created until you finish the next step." />
          <TemplateCyclePreview
            key={template.id}
            title={template.title}
            description={template.description ?? ""}
            genre={template.genre}
            phases={template.phases}
            onBack={() => go({ path: "template" })}
            onUse={() => go({ path: "template", template: template.id, customise: true })}
          />
        </AppShell>
      );
    }
    return (
      <AppShell coachContext="create">
        <PageHeading title={`Customise the ${template.title}`} description="Every phase and milestone is yours to rename, remove, or add to." />
        <CycleBuilder
          key={template.id}
          title={template.title}
          description={template.description ?? ""}
          phases={template.phases}
          initialTitle={existingBook?.title ?? ""}
          creating={createCycle.isPending}
          onBack={() => go({ path: "template", template: template.id })}
          onCreate={(input) => create({ ...input, templateId: template.id, ...(template.genre ? { genre: template.genre } : {}), illustrated: template.details.illustrated ?? false })}
        />
      </AppShell>
    );
  }

  if (selected === "scratch") {
    return (
      <AppShell coachContext="create">
        <PageHeading title="Build from scratch" description="Six phases, empty and waiting. Add the milestones that matter for this book." />
        <CycleBuilder
          title="Your book cycle"
          description="Add at least one milestone per phase. Each milestone carries exactly one requirement."
          phases={blankPhases}
          initialTitle={existingBook?.title ?? ""}
          creating={createCycle.isPending}
          onBack={backToChooser}
          onCreate={(input) => create(input)}
        />
      </AppShell>
    );
  }

  const planPhases: TemplatePhase[] = phases.filter((phase) => Boolean(phase?.name)).map((phase, index) => ({
    id: PHASE_DEFS[index]?.key ?? `phase-${index}`,
    name: phase.name!,
    mode: (phase.mode ?? "Sprint") as TemplatePhase["mode"],
    summary: phase.summary ?? "",
    milestones: (phase.milestones ?? []).filter((milestone) => Boolean(milestone?.name)).map((milestone) => ({
      localId: crypto.randomUUID(),
      name: milestone.name!,
      requirement: (milestone.requirement ?? "attach_a_file") as TemplatePhase["milestones"][number]["requirement"],
      note: milestone.description ?? milestone.recommendation ?? "",
    })),
  }));

  // One merged warnings channel: Pen's own plan-specific flags, plus a client-side schedule
  // feasibility check against whatever launch date is currently set (matches the same check
  // useCreateBookCycle runs after creation, surfaced here before the author commits to it).
  // coachDate is seeded from the coach's launchDate answer on generate; after that the field is
  // the single source of truth — clearing it must mean "no date", not "fall back to the answer".
  const effectiveDate = coachDate;
  const feasibilityWarning = (() => {
    if (!effectiveDate) return null;
    const target = new Date(`${effectiveDate}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    const illustrated = /picture book/i.test(coachAnswers["genre"] ?? "");
    return suggestPhaseRanges(new Date(), target, toManuscriptStatus(coachAnswers["status"]), illustrated).warnings[0] ?? null;
  })();
  const planWarnings = [...(plan?.warnings ?? []).filter(Boolean), ...(feasibilityWarning ? [feasibilityWarning] : [])];

  if (!isPaid) {
    return (
      <AppShell coachContext="create">
        <PageHeading title="Plan with Pen" description="Planning with Pen is part of the paid plan." />
        <div className="max-w-2xl rounded-2xl border border-border bg-paper p-8">
          <p className="text-sm leading-7 text-muted-foreground">Your account is on the free plan, which includes every template and building a book cycle from scratch. Upgrade whenever you’d like the coach to shape the plan around your genre, budget and launch date.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => go({ path: "template" })}>Start from a template</Button>
            <Button variant="outline" onClick={() => go({ path: "scratch" })}>Build from scratch</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell coachContext="create">
      <PageHeading title="Plan with Pen" description="Answer a few questions and Pen will draft the whole cycle." />

      <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <CoachConversation generating={isStreaming} onGenerate={(answers) => { setCoachTitle(answers["title"] ?? existingBook?.title ?? ""); setCoachAnswers(answers); if (answers["launchDate"]) setCoachDate(answers["launchDate"]); void start(toPayload(answers)); }} />

          {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
          {canceled && <p className="rounded-xl border border-border bg-secondary p-4 text-sm">You stopped the draft. Everything the coach had written so far is kept below.</p>}
          {isStreaming && <div className="flex justify-end"><Button variant="outline" onClick={cancel}><X className="size-4" />Stop</Button></div>}
          {!plan && !isStreaming && <div className="flex justify-start"><Button variant="outline" onClick={backToChooser}>Back</Button></div>}

          {plan && <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
            <h3 className="font-heading text-2xl font-semibold">Your draft book cycle</h3>
            {isStreaming && <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Pen is writing this now. Phases appear as they arrive.</p>}
            {plan.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.summary}</p>}
            {plan.budgetNote && <p className="mt-4 rounded-xl bg-amber/15 p-4 text-sm leading-6">{plan.budgetNote}</p>}
            {planWarnings.length > 0 && <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">{planWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
            <ol className="mt-8 space-y-6">
              {planPhases.map((phase, index) => <li key={phase.name} className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border p-5 duration-500">
                <div className="flex items-baseline gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                  <h4 className="font-heading text-xl font-semibold">{phase.name}</h4>
                  {phase.mode && <span className="text-xs font-semibold text-muted-foreground">{phase.mode}</span>}
                </div>
                {phase.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{phase.summary}</p>}
                <MilestoneDisclosure items={phase.milestones} className="mt-4 space-y-3" renderItem={(milestone, milestoneIndex) => <li key={`${milestone.name}-${milestoneIndex}`} className="animate-in fade-in rounded-xl bg-secondary p-4 duration-500">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">{requirementLabel[milestone.requirement]}</p>
                    </div>
                    {milestone.note && <p className="mt-1 text-sm leading-6 text-muted-foreground">{milestone.note}</p>}
                  </li>} />
              </li>)}
            </ol>

            {!isStreaming && <div className="mt-8 space-y-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">Working title<Input className="mt-2" value={coachTitle} onChange={(event) => setCoachTitle(event.target.value)} placeholder="The working title of your book" /></label>
                <label className="block text-sm font-semibold">Target publication date<Input className="mt-2" type="date" value={coachDate} onChange={(event) => setCoachDate(event.target.value)} /></label>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={backToChooser}>Change answers</Button>
                <Button
                  disabled={!coachTitle.trim() || planPhases.length === 0 || createCycle.isPending}
                  onClick={() =>
                    create({
                      title: coachTitle.trim(),
                      targetDate: effectiveDate,
                      phases: planPhases,
                      ...(coachAnswers["genre"] ? { genre: coachAnswers["genre"] } : {}),
                      manuscriptStatus: toManuscriptStatus(coachAnswers["status"]),
                      ...(coachAnswers["budget"] ? { budget: Number(coachAnswers["budget"]) || 0 } : {}),
                      formats: toFormats(coachAnswers["formats"]),
                    })
                  }
                >
                  {createCycle.isPending && <Loader2 className="animate-spin" />}Create the book cycle
                </Button>
              </div>
            </div>}
          </section>}
        </div>
        <aside className="rounded-2xl bg-teal/12 p-6"><p className="text-sm font-semibold">What Pen will do</p><ul className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground"><li>Build six publishing phases around your target date.</li><li>Recommend where to do it yourself and where specialist help matters.</li><li>Keep one clear requirement for every milestone.</li></ul></aside>
      </div>
    </AppShell>
  );
}
