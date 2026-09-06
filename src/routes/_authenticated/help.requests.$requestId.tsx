import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronUp, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  FEATURE_STATUS_LABELS,
  useFeatureEmailPreference,
  useFeatureRequest,
  useMyFeatureVotes,
  useSetFeatureEmailPreference,
  useToggleFeatureVote,
  useUpdateMyFeatureRequest,
  useWithdrawFeatureRequest,
} from "@/lib/feature-requests";

export const Route = createFileRoute("/_authenticated/help/requests/$requestId")({
  component: FeatureRequestDetail,
  head: () => ({
    meta: [
      { title: "Feature request · Author’s Workshop" },
      { name: "description", content: "Follow an idea from the authors’ board: where it stands, what the team said, and how many authors want it." },
      { property: "og:title", content: "Feature request · Author’s Workshop" },
      { property: "og:description", content: "Follow an idea from the authors’ board: where it stands, what the team said, and how many authors want it." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function FeatureRequestDetail() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const request = useFeatureRequest(requestId);
  const votes = useMyFeatureVotes();
  const toggleVote = useToggleFeatureVote();
  const update = useUpdateMyFeatureRequest();
  const withdraw = useWithdrawFeatureRequest();
  const emailPref = useFeatureEmailPreference();
  const setEmailPref = useSetFeatureEmailPreference();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const data = request.data;
  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setBody(data.body);
    }
  }, [data]);

  if (request.isLoading) {
    return <AppShell><p className="text-sm text-muted-foreground">Loading this idea…</p></AppShell>;
  }
  if (!data) {
    return <AppShell><p className="text-sm text-muted-foreground">That idea isn’t available.</p></AppShell>;
  }

  const isMine = data.submitted_by === user.data?.id;
  const editable = isMine && !data.approved && data.status === "waiting";
  const voted = (votes.data ?? []).includes(data.id);

  return (
    <AppShell>
      <PageHeading title={data.title} description={data.area ?? "Feature request"} backLabel="Feature requests" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          {editable ? (
            <>
              <Input aria-label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
              <Textarea rows={8} aria-label="Details" value={body} onChange={(event) => setBody(event.target.value)} />
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate(
                      { id: data.id, title: title.trim(), body: body.trim(), area: data.area },
                      { onSuccess: () => toast.success("Saved"), onError: () => toast.error("Couldn’t save that") },
                    )
                  }
                >
                  {update.isPending ? <Loader2 className="animate-spin" /> : <Save />}Save changes
                </Button>
                <Button
                  variant="secondary"
                  disabled={withdraw.isPending}
                  onClick={() =>
                    withdraw.mutate(data.id, {
                      onSuccess: () => { toast.success("Idea withdrawn"); void navigate({ to: "/help/requests" }); },
                      onError: () => toast.error("Couldn’t withdraw that"),
                    })
                  }
                >
                  <Trash2 />Withdraw
                </Button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{data.body}</p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <StatusPill tone={data.status === "shipped" ? "good" : "warm"}>{FEATURE_STATUS_LABELS[data.status]}</StatusPill>
            {data.public_note && <p className="mt-3 text-sm text-muted-foreground">{data.public_note}</p>}
            {data.approved && (
              <button
                type="button"
                disabled={toggleVote.isPending}
                onClick={() => toggleVote.mutate({ requestId: data.id, voted })}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${voted ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:border-primary"}`}
              >
                <ChevronUp className="size-4" />
                {voted ? "You voted" : "Vote for this"} · {data.vote_count}
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-paper p-5">
            <p className="text-sm font-semibold">Email me about progress</p>
            <p className="mt-1 text-xs text-muted-foreground">You always get a bell notification. Turn this on to hear by email too.</p>
            <div className="mt-3">
              <Switch
                checked={emailPref.data ?? true}
                onCheckedChange={(checked) => setEmailPref.mutate(checked)}
                aria-label="Email me about feature request progress"
              />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
