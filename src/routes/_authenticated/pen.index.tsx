import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { PenChat, penOpener } from "@/components/pen/pen-chat";
import { useCreatePenThread, usePenThreads } from "@/lib/pen-db";
import { useCurrentUser } from "@/lib/use-current-user";
import penMarkAsset from "@/assets/pen-mark.png.asset.json";
import aiPenCoachAsset from "@/assets/ai-pen-coach.svg.asset.json";
const penMark = penMarkAsset.url;
const aiPenCoach = aiPenCoachAsset.url;


export const Route = createFileRoute("/_authenticated/pen/")({
  head: () => ({
    meta: [
      { title: "Pen, your book coach — Author's Workshop" },
      {
        name: "description",
        content:
          "Talk to Pen about your books: what to write next, when to start a book cycle, and how to publish well.",
      },
      { property: "og:title", content: "Pen, your book coach" },
      {
        property: "og:description",
        content: "A book coach who knows your shelf and asks the right questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PenIndexPage,
});

function PenIndexPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const paid = user.data?.profile?.plan === "paid";
  const threads = usePenThreads();
  const createThread = useCreatePenThread();

  const startThread = async (title?: string) => {
    try {
      const thread = await createThread.mutateAsync(title ? { title } : {});
      await navigate({ to: "/pen/$threadId", params: { threadId: thread.id } });
    } catch {
      toast.error("Couldn't start a new conversation.");
    }
  };

  return (
    <AppShell showPenLauncher={false}>
    <div className="min-w-0 space-y-6">
      <PageHeading
        title="Pen"
        description="Your book coach. Talk through ideas, decide what's next, and get your books to the world."
        action={
          paid ? (
            <Button onClick={() => void startThread()} disabled={createThread.isPending}>
              <Plus /> New conversation
            </Button>
          ) : null
        }
      />

      {!paid ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <img
              src={aiPenCoach}
              alt=""
              loading="lazy"
              width={2000}
              height={2000}
              className="max-h-36 w-auto object-contain"
            />
            <div>
              <p className="font-semibold">Pen comes with the paid plan.</p>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                Free authors keep the templates and the build-from-scratch cycle. Upgrade to talk with Pen
                about your shelf, your pacing and your budget whenever you like.
              </p>
              <Button
                className="mt-4"
                onClick={() => toast.info("Plans are coming soon — your account is on the free plan for now.")}
              >
                Upgrade to the paid plan
              </Button>
            </div>
          </div>
        </div>

      ) : (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your conversations
            </p>
            {(threads.data ?? []).map((thread) => (
              <Link
                key={thread.id}
                to="/pen/$threadId"
                params={{ threadId: thread.id }}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-paper"
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{thread.title}</span>
              </Link>
            ))}
            {threads.data?.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No saved conversations yet. Anything you say below is saved once you name a conversation.
              </p>
            )}
          </aside>

          <section className="flex h-[clamp(32rem,65dvh,44rem)] min-w-0 flex-col rounded-2xl border border-border bg-card p-3 sm:p-5">
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <img src={penMark} alt="" loading="lazy" width={1100} height={850} className="max-h-10 max-w-10 object-contain" />
              <div className="hidden min-w-0 sm:block">
                <p className="font-semibold">Pen</p>
                <p className="truncate text-xs text-muted-foreground">{penOpener("overview").greeting.slice(0, 60)}…</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto max-w-full"
                onClick={() => void startThread()}
                disabled={createThread.isPending}
              >
                Save as a conversation
              </Button>
            </div>
            <PenChat chatId="pen-quick" section="overview" />
          </section>
        </div>
      )}
    </div>
    </AppShell>
  );
}
