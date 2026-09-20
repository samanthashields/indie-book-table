import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FEATURE_PRIORITY_LABELS,
  FEATURE_PRIORITY_ORDER,
  FEATURE_STATUS_LABELS,
  FEATURE_STATUS_ORDER,
  useFeatureAttachmentUrls,
  useFeatureRequests,
  useFeatureRequestUpdates,
  type FeaturePriority,
  type FeatureRequestStatus,
} from "@/lib/feature-requests";
import { updateFeatureRequest } from "@/lib/feature-requests.functions";

export const Route = createFileRoute("/_authenticated/admin/requests")({ component: AdminFeatureRequests });

type Filter = "needs_triage" | "all" | FeatureRequestStatus;

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function AdminFeatureRequests() {
  const requests = useFeatureRequests();
  const queryClient = useQueryClient();
  const save = useServerFn(updateFeatureRequest);

  const [filter, setFilter] = useState<Filter>("needs_triage");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<FeatureRequestStatus>("waiting");
  const [priority, setPriority] = useState<FeaturePriority>("nice_to_have");
  const [reply, setReply] = useState("");
  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);

  const all = useMemo(() => requests.data ?? [], [requests.data]);
  const rows = useMemo(() => {
    if (filter === "all") return all;
    if (filter === "needs_triage") return all.filter((row) => !row.approved || row.status === "waiting");
    return all.filter((row) => row.status === filter);
  }, [all, filter]);

  const active = all.find((row) => row.id === activeId) ?? null;
  const timeline = useFeatureRequestUpdates(activeId ?? "");
  const attachmentUrls = useFeatureAttachmentUrls(active?.attachments ?? []);

  useEffect(() => {
    if (active) {
      setStatus(active.status);
      setPriority(active.priority);
      setApproved(active.approved);
      setReply("");
    }
  }, [active]);

  const submit = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await save({ data: { requestId: active.id, status, priority, reply: reply.trim() || null, approved } });
      await queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["feature-request-updates", active.id] });
      setReply("");
      toast.success("Saved — the author and voters have been told");
    } catch {
      toast.error("Couldn’t save that update");
    } finally {
      setSaving(false);
    }
  };

  const entries = timeline.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-normal">Feature requests</h2>
        <Select value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <SelectTrigger aria-label="Filter ideas"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="needs_triage">Needs triage</SelectItem>
            <SelectItem value="all">All ideas</SelectItem>
            {FEATURE_STATUS_ORDER.map((option) => (
              <SelectItem key={option} value={option}>{FEATURE_STATUS_LABELS[option]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {requests.isLoading && <p className="text-sm text-muted-foreground">Loading ideas…</p>}
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setActiveId(row.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${row.id === activeId ? "border-primary bg-paper" : "border-border/70 hover:border-primary"}`}
          >
            <p className="text-sm font-semibold">{row.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusPill tone={row.approved ? "good" : "warm"}>{FEATURE_STATUS_LABELS[row.status]}</StatusPill>
              <span>{FEATURE_PRIORITY_LABELS[row.priority]}</span>
              <span>{row.vote_count} {row.vote_count === 1 ? "vote" : "votes"}</span>
              {!row.approved && <span>· not on the board</span>}
            </p>
          </button>
        ))}
        {!requests.isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {!active && <p className="text-sm text-muted-foreground">Pick an idea to review it.</p>}
        {active && (
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-normal">{active.title}</h3>
            {active.area && <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{active.area}</p>}
            <p className="whitespace-pre-wrap text-sm">{active.body}</p>

            {active.links.length > 0 && (
              <ul className="space-y-1">
                {active.links.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
                      <ExternalLink className="size-3.5" /><span className="truncate">{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {active.attachments.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {active.attachments.map((file) => {
                  const url = attachmentUrls.data?.[file.path];
                  return (
                    <li key={file.path}>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={file.name} loading="lazy" className="h-28 w-40 rounded-xl border border-border object-cover" />
                        </a>
                      ) : (
                        <span className="flex h-28 w-40 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">{file.name}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

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
              <div className="min-w-56">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Priority</label>
                <Select value={priority} onValueChange={(value) => setPriority(value as FeaturePriority)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEATURE_PRIORITY_ORDER.map((option) => (
                      <SelectItem key={option} value={option}>{FEATURE_PRIORITY_LABELS[option]}</SelectItem>
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
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Post a public reply</label>
              <Textarea className="mt-1" rows={4} placeholder="A sentence everyone following this will see." value={reply} onChange={(event) => setReply(event.target.value)} />
            </div>

            <Button disabled={saving} onClick={submit}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Save and notify</Button>

            <div className="rounded-xl border border-border/70 bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timeline</p>
              <ol className="mt-3 space-y-3">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <p className="text-xs text-muted-foreground">{FEATURE_STATUS_LABELS[entry.status]} · {dateLabel(entry.created_at)}</p>
                    {entry.body && <p className="mt-1 whitespace-pre-wrap text-sm">{entry.body}</p>}
                  </li>
                ))}
                {entries.length === 0 && <li className="text-sm text-muted-foreground">Nothing posted yet.</li>}
              </ol>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
