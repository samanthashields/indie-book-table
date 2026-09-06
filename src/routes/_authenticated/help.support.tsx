import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Lightbulb, LifeBuoy, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FEATURE_STATUS_LABELS, useFeatureRequest } from "@/lib/feature-requests";
import { TICKET_STATUS_LABELS, useOpenTicket, useReplyToTicket, useSupportTickets, useTicketMessages } from "@/lib/help-db";
import { useCurrentUser } from "@/lib/use-current-user";

export const Route = createFileRoute("/_authenticated/help/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Contact support · Author’s Workshop" },
      { name: "description", content: "Message the Author’s Workshop team and follow every request you’ve raised." },
      { property: "og:title", content: "Contact support · Author’s Workshop" },
      { property: "og:description", content: "Message the Author’s Workshop team and follow every request you’ve raised." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function SupportPage() {
  const user = useCurrentUser();
  const tickets = useSupportTickets();
  const open = useOpenTicket();
  const reply = useReplyToTicket();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const messages = useTicketMessages(activeId);
  const activeTicket = (tickets.data ?? []).find((ticket) => ticket.id === activeId) ?? null;
  const linkedIdea = useFeatureRequest(activeTicket?.feature_request_id ?? "");

  const mine = (tickets.data ?? []).filter((ticket) => ticket.user_id === user.data?.id);

  const send = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Add a subject and a message");
      return;
    }
    open.mutate(
      { subject: subject.trim(), body: body.trim() },
      {
        onSuccess: (id) => {
          toast.success("Message sent — we’ll reply here");
          setSubject("");
          setBody("");
          setActiveId(id);
        },
        onError: () => toast.error("Couldn’t send that message"),
      },
    );
  };

  return (
    <AppShell>
      <PageHeading title="Contact support" description="Tell us what’s happening and we’ll answer right here." backLabel="Help Center" />

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-sky/40 bg-sky/10 p-5">
          <h2 className="flex items-center gap-2 font-serif text-xl font-normal"><LifeBuoy className="size-5" />Something’s broken or I need help</h2>
          <p className="mt-1 text-sm text-muted-foreground">Send us a message below and we’ll answer in this thread.</p>
        </div>
        <Link to="/help/requests" className="rounded-2xl border-2 border-sun/50 bg-sun/10 p-5 transition-colors hover:border-primary">
          <h2 className="flex items-center gap-2 font-serif text-xl font-normal"><Lightbulb className="size-5" />I have an idea</h2>
          <p className="mt-1 text-sm text-muted-foreground">Post it to the feature request board, where other authors can vote for it.</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4 rounded-2xl border-2 border-sky/40 bg-sky/10 p-6">
          <h2 className="font-serif text-2xl font-normal">New request</h2>
          <Input placeholder="Subject" aria-label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <Textarea rows={7} placeholder="What happened, and what were you trying to do?" aria-label="Message" value={body} onChange={(event) => setBody(event.target.value)} />
          <Button disabled={open.isPending} onClick={send}>{open.isPending ? <Loader2 className="animate-spin" /> : <Send />}Send message</Button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="font-serif text-xl font-normal">My requests</h2>
          <ul className="mt-3 space-y-2">
            {mine.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(ticket.id === activeId ? null : ticket.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${ticket.id === activeId ? "border-primary bg-paper" : "border-border/70 hover:border-primary"}`}
                >
                  <p className="text-sm font-semibold">{ticket.subject}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusPill tone={ticket.status === "resolved" ? "good" : "warm"}>{TICKET_STATUS_LABELS[ticket.status]}</StatusPill>
                    {dateLabel(ticket.created_at)}
                  </p>
                </button>
              </li>
            ))}
            {mine.length === 0 && <li className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No requests yet.</li>}
          </ul>
        </section>
      </div>

      {activeId && (
        <section className="mt-6 max-w-3xl rounded-2xl border border-border bg-paper p-6">
          <h2 className="font-serif text-xl font-normal">Conversation</h2>
          {linkedIdea.data && (
            <Link
              to="/help/requests/$requestId"
              params={{ requestId: linkedIdea.data.id }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary"
            >
              <span className="text-muted-foreground">This is tracked as:</span>
              <span className="font-semibold">{linkedIdea.data.title}</span>
              <StatusPill tone={linkedIdea.data.status === "shipped" ? "good" : "warm"}>{FEATURE_STATUS_LABELS[linkedIdea.data.status]}</StatusPill>
            </Link>
          )}
          <ol className="mt-4 space-y-3">
            {(messages.data ?? []).map((message) => (
              <li key={message.id} className={`rounded-xl p-4 text-sm shadow-xs ${message.from_admin ? "bg-teal/15" : "bg-card"}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{message.from_admin ? "Support" : "You"} · {dateLabel(message.created_at)}</p>
                <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 space-y-3">
            <Textarea rows={4} placeholder="Add to this request…" aria-label="Reply" value={replyBody} onChange={(event) => setReplyBody(event.target.value)} />
            <Button
              variant="secondary"
              disabled={reply.isPending || !replyBody.trim()}
              onClick={() =>
                reply.mutate(
                  { ticketId: activeId, body: replyBody.trim(), fromAdmin: false },
                  { onSuccess: () => { setReplyBody(""); toast.success("Reply sent"); }, onError: () => toast.error("Couldn’t send that reply") },
                )
              }
            >
              Send reply
            </Button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
