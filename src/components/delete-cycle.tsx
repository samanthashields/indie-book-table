import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eraser, Loader2, MoreVertical, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteBookCycle } from "@/lib/book-db";
import { useCurrentUser } from "@/lib/use-current-user";

/** Confirms, then deletes a book's cycle while keeping the book on the shelf. */
export function DeleteCycleDialog({
  open,
  onOpenChange,
  bookId,
  title,
  total,
  done,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  title: string;
  total: number;
  done: number;
}) {
  const navigate = useNavigate();
  const deleteCycle = useDeleteBookCycle();

  const confirm = () => {
    deleteCycle.mutate(bookId, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(`Book cycle deleted. “${title}” is back on your shelf.`);
        void navigate({ to: "/" });
      },
      onError: () => toast.error("Couldn’t delete the book cycle. Nothing was changed."),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!deleteCycle.isPending) onOpenChange(next); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this book cycle?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm leading-6">
              <p>
                This removes the plan for “{title}”: {total} {total === 1 ? "milestone" : "milestones"}
                {done > 0 ? ` (${done} complete)` : ""}, with their notes, steps and attachments, plus the setup tasks and
                reflection. It can’t be undone.
              </p>
              <p>The book stays on your shelf as an idea, with its details and cover. You can start a new cycle whenever you like.</p>
              <p>Want to keep a record of how it went instead? Use “End book cycle &amp; reflect”.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCycle.isPending}>Keep the cycle</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={deleteCycle.isPending}>
            {deleteCycle.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Delete book cycle
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** A quiet section at the foot of the book overview. Only the book's author sees it. */
export function DeleteCycleSection({
  bookId,
  authorId,
  title,
  total,
  done,
}: {
  bookId: string;
  authorId: string;
  title: string;
  total: number;
  done: number;
}) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  if (user.data?.id !== authorId) return null;

  return (
    <section className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="font-serif text-2xl font-normal">Delete this book cycle</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        Remove this plan without deleting the book. “{title}” stays on your shelf and you can start a new cycle whenever you like.
        To keep a record of how it went, use “End book cycle &amp; reflect” instead.
      </p>
      <Button variant="outline" className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}>
        <Trash2 />
        Delete book cycle
      </Button>
      <DeleteCycleDialog open={open} onOpenChange={setOpen} bookId={bookId} title={title} total={total} done={done} />
    </section>
  );
}

/** The ⋮ menu on a cycle tile in My Cycles. Only cycles the author owns are listed there. */
export function CycleActionsMenu({ bookId, title, total, done }: { bookId: string; title: string; total: number; done: number }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${title}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/books/$bookId" params={{ bookId }}><Sparkles />Open the book cycle</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirm(true)}>
            <Eraser />Delete book cycle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span onClick={(event) => event.stopPropagation()}>
        <DeleteCycleDialog open={confirm} onOpenChange={setConfirm} bookId={bookId} title={title} total={total} done={done} />
      </span>
    </>
  );
}

/** The Delete book cycle button for the top of the book overview. Only the book's author sees it. */
export function DeleteCycleButton({ bookId, authorId, title, total, done }: { bookId: string; authorId: string; title: string; total: number; done: number }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  if (user.data?.id !== authorId) return null;
  return (
    <>
      <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}>
        <Eraser />
        Delete book cycle
      </Button>
      <DeleteCycleDialog open={open} onOpenChange={setOpen} bookId={bookId} title={title} total={total} done={done} />
    </>
  );
}
