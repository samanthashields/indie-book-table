import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronUp, Lightbulb, Loader2, Search, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FeatureRequestFields } from "@/components/feature-request-fields";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  FEATURE_PRIORITY_LABELS,
  FEATURE_STATUS_LABELS,
  FEATURE_STATUS_ORDER,
  useFeatureRequests,
  useMyFeatureVotes,
  useSubmitFeatureRequest,
  useToggleFeatureVote,
  type FeatureAttachment,
  type FeaturePriority,
  type FeatureRequestStatus,
} from "@/lib/feature-requests";

export const Route = createFileRoute("/_authenticated/help/requests/")({
  component: FeatureRequestsBoard,
  head: () => ({
    meta: [
      { title: "Feature requests · Author’s Workshop" },
      { name: "description", content: "Share an idea for the workshop, vote for the ones you want most, and follow what we’re building next." },
      { property: "og:title", content: "Feature requests · Author’s Workshop" },
      { property: "og:description", content: "Share an idea for the workshop, vote for the ones you want most, and follow what we’re building next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TONE: Record<FeatureRequestStatus, "good" | "warm" | "neutral"> = {
  waiting: "warm",
  considering: "warm",
  planned: "neutral",
  in_progress: "neutral",
  shipped: "good",
  not_planned: "neutral",
};

function FeatureRequestsBoard() {
  const user = useCurrentUser();
  const requests = useFeatureRequests();
  const votes = useMyFeatureVotes();
  const toggleVote = useToggleFeatureVote();
  const submit = useSubmitFeatureRequest();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FeatureRequestStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [area, setArea] = useState<string>("");
  const [priority, setPriority] = useState<FeaturePriority>("nice_to_have");
  const [links, setLinks] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FeatureAttachment[]>([]);

  const votedIds = useMemo(() => new Set(votes.data ?? []), [votes.data]);
  const all = requests.data ?? [];
  const mine = all.filter((request) => request.submitted_by === user.data?.id && !request.approved);

  const board = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all
      .filter((request) => request.approved)
      .filter((request) => (statusFilter === "all" ? true : request.status === statusFilter))
      .filter((request) => (needle ? `${request.title} ${request.body}`.toLowerCase().includes(needle) : true));
  }, [all, query, statusFilter]);

  const send = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a short title and a little detail");
      return;
    }
    submit.mutate(
      { title: title.trim(), body: body.trim(), area: area || null, priority, links, attachments },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setArea("");
          setPriority("nice_to_have");
          setLinks([]);
          setAttachments([]);
          setShowForm(false);
          toast.success("Thanks — we’ll read it and post it to the board once it’s reviewed");
        },
        onError: () => toast.error("Couldn’t send that idea"),
      },
    );
  };

  return (
    <AppShell>
      <PageHeading
        title="Feature requests"
        description="Ideas from authors, out in the open. Vote for what you want most and follow it all the way to shipped."
        backLabel="Help Center"
        action={<Button onClick={() => setShowForm((open) => !open)}><Lightbulb />Request a feature</Button>}
      />

      {showForm && (
        <section className="mb-8 space-y-4 rounded-2xl border-2 border-sun/50 bg-sun/10 p-6">
          <h2 className="font-serif text-2xl font-normal">Your idea</h2>
          <Input placeholder="One line — what should it do?" aria-label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea rows={6} placeholder="What are you trying to get done, and where does the workshop get in the way today?" aria-label="Details" value={body} onChange={(event) => setBody(event.target.value)} />
          <FeatureRequestFields
            area={area}
            onAreaChange={setArea}
            priority={priority}
            onPriorityChange={setPriority}
            links={links}
            onLinksChange={setLinks}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
          <p className="text-xs text-muted-foreground">We read every idea. Once it’s reviewed it appears on the board below, where other authors can vote for it.</p>
          <Button disabled={submit.isPending} onClick={send}>{submit.isPending ? <Loader2 className="animate-spin" /> : <Send />}Send idea</Button>
        </section>
      )}

      {mine.length > 0 && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-serif text-xl font-normal">Waiting for review</h2>
          <p className="text-xs text-muted-foreground">Only you and the team can see these until they’re posted to the board.</p>
          <ul className="mt-3 space-y-2">
            {mine.map((request) => (
              <li key={request.id}>
                <Link to="/help/requests/$requestId" params={{ requestId: request.id }} className="block rounded-xl border border-border/70 px-4 py-3 hover:border-primary">
                  <p className="text-sm font-semibold">{request.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{FEATURE_STATUS_LABELS[request.status]}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search ideas" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setStatusFilter("all")} className={chip(statusFilter === "all")}>All</button>
          {FEATURE_STATUS_ORDER.filter((status) => status !== "waiting").map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} className={chip(statusFilter === status)}>
              {FEATURE_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </section>

      <ul className="space-y-3">
        {board.map((request) => {
          const voted = votedIds.has(request.id);
          return (
            <li key={request.id} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <button
                type="button"
                aria-label={voted ? "Remove my vote" : "Vote for this idea"}
                disabled={toggleVote.isPending}
                onClick={() => toggleVote.mutate({ requestId: request.id, voted })}
                className={`flex w-16 shrink-0 flex-col items-center rounded-xl border-2 px-2 py-2 transition-colors ${voted ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary"}`}
              >
                <ChevronUp className="size-5" />
                <span className="text-sm font-semibold">{request.vote_count}</span>
              </button>
              <div className="min-w-0 flex-1">
                <Link to="/help/requests/$requestId" params={{ requestId: request.id }} className="font-serif text-xl font-normal hover:underline">
                  {request.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{request.body}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone={TONE[request.status]}>{FEATURE_STATUS_LABELS[request.status]}</StatusPill>
                  {request.area && <span className="text-xs text-muted-foreground">{request.area}</span>}
                  <span className="text-xs text-muted-foreground">{FEATURE_PRIORITY_LABELS[request.priority]}</span>
                </p>
              </div>
            </li>
          );
        })}
        {requests.isLoading && <li className="text-sm text-muted-foreground">Loading ideas…</li>}
        {!requests.isLoading && board.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No ideas here yet. Yours could be the first.
          </li>
        )}
      </ul>
    </AppShell>
  );
}

function chip(active: boolean) {
  return `rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-card text-muted-foreground hover:text-foreground"}`;
}
