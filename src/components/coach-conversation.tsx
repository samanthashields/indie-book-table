import { useEffect, useRef, useState } from "react";
import { Check, CornerDownLeft } from "lucide-react";
import { CoachMark } from "@/components/coach-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type Answers,
  enrichment,
  gatePrompt,
  questions,
  scratchEssentials,
  summaryLine,
  templateEssentials,
} from "@/lib/coach-intake";

type Turn = { key: string; role: "coach" | "author"; text: string };

export function CoachConversation({
  onGenerate,
  generating,
  initialFork,
}: {
  onGenerate: (answers: Answers) => void;
  generating: boolean;
  initialFork?: "Start from a template" | "Build from scratch" | undefined;
}) {
  const startIds = initialFork === "Start from a template" ? templateEssentials : scratchEssentials;
  const [answers, setAnswers] = useState<Answers>(initialFork ? { fork: initialFork } : {});
  const [turns, setTurns] = useState<Turn[]>(
    initialFork
      ? [
          { key: "intro", role: "coach", text: "Hello — I'm Pen. I'll ask a few things about your book, then draft a full cycle across the six publishing phases. You can change anything afterwards." },
          { key: "q-first", role: "coach", text: questions[startIds[0]!]!.prompt({}) },
        ]
      : [
          { key: "intro", role: "coach", text: "Hello — I'm Pen. I'll ask a few things about your book, then draft a full cycle across the six publishing phases. You can change anything afterwards." },
          { key: "q-fork", role: "coach", text: questions["fork"]!.prompt({}) },
        ],
  );
  const [queue, setQueue] = useState<string[]>(initialFork ? startIds.slice(1) : []);
  const [current, setCurrent] = useState<string | null>(initialFork ? startIds[0]! : "fork");
  const [atGate, setAtGate] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [retried, setRetried] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns.length, atGate]);

  const question = current ? questions[current] : null;
  const essentials = answers["fork"] === "Start from a template" ? templateEssentials : scratchEssentials;
  const answered = essentials.filter((id) => answers[id] !== undefined).length;

  const push = (role: Turn["role"], text: string) => setTurns((t) => [...t, { key: `${t.length}-${role}`, role, text }]);

  const moveOn = (nextQueue: string[], next: Answers) => {
    const remaining = [...nextQueue];
    let nextId = remaining.shift();
    while (nextId && next[nextId] !== undefined) nextId = remaining.shift();
    setQueue(remaining);
    if (nextId) {
      setCurrent(nextId);
      setPicked([]);
      setDraft("");
      push("coach", questions[nextId]!.prompt(next));
    } else {
      setCurrent(null);
      setAtGate(true);
      push("coach", gatePrompt(next));
    }
  };

  const submit = (rawValue: string) => {
    if (!question) return;
    const value = rawValue.trim();
    if (!value) {
      if (question.retry && !retried.includes(question.id)) {
        setRetried((r) => [...r, question.id]);
        push("coach", question.retry);
        return;
      }
      if (question.essential) return;
    }
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    push("author", value || "Skip for now");
    push("coach", question.reflect(value, next));
    setDraft("");
    setPicked([]);

    if (question.id === "fork") {
      const path = value === "Start from a template" ? templateEssentials : scratchEssentials;
      moveOn(path, next);
      return;
    }
    if (queue.length === 0) {
      setCurrent(null);
      setAtGate(true);
      push("coach", gatePrompt(next));
      return;
    }
    moveOn(queue, next);
  };

  const generate = () => {
    setAtGate(false);
    push("coach", summaryLine(answers));
    onGenerate(answers);
  };

  const openEnrichment = (id: string) => {
    setAtGate(false);
    setCurrent(id);
    setPicked([]);
    setDraft("");
    push("coach", questions[id]!.prompt(answers));
  };

  const remainingEnrichment = enrichment.filter((item) => answers[item.id] === undefined);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <header className="flex items-center gap-4 border-b border-border p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><CoachMark className="size-5" /></span>
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-semibold">Plan with Pen</h2>
          <p className="mt-1 text-sm text-muted-foreground">One question at a time. Nothing here is final.</p>
        </div>
        <div className="hidden w-32 sm:block">
          <p className="text-xs text-muted-foreground">{answered} of {essentials.length} answered</p>
          <div className="mt-2 h-1 w-full bg-secondary"><div className="h-1 bg-primary transition-all duration-500" style={{ width: `${(answered / essentials.length) * 100}%` }} /></div>
        </div>
      </header>

      <div className="space-y-5 p-6 md:p-8">
        {turns.map((turn) =>
          turn.role === "coach" ? (
            <div key={turn.key} className="flex gap-3 duration-500 animate-in fade-in slide-in-from-bottom-2">
              <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-link"><CoachMark className="size-4" /></span>
              <p className="max-w-prose text-sm leading-6">{turn.text}</p>
            </div>
          ) : (
            <div key={turn.key} className="flex justify-end duration-500 animate-in fade-in slide-in-from-bottom-2">
              <p className="max-w-prose rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm leading-6 text-primary-foreground">{turn.text}</p>
            </div>
          ),
        )}
        <div ref={endRef} />

        {question && (
          <div className="border-t border-border pt-6">
            {question.chips && (
              <div className="flex flex-wrap gap-2">
                {question.chips.map((chip) => {
                  const active = question.multi && picked.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        question.multi
                          ? setPicked((p) => (p.includes(chip) ? p.filter((c) => c !== chip) : [...p, chip]))
                          : submit(chip)
                      }
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary",
                      )}
                    >
                      {active && <Check className="mr-1 inline size-3.5" />}
                      {chip}
                    </button>
                  );
                })}
                {question.multi && (
                  <Button size="sm" onClick={() => submit(picked.join(", "))}>
                    {picked.length ? `Done, ${picked.length} selected` : "None of these"}
                  </Button>
                )}
              </div>
            )}
            {!question.multi && (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submit(draft);
                }}
              >
                {question.input === "textarea" ? (
                  <Textarea className="min-h-24" value={draft} placeholder={question.placeholder ?? "Type your answer"} onChange={(e) => setDraft(e.target.value)} />
                ) : (
                  <Input
                    type={question.input === "date" ? "date" : question.input === "number" ? "number" : "text"}
                    min={question.input === "number" ? 0 : undefined}
                    value={draft}
                    placeholder={question.placeholder ?? "Type your answer"}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                )}
                <Button type="submit" size="icon" aria-label="Send answer"><CornerDownLeft className="size-4" /></Button>
              </form>
            )}
          </div>
        )}

        {atGate && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-6">
            <Button onClick={generate} disabled={generating}>Generate preview</Button>
            {remainingEnrichment.map((item) => (
              <button key={item.id} type="button" onClick={() => openEnrichment(item.id)} className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:bg-secondary">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
