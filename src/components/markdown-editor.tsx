import { useRef, useState } from "react";
import { Bold, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, Type } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { signCatalogCover, uploadCatalogCover } from "@/lib/catalog-covers";

/** Markdown writing box with a small formatting toolbar and inline image upload. */
export function MarkdownEditor({
  value,
  onChange,
  rows = 16,
  placeholder = "Write here…",
  label = "Body",
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);

  const wrap = (before: string, after = "", placeholderText = "") => {
    const field = bodyRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end) || placeholderText;
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    requestAnimationFrame(() => {
      field.focus();
      field.selectionStart = start + before.length;
      field.selectionEnd = start + before.length + selected.length;
    });
  };

  const insertImage = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sign in again to upload images.");
      const path = await uploadCatalogCover(userData.user.id, file);
      const url = await signCatalogCover(path, 60 * 60 * 24 * 365);
      onChange(`${value}\n\n![${file.name.replace(/\.[a-z0-9]+$/i, "")}](${url})\n`);
      toast.success("Image added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t upload that image");
    } finally {
      setBusy(false);
    }
  };

  const tools = [
    { icon: Bold, label: "Bold", run: () => wrap("**", "**", "bold text") },
    { icon: Italic, label: "Italic", run: () => wrap("*", "*", "italic text") },
    { icon: Type, label: "Heading", run: () => wrap("\n## ", "", "Heading") },
    { icon: Quote, label: "Quote", run: () => wrap("\n> ", "", "A line worth pulling out") },
    { icon: List, label: "Bullet list", run: () => wrap("\n- ", "", "First point") },
    { icon: ListOrdered, label: "Numbered list", run: () => wrap("\n1. ", "", "First step") },
    { icon: Link2, label: "Link", run: () => wrap("[", "](https://)", "link text") },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-input bg-secondary px-2 py-1.5">
        {tools.map(({ icon: Icon, label: toolLabel, run }) => (
          <button
            key={toolLabel}
            type="button"
            title={toolLabel}
            aria-label={toolLabel}
            onClick={run}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <Icon className="size-4" />
          </button>
        ))}
        <label className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground" title="Insert image">
          <ImageIcon className="size-4" />
          <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(event) => void insertImage(event.target.files?.[0])} />
        </label>
      </div>
      <Textarea
        ref={bodyRef}
        rows={rows}
        className="rounded-t-none"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
