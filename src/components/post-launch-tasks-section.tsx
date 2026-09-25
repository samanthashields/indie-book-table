import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_LAUNCH_TASK_GROUPS, POST_LAUNCH_TASKS_LABEL, useAddPostLaunchTask, usePostLaunchTasks, useRemovePostLaunchTask, useRestorePostLaunchTasks, useUpdatePostLaunchTask, type PostLaunchTask } from "@/lib/post-launch-tasks";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

/** The optional checklist after Post-Launch & Growth. Only the author sees it. */
export function PostLaunchTasksSection({ bookId, authorId }: { bookId: string; authorId: string }) {
  const user = useCurrentUser();
  if (!user.data?.id || user.data.id !== authorId) return null;
  return <PostLaunchTasksPanel bookId={bookId} userId={user.data.id} />;
}

const storageKey = (userId: string) => `ibt:post-launch-tasks-open:${userId}`;

function readOpen(userId: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(userId)) !== "0";
  } catch {
    return true;
  }
}

function PostLaunchTasksPanel({ bookId, userId }: { bookId: string; userId: string }) {
  const [open, setOpen] = useState(() => readOpen(userId));
  const choose = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey(userId), next ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice still applies until the page is closed.
    }
  };
  const tasks = usePostLaunchTasks(bookId);
  const update = useUpdatePostLaunchTask(bookId);
  const add = useAddPostLaunchTask(bookId);
  const remove = useRemovePostLaunchTask(bookId);
  const restore = useRestorePostLaunchTasks(bookId);
  const [managing, setManaging] = useState(false);
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");

  const list = tasks.data ?? [];
  const done = list.filter((task) => task.status === "complete").length;
  const groups = list.reduce<{ label: string; tasks: PostLaunchTask[] }[]>((acc, task) => {
    const existing = acc.find((group) => group.label === task.group_label);
    if (existing) existing.tasks.push(task);
    else acc.push({ label: task.group_label, tasks: [task] });
    return acc;
  }, []);

  const groupNames = groups.map((entry) => entry.label);
  const chosenGroup = (group === "__new" ? newGroup : group || groupNames[0] || "").trim();
  const knownKeys = new Set(list.map((task) => task.key));
  const missing = POST_LAUNCH_TASK_GROUPS.flatMap((entry) => entry.tasks).filter((task) => !knownKeys.has(task.key)).length;
  const submit = () => {
    if (!label.trim() || !chosenGroup) return;
    const position = list.reduce((max, task) => Math.max(max, task.position), -1) + 1;
    add.mutate({ label, group: chosenGroup, position }, {
      onSuccess: () => { setLabel(""); setNewGroup(""); toast.success("Task added"); },
      onError: () => toast.error("Couldn’t add that task"),
    });
  };

  return (
    <section id="tour-post-launch" className="mb-10 mt-10 rounded-2xl border border-border bg-card shadow-xs" aria-labelledby="post-launch-tasks-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="min-w-0">
          <h2 id="post-launch-tasks-heading" className="font-heading text-2xl font-normal">{POST_LAUNCH_TASKS_LABEL}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length > 0 ? `${done} of ${list.length} done. ` : ""}Ways to keep your book growing after launch. Nothing here blocks your cycle — check items off in any order.
          </p>
        </div>
        <div className="flex items-center gap-2">
        {open && <Button variant="ghost" size="sm" onClick={() => setManaging(!managing)} aria-pressed={managing}>{managing ? "Done managing" : "Manage tasks"}</Button>}
        <Button variant="outline" size="sm" onClick={() => choose(!open)} aria-expanded={open} aria-controls="post-launch-tasks-body">
          {open ? "Hide" : "Show"}
          <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} />
        </Button>
        </div>
      </div>
      {open && <div id="post-launch-tasks-body" className="border-t border-border/70 px-6 pb-5 pt-4">
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
                        <p className={cn("min-w-0 flex-1 text-sm", complete && "text-muted-foreground line-through")}>{task.label}</p>
                        {managing && (
                          <Button variant="ghost" size="icon" className="-my-1.5 size-8" aria-label={`Remove "${task.label}"`} disabled={remove.isPending} onClick={() => remove.mutate(task.id, { onError: () => toast.error("Couldn’t remove that task") })}>
                            <Trash2 />
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
        {managing && (
          <form className="mt-6 grid gap-3 rounded-xl border border-border bg-secondary/40 p-4" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <p className="text-sm font-semibold">Add your own task</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={label} maxLength={120} onChange={(event) => setLabel(event.target.value)} placeholder="Pitch a local bookstore" aria-label="Task" />
              <select value={group || groupNames[0] || "__new"} onChange={(event) => setGroup(event.target.value)} aria-label="Group" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {groupNames.map((name) => <option key={name} value={name}>{name}</option>)}
                <option value="__new">New group…</option>
              </select>
            </div>
            {(group === "__new" || groupNames.length === 0) && <Input value={newGroup} maxLength={80} onChange={(event) => { setGroup("__new"); setNewGroup(event.target.value); }} placeholder="Group name" aria-label="New group name" />}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!label.trim() || !chosenGroup || add.isPending}><Plus />Add task</Button>
              {missing > 0 && <Button type="button" variant="outline" disabled={restore.isPending} onClick={() => restore.mutate(list, { onSuccess: () => toast.success("Recommended tasks restored") })}>Restore {missing} recommended {missing === 1 ? "task" : "tasks"}</Button>}
            </div>
          </form>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Hide this panel any time. We’ll remember your choice on this device.</p>
      </div>}
    </section>
  );
}
