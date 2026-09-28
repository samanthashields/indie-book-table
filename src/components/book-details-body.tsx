import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CoverUploader } from "@/components/cover-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBookTree, useUpdateBook } from "@/lib/book-db";
import { BOOK_STATUSES } from "@/lib/book-status";
import { cn } from "@/lib/utils";

const Field = ({ label, name, value, onChange, type = "text" }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: string }) => (
  <label className="block text-sm font-semibold">{label}<Input className="mt-2" type={type} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} /></label>
);

const fields = ["title", "subtitle", "pen_name", "genre", "series", "edition", "audience", "comparables", "goals", "length_estimate", "language", "trim_size", "isbn", "imprint", "price", "publishing_path", "start_date", "target_publication_date", "budget", "shelf_status"] as const;
type FormState = Record<(typeof fields)[number], string>;

/** The Book Details form body — reused both by the standalone /books/$bookId/details route and the overview page's drawer. */
export function BookDetailsBody({ bookId, compact = false }: { bookId: string; compact?: boolean }) {
  const { data, isLoading } = useBookTree(bookId);
  const updateBook = useUpdateBook(bookId);
  const [form, setForm] = useState<FormState | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [coverReady, setCoverReady] = useState(false);

  useEffect(() => {
    if (data && !form) {
      const book = data.book;
      setForm({
        title: book.title ?? "", subtitle: book.subtitle ?? "", pen_name: book.pen_name ?? "", genre: book.genre ?? "",
        series: book.series ?? "", edition: book.edition ?? "", audience: book.audience ?? "", comparables: book.comparables ?? "",
        goals: book.goals ?? "", length_estimate: book.length_estimate ?? "", language: book.language ?? "", trim_size: book.trim_size ?? "",
        isbn: book.isbn ?? "", imprint: book.imprint ?? "", price: book.price ?? "", publishing_path: book.publishing_path ?? "", start_date: book.start_date ?? "",
        target_publication_date: book.target_publication_date ?? "", budget: book.budget != null ? String(book.budget) : "", shelf_status: book.shelf_status ?? "idea",
      });
    }
    if (data && !coverReady) { setCover(data.book.cover_url); setCoverReady(true); }
  }, [data, form, coverReady]);

  if (isLoading || !data || !form) return <p className="text-sm text-muted-foreground">Loading book details…</p>;
  const book = data.book;
  const onChange = (name: string, value: string) => setForm((current) => current ? { ...current, [name]: value } : current);

  const save = () => {
    updateBook.mutate(
      {
        title: form.title, subtitle: form.subtitle || null, pen_name: form.pen_name || null, genre: form.genre || null,
        series: form.series || null, edition: form.edition || null, audience: form.audience || null, comparables: form.comparables || null,
        goals: form.goals || null, length_estimate: form.length_estimate || null, language: form.language || null, trim_size: form.trim_size || null,
        isbn: form.isbn || null, imprint: form.imprint || null, price: form.price || null, publishing_path: form.publishing_path || null, start_date: form.start_date || null,
        target_publication_date: form.target_publication_date || null, budget: form.budget ? Number(form.budget) : null, shelf_status: form.shelf_status || "idea",
        cover_url: cover,
      },
      { onSuccess: () => toast.success("Book details saved"), onError: () => toast.error("Couldn’t save the details") },
    );
  };

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); save(); }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-6">
        <h2 className={compact ? "font-heading text-3xl font-normal" : "font-heading text-4xl font-normal md:text-5xl"}>Book details</h2>
        <Button onClick={save} disabled={updateBook.isPending}>Save changes</Button>
      </div>
      <section className="rounded-2xl border border-border bg-paper p-6 shadow-xs">
        <h3 className="mb-5 font-heading text-2xl font-normal">Cover image</h3>
        <CoverUploader bookId={bookId} title={form.title || book.title} coverUrl={cover} onChange={setCover} saving={updateBook.isPending} compact={compact} />
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="mb-5 font-heading text-2xl font-normal">Book identity</h3>
        <div className={cn("grid gap-5", compact ? "grid-cols-1" : "md:grid-cols-2")}>
          <Field label="Working title" name="title" value={form.title} onChange={onChange} />
          <Field label="Subtitle" name="subtitle" value={form.subtitle} onChange={onChange} />
          <Field label="Author or pen name" name="pen_name" value={form.pen_name} onChange={onChange} />
          <Field label="Genre or category" name="genre" value={form.genre} onChange={onChange} />
          <Field label="Series" name="series" value={form.series} onChange={onChange} />
          <Field label="Edition" name="edition" value={form.edition} onChange={onChange} />
          <label className={cn("block text-sm font-semibold", !compact && "md:col-span-2")}>Book status
            <select className="mt-2 h-10 w-full rounded-xl border border-input bg-paper px-3 text-sm" value={form.shelf_status} onChange={(event) => onChange("shelf_status", event.target.value)}>
              {BOOK_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="mb-5 font-heading text-2xl font-normal">Audience and goals</h3>
        <div className={cn("grid gap-5", compact ? "grid-cols-1" : "md:grid-cols-2")}>
          <Field label="Audience" name="audience" value={form.audience} onChange={onChange} />
          <Field label="Comparable titles" name="comparables" value={form.comparables} onChange={onChange} />
          <label className={cn("block text-sm font-semibold", !compact && "md:col-span-2")}>Book goals<Textarea className="mt-2" name="goals" value={form.goals} onChange={(event) => onChange("goals", event.target.value)} /></label>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="mb-5 font-heading text-2xl font-normal">Production</h3>
        <div className={cn("grid gap-5", compact ? "grid-cols-1" : "md:grid-cols-3")}>
          <Field label="Length estimate" name="length_estimate" value={form.length_estimate} onChange={onChange} />
          <Field label="Language" name="language" value={form.language} onChange={onChange} />
          <Field label="Trim size" name="trim_size" value={form.trim_size} onChange={onChange} />
          <Field label="ISBN" name="isbn" value={form.isbn} onChange={onChange} />
          <Field label="Imprint" name="imprint" value={form.imprint} onChange={onChange} />
          <Field label="List price" name="price" value={form.price} onChange={onChange} />
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h3 className="mb-5 font-heading text-2xl font-normal">Publishing plan</h3>
        <div className={cn("grid gap-5", compact ? "grid-cols-1" : "md:grid-cols-2")}>
          <Field label="Publishing path" name="publishing_path" value={form.publishing_path} onChange={onChange} />
          <Field label="Cycle start date" name="start_date" type="date" value={form.start_date} onChange={onChange} />
          <Field label="Target publication date" name="target_publication_date" type="date" value={form.target_publication_date} onChange={onChange} />
          <Field label="Budget" name="budget" type="number" value={form.budget} onChange={onChange} />
        </div>
      </section>
    </form>
  );
}
