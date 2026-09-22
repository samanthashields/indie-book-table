import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadCatalogCover, useCatalogCoverUrl } from "@/lib/catalog-covers";
import {
  AI_OPTIONS,
  AUDIENCE_OPTIONS,
  STEP_FIELDS,
  SUBMIT_STEPS,
  TAG_OPTIONS,
  submissionSchema,
  type SubmissionValues,
} from "@/lib/submission-schema";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<string, string>>;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {

  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function Choice<T extends string>({
  value,
  options,
  onChange,
  name,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  name: string;
}) {
  return (
    <span className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
            value === option.value
              ? "border-inverse bg-inverse text-on-inverse"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}

function CoverField({
  userId,
  value,
  title,
  onChange,
}: {
  userId: string;
  value: string | null;
  title: string;
  onChange: (value: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const preview = useCatalogCoverUrl(value);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadCatalogCover(userId, file));
      toast.success("Cover uploaded");
    } catch {
      toast.error("Couldn’t upload that image");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="flex gap-5">
      {preview.data ? (
        <img
          src={preview.data}
          alt={`Cover of ${title || "your book"}`}
          className="aspect-[2/3] w-28 rounded-xl object-cover shadow-sm"
        />
      ) : (
        <span className="grid aspect-[2/3] w-28 place-items-center rounded-xl bg-teal/15 font-heading text-4xl text-cocoa">
          {title.charAt(0) || "?"}
        </span>
      )}
      <div>
        <p className="text-sm text-muted-foreground">
          Portrait artwork, JPG or PNG, at least 1600 px tall.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button type="button" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : value ? "Replace cover" : "Upload cover"}
          </Button>
          {value && (
            <Button type="button" variant="outline" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void pick(event.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}

export function SubmissionForm({
  userId,
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  userId: string;
  initial: SubmissionValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: SubmissionValues) => void;
}) {
  const [values, setValues] = useState<SubmissionValues>(initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const step = SUBMIT_STEPS[stepIndex]!;
  const coverUrl = useCatalogCoverUrl(values.cover_image_url);

  const set = <K extends keyof SubmissionValues>(key: K, value: SubmissionValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validate = (fields: (keyof SubmissionValues)[]) => {
    const result = submissionSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const found: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (fields.length === 0 || fields.includes(key as keyof SubmissionValues)) {
        found[key] ??= issue.message;
      }
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const next = () => {
    if (!validate(STEP_FIELDS[step.key] ?? [])) return;
    setStepIndex((index) => Math.min(index + 1, SUBMIT_STEPS.length - 1));
  };

  const send = () => {
    const result = submissionSchema.safeParse(values);
    if (!result.success) {
      const found: Errors = {};
      for (const issue of result.error.issues) found[String(issue.path[0] ?? "")] ??= issue.message;
      setErrors(found);
      toast.error("Some details still need a look");
      setStepIndex(0);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2">
        {SUBMIT_STEPS.map((item, index) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => setStepIndex(index)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                index === stepIndex
                  ? "bg-primary text-primary-foreground"
                  : index < stepIndex
                    ? "bg-secondary text-foreground"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {index + 1}. {item.label}
            </button>
          </li>
        ))}
      </ol>

      <section className="space-y-6 rounded-3xl border border-border/70 bg-card p-6 shadow-xs md:p-8">
        {step.key === "you" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Name on the listing" error={errors["author_name"]}>
              <Input value={values.author_name} onChange={(e) => set("author_name", e.target.value)} />
            </Field>
            <Field label="Email" hint="Only the editors see this." error={errors["author_email"]}>
              <Input value={values.author_email} onChange={(e) => set("author_email", e.target.value)} />
            </Field>
            <Field label="Instagram" hint="Optional">
              <Input value={values.instagram_handle} onChange={(e) => set("instagram_handle", e.target.value)} placeholder="@yourhandle" />
            </Field>
            <Field label="Website" hint="Optional">
              <Input value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Short bio" hint="A couple of sentences readers will see on your shelf.">
                <Textarea rows={4} value={values.bio} onChange={(e) => set("bio", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {step.key === "book" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Title" error={errors["title"]}>
              <Input value={values.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Pen name" hint="Optional — shown instead of your name.">
              <Input value={values.pen_name} onChange={(e) => set("pen_name", e.target.value)} />
            </Field>
            <Field label="Genre">
              <Input value={values.genre} onChange={(e) => set("genre", e.target.value)} placeholder="Cosy fantasy" />
            </Field>
            <Field label="Audience">
              <Choice name="Audience" value={values.target_audience} options={AUDIENCE_OPTIONS} onChange={(v) => set("target_audience", v)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="One-line hook" hint="What makes a reader pick it up?" error={errors["hook"]}>
                <Textarea rows={3} value={values.hook} onChange={(e) => set("hook", e.target.value)} />
              </Field>
            </div>
            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={values.explicit_content}
                onChange={(e) => set("explicit_content", e.target.checked)}
              />
              <span className="text-sm">This book contains explicit content</span>
            </label>
          </div>
        )}

        {step.key === "credits" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Editor(s)"><Input value={values.editors} onChange={(e) => set("editors", e.target.value)} /></Field>
            <Field label="Illustrator(s)"><Input value={values.illustrators} onChange={(e) => set("illustrators", e.target.value)} /></Field>
            <Field label="Cover designer"><Input value={values.cover_designer} onChange={(e) => set("cover_designer", e.target.value)} /></Field>
            <div />
            <Field label="AI help with the writing">
              <Choice name="AI writing" value={values.ai_writing_contribution} options={AI_OPTIONS} onChange={(v) => set("ai_writing_contribution", v)} />
            </Field>
            <Field label="AI help with the art">
              <Choice name="AI art" value={values.ai_art_contribution} options={AI_OPTIONS} onChange={(v) => set("ai_art_contribution", v)} />
            </Field>
          </div>
        )}

        {step.key === "cover" && (
          <div className="space-y-6">
            <CoverField userId={userId} value={values.cover_image_url} title={values.title} onChange={(v) => set("cover_image_url", v)} />
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="eBook price" hint="In your currency, e.g. 4.99" error={errors["ebook_price"]}>
                <Input value={values.ebook_price} onChange={(e) => set("ebook_price", e.target.value)} />
              </Field>
              <Field label="Print price" error={errors["print_price"]}>
                <Input value={values.print_price} onChange={(e) => set("print_price", e.target.value)} />
              </Field>
            </div>
            <div>
              <p className="text-sm font-semibold">Where to buy</p>
              {errors["purchase_links"] && <p className="mt-1 text-xs font-semibold text-destructive">{errors["purchase_links"]}</p>}
              <ul className="mt-3 space-y-3">
                {values.purchase_links.map((link, index) => (
                  <li key={index} className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                    <Input
                      aria-label="Shop name"
                      placeholder="Amazon"
                      value={link.platform_label}
                      onChange={(e) =>
                        set("purchase_links", values.purchase_links.map((item, i) => (i === index ? { ...item, platform_label: e.target.value } : item)))
                      }
                    />
                    <Input
                      aria-label="Link"
                      placeholder="https://"
                      value={link.url}
                      onChange={(e) =>
                        set("purchase_links", values.purchase_links.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)))
                      }
                    />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove link" onClick={() => set("purchase_links", values.purchase_links.filter((_, i) => i !== index))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                disabled={values.purchase_links.length >= 8}
                onClick={() => set("purchase_links", [...values.purchase_links, { platform_label: "", url: "" }])}
              >
                <Plus className="size-4" /> Add a link
              </Button>
            </div>
          </div>
        )}

        {step.key === "extras" && (
          <div className="space-y-6">
            <Field label="Awards or reviews" hint="Optional — anything worth quoting.">
              <Textarea rows={4} value={values.awards_reviews_text} onChange={(e) => set("awards_reviews_text", e.target.value)} />
            </Field>
            <div>
              <p className="text-sm font-semibold">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const on = values.tags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("tags", on ? values.tags.filter((t) => t !== tag.value) : [...values.tags, tag.value])}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors",
                        on ? "border-amber bg-amber/30 text-cocoa" : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step.key === "review" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">This is how your listing will look at The Table.</p>
            <article className="flex gap-4 rounded-2xl border border-border/70 bg-paper p-4">
              {coverUrl.data ? (
                <img src={coverUrl.data} alt={`Cover of ${values.title}`} className="aspect-[2/3] w-24 rounded-xl object-cover" />
              ) : (
                <span className="grid aspect-[2/3] w-24 place-items-center rounded-xl bg-teal/15 p-2 text-center font-heading text-sm text-cocoa">{values.title || "Your book"}</span>
              )}
              <div className="min-w-0">
                <h3 className="font-heading text-lg">{values.title || "Untitled"}</h3>
                <p className="text-sm text-muted-foreground">by {values.pen_name || values.author_name || "you"}</p>
                <p className="mt-2 text-sm font-semibold text-text-inkblue">
                  {values.genre || "Indie"} · {AUDIENCE_OPTIONS.find((a) => a.value === values.target_audience)?.label}
                </p>
                <p className="mt-2 text-sm">{values.hook}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {values.purchase_links.length} buying link{values.purchase_links.length === 1 ? "" : "s"} · {values.tags.length} tag{values.tags.length === 1 ? "" : "s"}
                </p>
              </div>
            </article>
            <p className="text-sm text-muted-foreground">
              The editors read every submission. You’ll see the status on your submissions page and get a note when your book is picked for an issue.
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
          Back
        </Button>
        {stepIndex < SUBMIT_STEPS.length - 1 ? (
          <Button type="button" onClick={next}>Continue</Button>
        ) : (
          <Button type="button" onClick={send} disabled={submitting}>
            {submitting ? "Sending…" : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
