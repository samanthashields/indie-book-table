import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FEATURE_STATUS_LABELS,
  FEATURE_STATUS_ORDER,
  useFeatureRequests,
  type FeatureRequestStatus,
} from "@/lib/feature-requests";
import { updateFeatureRequest } from "@/lib/feature-requests.functions";

export const Route = createFileRoute("/_authenticated/admin/requests")({ component: AdminFeatureRequests });

function AdminFeatureRequests() {
  const requests = useFeatureRequests();
  const queryClient = useQueryClient();
  const save = useServerFn(updateFeatureRequest);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<FeatureRequestStatus>("waiting");
  const [note, setNote] = useState("");
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);

  const rows = requests.data ?? [];
  const active = rows.find((row) => row.id === activeId) ?? null;

  useEffect(() => {
    if (active) {
      setStatus(active.status);
      setNote(active.public_note ?? "");
      setApproved(active.approved);
    }
  }, [active]);

  const submit = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await save({ data: { requestId: active.id, status, publicNote: note.trim() || null, approved } });
      await queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Saved — the author and voters have been told");
    } catch {
      toast.error("Couldn’t save that update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-2">
        <h2 className="font-serif text-2xl font-normal">Feature requests</h2>
        {requests.isLoading && <p className="text-sm text-muted-foreground">Loading ideas…</p>}
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setActiveId(row.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${row.id === activeId ? "border-primary bg-paper" : "border-border/70 hover:border-primary"}`}
          >
            <p className="text-sm font-semibold">{row.title}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <StatusPill tone={row.approved ? "good" : "warm"}>{FEATURE_STATUS_LABELS[row.status]}</StatusPill>
              {row.vote_count} {row.vote_count === 1 ? "vote" : "votes"}
              {!row.approved && " · not on the board"}
            </p>
          </button>
        ))}
        {!requests.isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">No ideas yet.</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {!active && <p className="text-sm text-muted-foreground">Pick an idea to review it.</p>}
        {active && (
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-normal">{active.title}</h3>
            {active.area && <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{active.area}</p>}
            <p className="whitespace-pre-wrap text-sm">{active.body}</p>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/70 bg-paper p-4">
              <div className="min-w-56">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</label>
                <Select value={status} onValueChange={(value) => setStatus(value as FeatureRequestStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEATURE_STATUS_ORDER.map((option) => (
                      <SelectItem key={option} value={option}>{FEATURE_STATUS_LABELS[option]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Show on the public board</label>
                <div className="mt-2"><Switch checked={approved} onCheckedChange={setApproved} aria-label="Show on the public board" /></div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Note for authors</label>
              <Textarea className="mt-1" rows={4} placeholder="A sentence everyone following this will see." value={note} onChange={(event) => setNote(event.target.value)} />
            </div>

            <Button disabled={saving} onClick={submit}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Save and notify</Button>
          </div>
        )}
      </section>
    </div>
  );
}
