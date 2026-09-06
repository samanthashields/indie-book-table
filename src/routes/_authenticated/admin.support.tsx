import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FEATURE_STATUS_LABELS, useFeatureRequests } from "@/lib/feature-requests";
import {
  TICKET_STATUS_LABELS,
  useReplyToTicket,
  useSetTicketFeatureRequest,
  useSetTicketStatus,
  useSupportTickets,
  useTicketMessages,
  type TicketStatus,
} from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/admin/support")({ component: AdminSupport });

const STATUSES: TicketStatus[] = ["new", "open", "waiting", "resolved"];

function useTicketAuthors(userIds: string[]) {
  const key = [...new Set(userIds)].sort().join(",");
  return useQuery({
    queryKey: ["help", "ticket-authors", key],
    enabled: userIds.length > 0,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name").in("user_id", [...new Set(userIds)]);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((row) => [row.user_id, row.display_name || "Author"]));
    },
  });
}

function AdminSupport() {
  const tickets = useSupportTickets();
  const reply = useReplyToTicket();
  const setStatus = useSetTicketStatus();
  const setLinkedIdea = useSetTicketFeatureRequest();
  const ideas = useFeatureRequests();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const messages = useTicketMessages(activeId);
  const authors = useTicketAuthors((tickets.data ?? []).map((ticket) => ticket.user_id));

  const active = (tickets.data ?? []).find((ticket) => ticket.id === activeId);

  const send = () => {
    if (!active || !body.trim()) return;
    reply.mutate(
      { ticketId: active.id, body: body.trim(), fromAdmin: true, notifyUserId: active.user_id },
      { onSuccess: () => { setBody(""); toast.success("Reply sent"); }, onError: () => toast.error("Couldn’t send that reply") },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="space-y-2">
        <h2 className="font-serif text-2xl font-normal">Support requests</h2>
        {tickets.isLoading && <p className="text-sm text-muted-foreground">Loading requests…</p>}
        {(tickets.data ?? []).map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => setActiveId(ticket.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${ticket.id === activeId ? "border-primary bg-paper" : "border-border/70 bg-card hover:border-primary"}`}
          >
            <p className="text-sm font-semibold">{ticket.subject}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusPill tone={ticket.status === "resolved" ? "good" : "warm"}>{TICKET_STATUS_LABELS[ticket.status]}</StatusPill>
              {authors.data?.[ticket.user_id] ?? "Author"} · {new Date(ticket.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          </button>
        ))}
        {!tickets.isLoading && (tickets.data ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No requests yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {!active && <p className="text-sm text-muted-foreground">Pick a request to read and answer it.</p>}
        {active && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-normal">{active.subject}</h2>
              <label className="text-sm font-semibold">
                Status
                <select
                  className="ml-2 h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  value={active.status}
                  onChange={(event) => setStatus.mutate({ ticketId: active.id, status: event.target.value as TicketStatus })}
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{TICKET_STATUS_LABELS[status]}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">From {authors.data?.[active.user_id] ?? "an author"}</p>

            <div className="mt-4 rounded-xl border border-border/70 bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tracked as a feature request</p>
              <Select
                value={active.feature_request_id ?? "none"}
                onValueChange={(value) =>
                  setLinkedIdea.mutate(
                    { ticketId: active.id, featureRequestId: value === "none" ? null : value },
                    { onSuccess: () => toast.success("Link updated"), onError: () => toast.error("Couldn’t update the link") },
                  )
                }
              >
                <SelectTrigger className="mt-2" aria-label="Linked feature request"><SelectValue placeholder="Not linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {(ideas.data ?? []).map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title} — {FEATURE_STATUS_LABELS[idea.status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ol className="mt-5 space-y-3">
              {(messages.data ?? []).map((message) => (
                <li key={message.id} className={`rounded-xl p-4 text-sm ${message.from_admin ? "bg-teal/15" : "bg-paper"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {message.from_admin ? "Support" : authors.data?.[active.user_id] ?? "Author"} · {new Date(message.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-5 space-y-3">
              <Textarea rows={5} placeholder="Write a reply…" aria-label="Reply" value={body} onChange={(event) => setBody(event.target.value)} />
              <Button disabled={reply.isPending || !body.trim()} onClick={send}>Send reply</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
