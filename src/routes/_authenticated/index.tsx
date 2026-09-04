import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarDays, CircleAlert, Clock3, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBooks } from "@/lib/book-db";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [
    { title: "My Books — Book Cycles" },
    { name: "description", content: "Guide every book from draft to launch with a clear publishing plan." },
    { property: "og:title", content: "My Books — Book Cycles" },
    { property: "og:description", content: "Guide every book from draft to launch with a clear publishing plan." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  const { data: books = [], isLoading } = useBooks();
  const launchingSoon = books.filter((book) => {
    if (!book.target) return false;
    return book.progress < 100;
  }).length;
  const pending = books.filter((book) => book.nextAction !== "All milestones complete").length;

  return (
    <AppShell>
      <PageHeading title="My Books" description="Each book has its own path. Keep the next meaningful step in view." action={<Button asChild><Link to="/books/new"><Plus />Start a book cycle</Link></Button>} />
      <section className="mb-10 grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:grid-cols-3" aria-label="Publishing priorities">
        <div className="rounded-xl bg-destructive/8 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4 text-destructive" />Behind pace</div><p className="mt-1 text-2xl font-semibold">0</p></div>
        <div className="rounded-xl bg-accent/20 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4" />Active books</div><p className="mt-1 text-2xl font-semibold">{launchingSoon}</p></div>
        <div className="rounded-xl bg-chart-3/15 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-primary" />Pending action</div><p className="mt-1 text-2xl font-semibold">{pending}</p></div>
      </section>
      <section>
        <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-2xl font-semibold">Active book cycles</h2><span className="text-sm text-muted-foreground">{books.length} books</span></div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your books…</p>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
            <BookOpen className="mx-auto mb-4 size-8 text-primary" />
            <h3 className="font-serif text-2xl font-normal">Your first book starts here</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Create a book cycle from a template, from scratch, or with your Book Coach — and every phase, milestone, and note will live here.</p>
            <Button asChild className="mt-6"><Link to="/books/new"><Plus />Start a book cycle</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <Link key={book.id} to="/books/$bookId" params={{ bookId: book.id }} className="group grid gap-5 rounded-2xl border border-border bg-card px-5 py-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[88px_1fr_auto] sm:items-center">
                <BookCover src={book.coverUrl} title={book.title} className="w-20 shrink-0" fallbackClassName="text-3xl" />

                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-normal group-hover:text-primary">{book.title}</h3><StatusPill tone={book.progress > 60 ? "warm" : "good"}>{book.status}</StatusPill></div><p className="mt-1 text-sm text-muted-foreground">{book.genre}, by {book.author}</p><div className="mt-4 flex max-w-xl items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div><p className="mt-3 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p></div>
                <div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Target publication</p><p className="mt-1 text-sm font-semibold">{book.target}</p></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
