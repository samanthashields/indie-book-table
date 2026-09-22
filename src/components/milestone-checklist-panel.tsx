import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, CircleCheck, GripVertical, LifeBuoy, ListChecks, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  itemReference,
  useAddChecklistItems,
  useDeleteChecklistItem,
  useMilestoneChecklist,
  useReorderChecklist,
  useUpdateChecklistItem,
  type ChecklistItem,
} from "@/lib/milestone-checklist";

function ItemLink({ item }: { item: ChecklistItem }) {
  const reference = itemReference(item);
  if (!reference) return null;
  const className =
    "mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground";

  if (reference.kind === "milestone") {
    return (
      <Link
        to="/books/$bookId/milestones/$milestoneId"
        params={{ bookId: reference.bookId, milestoneId: reference.milestoneId }}
        className={className}
      >
        <CircleCheck className="size-3.5" />
        {reference.label}
      </Link>
    );
  }
  if (reference.kind === "book") {
    return (
      <Link to="/books/$bookId" params={{ bookId: reference.bookId }} className={className}>
        <BookOpen className="size-3.5" />
        {reference.label}
      </Link>
    );
  }
  return (
    <Link to="/help/articles/$slug" params={{ slug: reference.slug }} className={className}>
      <LifeBuoy className="size-3.5" />
      {reference.label}
    </Link>
  );
}

/** A tick-list of small steps inside one milestone, addable by hand or from Pen. */
export function MilestoneChecklistPanel({ bookId, milestoneId }: { bookId: string; milestoneId: string }) {
  const items = useMilestoneChecklist(milestoneId);
  const add = useAddChecklistItems();
  const update = useUpdateChecklistItem(milestoneId);
  const remove = useDeleteChecklistItem(milestoneId);
  const reorder = useReorderChecklist(milestoneId);
  const [draft, setDraft] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  const list = items.data ?? [];
  const done = list.filter((item) => item.done).length;

  const addItem = async () => {
    const label = draft.trim();
    if (!label) return;
    setDraft("");
    try {
      await add.mutateAsync({ milestoneId, bookId, items: [{ label }] });
    } catch {
      toast.error("Couldn't add that step.");
    }
  };

  const drop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const ids = list.map((item) => item.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    setDragging(null);
    reorder.mutate(ids);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-2xl font-semibold">Your steps</h3>
        {list.length > 0 && (
          <p className="text-sm font-semibold text-muted-foreground">
            {done} of {list.length} done
          </p>
        )}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Break this milestone into small steps. When you ask Pen what to do next while you're on this page,
        you can save its answer straight into this list.
      </p>

      {list.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-4 text-sm text-muted-foreground">
          <ListChecks className="size-4 shrink-0" />
          No steps yet. Add one below.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => drop(item.id)}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3"
            >
              <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" />
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-[var(--leaf)]"
                checked={item.done}
                aria-label={`Mark "${item.label}" done`}
                onChange={(event) => update.mutate({ id: item.id, done: event.target.checked })}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-6 ${item.done ? "text-muted-foreground line-through" : ""}`}>
                  {item.label}
                </p>
                <ItemLink item={item} />
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove this step"
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void addItem();
            }
          }}
          placeholder="Add a step, e.g. Read the editor's letter twice"
          className="min-w-[16rem] flex-1"
          aria-label="Add a step"
        />
        <Button type="button" onClick={() => void addItem()} disabled={!draft.trim() || add.isPending}>
          <Plus /> Add step
        </Button>
      </div>
    </section>
  );
}
