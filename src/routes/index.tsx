import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CircleAlert, Clock3, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { books } from "@/lib/book-data";

export const Route = createFileRoute("/")({
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
  return (
    <AppShell>
      <PageHeading title="My Books" description="Each book has its own path. Keep the next meaningful step in view." action={<Button asChild><Link to="/books/new"><Plus />Start a book cycle</Link></Button>} />
      <section className="mb-10 grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:grid-cols-3" aria-label="Publishing priorities">
        <div className="rounded-xl bg-destructive/8 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4 text-destructive" />Behind pace</div><p className="mt-1 text-2xl font-semibold">1</p></div>
        <div className="rounded-xl bg-accent/20 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4" />Launch approaching</div><p className="mt-1 text-2xl font-semibold">1</p></div>
        <div className="rounded-xl bg-chart-3/15 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-primary" />Pending action</div><p className="mt-1 text-2xl font-semibold">2</p></div>
      </section>
      <section>
        <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-2xl font-semibold">Active book cycles</h2><span className="text-sm text-muted-foreground">{books.length} books</span></div>
        <div className="space-y-3">
          {books.map((book) => (
            <Link key={book.id} to="/books/$bookId" params={{ bookId: book.id }} className="group grid gap-5 rounded-2xl border border-border bg-card px-5 py-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[88px_1fr_auto] sm:items-center">
              <img src={book.cover} alt={`Cover artwork for ${book.title}`} width={768} height={1152} className="aspect-[2/3] w-20 rounded-lg object-cover shadow-sm" loading="lazy" />
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl font-normal group-hover:text-primary">{book.title}</h3><StatusPill tone={book.progress > 60 ? "warm" : "good"}>{book.status}</StatusPill></div><p className="mt-1 text-sm text-muted-foreground">{book.genre}, by {book.author}</p><div className="mt-4 flex max-w-xl items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div><p className="mt-3 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p></div>
              <div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Target publication</p><p className="mt-1 text-sm font-semibold">{book.target}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
