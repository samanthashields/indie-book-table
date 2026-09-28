import { useState } from "react";
import { MoreHorizontal, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DeleteCycleDialog } from "@/components/delete-cycle";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUpdateBook } from "@/lib/book-db";
import { useCurrentUser } from "@/lib/use-current-user";

/** The ⋯ menu in the book cycle header: the tour, restarting an ended cycle, plus the (rarely needed) delete action for the author. */
export function CycleHeaderMenu({
  bookId,
  authorId,
  title,
  total,
  done,
  ended,
  onTour,
  onRestart,
}: {
  bookId: string;
  authorId: string;
  title: string;
  total: number;
  done: number;
  ended: boolean;
  onTour: () => void;
  onRestart: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const user = useCurrentUser();
  const isAuthor = user.data?.id === authorId;
  const updateBook = useUpdateBook(bookId);

  const restart = () => {
    updateBook.mutate(
      { status: "active" },
      {
        onSuccess: () => { onRestart(); toast.success("Book cycle reopened. Every phase keeps its progress."); },
        onError: () => toast.error("Couldn’t restart the cycle."),
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions"><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={onTour}><Sparkles />Take the tour</DropdownMenuItem>
          {isAuthor && ended && (
            <DropdownMenuItem disabled={updateBook.isPending} onSelect={restart}><RotateCcw />Restart cycle</DropdownMenuItem>
          )}
          {isAuthor && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirm(true)}><Trash2 />Delete book cycle</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isAuthor && <DeleteCycleDialog open={confirm} onOpenChange={setConfirm} bookId={bookId} title={title} total={total} done={done} />}
    </>
  );
}
