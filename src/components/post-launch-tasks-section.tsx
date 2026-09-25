import { CheckCircle2, Circle } from "lucide-react";

import { POST_LAUNCH_TASKS_LABEL, usePostLaunchTasks, useUpdatePostLaunchTask, type PostLaunchTask } from "@/lib/post-launch-tasks";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

/** The optional checklist after Post-Launch & Growth. Only the author sees it. */
export function PostLaunchTasksSection({ bookId, authorId }: { bookId: string; authorId: string }) {
  const user = useCurrentUser();
  if (!user.data?.id || user.data.id !== authorId) return null;
  return <PostLaunchTasksPanel bookId={bookId} />;
}

function PostLaunchTasksPanel({ bookId }: { bookId: string }) {
  const tasks = usePostLaunchTasks(bookId);
  const update = useUpdatePostLaunchTask(bookId);

  const list = tasks.data ?? [];
  const done = list.filter((task) => task.status === "complete").length;
  const groups = list.reduce<{ label: string; tasks: PostLaunchTask[] }[]>((acc, task) => {
    const existing = acc.find((group) => group.label === task.group_label);
    if (existing) existing.tasks.push(task);
    else acc.push({ label: task.group_label, tasks: [task] });
    return acc;
  }, []);

  return (
    <section className="mb-10 rounded-2xl border border-border bg-card shadow-xs" aria-labelledby="post-launch-tasks-heading">
      <div className="px-6 py-5">
        <h2 id="post-launch-tasks-heading" className="font-heading text-2xl font-normal">{POST_LAUNCH_TASKS_LABEL}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length > 0 ? `${done} of ${list.length} done. ` : ""}Ways to keep your book growing after launch. Nothing here blocks your cycle — check items off in any order.
        </p>
      </div>
      <div className="border-t border-border/70 px-6 pb-5 pt-4">
        {tasks.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : tasks.isError ? (
          <p className="text-sm text-muted-foreground">Couldn’t load your recommended tasks. Try again in a moment.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-sm font-semibold">{group.label}</h3>
                <ul className="mt-1">
                  {group.tasks.map((task) => {
                    const complete = task.status === "complete";
                    return (
                      <li key={task.id} className="flex items-start gap-3 rounded-xl px-2 py-2">
                        <button
                          type="button"
                          aria-label={complete ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`}
                          onClick={() => update.mutate({ id: task.id, complete: !complete })}
                          className="mt-0.5 shrink-0"
                        >
                          {complete ? <CheckCircle2 className="size-5 text-text-leaf" /> : <Circle className="size-5 text-muted-foreground" />}
                        </button>
                        <p className={cn("text-sm", complete && "text-muted-foreground line-through")}>{task.label}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
