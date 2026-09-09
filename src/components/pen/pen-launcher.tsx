import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Maximize2, Minus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PenChat } from "@/components/pen/pen-chat";
import { useCurrentUser } from "@/lib/use-current-user";
import penMark from "@/assets/pen-mark.png";

/** Pen's floating chat window, available in every workshop section. */
export function PenLauncher({ context = "overview" }: { context?: string | undefined }) {
  const user = useCurrentUser();
  const paid = user.data?.profile?.plan === "paid";
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[78vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-border bg-amber/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={penMark} alt="" width={1024} height={1024} className="size-9" />
              <div>
                <p className="font-semibold">Pen</p>
                <p className="text-xs text-muted-foreground">Your book coach</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" asChild aria-label="Open Pen full screen">
                <Link to="/pen" onClick={() => setOpen(false)}>
                  <Maximize2 className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Minimise Pen">
                <Minus className="size-4" />
              </Button>
            </div>
          </div>

          {paid ? (
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <PenChat chatId={`pen-floating-${context}`} section={context} />
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="rounded-2xl bg-paper p-4 text-sm leading-6">
                <p className="font-semibold">Pen comes with the paid plan.</p>
                <p className="mt-2 text-muted-foreground">
                  On the free plan you can still build a book cycle from a template or from scratch, and
                  everything you plan stays yours. Upgrade whenever you'd like a coach to think out loud
                  with.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="rounded-xl bg-teal/12 px-4 py-3">Talk through book ideas any time</li>
                <li className="rounded-xl bg-amber/18 px-4 py-3">Honest pacing against your launch date</li>
                <li className="rounded-xl bg-leaf/20 px-4 py-3">Do it yourself or hire, based on your budget</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => toast.info("Plans are coming soon — your account is on the free plan for now.")}
              >
                Upgrade to the paid plan
              </Button>
            </div>
          )}
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Pen, your book coach"
          className="fixed bottom-5 right-5 z-50 grid size-12 place-items-center rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <img src={penMark} alt="" width={1024} height={1024} className="size-8" />
        </button>
      )}
    </>
  );
}
