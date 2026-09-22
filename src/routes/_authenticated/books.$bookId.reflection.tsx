import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAchievements } from "@/lib/achievements";
import { useBookTree, useReflection, useSaveReflection, useUpdateBook } from "@/lib/book-db";
import { celebrate } from "@/lib/celebrate";
import { syncChallenges } from "@/lib/challenges.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/reflection")({ head: () => ({ meta: [
  { title: "Post-Launch Reflection — The Indie Book Table" }, { name: "description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:title", content: "Post-Launch Reflection — The Indie Book Table" }, { property: "og:description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Reflection });

/**
 * One reflection flow, not two. This used to be split across this page and a separate
 * EndCycleDialog modal triggered from the book overview — both wrote into the same
 * reflections.custom jsonb array, from two different UI moments, with overlapping
 * "did it finish / did it publish" questions. Merged here: ending the cycle is a section
 * of this page, not a separate dialog elsewhere.
 */
export const END_CYCLE_PROMPTS = {
  completed: "Was this book cycle completed?",
  published: "Was this book published?",
  notPublished: "Why was this book not published?",
  notComplete: "Why was this book cycle not complete?",
  notes: "Notes about this cycle to come back to later",
} as const;

function YesNo({ value, onChange }: { value: boolean | null; onChange: (value: boolean) => void }) {
  return (
    <div className="mt-3 flex gap-2">
      {([true, false] as const).map((option) => (
        <Button key={String(option)} type="button" className="min-w-24" variant={value === option ? "default" : "outline"} onClick={() => onChange(option)}>
          {option ? "Yes" : "No"}
        </Button>
      ))}
    </div>
  );
}

function Reflection() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const book = useBookTree(bookId);
  const reflection = useReflection(bookId);
  const saveReflection = useSaveReflection(bookId);
  const updateBook = useUpdateBook(bookId);
  const achievements = useAchievements();
  const sync = useServerFn(syncChallenges);
  const queryClient = useQueryClient();

  const [achieved, setAchieved] = useState<boolean | null>(null);
  const [goalsNotes, setGoalsNotes] = useState("");
  const [onTime, setOnTime] = useState<boolean | null>(null);
  const [nextSteps, setNextSteps] = useState("");
  const [memory, setMemory] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [completed, setCompleted] = useState<boolean | null>(null);
  const [published, setPublished] = useState<boolean | null>(null);
  const [notPublished, setNotPublished] = useState("");
  const [notComplete, setNotComplete] = useState("");
  const [endNotes, setEndNotes] = useState("");
  const [justEnded, setJustEnded] = useState(false);

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

  const isEnded = book.data?.book.status === "complete";
  const endReady =
    completed === true ? published === true || (published === false && notPublished.trim().length > 0) : completed === false && notComplete.trim().length > 0;

  const endCycle = () => {
    const existing = (reflection.data?.custom ?? []).filter(
      (entry) => !Object.values(END_CYCLE_PROMPTS).includes(entry.prompt as (typeof END_CYCLE_PROMPTS)[keyof typeof END_CYCLE_PROMPTS]),
    );
    const answers = [
      { prompt: END_CYCLE_PROMPTS.completed, answer: completed ? "Yes" : "No" },
      ...(completed ? [{ prompt: END_CYCLE_PROMPTS.published, answer: published ? "Yes" : "No" }] : []),
      ...(completed && published === false && notPublished.trim() ? [{ prompt: END_CYCLE_PROMPTS.notPublished, answer: notPublished.trim() }] : []),
      ...(completed === false && notComplete.trim() ? [{ prompt: END_CYCLE_PROMPTS.notComplete, answer: notComplete.trim() }] : []),
      ...(endNotes.trim() ? [{ prompt: END_CYCLE_PROMPTS.notes, answer: endNotes.trim() }] : []),
    ];

    saveReflection.mutate(
      {
        achieved_goals: reflection.data?.achieved_goals ?? achieved,
        goals_notes: reflection.data?.goals_notes ?? (goalsNotes || null),
        published_on_time: reflection.data?.published_on_time ?? onTime,
        next_steps: reflection.data?.next_steps ?? (nextSteps || null),
        custom: [...answers, ...existing],
      },
      {
        onSuccess: () => {
          updateBook.mutate(
            { status: "complete", ...(completed && published ? { shelf_status: "published" } : {}) },
            {
              onSuccess: () => {
                setJustEnded(true);
                void queryClient.invalidateQueries({ queryKey: ["book", bookId] });
                void sync({ data: undefined }).then(() => queryClient.invalidateQueries({ queryKey: ["challenges"] })).catch(() => undefined);
                if (completed && published) void celebrate();
                else toast.success("Book cycle closed");
              },
              onError: () => toast.error("Couldn’t close the cycle"),
            },
          );
        },
        onError: () => toast.error("Couldn’t save your answers"),
      },
    );
  };

  const saved = Boolean(reflection.data?.completed_at);
  const endPrompts = Object.values(END_CYCLE_PROMPTS) as string[];
  const endAnswers = (reflection.data?.custom ?? []).filter((entry) => endPrompts.includes(entry.prompt));
  const celebrating = Boolean(completed && published);
  const total = achievements.publishedCount;

  return (
    <AppShell>
      {(isEnded || justEnded) && (
        <div className="mb-8 rounded-2xl border border-accent/50 bg-accent/20 p-6 shadow-xs md:p-8">
          {justEnded ? (
            <>
              <div className="flex items-center gap-2">{celebrating && <PartyPopper className="size-7 text-chart-1" />}<p className="font-heading text-3xl font-normal">{celebrating ? "Congratulations — your book is out in the world" : "Your book cycle is closed"}</p></div>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {celebrating
                  ? total > 0 ? `That makes ${total} published ${total === 1 ? "book" : "books"} on your table.` : "Your book now has a place on your table."
                  : "This one didn’t reach publication, and that still counts. Everything you learned is saved below."}
              </p>
              {celebrating && <Button className="mt-4" onClick={() => void navigate({ to: "/my-table" })}>See my table</Button>}
            </>
          ) : (
            <>
              <PartyPopper className="mb-4 size-7 text-chart-1" />
              <p className="font-heading text-3xl font-normal">You made a book.</p>
              <p className="mt-2 max-w-2xl text-muted-foreground">Take a quiet moment to mark what happened before you decide what comes next.</p>
            </>
          )}
        </div>
      )}
      <PageHeading title="Post-Launch Reflection" description="Your answers stay with this book cycle." />

      {!isEnded && !justEnded && (
        <section className="mb-6 max-w-3xl rounded-2xl border border-teal/40 bg-teal/10 p-6">
          <h2 className="font-heading text-2xl font-normal">End this book cycle</h2>
          <p className="mt-1 text-sm text-muted-foreground">When you're ready to close it out — whether it published or not.</p>
          <div className="mt-4 space-y-5">
            <section>
              <h3 className="text-sm font-semibold">{END_CYCLE_PROMPTS.completed}</h3>
              <YesNo value={completed} onChange={(value) => { setCompleted(value); setPublished(null); }} />
            </section>
            {completed === true && (
              <section>
                <h3 className="text-sm font-semibold">{END_CYCLE_PROMPTS.published}</h3>
                <YesNo value={published} onChange={setPublished} />
                {published === false && (
                  <label className="mt-3 block text-sm font-semibold">
                    {END_CYCLE_PROMPTS.notPublished}
                    <Textarea className="mt-2 min-h-24" value={notPublished} onChange={(event) => setNotPublished(event.target.value)} />
                  </label>
                )}
              </section>
            )}
            {completed === false && (
              <label className="block text-sm font-semibold">
                {END_CYCLE_PROMPTS.notComplete}
                <Textarea className="mt-2 min-h-24" value={notComplete} onChange={(event) => setNotComplete(event.target.value)} />
              </label>
            )}
            {completed !== null && (
              <label className="block text-sm font-semibold">
                {END_CYCLE_PROMPTS.notes} <span className="font-normal text-muted-foreground">Optional</span>
                <Textarea className="mt-2 min-h-24" value={endNotes} onChange={(event) => setEndNotes(event.target.value)} />
              </label>
            )}
            <Button disabled={!endReady || saveReflection.isPending || updateBook.isPending} onClick={endCycle}>End book cycle</Button>
          </div>
        </section>
      )}

      {(isEnded || justEnded) && endAnswers.length > 0 && (
        <section className="mb-6 max-w-3xl rounded-2xl border border-teal/40 bg-teal/10 p-6">
          <h2 className="font-heading text-2xl font-normal">End of Cycle Details</h2>
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
