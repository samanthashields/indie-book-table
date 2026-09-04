import { useEffect, useRef, useState } from "react";
import { Minus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoachMark } from "@/components/coach-mark";

type Message = { id: string; role: "coach" | "author"; text: string };

type Step = { reply: string; suggestions: string[] };

const opening: Record<string, { greeting: string; suggestions: string[] }> = {
  overview: {
    greeting: "Your editing phase is moving well. The developmental edit is the right next focus before you book a copyeditor. What would you like to look at?",
    suggestions: ["What should I focus on this week?", "Am I on pace for my launch date?", "Should I hire a copyeditor?"],
  },
  milestone: {
    greeting: "Start with the editor’s letter, not the margin notes. Look for two or three changes that unlock the rest. Want a way in?",
    suggestions: ["How do I read an editor’s letter?", "How long should this revision take?", "What if I disagree with a note?"],
  },
  create: {
    greeting: "Tell me what you’re writing and when you hope to publish, and I’ll shape a realistic plan around your budget.",
    suggestions: ["How long does self-publishing take?", "What can I do myself?", "What should I spend money on first?"],
  },
};

const answers: Step[] = [
  {
    reply: "I’d keep this week small: finish the one decision that unblocks everything else, and let the next milestone wait. Right now that’s signing off the developmental edit.",
    suggestions: ["What comes after that?", "How much should editing cost?"],
  },
  {
    reply: "After the developmental edit, the revision pass is yours alone — block writing time before you book anyone else. A copyeditor only makes sense once the structure is settled.",
    suggestions: ["Am I on pace for my launch date?", "How do I find a good copyeditor?"],
  },
  {
    reply: "You have room, but not spare room. Pre-launch needs a full two to three months, so protect that window even if revision runs long.",
    suggestions: ["What should I be doing during pre-launch?", "Thanks, that helps"],
  },
  {
    reply: "Happy to keep going. Ask me anything about the phase you’re in, and I’ll tell you where to spend effort and where to spend money.",
    suggestions: ["What should I focus on this week?"],
  },
];

export function BookCoach({ context = "overview" }: { context?: string | undefined }) {
  const start = opening[context] ?? opening["overview"]!;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [turn, setTurn] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ id: "greeting", role: "coach", text: start.greeting }]);
  const [suggestions, setSuggestions] = useState<string[]>(start.suggestions);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages, open]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const step = answers[Math.min(turn, answers.length - 1)]!;
    setMessages((current) => [
      ...current,
      { id: `a-${current.length}`, role: "author", text },
      { id: `c-${current.length}`, role: "coach", text: step.reply },
    ]);
    setSuggestions(step.suggestions);
    setTurn((value) => value + 1);
    setDraft("");
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[76vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-border bg-teal/15 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><CoachMark className="size-5" /></span>
              <div><p className="font-semibold">Book Coach</p><p className="text-xs text-muted-foreground">Here when you need me</p></div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Minimise Book Coach"><Minus /></Button>
          </div>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "coach" ? "rounded-2xl rounded-bl-md bg-paper p-4 text-sm leading-6" : "ml-8 rounded-2xl rounded-br-md bg-primary p-3 text-sm text-primary-foreground"}>{message.text}</div>
            ))}
            {suggestions.length > 0 && (
              <div className="pt-1">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} onClick={() => send(suggestion)} className="rounded-full border border-teal/45 bg-teal/12 px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-teal/25">{suggestion}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-border p-4">
            <Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(draft); }} placeholder="Ask your Book Coach" aria-label="Message Book Coach" />
            <Button size="icon" onClick={() => send(draft)} aria-label="Send message"><Send /></Button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Book Coach"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-primary py-3 pl-4 pr-5 text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <CoachMark className="size-6" />
          <span className="text-sm font-semibold">Book Coach</span>
        </button>
      )}
    </>
  );
}
