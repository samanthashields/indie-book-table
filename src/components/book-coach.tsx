import { useState } from "react";
import { PanelRightClose, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoachMark } from "@/components/coach-mark";
import { cn } from "@/lib/utils";

export function BookCoach({ context = "overview" }: { context?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const guidance = context === "milestone"
    ? "Start with the editor’s letter, not the margin notes. Look for two or three changes that unlock the rest."
    : context === "create"
      ? "Tell me what you’re writing and when you hope to publish. I’ll shape a realistic plan around your budget."
      : "Your editing phase is moving well. The developmental edit is the right next focus before you book a copyeditor.";

  const send = () => {
    const value = draft.trim();
    if (!value) return;
    setMessages((current) => [...current, value]);
    setDraft("");
  };

  return (
    <>
      {!expanded && (
        <div className="hidden lg:ml-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-14 lg:shrink-0 lg:flex-col lg:items-center lg:gap-3 lg:border lg:border-border lg:bg-card lg:py-4">
          <button
            onClick={() => setExpanded(true)}
            aria-label="Show Book Coach"
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <CoachMark className="size-6" />
          </button>
          <span className="mt-2 text-xs font-medium text-muted-foreground [writing-mode:vertical-rl]">Book Coach</span>
        </div>
      )}

      <aside
        className={cn(
          "fixed inset-x-3 bottom-3 z-40 hidden max-h-[72vh] flex-col overflow-hidden border border-border bg-card shadow-xl lg:static lg:ml-4 lg:h-[calc(100vh-2rem)] lg:max-h-none lg:w-[320px] lg:shrink-0 lg:shadow-none",
          open && "flex",
          expanded ? "lg:flex" : "lg:hidden",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><CoachMark className="size-5" /></span>
            <div><p className="font-semibold">Book Coach</p><p className="text-xs text-muted-foreground">Here when you need me</p></div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close Book Coach"><X /></Button>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setExpanded(false)} aria-label="Hide Book Coach"><PanelRightClose /></Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-md bg-secondary p-4 text-sm leading-6">{guidance}</div>
          {messages.map((message, index) => <div key={`${message}-${index}`} className="ml-8 rounded-md bg-primary p-3 text-sm text-primary-foreground">{message}</div>)}
          {messages.length > 0 && <div className="rounded-md bg-secondary p-4 text-sm leading-6">That’s a good question. I’d keep this step small: choose one decision you can finish today, then let the next milestone wait.</div>}
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested</p>
            <button className="w-full text-left text-sm text-primary hover:underline" onClick={() => setDraft("What should I focus on this week?")}>What should I focus on this week?</button>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Ask your Book Coach" aria-label="Message Book Coach" />
          <Button size="icon" onClick={send} aria-label="Send message"><Send /></Button>
        </div>
      </aside>

      <Button className="fixed bottom-4 right-4 z-30 rounded-full shadow-lg lg:hidden" size="icon" onClick={() => setOpen(true)} aria-label="Open Book Coach"><CoachMark className="size-5" /></Button>
    </>
  );
}
