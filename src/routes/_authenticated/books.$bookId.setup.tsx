import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { useBookTree } from "@/lib/book-db";
import { SETUP_TASK_DEFS, useSetupTasks, useUpdateSetupTask } from "@/lib/setup-tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$bookId/setup")({
  head: () => ({ meta: [
    { title: "Setup Tasks — Book Cycles" },
    { name: "description", content: "The strategic decisions to make before and around production." },
    { property: "og:title", content: "Setup Tasks — Book Cycles" },
    { property: "og:description", content: "The strategic decisions to make before and around production." },
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

  const list = tasks.data ?? [];
  const done = list.filter((task) => task.status === "complete").length;

  return (
    <AppShell>
      <PageHeading
        title="Setup Tasks"
        description={`Strategic decisions worth settling before and around production for ${book.data?.book.title ?? "this book"}.`}
      />
      {list.length > 0 && <p className="mb-5 text-sm font-semibold text-muted-foreground">{done} of {list.length} done</p>}

      {tasks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {list.map((task) => {
            const def = SETUP_TASK_DEFS.find((entry) => entry.key === task.key);
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
