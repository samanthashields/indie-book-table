import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check, MessageSquareText, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/books/new")({
  head: () => ({ meta: [
    { title: "Create a Book Cycle — Book Cycles" }, { name: "description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:title", content: "Create a Book Cycle — Book Cycles" }, { property: "og:description", content: "Build a publishing plan from scratch, a template, or a guided AI conversation." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: CreateBook,
});

const paths = [
  { id: "coach", title: "Plan with Book Coach", copy: "Talk through your book, budget, and timing. Your coach will draft the cycle.", icon: Sparkles },
  { id: "template", title: "Start from a template", copy: "Choose a genre-specific path and tailor every milestone.", icon: BookOpen },
  { id: "scratch", title: "Build from scratch", copy: "Create each phase and milestone yourself.", icon: MessageSquareText },
];

function CreateBook() {
  const [selected, setSelected] = useState("coach");
  const [step, setStep] = useState(0);
  return <AppShell coachContext="create"><PageHeading title="Create a Book Cycle" description="Begin with what you know. You can adjust the plan as the book changes." />
    {step === 0 ? <><div className="grid gap-4 md:grid-cols-3">{paths.map(({ id, title, copy, icon: Icon }) => <button key={id} onClick={() => setSelected(id)} className={cn("relative min-h-52 border bg-card p-6 text-left transition-colors hover:border-primary", selected === id ? "border-2 border-primary" : "border-border")}><Icon className="mb-8 size-7 text-primary" /><h2 className="font-serif text-2xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>{selected === id && <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}</button>)}</div><div className="mt-6 flex justify-end"><Button onClick={() => setStep(1)}>Continue</Button></div></> :
    <div className="grid gap-8 xl:grid-cols-[1fr_300px]"><section className="border bg-card p-6 md:p-8"><div className="mb-7 flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="size-5" /></span><div><h2 className="font-serif text-2xl font-semibold">Let’s shape the path for your book</h2><p className="mt-1 text-sm text-muted-foreground">A few honest answers are enough to start.</p></div></div><div className="space-y-5"><label className="block text-sm font-semibold">What are you writing?<Input className="mt-2" defaultValue="A literary novel about a family returning to their coastal hometown" /></label><label className="block text-sm font-semibold">What stage is the manuscript in?<Input className="mt-2" defaultValue="Complete first draft, ready for structural feedback" /></label><label className="block text-sm font-semibold">What matters most for this book?<Textarea className="mt-2 min-h-28" defaultValue="I want a thoughtful, professionally edited book that can find readers beyond friends and family." /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Target publication date<Input className="mt-2" type="date" defaultValue="2026-09-18" /></label><label className="block text-sm font-semibold">Total budget<Input className="mt-2" type="number" defaultValue="3500" /></label></div></div><div className="mt-8 flex justify-between"><Button variant="outline" onClick={() => setStep(0)}>Back</Button><Button asChild><Link to="/books/$bookId" params={{ bookId: "salt-lines" }}>Generate my book cycle</Link></Button></div></section><aside className="bg-secondary p-6"><p className="text-sm font-semibold">What your coach will do</p><ul className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground"><li>Build six publishing phases around your target date.</li><li>Recommend where to do it yourself and where specialist help matters.</li><li>Keep one clear requirement for every milestone.</li></ul></aside></div>}
  </AppShell>;
}
