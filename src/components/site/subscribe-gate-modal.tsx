import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="panel-outline max-w-md gap-0 rounded-none border-cocoa bg-paper p-0">
        <div className="border-b-4 border-dashed border-cocoa bg-amber px-6 py-5">
          <DialogTitle className="max-w-[80%] font-serif text-2xl leading-tight text-cocoa">
            Want to take your list with you?
          </DialogTitle>
          <DialogDescription className="mt-2 text-[0.92rem] text-cocoa/85">
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
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="panel-outline-thin w-full bg-card px-3 py-2 text-foreground outline-none focus:bg-leaf/20"
          />

          <div className="flex flex-wrap gap-4 text-[0.9rem] text-cocoa">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={catalog}
                onChange={(event) => setCatalog(event.target.checked)}
                className="size-4 accent-clay"
              />
              Monthly issue
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={blog}
                onChange={(event) => setBlog(event.target.checked)}
                className="size-4 accent-clay"
              />
              Journal posts
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="panel-outline-thin bg-clay px-5 py-2 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-card disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : "Subscribe"}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-[0.85rem] font-semibold uppercase tracking-[0.1em] text-cocoa/70 underline"
            >
              Keep browsing
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
