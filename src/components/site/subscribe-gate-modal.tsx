import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { subscribeEmail } from "@/lib/catalog.functions";

/** Coupon-style prompt shown the first time a reader tries to circle a book. */
export function SubscribeGateModal({
  open,
  onOpenChange,
  onSubscribed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: () => void;
}) {
  const [email, setEmail] = useState("");
  const [catalog, setCatalog] = useState(true);
  const [blog, setBlog] = useState(false);

  const subscribe = useServerFn(subscribeEmail);
  const mutation = useMutation({
    mutationFn: () => subscribe({ data: { email, catalog, blog } }),
    onSuccess: () => {
      toast.success("You're in — start circling.");
      setEmail("");
      onSubscribed();
    },
    onError: (error: Error) => toast.error(error.message || "That didn't go through."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b border-border bg-card px-6 py-5">
          <DialogTitle className="max-w-[80%] font-heading text-2xl font-normal leading-tight">
            Want to take your list with you?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Circle the books you want and keep the list — subscribe free. Reading the flyer is
            always free too.
          </DialogDescription>
        </div>

        <form
          className="space-y-4 px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!catalog && !blog) {
              toast.error("Pick at least one list to join");
              return;
            }
            mutation.mutate();
          }}
        >
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
          />

          <div className="flex flex-wrap gap-4 text-sm text-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={catalog}
                onChange={(event) => setCatalog(event.target.checked)}
                className="size-4 accent-primary"
              />
              Monthly issue
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={blog}
                onChange={(event) => setBlog(event.target.checked)}
                className="size-4 accent-primary"
              />
              Journal posts
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Subscribe"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Keep browsing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
