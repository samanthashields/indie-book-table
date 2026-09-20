import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  resolveOnboardingMedia,
  useSaveWorkshopOnboardingState,
  useWorkshopOnboarding,
  type WorkshopTourStep,
} from "@/lib/workshop-onboarding";

export const OPEN_WORKSHOP_WELCOME = "open-workshop-welcome";
export const OPEN_WORKSHOP_TOUR = "open-workshop-tour";
const SESSION_CLOSED_KEY = "workshop-welcome-closed";

function Media({ kind, value, label }: { kind: string; value: string; label: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let current = true;
    if (!value) { setUrl(""); return; }
    void resolveOnboardingMedia(value).then((next) => { if (current) setUrl(next); }).catch(() => { if (current) setUrl(""); });
    return () => { current = false; };
  }, [value]);

  if (!value || kind === "none") {
    return (
      <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-border bg-secondary/50 text-muted-foreground">
        <div className="text-center"><ImageIcon className="mx-auto size-7" /><p className="mt-2 text-sm">Introduction media</p></div>
      </div>
    );
  }
  if (!url) return <div className="aspect-video animate-pulse rounded-lg bg-secondary" />;
  if (kind === "video") {
    return <video className="aspect-video w-full rounded-lg bg-foreground object-contain" src={url} controls aria-label={label} />;
  }
  return <img className="aspect-video w-full rounded-lg object-cover" src={url} alt={label} />;
}

function TourScreen({ step, index, count }: { step: WorkshopTourStep; index: number; count: number }) {
  return (
    <>
      <Media kind={step.media_kind} value={step.media_value} label={step.title} />
      <DialogHeader>
        <p className="text-sm font-semibold text-link">{index + 1} of {count}</p>
        <DialogTitle className="font-serif text-3xl font-normal">{step.title}</DialogTitle>
        <DialogDescription className="whitespace-pre-line text-base leading-7">{step.body}</DialogDescription>
      </DialogHeader>
      <div className="flex gap-1" aria-label="Walkthrough progress">
        {Array.from({ length: count }, (_, dot) => (
          <span key={dot} className={`h-1.5 flex-1 rounded-full ${dot <= index ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>
    </>
  );
}

export function WorkshopOnboarding() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const onboarding = useWorkshopOnboarding();
  const saveState = useSaveWorkshopOnboardingState();
  const [mode, setMode] = useState<"closed" | "welcome" | "tour">("closed");
  const [stepIndex, setStepIndex] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const data = onboarding.data;
  const isWorkshopPage = !pathname.startsWith("/admin") && !pathname.startsWith("/auth");

  useEffect(() => {
    if (!data?.welcome?.enabled || data.state?.dismissed || data.state?.completed || !isWorkshopPage) return;
    if (window.sessionStorage.getItem(SESSION_CLOSED_KEY) === "true") return;
    setMode("welcome");
  }, [data, isWorkshopPage]);

  useEffect(() => {
    const openWelcome = (event: Event) => { setPreviewing(event instanceof CustomEvent && event.detail?.preview === true); setDontShow(false); setMode("welcome"); };
    const openTour = (event: Event) => { setPreviewing(event instanceof CustomEvent && event.detail?.preview === true); setStepIndex(0); setMode("tour"); };
    window.addEventListener(OPEN_WORKSHOP_WELCOME, openWelcome);
    window.addEventListener(OPEN_WORKSHOP_TOUR, openTour);
    return () => {
      window.removeEventListener(OPEN_WORKSHOP_WELCOME, openWelcome);
      window.removeEventListener(OPEN_WORKSHOP_TOUR, openTour);
    };
  }, []);

  const step = data?.steps[stepIndex];
  const closeForNow = () => {
    window.sessionStorage.setItem(SESSION_CLOSED_KEY, "true");
    setMode("closed");
    if (previewing) return;
    void saveState.mutateAsync({ last_seen_at: new Date().toISOString(), dismissed: dontShow });
  };
  const finish = () => {
    setMode("closed");
    if (previewing) return;
    void saveState.mutateAsync({ completed: true, dismissed: false, current_step: 0, last_seen_at: new Date().toISOString() });
  };

  if (!data?.welcome) return null;

  return (
    <Dialog open={mode !== "closed"} onOpenChange={(open) => { if (!open) closeForNow(); }}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl p-5 sm:p-7">
        {mode === "welcome" ? (
          <>
            <Media kind={data.welcome.media_kind} value={data.welcome.media_value} label={data.welcome.heading} />
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl font-normal">{data.welcome.heading}</DialogTitle>
              <DialogDescription className="whitespace-pre-line text-base leading-7">{data.welcome.body}</DialogDescription>
            </DialogHeader>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox checked={dontShow} onCheckedChange={(checked) => setDontShow(checked === true)} />
              Don’t show this again
            </label>
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button variant="outline" onClick={closeForNow}>{data.welcome.secondary_label}</Button>
              <Button onClick={() => { setStepIndex(0); setMode("tour"); }}>{data.welcome.primary_label}</Button>
            </DialogFooter>
          </>
        ) : step ? (
          <>
            <TourScreen step={step} index={stepIndex} count={data.steps.length} />
            <DialogFooter className="items-center gap-2 sm:space-x-0">
              <Button variant="ghost" onClick={() => { setMode("closed"); if (!previewing) void saveState.mutateAsync({ dismissed: true, current_step: stepIndex, last_seen_at: new Date().toISOString() }); }}>Skip</Button>
              {step.destination_label && step.destination_path ? (
                <Button variant="outline" onClick={() => { setMode("closed"); void navigate({ to: step.destination_path as "/" }); }}>{step.destination_label}</Button>
              ) : null}
              <Button variant="outline" size="icon" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))} aria-label="Previous screen"><ChevronLeft /></Button>
              {stepIndex === data.steps.length - 1 ? (
                <Button onClick={finish}>Finish</Button>
              ) : (
                <Button onClick={() => { const next = stepIndex + 1; setStepIndex(next); void saveState.mutateAsync({ current_step: next, last_seen_at: new Date().toISOString() }); }}>Next<ChevronRight /></Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader><DialogTitle>No walkthrough screens yet</DialogTitle><DialogDescription>You can continue into the Workshop.</DialogDescription></DialogHeader>
            <DialogFooter><Button onClick={closeForNow}>Continue</Button></DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}