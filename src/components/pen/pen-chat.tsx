import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PenQuickActions } from "@/components/pen/pen-quick-actions";
import { PenReferenceChips, parsePenMessage } from "@/components/pen/pen-references";
import { penAuthHeaders } from "@/lib/pen-db";
import { useAddChecklistItems } from "@/lib/milestone-checklist";
import penMarkAsset from "@/assets/pen-mark.png.asset.json";
const penMark = penMarkAsset.url;


export const PEN_OPENERS: Record<string, { greeting: string; suggestions: string[] }> = {
  overview: {
    greeting:
      "Hello — I'm Pen. I keep an eye on your shelf and help you move each book forward. What are we working on today?",
    suggestions: [
      "Which book should I focus on right now?",
      "How do I know a book is ready for a cycle?",
      "Help me talk through a new book idea",
    ],
  },
  books: {
    greeting:
      "Your shelf is where every idea starts. Tell me about one of these books and we'll work out its next step.",
    suggestions: [
      "What's the next step for my newest book?",
      "How do I turn an idea into a real plan?",
      "When should I start a book cycle?",
    ],
  },
  cycle: {
    greeting:
      "Let's look at this cycle together. I can help you pace the phases and decide what's worth paying for.",
    suggestions: [
      "What should I focus on this week?",
      "Am I on pace for my launch date?",
      "What can I do myself instead of hiring?",
    ],
  },
  milestone: {
    greeting: "Tell me where you're stuck on this milestone and I'll help you find a way in.",
    suggestions: [
      "How do I read an editor's letter?",
      "How long should this take?",
      "What if I disagree with a note?",
    ],
  },
  submissions: {
    greeting:
      "Published books belong on The Table. I can help you polish a submission or plan what comes after it.",
    suggestions: [
      "How do I make my submission stand out?",
      "What happens after I submit?",
      "How do I market a published book?",
    ],
  },
  create: {
    greeting:
      "Tell me what you're writing and when you'd like it out in the world, and we'll shape a realistic plan.",
    suggestions: [
      "How long does self-publishing take?",
      "What should I spend money on first?",
      "Help me pick a genre template",
    ],
  },
};

/** Reads the book and milestone out of the page the author is standing on. */
function useMilestoneTarget() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const match = /^\/books\/([^/]+)\/milestones\/([^/]+)/.exec(pathname);
  if (!match?.[1] || !match[2]) return null;
  return { bookId: match[1], milestoneId: match[2] };
}

/** Turns a reply's numbered steps into checklist items on the open milestone. */
function SaveStepsButton({
  steps,
  target,
}: {
  steps: string[];
  target: { bookId: string; milestoneId: string };
}) {
  const add = useAddChecklistItems();
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await add.mutateAsync({
        milestoneId: target.milestoneId,
        bookId: target.bookId,
        items: steps.slice(0, 12).map((label) => ({ label })),
      });
      setSaved(true);
      toast.success("Saved to this milestone's checklist");
    } catch {
      toast.error("Couldn't save those steps.");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void save()}
      disabled={add.isPending || saved}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-leaf/50 bg-leaf/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-leaf/35 disabled:opacity-60"
    >
      <ListChecks className="size-3.5" />
      {saved ? "Saved to your checklist" : `Save ${steps.length} steps to this milestone`}
    </button>
  );
}

export function penOpener(section: string | undefined) {
  return PEN_OPENERS[section ?? "overview"] ?? PEN_OPENERS["overview"]!;
}

/**
 * The Pen conversation surface. Streams from /api/pen and, when a threadId is
 * given, the server saves both sides of the exchange to that thread.
 */
export function PenChat({
  chatId,
  threadId,
  section = "overview",
  initialMessages,
  onFirstMessage,
  className,
}: {
  chatId: string;
  threadId?: string | undefined;
  section?: string | undefined;
  initialMessages?: UIMessage[] | undefined;
  onFirstMessage?: ((text: string) => void) | undefined;
  className?: string | undefined;
}) {
  const opener = penOpener(section);
  const milestoneTarget = useMilestoneTarget();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/pen",
        headers: penAuthHeaders,
        body: { threadId: threadId ?? null, section },
      }),
    [threadId, section],
  );

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    ...(initialMessages ? { messages: initialMessages } : {}),
    transport,
    onError: (error) =>
      toast.error(
        error.message.includes("paid plan")
          ? "Pen comes with the paid plan."
          : "Pen couldn't reply just now. Try again in a moment.",
      ),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId]);

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    if (messages.length === 0) onFirstMessage?.(value);
    void sendMessage({ text: value });
  };

  const handleSubmit = (message: { text?: string }, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = event.currentTarget.querySelector("textarea");
    send(message.text ?? field?.value ?? "");
    if (field) field.value = "";
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`}>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="space-y-4">
          {messages.length === 0 && (
            <div className="flex items-start gap-3">
              <img src={penMark} alt="" width={1100} height={850} className="max-h-10 max-w-10 shrink-0 object-contain" />
              <p className="rounded-2xl rounded-bl-md bg-paper p-4 text-sm leading-6">
                {opener.greeting}
              </p>
            </div>
          )}

          {messages.map((message) => {
            const raw = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");
            const parsed =
              message.role === "assistant"
                ? parsePenMessage(raw)
                : { text: raw, references: [], followUps: [], steps: [] };

            return (
              <Message key={message.id} from={message.role}>
                <MessageContent
                  className={
                    message.role === "assistant"
                      ? "bg-transparent p-0 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                >
                  <MessageResponse>{parsed.text}</MessageResponse>
                  {message.role === "assistant" && (
                    <>
                      <PenReferenceChips references={parsed.references} />
                      {milestoneTarget && parsed.steps.length > 1 && !busy && (
                        <SaveStepsButton steps={parsed.steps} target={milestoneTarget} />
                      )}
                      {parsed.followUps.length > 0 && !busy && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {parsed.followUps.map((question) => (
                            <button
                              key={question}
                              type="button"
                              onClick={() => send(question)}
                              className="rounded-full border border-amber/60 bg-amber/20 px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-amber/35"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </MessageContent>
              </Message>
            );
          })}


          {status === "submitted" && <Shimmer className="text-sm">Pen is thinking…</Shimmer>}

          {messages.length === 0 && (
            <div className="pt-1">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {opener.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-teal/45 bg-teal/12 px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-teal/25"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PenQuickActions section={section} disabled={busy} onPick={send} />

      <PromptInput onSubmit={handleSubmit} className="mt-2">
        <PromptInputTextarea ref={textareaRef} placeholder="Talk to Pen about your books…" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} disabled={busy} />
        </PromptInputFooter>
      </PromptInput>

    </div>
  );
}
