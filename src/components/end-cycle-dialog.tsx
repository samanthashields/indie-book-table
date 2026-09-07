import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAchievements } from "@/lib/achievements";
import { celebrate } from "@/lib/celebrate";
import { syncChallenges } from "@/lib/challenges.functions";
import { useReflection, useSaveReflection, useUpdateBook } from "@/lib/book-db";


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

/** Closes out a book cycle with the conditional wrap-up questions. */
export function EndCycleDialog({ bookId, open, onOpenChange }: { bookId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const reflection = useReflection(bookId);
  const saveReflection = useSaveReflection(bookId);
  const updateBook = useUpdateBook(bookId);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [published, setPublished] = useState<boolean | null>(null);
  const [notPublished, setNotPublished] = useState("");
  const [notComplete, setNotComplete] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const achievements = useAchievements();

  const ready =
    completed === true ? published === true || (published === false && notPublished.trim().length > 0) : completed === false && notComplete.trim().length > 0;

  const finish = () => {
    const existing = (reflection.data?.custom ?? []).filter(
      (entry) => !Object.values(END_CYCLE_PROMPTS).includes(entry.prompt as (typeof END_CYCLE_PROMPTS)[keyof typeof END_CYCLE_PROMPTS]),
    );
    const answers = [
      { prompt: END_CYCLE_PROMPTS.completed, answer: completed ? "Yes" : "No" },
      ...(completed ? [{ prompt: END_CYCLE_PROMPTS.published, answer: published ? "Yes" : "No" }] : []),
      ...(completed && published === false && notPublished.trim() ? [{ prompt: END_CYCLE_PROMPTS.notPublished, answer: notPublished.trim() }] : []),
      ...(completed === false && notComplete.trim() ? [{ prompt: END_CYCLE_PROMPTS.notComplete, answer: notComplete.trim() }] : []),
      ...(notes.trim() ? [{ prompt: END_CYCLE_PROMPTS.notes, answer: notes.trim() }] : []),
    ];

    saveReflection.mutate(
      {
        achieved_goals: reflection.data?.achieved_goals ?? null,
        goals_notes: reflection.data?.goals_notes ?? null,
        published_on_time: reflection.data?.published_on_time ?? null,
        next_steps: reflection.data?.next_steps ?? null,
        custom: [...answers, ...existing],
      },
      {
        onSuccess: () => {
          updateBook.mutate(
            { status: "complete", ...(completed && published ? { shelf_status: "published" } : {}) },
            {
              onSuccess: () => {
                setDone(true);
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

  const goToReflection = () => {
    onOpenChange(false);
    void navigate({ to: "/books/$bookId/reflection", params: { bookId } });
  };

  if (done) {
    const celebrating = Boolean(completed && published);
    const total = achievements.publishedCount;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl font-normal">
              {celebrating && <PartyPopper className="size-6 text-primary" />}
              {celebrating ? "Congratulations — your book is out in the world" : "Your book cycle is closed"}
            </DialogTitle>
            <DialogDescription>
              {celebrating
                ? total > 0
                  ? `That makes ${total} published ${total === 1 ? "book" : "books"} on your table.`
                  : "Your book now has a place on your table."
                : "This one didn’t reach publication, and that still counts. Everything you learned is saved in the reflection."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-3 pt-2">
            {celebrating && (
              <Button onClick={() => { onOpenChange(false); void navigate({ to: "/my-table" }); }}>See my table</Button>
            )}
            <Button variant={celebrating ? "outline" : "default"} onClick={goToReflection}>Go to reflection</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">End this book cycle</DialogTitle>
          <DialogDescription>Your answers are saved with the book’s reflection.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
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
            <section>
              <label className="block text-sm font-semibold">
                {END_CYCLE_PROMPTS.notComplete}
                <Textarea className="mt-2 min-h-24" value={notComplete} onChange={(event) => setNotComplete(event.target.value)} />
              </label>
            </section>
          )}

          {completed !== null && (
            <label className="block text-sm font-semibold">
              {END_CYCLE_PROMPTS.notes} <span className="font-normal text-muted-foreground">Optional</span>
              <Textarea className="mt-2 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button disabled={!ready || saveReflection.isPending || updateBook.isPending} onClick={finish}>End book cycle</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Not yet</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
