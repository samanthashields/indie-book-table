import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { useBookTree } from "@/lib/book-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SETUP_TASKS_LABEL, findSetupTaskDef, missingSetupTaskCount, useAddSetupTask, useRemoveSetupTask, useRestoreSetupTasks, useSetupTasks, useUpdateSetupTask } from "@/lib/setup-tasks";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/setup")({
  head: () => ({ meta: [
    { title: `${SETUP_TASKS_LABEL} — The Indie Book Table` },
    { name: "description", content: "Optional decisions and habits worth settling before and around production." },
    { property: "og:title", content: `${SETUP_TASKS_LABEL} — The Indie Book Table` },
    { property: "og:description", content: "Optional decisions and habits worth settling before and around production." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SetupTasksPage,
});

function SetupTasksPage() {
  const { bookId } = Route.useParams();
  const book = useBookTree(bookId);
  const tasks = useSetupTasks(bookId);
  const update = useUpdateSetupTask(bookId);
  const add = useAddSetupTask(bookId);
  const remove = useRemoveSetupTask(bookId);
  const restore = useRestoreSetupTasks(bookId);
  const user = useCurrentUser();
  const isAuthor = Boolean(user.data?.id && book.data?.book.author_id === user.data.id);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [missing, setMissing] = useState(0);

  const list = tasks.data ?? [];
  const done = list.filter((task) => task.status === "complete").length;
  const listKey = list.map((task) => task.key).join("|");
  useEffect(() => {
    if (tasks.data) void missingSetupTaskCount(bookId, tasks.data).then(setMissing).catch(() => setMissing(0));
  }, [bookId, listKey, tasks.data]);

  const submit = () => {
    if (!label.trim()) return;
    const position = list.reduce((max, task) => Math.max(max, task.position), -1) + 1;
    add.mutate({ label, description: note, position }, {
      onSuccess: () => { setLabel(""); setNote(""); toast.success("Task added"); },
      onError: () => toast.error("Couldn’t add that task"),
    });
  };

  return (
    <AppShell>
      <PageHeading
        title={SETUP_TASKS_LABEL}
        description={`Optional, non-blocking — worth settling before and around production for ${book.data?.book.title ?? "this book"}.`}
      />
      {list.length > 0 && <p className="mb-5 text-sm font-semibold text-muted-foreground">{done} of {list.length} done</p>}

      {tasks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {list.map((task) => {
            const def = findSetupTaskDef(task.key);
            const fieldValue = def?.bookField ? book.data?.book[def.bookField] : undefined;
            const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
            const complete = task.status === "complete";
            return (
              <li key={task.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={complete ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`}
                    onClick={() => update.mutate({ id: task.id, complete: !complete })}
                    className="mt-0.5 shrink-0"
                  >
                    {complete ? <CheckCircle2 className="size-5 text-text-leaf" /> : <Circle className="size-5 text-muted-foreground" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-semibold", complete && "text-muted-foreground line-through")}>{task.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                    {def?.bookField && (
                      <p className="mt-2 text-xs">
                        <span className={hasValue ? "font-semibold text-text-leaf" : "font-semibold text-amber"}>{hasValue ? "Set in Book Details" : "Not set yet"}</span>
                        {" — "}
                        <Link to="/books/$bookId/details" params={{ bookId }} className="font-semibold text-link underline-offset-2 hover:underline">Edit in Book Details</Link>
                      </p>
                    )}
                  </div>
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove "${task.label}"`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(task.id, { onError: () => toast.error("Couldn’t remove that task") })}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isAuthor && !tasks.isLoading && (
        <section className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xs" aria-labelledby="add-task-heading">
          <h2 id="add-task-heading" className="font-heading text-xl font-normal">Add your own task</h2>
          <p className="mt-1 text-sm text-muted-foreground">Anything you want to settle before or around production. You can remove any task above, too.</p>
          <form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <label className="block text-sm font-semibold">Task<Input className="mt-2 font-normal" value={label} maxLength={120} onChange={(event) => setLabel(event.target.value)} placeholder="Pick a cover designer" /></label>
            <label className="block text-sm font-semibold">Note (optional)<Input className="mt-2 font-normal" value={note} maxLength={240} onChange={(event) => setNote(event.target.value)} placeholder="Why it matters or what done looks like" /></label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!label.trim() || add.isPending}><Plus />Add task</Button>
              {missing > 0 && (
                <Button type="button" variant="outline" disabled={restore.isPending} onClick={() => restore.mutate(list, { onSuccess: () => toast.success("Recommended tasks restored") })}>
                  Restore {missing} recommended {missing === 1 ? "task" : "tasks"}
                </Button>
              )}
            </div>
          </form>
        </section>
      )}
    </AppShell>
  );
}
