import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookIdea } from "@/lib/book-db";

export const Route = createFileRoute("/_authenticated/books/add")({
  head: () => ({ meta: [
    { title: "Add a Book — Book Cycles" },
    { name: "description", content: "Save a book idea to your shelf and start its publishing cycle whenever you're ready." },
    { property: "og:title", content: "Add a Book — Book Cycles" },
    { property: "og:description", content: "Save a book idea to your shelf and start its publishing cycle whenever you're ready." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AddBook,
});

function AddBook() {
  const navigate = useNavigate();
  const create = useCreateBookIdea();
  const [form, setForm] = useState({ title: "", subtitle: "", pen_name: "", genre: "", audience: "", goals: "", target_publication_date: "" });
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = (then: "shelf" | "cycle") => {
    if (!form.title.trim()) return;
    create.mutate(
      { ...form, title: form.title.trim() },
      {
        onSuccess: (bookId) => {
          toast.success("Book saved to your shelf");
          if (then === "cycle") void navigate({ to: "/books/new", search: { book: bookId } });
          else void navigate({ to: "/" });
        },
        onError: () => toast.error("Couldn’t save that book"),
      },
    );
  };

  return (
    <AppShell>
      <PageHeading title="Add a book" description="Keep the idea safe now. You can fill in the rest of the details, and start a cycle, at any time." />
      <form className="max-w-3xl space-y-6" onSubmit={(event) => { event.preventDefault(); save("shelf"); }}>
        <section className="rounded-2xl border border-border bg-paper p-6 shadow-xs">
          <h2 className="mb-5 font-serif text-2xl font-normal">The book</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold md:col-span-2">Working title<Input className="mt-2" required value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="The working title of your book" /></label>
            <label className="block text-sm font-semibold">Subtitle<Input className="mt-2" value={form.subtitle} onChange={(event) => set("subtitle", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Author or pen name<Input className="mt-2" value={form.pen_name} onChange={(event) => set("pen_name", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Genre or category<Input className="mt-2" value={form.genre} onChange={(event) => set("genre", event.target.value)} /></label>
            <label className="block text-sm font-semibold">Audience<Input className="mt-2" value={form.audience} onChange={(event) => set("audience", event.target.value)} placeholder="Adult, young adult, middle grade…" /></label>
            <label className="block text-sm font-semibold">Hoped-for publication date<Input className="mt-2" type="date" value={form.target_publication_date} onChange={(event) => set("target_publication_date", event.target.value)} /></label>
            <label className="block text-sm font-semibold md:col-span-2">What you want this book to do<Textarea className="mt-2" value={form.goals} onChange={(event) => set("goals", event.target.value)} /></label>
          </div>
        </section>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => void navigate({ to: "/" })}>Cancel</Button>
          <Button type="submit" variant="outline" disabled={create.isPending || !form.title.trim()}>Save to my shelf</Button>
          <Button type="button" disabled={create.isPending || !form.title.trim()} onClick={() => save("cycle")}>Save and start a cycle</Button>
        </div>
      </form>
    </AppShell>
  );
}
