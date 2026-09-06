import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { END_CYCLE_PROMPTS } from "@/components/end-cycle-dialog";
import { useReflection, useSaveReflection } from "@/lib/book-db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/reflection")({ head: () => ({ meta: [
  { title: "Post-Launch Reflection — Book Cycles" }, { name: "description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:title", content: "Post-Launch Reflection — Book Cycles" }, { property: "og:description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Reflection });

function Reflection() {
  const { bookId } = Route.useParams();
  const reflection = useReflection(bookId);
  const saveReflection = useSaveReflection(bookId);
  const [achieved, setAchieved] = useState<boolean | null>(null);
  const [goalsNotes, setGoalsNotes] = useState("");
  const [onTime, setOnTime] = useState<boolean | null>(null);
  const [nextSteps, setNextSteps] = useState("");
  const [memory, setMemory] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && reflection.data !== undefined) {
      if (reflection.data) {
        setAchieved(reflection.data.achieved_goals);
        setGoalsNotes(reflection.data.goals_notes ?? "");
        setOnTime(reflection.data.published_on_time);
        setNextSteps(reflection.data.next_steps ?? "");
        setMemory(reflection.data.custom?.find((entry) => entry.prompt.startsWith("What do you want to remember"))?.answer ?? "");
      }
      setLoaded(true);
    }
  }, [reflection.data, loaded]);

  const save = () => {
    saveReflection.mutate(
      {
        achieved_goals: achieved,
        goals_notes: goalsNotes || null,
        published_on_time: achieved === false ? onTime : null,
        next_steps: nextSteps || null,
        custom: [
          ...(memory ? [{ prompt: "What do you want to remember for your next book?", answer: memory }] : []),
          ...(reflection.data?.custom ?? []).filter((entry) => !entry.prompt.startsWith("What do you want to remember")),
        ],
      },
      { onSuccess: () => toast.success("Reflection saved"), onError: () => toast.error("Couldn’t save the reflection") },
    );
  };

  const saved = Boolean(reflection.data?.completed_at);
  const endPrompts = Object.values(END_CYCLE_PROMPTS) as string[];
  const endAnswers = (reflection.data?.custom ?? []).filter((entry) => endPrompts.includes(entry.prompt));

  return (
    <AppShell>
      <div className="mb-8 rounded-2xl border border-accent/50 bg-accent/20 p-6 shadow-xs md:p-8"><PartyPopper className="mb-4 size-7 text-chart-1" /><p className="font-serif text-3xl font-normal">You made a book.</p><p className="mt-2 max-w-2xl text-muted-foreground">Take a quiet moment to mark what happened before you decide what comes next.</p></div>
      <PageHeading title="Post-Launch Reflection" description="Your answers stay with this book cycle." />
      {endAnswers.length > 0 && (
        <section className="mb-6 max-w-3xl rounded-2xl border border-teal/40 bg-teal/10 p-6">
          <h2 className="font-serif text-2xl font-normal">End of Cycle Details</h2>
          <dl className="mt-4 space-y-3">
            {endAnswers.map((entry) => (
              <div key={entry.prompt}>
                <dt className="text-sm font-semibold">{entry.prompt}</dt>
                <dd className="text-sm text-muted-foreground">{entry.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <div className="max-w-3xl space-y-5">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-lg font-semibold">Did this book achieve its goals?</h2>
          <div className="mt-3 flex gap-2">{([true, false] as const).map((value) => <Button key={String(value)} type="button" variant={achieved === value ? "default" : "outline"} onClick={() => setAchieved(value)} className="min-w-24">{value ? "Yes" : "No"}</Button>)}</div>
          <Textarea className="mt-3 min-h-28" placeholder="What tells you that?" value={goalsNotes} onChange={(event) => setGoalsNotes(event.target.value)} />
        </section>
        {achieved === false && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-lg font-semibold">Was the book published on or before its target date?</h2>
            <div className="mt-3 flex gap-2">{([true, false] as const).map((value) => <Button key={String(value)} type="button" variant={onTime === value ? "default" : "outline"} onClick={() => setOnTime(value)} className="min-w-24">{value ? "Yes" : "No"}</Button>)}</div>
          </section>
        )}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-lg font-semibold">What are the next steps for this book to be successful?</h2>
          <Textarea className="mt-3 min-h-36" placeholder="Consider reader outreach, reviews, backlist links, or your next book." value={nextSteps} onChange={(event) => setNextSteps(event.target.value)} />
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-lg font-semibold">What do you want to remember for your next book? <span className="font-normal text-muted-foreground">Optional</span></h2>
          <Textarea className="mt-3 min-h-28" value={memory} onChange={(event) => setMemory(event.target.value)} />
        </section>
        <Button onClick={save} disabled={saveReflection.isPending} className={cn(saved && "bg-secondary text-secondary-foreground")}>{saved && <CheckCircle2 />}{saved ? "Update reflection" : "Save reflection"}</Button>
      </div>
    </AppShell>
  );
}
