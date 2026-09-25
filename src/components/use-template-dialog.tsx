import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateBookCycle, type useTemplates } from "@/lib/book-db";

type TemplateRow = NonNullable<ReturnType<typeof useTemplates>["data"]>[number];

/**
 * "Use this template": asks only for a title and publication date, creates the cycle straight
 * from the template's default phases, and lands on the new cycle. Customising happens there.
 */
export function UseTemplateButton({ template, bookId, variant }: { template: TemplateRow; bookId?: string | undefined; variant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const createCycle = useCreateBookCycle();

  const submit = () => {
    if (!title.trim()) return;
    createCycle.mutate(
      {
        title: title.trim(),
        phases: template.phases,
        templateId: template.id,
        illustrated: template.details.illustrated ?? false,
        ...(date ? { targetDate: date } : {}),
        ...(template.genre ? { genre: template.genre } : {}),
        ...(bookId ? { bookId } : {}),
      },
      {
        onSuccess: (newBookId) => void navigate({ to: "/books/$bookId", params: { bookId: newBookId } }),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn’t create the book cycle"),
      },
    );
  };

  return (
    <>
      <Button variant={variant ?? "default"} onClick={() => setOpen(true)}>Use this template</Button>
      <Dialog open={open} onOpenChange={(next) => { if (!createCycle.isPending) setOpen(next); }}>
        <DialogContent>
          <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <DialogHeader>
              <DialogTitle>Start your {template.title}</DialogTitle>
              <DialogDescription>Give your book a working title and, if you have one, a target publication date. You can change both later.</DialogDescription>
            </DialogHeader>
            <div className="my-5 grid gap-4">
              <label className="block text-sm font-semibold">Working title<Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="The working title of your book" autoFocus /></label>
              <label className="block text-sm font-semibold">Target publication date<Input className="mt-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={createCycle.isPending} onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!title.trim() || createCycle.isPending}>{createCycle.isPending && <Loader2 className="animate-spin" />}Create Book Cycle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
