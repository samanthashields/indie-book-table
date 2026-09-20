import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronUp, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { FeatureRequestFields } from "@/components/feature-request-fields";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  FEATURE_NEXT_STEPS,
  FEATURE_PRIORITY_LABELS,
  FEATURE_STATUS_LABELS,
  useFeatureAttachmentUrls,
  useFeatureEmailPreference,
  useFeatureRequest,
  useFeatureRequestUpdates,
  useMyFeatureVotes,
  useSetFeatureEmailPreference,
  useToggleFeatureVote,
  useUpdateMyFeatureRequest,
  useWithdrawFeatureRequest,
  type FeatureAttachment,
  type FeaturePriority,
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

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function FeatureRequestDetail() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const request = useFeatureRequest(requestId);
  const timeline = useFeatureRequestUpdates(requestId);
  const votes = useMyFeatureVotes();
  const toggleVote = useToggleFeatureVote();
  const update = useUpdateMyFeatureRequest();
  const withdraw = useWithdrawFeatureRequest();
  const emailPref = useFeatureEmailPreference();
  const setEmailPref = useSetFeatureEmailPreference();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [area, setArea] = useState("");
  const [priority, setPriority] = useState<FeaturePriority>("nice_to_have");
  const [links, setLinks] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FeatureAttachment[]>([]);

  const data = request.data;
  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setBody(data.body);
      setArea(data.area ?? "");
      setPriority(data.priority);
      setLinks(data.links ?? []);
      setAttachments(data.attachments ?? []);
    }
  }, [data]);

  const attachmentUrls = useFeatureAttachmentUrls(data?.attachments ?? []);

  if (request.isLoading) {
    return <AppShell><p className="text-sm text-muted-foreground">Loading this idea…</p></AppShell>;
  }
  if (!data) {
    return <AppShell><p className="text-sm text-muted-foreground">That idea isn’t available.</p></AppShell>;
  }

  const isMine = data.submitted_by === user.data?.id;
  const editable = isMine && !data.approved && data.status === "waiting";
  const voted = (votes.data ?? []).includes(data.id);
  const entries = timeline.data ?? [];

  return (
    <AppShell>
      <PageHeading title={data.title} description={data.area ?? "Feature request"} backLabel="Feature requests" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            {editable ? (
              <>
                <Input aria-label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
                <Textarea rows={8} aria-label="Details" value={body} onChange={(event) => setBody(event.target.value)} />
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
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate(
                        {
                          id: data.id,
                          title: title.trim(),
                          body: body.trim(),
                          area: area || null,
                          priority,
                          links,
                          attachments,
                        },
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
              <>
                <p className="whitespace-pre-wrap text-sm">{data.body}</p>

                {data.links.length > 0 && (
                  <ul className="space-y-1">
                    {data.links.map((link) => (
                      <li key={link}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-link hover:underline"
                        >
                          <ExternalLink className="size-3.5" />
                          <span className="truncate">{link}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {data.attachments.length > 0 && (
                  <ul className="flex flex-wrap gap-3">
                    {data.attachments.map((file) => {
                      const url = attachmentUrls.data?.[file.path];
                      return (
                        <li key={file.path}>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={file.name} loading="lazy" className="h-28 w-40 rounded-xl border border-border object-cover" />
                            </a>
                          ) : (
                            <span className="flex h-28 w-40 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                              {file.name}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="font-serif text-2xl font-normal">Updates</h2>
            {timeline.isLoading && <p className="mt-2 text-sm text-muted-foreground">Loading updates…</p>}
            <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
              {entries.map((entry, index) => (
                <li key={entry.id} className="relative">
                  <span className={`absolute -left-[27px] top-1.5 size-3 rounded-full border-2 ${index === entries.length - 1 ? "border-primary bg-primary" : "border-border bg-card"}`} />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {index === 0 && !entry.body ? "Submitted" : FEATURE_STATUS_LABELS[entry.status]} · {dateLabel(entry.created_at)}
                  </p>
                  {entry.body && <p className="mt-1 whitespace-pre-wrap text-sm">{entry.body}</p>}
                </li>
              ))}
              {!timeline.isLoading && entries.length === 0 && (
                <li className="text-sm text-muted-foreground">Nothing posted yet.</li>
              )}
            </ol>
            <div className="mt-5 rounded-xl bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What happens next</p>
              <p className="mt-1 text-sm">{FEATURE_NEXT_STEPS[data.status]}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <StatusPill tone={data.status === "shipped" ? "good" : "warm"}>{FEATURE_STATUS_LABELS[data.status]}</StatusPill>
            <p className="mt-3 text-xs text-muted-foreground">Priority: {FEATURE_PRIORITY_LABELS[data.priority]}</p>
            {data.public_note && <p className="mt-3 text-sm text-muted-foreground">{data.public_note}</p>}
            {data.approved && (
              <button
                type="button"
                disabled={toggleVote.isPending}
                onClick={() => toggleVote.mutate({ requestId: data.id, voted })}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${voted ? "border-primary bg-primary/10 text-link" : "border-border/70 hover:border-primary"}`}
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
