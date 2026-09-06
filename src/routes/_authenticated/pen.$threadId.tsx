import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { UIMessage } from "ai";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/page-heading";
import { PenChat } from "@/components/pen/pen-chat";
import {
  useCreatePenThread,
  useDeletePenThread,
  usePenMessages,
  usePenThreads,
  useRenamePenThread,
  titleFromFirstMessage,
} from "@/lib/pen-db";
import penMark from "@/assets/pen-mark.png";

export const Route = createFileRoute("/_authenticated/pen/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation with Pen — Author's Workshop" },
      {
        name: "description",
        content: "A saved conversation with Pen, your book coach in Author's Workshop.",
      },
      { property: "og:title", content: "Conversation with Pen" },
      { property: "og:description", content: "A saved conversation with your book coach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PenThreadPage,
});

function PenThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const threads = usePenThreads();
  const history = usePenMessages(threadId);
  const rename = useRenamePenThread();
  const remove = useDeletePenThread();
  const createThread = useCreatePenThread();
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const thread = threads.data?.find((entry) => entry.id === threadId);

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      (history.data ?? []).map((row) => ({
        id: row.id,
        role: row.role,
        parts: [{ type: "text" as const, text: row.content }],
      })),
    [history.data],
  );

  const startThread = async () => {
    const created = await createThread.mutateAsync({});
    await navigate({ to: "/pen/$threadId", params: { threadId: created.id } });
  };

  const handleFirstMessage = (text: string) => {
    if (!thread || thread.title !== "New conversation") return;
    rename.mutate({ id: threadId, title: titleFromFirstMessage(text) });
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={thread?.title ?? "Conversation"}
        description="Pen remembers this conversation, so you can pick it back up any time."
        back
        backLabel="All conversations"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDraftTitle(thread?.title ?? ""); setRenaming(true); }}>
              <Pencil /> Rename
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await remove.mutateAsync(threadId);
                toast.success("Conversation deleted.");
                await navigate({ to: "/pen" });
              }}
            >
              <Trash2 /> Delete
            </Button>
            <Button onClick={() => void startThread()} disabled={createThread.isPending}>
              <Plus /> New
            </Button>
          </div>
        }
      />

      {renaming && (
        <form
          className="flex gap-2 rounded-2xl border border-border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            rename.mutate({ id: threadId, title: draftTitle });
            setRenaming(false);
          }}
        >
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            aria-label="Conversation name"
            placeholder="Name this conversation"
          />
          <Button type="submit">Save</Button>
          <Button type="button" variant="ghost" onClick={() => setRenaming(false)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your conversations
          </p>
          {(threads.data ?? []).map((entry) => (
            <Link
              key={entry.id}
              to="/pen/$threadId"
              params={{ threadId: entry.id }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                entry.id === threadId
                  ? "border-primary bg-paper"
                  : "border-border bg-card hover:bg-paper"
              }`}
            >
              <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{entry.title}</span>
            </Link>
          ))}
        </aside>

        <section className="flex min-h-[32rem] flex-col rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-3">
            <img src={penMark} alt="" loading="lazy" width={512} height={512} className="size-10" />
            <div>
              <p className="font-semibold">Pen</p>
              <p className="text-xs text-muted-foreground">Saved to your account</p>
            </div>
          </div>
          {history.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading this conversation…</p>
          ) : (
            <PenChat
              chatId={threadId}
              threadId={threadId}
              section="overview"
              initialMessages={initialMessages}
              onFirstMessage={handleFirstMessage}
            />
          )}
        </section>
      </div>
    </div>
  );
}
