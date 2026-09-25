import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { CoachMark } from "@/components/coach-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CYCLE_TOUR_TARGETS, useCycleTourSteps } from "@/lib/cycle-tour";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

const storageKey = (userId: string) => `ibt:cycle-tour-seen:${userId}`;
const RING = ["ring-2", "ring-primary", "ring-offset-4", "ring-offset-background", "transition-shadow"];
const CARD_WIDTH = 360;
const GAP = 18;

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

function PenAvatar({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-11 place-items-center rounded-full border border-border bg-card text-link shadow-sm", className)}>
      <CoachMark className="size-7" />
    </span>
  );
}

type Placement = { top: number; left: number; side: "above" | "below"; arrowLeft: number } | null;

/** A first-visit welcome plus a short walkthrough. Each step floats beside the part of the page it talks about. */
export function CycleTour({ replayKey }: { replayKey: number }) {
  const user = useCurrentUser();
  const userId = user.data?.id;
  const stepsQuery = useCycleTourSteps();
  const [stage, setStage] = useState<"closed" | "welcome" | "tour">("closed");
  const [index, setIndex] = useState(0);
  const [never, setNever] = useState(false);
  const [placement, setPlacement] = useState<Placement>(null);
  const [narrow, setNarrow] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const all = stepsQuery.data ?? [];
  const welcome = all.find((step) => step.key === "welcome");
  const tourSteps = stage === "tour" ? all.filter((step) => step.key !== "welcome" && document.getElementById(CYCLE_TOUR_TARGETS[step.key] ?? "")) : [];
  const step = tourSteps[index];
  const targetId = step ? CYCLE_TOUR_TARGETS[step.key] : undefined;

  useEffect(() => {
    if (userId && stepsQuery.isSuccess && !readSeen(userId)) setStage(welcome ? "welcome" : "tour");
  }, [userId, stepsQuery.isSuccess, welcome]);

  useEffect(() => {
    if (replayKey > 0) {
      setIndex(0);
      setStage(welcome ? "welcome" : "tour");
    }
  }, [replayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage !== "tour" || !targetId) return;
    const element = document.getElementById(targetId);
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.style.scrollMarginTop = "300px";
    element.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    element.classList.add(...RING);
    return () => {
      element.classList.remove(...RING);
      element.style.scrollMarginTop = "";
    };
  }, [stage, targetId]);

  useLayoutEffect(() => {
    if (stage !== "tour" || !targetId) return;
    let frame = 0;
    const place = () => {
      const element = document.getElementById(targetId);
      const card = cardRef.current;
      const isNarrow = window.innerWidth < 640;
      setNarrow(isNarrow);
      if (!element || !card || isNarrow) {
        setPlacement(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      const height = card.offsetHeight;
      const left = Math.min(Math.max(rect.left + 32, 16), window.innerWidth - CARD_WIDTH - 16);
      const arrowLeft = Math.min(Math.max(rect.left + 56 - left, 24), CARD_WIDTH - 40);
      const aboveTop = rect.top - height - GAP;
      const side = aboveTop >= 8 ? "above" : "below";
      const rawTop = side === "above" ? aboveTop : rect.bottom + GAP;
      const top = Math.min(Math.max(rawTop, 8), window.innerHeight - height - 16);
      setPlacement({ top, left, side, arrowLeft });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stage, targetId, index]);

  const close = (markSeen: boolean) => {
    if (userId && (markSeen || never)) writeSeen(userId);
    setStage("closed");
    setIndex(0);
    setPlacement(null);
  };

  if (stage === "welcome" && welcome) {
    return (
      <Dialog open onOpenChange={(next) => { if (!next) close(false); }}>
        <DialogContent>
          <DialogHeader>
            <PenAvatar className="mb-1" />
            <DialogTitle>{welcome.title}</DialogTitle>
            <DialogDescription>{welcome.body}</DialogDescription>
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
    const last = index === tourSteps.length - 1;
    return (
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Book cycle tour"
        style={narrow || !placement ? undefined : { top: placement.top, left: placement.left, width: CARD_WIDTH }}
        className={cn(
          "fixed z-50 rounded-2xl border border-border bg-card p-5 pl-6 shadow-lg motion-safe:transition-[top,left] motion-safe:duration-300",
          narrow || !placement ? "inset-x-4 bottom-4 mx-auto max-w-md" : "",
          !narrow && !placement && "opacity-0",
        )}
      >
        {!narrow && placement && (
          <span
            aria-hidden="true"
            style={{ left: placement.arrowLeft }}
            className={cn("absolute size-4 rotate-45 border-border bg-card", placement.side === "above" ? "-bottom-2 border-b border-r" : "-top-2 border-l border-t")}
          />
        )}
        <PenAvatar className="absolute -left-4 -top-4" />
        <p className="pl-6 text-xs text-muted-foreground">Step {index + 1} of {tourSteps.length}</p>
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
