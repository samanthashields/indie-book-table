import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BookRow } from "@/lib/book-db";
import { SETUP_TASKS_LABEL, findSetupTaskDef, useSetupTasks, useUpdateSetupTask } from "@/lib/setup-tasks";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

const storageKey = (userId: string) => `ibt:setup-tasks-open:${userId}`;

function readOpen(userId: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(userId)) !== "0";
  } catch {
    return true;
  }
}

/**
 * Whether the setup tasks panel is shown. Remembered for each signed-in author on this
 * browser, so their choice carries across every book cycle and every visit.
 */
function useSetupTasksOpen(userId: string) {
  const [open, setOpen] = useState(() => readOpen(userId));
  const choose = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey(userId), next ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice still applies until the page is closed.
    }
  };
  return [open, choose] as const;
}

/** A collapsible copy of the setup tasks, for the top of the book overview. Only the author sees it. */
export function SetupTasksSection({ bookId, authorId, book }: { bookId: string; authorId: string; book: BookRow }) {
  const user = useCurrentUser();
  const userId = user.data?.id;
  if (!userId || userId !== authorId) return null;
  return <SetupTasksPanel bookId={bookId} userId={userId} book={book} />;
}

function SetupTasksPanel({ bookId, userId, book }: { bookId: string; userId: string; book: BookRow }) {
  const [open, choose] = useSetupTasksOpen(userId);
  const tasks = useSetupTasks(bookId);
  const update = useUpdateSetupTask(bookId);

  const list = tasks.data ?? [];
  const done = list.filter((task) => task.status === "complete").length;

  return (
    <section id="tour-setup-tasks" className="mb-10 rounded-2xl border border-border bg-card shadow-xs" aria-labelledby="setup-tasks-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="min-w-0">
          <h2 id="setup-tasks-heading" className="font-heading text-2xl font-normal">{SETUP_TASKS_LABEL}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length > 0 ? `${done} of ${list.length} done. ` : ""}Nothing here blocks your cycle — check items off in any order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/books/$bookId/setup" params={{ bookId }}>Open full page</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => choose(!open)} aria-expanded={open} aria-controls="setup-tasks-body">
            {open ? "Hide" : "Show"}
            <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} />
          </Button>
        </div>
      </div>

      {open && (
        <div id="setup-tasks-body" className="border-t border-border/70 px-6 pb-5 pt-4">
          {tasks.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : tasks.isError ? (
            <p className="text-sm text-muted-foreground">Couldn’t load your recommended tasks. Try again in a moment.</p>
          ) : (
            <ul className="grid gap-x-8 gap-y-1 lg:grid-cols-2">
              {list.map((task) => {
                const def = findSetupTaskDef(task.key);
                const fieldValue = def?.bookField ? book[def.bookField] : undefined;
                const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
                const complete = task.status === "complete";
                return (
                  <li key={task.id} className="flex items-start gap-3 rounded-xl px-2 py-3">
                    <button
                      type="button"
                      aria-label={complete ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`}
                      onClick={() => update.mutate({ id: task.id, complete: !complete })}
                      className="mt-0.5 shrink-0"
                    >
                      {complete ? <CheckCircle2 className="size-5 text-text-leaf" /> : <Circle className="size-5 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", complete && "text-muted-foreground line-through")}>{task.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
                      {def?.bookField && (
                        <p className="mt-1.5 text-xs">
                          <span className={hasValue ? "font-semibold text-text-leaf" : "font-semibold text-amber"}>{hasValue ? "Set in Book Details" : "Not set yet"}</span>
                          {" — "}
                          <Link to="/books/$bookId/details" params={{ bookId }} className="font-semibold text-link underline-offset-2 hover:underline">Edit in Book Details</Link>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Hide this panel any time. We’ll remember your choice on this device.</p>
        </div>
      )}
    </section>
  );
}
