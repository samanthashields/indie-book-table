import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check, Loader2, MessageSquareText, X } from "lucide-react";
import { CoachMark } from "@/components/coach-mark";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlanStream } from "@/lib/use-plan-stream";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/books/new")({
  head: () => ({ meta: [
    { title: "Create a Book Cycle — Book Cycles" }, { name: "description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:title", content: "Create a Book Cycle — Book Cycles" }, { property: "og:description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: CreateBook,
});

const paths = [
  { id: "coach", title: "Plan with Book Coach", copy: "Talk through your book, budget, and timing. Your coach will draft the cycle.", icon: CoachMark },
  { id: "template", title: "Start from a template", copy: "Choose a genre-specific path and tailor every milestone.", icon: BookOpen },
  { id: "scratch", title: "Build from scratch", copy: "Create each phase and milestone yourself.", icon: MessageSquareText },
];

function CreateBook() {
  const [selected, setSelected] = useState("coach");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    premise: "A literary novel about a family returning to their coastal hometown",
    genre: "Literary fiction",
    stage: "Complete first draft, ready for structural feedback",
    goals: "I want a thoughtful, professionally edited book that can find readers beyond friends and family.",
    targetDate: "2026-09-18",
    budget: "3500",
  });
  const { plan, isStreaming, error, canceled, start, cancel } = usePlanStream();
  const phases = plan?.phases ?? [];

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return <AppShell coachContext="create"><PageHeading title="Create a Book Cycle" description="Begin with what you know. You can adjust the plan as the book changes." />
    {step === 0 ? <><div className="grid gap-4 md:grid-cols-3">{paths.map(({ id, title, copy, icon: Icon }) => <button key={id} onClick={() => setSelected(id)} className={cn("relative min-h-52 border bg-card p-6 text-left transition-colors hover:border-primary", selected === id ? "border-2 border-primary" : "border-border")}><Icon className="mb-8 size-7 text-primary" /><h2 className="font-serif text-2xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>{selected === id && <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}</button>)}</div><div className="mt-6 flex justify-end"><Button onClick={() => setStep(1)}>Continue</Button></div></> :
    <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
      <section className="border bg-card p-6 md:p-8">
        <div className="mb-7 flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><CoachMark className="size-5" /></span><div><h2 className="font-serif text-2xl font-semibold">Let’s shape the path for your book</h2><p className="mt-1 text-sm text-muted-foreground">A few honest answers are enough to start.</p></div></div>
        <div className="space-y-5">
          <label className="block text-sm font-semibold">What are you writing?<Input className="mt-2" value={form.premise} onChange={set("premise")} /></label>
          <label className="block text-sm font-semibold">Genre or category<Input className="mt-2" value={form.genre} onChange={set("genre")} /></label>
          <label className="block text-sm font-semibold">What stage is the manuscript in?<Input className="mt-2" value={form.stage} onChange={set("stage")} /></label>
          <label className="block text-sm font-semibold">What matters most for this book?<Textarea className="mt-2 min-h-28" value={form.goals} onChange={set("goals")} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Target publication date<Input className="mt-2" type="date" value={form.targetDate} onChange={set("targetDate")} /></label>
            <label className="block text-sm font-semibold">Total budget<Input className="mt-2" type="number" min="0" value={form.budget} onChange={set("budget")} /></label>
          </div>
        </div>
        {error && <p className="mt-6 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
        {canceled && <p className="mt-6 border border-border bg-secondary p-4 text-sm">You stopped the draft. Everything the coach had written so far is kept below.</p>}
        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button variant="outline" onClick={() => setStep(0)} disabled={isStreaming}>Back</Button>
          <div className="flex gap-3">
            {isStreaming && <Button variant="outline" onClick={cancel}><X className="size-4" />Stop</Button>}
            <Button onClick={() => void start({ ...form, budget: Number(form.budget) || 0 })} disabled={isStreaming}>{isStreaming ? <><Loader2 className="animate-spin" />Drafting your plan</> : plan ? "Draft it again" : "Generate my book cycle"}</Button>
          </div>
        </div>

        {plan && <div className="mt-10 border-t border-border pt-8">
          <h3 className="font-serif text-2xl font-semibold">Your draft book cycle</h3>
          {isStreaming && <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Your coach is writing this now. Phases appear as they arrive.</p>}
          {plan.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.summary}</p>}
          {plan.budgetNote && <p className="mt-4 bg-secondary p-4 text-sm leading-6">{plan.budgetNote}</p>}
          {(plan.pitfalls?.length ?? 0) > 0 && <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">{plan.pitfalls!.filter(Boolean).map((pitfall) => <li key={pitfall}>{pitfall}</li>)}</ul>}
          <ol className="mt-8 space-y-6">
            {phases.filter((phase) => Boolean(phase?.name)).map((phase, index) => <li key={phase.name} className="animate-in fade-in slide-in-from-bottom-2 border border-border p-5 duration-500">
              <div className="flex items-baseline gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                <h4 className="font-serif text-xl font-semibold">{phase.name}</h4>
                {phase.mode && <span className="text-xs font-semibold text-muted-foreground">{phase.mode}</span>}
              </div>
              {phase.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{phase.summary}</p>}
              <ul className="mt-4 space-y-3">
                {(phase.milestones ?? []).filter((milestone) => Boolean(milestone?.name)).map((milestone) => <li key={milestone.name} className="animate-in fade-in bg-secondary p-4 duration-500">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{milestone.name}</p>
                    <p className="text-xs text-muted-foreground">{milestone.requirement}{milestone.due ? ` · due ${milestone.due}` : ""}{milestone.approvalRequired ? " · approval required" : ""}</p>
                  </div>
                  {milestone.description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{milestone.description}</p>}
                  {milestone.recommendation && <p className="mt-2 text-sm leading-6">{milestone.recommendation}</p>}
                </li>)}
              </ul>
            </li>)}
          </ol>

          <div className="mt-8 flex justify-end"><Button asChild><Link to="/books/$bookId" params={{ bookId: "salt-lines" }}>Start this book cycle</Link></Button></div>
        </div>}
      </section>
      <aside className="bg-secondary p-6"><p className="text-sm font-semibold">What your coach will do</p><ul className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground"><li>Build six publishing phases around your target date.</li><li>Recommend where to do it yourself and where specialist help matters.</li><li>Keep one clear requirement for every milestone.</li></ul></aside>
    </div>}
  </AppShell>;
}
