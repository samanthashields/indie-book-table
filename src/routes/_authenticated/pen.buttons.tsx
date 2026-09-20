import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PEN_DEFAULT_ACTIONS,
  PEN_SECTIONS,
  useResetPenQuickActions,
  useSavePenQuickActions,
  usePenQuickActions,
  type PenQuickAction,
  type PenSection,
} from "@/lib/pen-quick-actions";

export const Route = createFileRoute("/_authenticated/pen/buttons")({
  head: () => ({
    meta: [
      { title: "Your Pen quick buttons — Author's Workshop" },
      {
        name: "description",
        content:
          "Choose the one-tap questions Pen offers you in each part of Author's Workshop, and write your own.",
      },
      { property: "og:title", content: "Your Pen quick buttons" },
      {
        property: "og:description",
        content: "Write your own one-tap questions for Pen, your book coach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PenButtonsPage,
});

function PenButtonsPage() {
  const [section, setSection] = useState<PenSection>("overview");
  const saved = usePenQuickActions(section);
  const save = useSavePenQuickActions();
  const reset = useResetPenQuickActions();
  const [draft, setDraft] = useState<PenQuickAction[]>([]);

  useEffect(() => {
    if (saved.data) setDraft(saved.data);
  }, [saved.data, section]);

  const update = (index: number, patch: Partial<PenQuickAction>) =>
    setDraft((current) =>
      current.map((action, i) => (i === index ? { ...action, ...patch } : action)),
    );

  const submit = async () => {
    try {
      await save.mutateAsync({ section, actions: draft });
      toast.success("Your buttons are saved");
    } catch {
      toast.error("Couldn't save those buttons. Try again.");
    }
  };

  const restore = async () => {
    try {
      await reset.mutateAsync(section);
      setDraft(PEN_DEFAULT_ACTIONS[section]);
      toast.success("Back to the buttons we suggest");
    } catch {
      toast.error("Couldn't reset those buttons.");
    }
  };

  return (
    <AppShell showPenLauncher={false}>
      <div className="space-y-6">
        <PageHeading
          title="Your Pen buttons"
          description="Pen shows a row of one-tap questions wherever you talk to it. Pick which ones you want, rename them, or write your own."
        />

        <div className="flex flex-wrap gap-2">
          {PEN_SECTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSection(item.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                section === item.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-paper"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          {draft.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No buttons here yet. Add one below, or bring back the ones we suggest.
            </p>
          )}

          {draft.map((action, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border/70 bg-paper p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={action.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                  placeholder="Button text, e.g. What should I do next?"
                  className="min-w-[14rem] flex-1"
                  aria-label="Button text"
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Switch
                    checked={!action.hidden}
                    onCheckedChange={(checked) => update(index, { hidden: !checked })}
                  />
                  Show it
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove this button"
                  onClick={() => setDraft((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
              <Textarea
                value={action.prompt}
                onChange={(event) => update(index, { prompt: event.target.value })}
                placeholder="What Pen should be asked when you tap it"
                rows={2}
                aria-label="What Pen is asked"
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() =>
                setDraft((current) => [...current, { label: "", prompt: "", hidden: false }])
              }
            >
              <Plus /> Add a button
            </Button>
            <Button onClick={() => void submit()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save buttons"}
            </Button>
            <Button variant="ghost" onClick={() => void restore()} disabled={reset.isPending}>
              <RotateCcw /> Back to suggested
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
