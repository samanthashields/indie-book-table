import { useState } from "react";
import { MoreHorizontal, Sparkles, Trash2 } from "lucide-react";

import { DeleteCycleDialog } from "@/components/delete-cycle";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/lib/use-current-user";

/** The ⋯ menu in the book cycle header: the tour, plus the (rarely needed) delete action for the author. */
export function CycleHeaderMenu({ bookId, authorId, title, total, done, onTour }: { bookId: string; authorId: string; title: string; total: number; done: number; onTour: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const user = useCurrentUser();
  const isAuthor = user.data?.id === authorId;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions"><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={onTour}><Sparkles />Take the tour</DropdownMenuItem>
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
