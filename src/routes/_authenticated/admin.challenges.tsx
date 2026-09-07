import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHALLENGE_METRICS,
  CHALLENGE_METRIC_LABELS,
  currentMonthValue,
  useAllChallenges,
  useDeleteChallenge,
  useSaveChallenge,
  type ChallengeMetric,
  type ChallengeRow,
} from "@/lib/challenges";
import { DECORATIONS, DECORATION_KEYS, type DecorationKey } from "@/lib/decorations";

export const Route = createFileRoute("/_authenticated/admin/challenges")({
  head: () => ({ meta: [
    { title: "Challenges — Admin" },
    { name: "description", content: "Create the monthly challenges authors can complete to decorate their table." },
    { property: "og:title", content: "Challenges — Admin" },
    { property: "og:description", content: "Create the monthly challenges authors can complete to decorate their table." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminChallenges,
});

type Draft = Omit<ChallengeRow, "id"> & { id?: string };

const emptyDraft = (): Draft => ({
  title: "",
  blurb: "",
  challenge_month: currentMonthValue(),
  metric: "milestones_completed",
  target: 5,
  decoration_key: "lamp",
  active: true,
});

function ChallengeForm({ initial, onDone }: { initial: Draft; onDone?: () => void }) {
  const [draft, setDraft] = useState<Draft>(initial);
  const save = useSaveChallenge();
  const remove = useDeleteChallenge();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={`title-${draft.id ?? "new"}`}>Title</Label>
          <Input id={`title-${draft.id ?? "new"}`} value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Spring sprint" className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`blurb-${draft.id ?? "new"}`}>Description</Label>
          <Textarea id={`blurb-${draft.id ?? "new"}`} value={draft.blurb ?? ""} onChange={(event) => set("blurb", event.target.value)} rows={2} className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`month-${draft.id ?? "new"}`}>Month</Label>
          <Input id={`month-${draft.id ?? "new"}`} type="month" value={draft.challenge_month.slice(0, 7)} onChange={(event) => set("challenge_month", `${event.target.value}-01`)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`target-${draft.id ?? "new"}`}>Target</Label>
          <Input id={`target-${draft.id ?? "new"}`} type="number" min={1} value={draft.target} onChange={(event) => set("target", Number(event.target.value))} className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`metric-${draft.id ?? "new"}`}>Counts</Label>
          <select
            id={`metric-${draft.id ?? "new"}`}
            value={draft.metric}
            onChange={(event) => set("metric", event.target.value as ChallengeMetric)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {CHALLENGE_METRICS.map((metric) => <option key={metric} value={metric}>{CHALLENGE_METRIC_LABELS[metric]}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor={`decoration-${draft.id ?? "new"}`}>Reward</Label>
          <select
            id={`decoration-${draft.id ?? "new"}`}
            value={draft.decoration_key}
            onChange={(event) => set("decoration_key", event.target.value as DecorationKey)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {DECORATION_KEYS.map((key) => <option key={key} value={key}>{DECORATIONS[key].label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch id={`active-${draft.id ?? "new"}`} checked={draft.active} onCheckedChange={(checked) => set("active", checked)} />
          <Label htmlFor={`active-${draft.id ?? "new"}`}>Visible to authors</Label>
        </div>
        <Button
          onClick={() => {
            if (!draft.title.trim()) { toast.error("Give the challenge a title."); return; }
            save.mutate(
              { ...draft, title: draft.title.trim() },
              { onSuccess: () => { toast.success("Challenge saved."); onDone?.(); } },
            );
          }}
          disabled={save.isPending}
        >
          Save
        </Button>
        {draft.id && (
          <Button
            variant="ghost"
            onClick={() => remove.mutate(draft.id!, { onSuccess: () => toast.success("Challenge removed.") })}
            disabled={remove.isPending}
          >
            <Trash2 />Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function AdminChallenges() {
  const { data: challenges = [], isLoading } = useAllChallenges();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Monthly challenges. Finishing one adds a decoration to the author’s table.</p>
        <Button onClick={() => setAdding(true)}><Plus />New challenge</Button>
      </div>

      {adding && <ChallengeForm initial={emptyDraft()} onDone={() => setAdding(false)} />}

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : challenges.length === 0 && !adding ? (
        <p className="rounded-2xl border border-dashed border-border bg-paper p-6 text-sm text-muted-foreground">No challenges yet.</p>
      ) : (
        challenges.map((challenge) => <ChallengeForm key={challenge.id} initial={challenge} />)
      )}
    </div>
  );
}
