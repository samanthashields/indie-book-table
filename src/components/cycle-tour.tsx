import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/lib/use-current-user";

const storageKey = (userId: string) => `ibt:cycle-tour-seen:${userId}`;

function readSeen(userId: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(userId)) === "1";
  } catch {
    return false;
  }
}

function writeSeen(userId: string) {
  try {
    window.localStorage.setItem(storageKey(userId), "1");
  } catch {
    // Storage can be blocked; the tour just may show again next visit.
  }
}

const STEPS: { target: string; title: string; body: string }[] = [
  { target: "tour-header", title: "Your book’s toolbox", body: "Book details, collaborators, and resources live up here, along with your recommended tasks and the option to end your cycle when you’re done." },
  { target: "tour-progress", title: "Progress at a glance", body: "See how far along you are, your target publication date, and the next thing to work on." },
  { target: "tour-setup-tasks", title: "Set up recommended tasks", body: "Optional decisions and habits worth settling early, like your budget and publishing path. Nothing here blocks your cycle." },
  { target: "tour-phases", title: "Your publishing path", body: "Six phases take you from private manuscript to published book. Open a phase to see its milestones, then click a milestone to add notes, files, and steps." },
  { target: "tour-post-launch", title: "After launch", body: "An optional checklist for keeping your book growing once it’s out in the world. Check items off in any order." },
];

/** A first-visit welcome plus a short walkthrough that scrolls to each part of the cycle page. */
export function CycleTour({ replayKey }: { replayKey: number }) {
  const user = useCurrentUser();
  const userId = user.data?.id;
  const [stage, setStage] = useState<"closed" | "welcome" | "tour">("closed");
  const [index, setIndex] = useState(0);
  const [never, setNever] = useState(false);

  useEffect(() => {
    if (userId && !readSeen(userId)) setStage("welcome");
  }, [userId]);

  useEffect(() => {
    if (replayKey > 0) {
      setIndex(0);
      setStage("welcome");
    }
  }, [replayKey]);

  const steps = STEPS.filter((step) => stage !== "tour" || document.getElementById(step.target));
  const step = steps[index];

  useEffect(() => {
    if (stage !== "tour" || !step) return;
    const element = document.getElementById(step.target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    element?.classList.add("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background", "transition-shadow");
    return () => element?.classList.remove("ring-2", "ring-primary", "ring-offset-4", "ring-offset-background", "transition-shadow");
  }, [stage, step]);

  const close = (markSeen: boolean) => {
    if (userId && (markSeen || never)) writeSeen(userId);
    setStage("closed");
    setIndex(0);
  };

  if (stage === "welcome") {
    return (
      <Dialog open onOpenChange={(next) => { if (!next) close(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to your Book Cycle</DialogTitle>
            <DialogDescription>This is your plan for taking a book from idea to published, one phase and milestone at a time. Take a quick look around, and it’ll be easy to find your way.</DialogDescription>
          </DialogHeader>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={never} onCheckedChange={(value) => setNever(value === true)} />Don’t show this again</label>
          <DialogFooter>
            <Button variant="outline" onClick={() => close(false)}>Skip for now</Button>
            <Button onClick={() => { setIndex(0); setStage("tour"); }}>Show me around</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (stage === "tour" && step) {
    const last = index === steps.length - 1;
    return (
      <div role="dialog" aria-label="Book cycle tour" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg sm:left-auto sm:right-6 sm:mx-0">
        <p className="text-xs text-muted-foreground">Step {index + 1} of {steps.length}</p>
        <h2 className="mt-1 font-heading text-xl font-normal">{step.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
        <label className="mt-4 flex items-center gap-2 text-sm"><Checkbox checked={never} onCheckedChange={(value) => setNever(value === true)} />Don’t show this again</label>
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => close(false)}>Skip tour</Button>
          <div className="flex gap-2">
            {index > 0 && <Button variant="outline" size="sm" onClick={() => setIndex(index - 1)}>Back</Button>}
            <Button size="sm" onClick={() => (last ? close(true) : setIndex(index + 1))}>{last ? "Done" : "Next"}</Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
