import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, Clock3, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { BookGridCard } from "@/components/book-grid-card";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ViewSwitcher, useCollectionView } from "@/components/view-switcher";
import { useBooks, type BookSummary } from "@/lib/book-db";

export const Route = createFileRoute("/_authenticated/cycles")({
  head: () => ({ meta: [
    { title: "My Cycles — Author's Workshop" },
    { name: "description", content: "Track every book cycle you have started, in progress, or finished." },
    { property: "og:title", content: "My Cycles — Author's Workshop" },
    { property: "og:description", content: "Track every book cycle you have started, in progress, or finished." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Cycles,
});

type Group = "not-started" | "in-progress" | "complete";

const groupOf = (book: BookSummary): Group =>
  book.status.toLowerCase() === "complete" ? "complete" : book.progress === 0 ? "not-started" : "in-progress";

const sections: { key: Group; title: string; blurb: string; icon: typeof Clock3 }[] = [
  { key: "not-started", title: "Not started", blurb: "Cycles waiting for their first milestone.", icon: CircleDashed },
  { key: "in-progress", title: "In progress", blurb: "Work you are moving through right now.", icon: Clock3 },
  { key: "complete", title: "Complete", blurb: "Cycles you have closed out.", icon: CheckCircle2 },
];

function CycleRow({ book }: { book: BookSummary }) {
  return (
    <Link
      to="/books/$bookId"
      params={{ bookId: book.id }}
      className="group grid gap-5 rounded-2xl border border-border bg-card px-5 py-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[72px_1fr_auto] sm:items-center"
    >
      <BookCover src={book.coverUrl} title={book.title} className="w-16 shrink-0" fallbackClassName="text-2xl" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-2xl font-normal group-hover:text-link">{book.title}</h3>
          <StatusPill tone={book.status.toLowerCase() === "complete" ? "good" : "warm"}>{book.status}</StatusPill>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{book.genre}, by {book.author}</p>
        <div className="mt-4 flex max-w-xl items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div>
        <p className="mt-3 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-xs text-muted-foreground">Target publication</p>
        <p className="mt-1 text-sm font-semibold">{book.target}</p>
      </div>
    </Link>
  );
}

function CycleCard({ book }: { book: BookSummary }) {
  return (
    <BookGridCard
      size="md"
      cover={<BookCover src={book.coverUrl} title={book.title} className="w-full" fallbackClassName="text-3xl" />}
      title={book.title}
      subtitle={`${book.genre}, by ${book.author}`}
      link={{ to: "/books/$bookId", params: { bookId: book.id } }}
    >
      <div className="mt-3"><StatusPill tone={book.status.toLowerCase() === "complete" ? "good" : "warm"}>{book.status}</StatusPill></div>
      <div className="mt-4 flex items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div>
      <p className="mt-3 line-clamp-2 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p>
      <p className="mt-auto pt-4 text-xs text-muted-foreground">Target publication · {book.target}</p>
    </BookGridCard>
  );
}

function Cycles() {
  const books = useBooks();
  const [view, setView] = useCollectionView();
  const cycles = (books.data ?? []).filter((book) => book.hasCycle && book.isMine);

  return (
    <AppShell>
      <PageHeading
        title="My Cycles"
        description="Every publishing cycle you have going, grouped by where it stands."
        action={<div className="flex flex-wrap items-center gap-3"><ViewSwitcher view={view} onChange={setView} label="Choose how cycles are shown" /><Button asChild><Link to="/books/new"><Plus />New book cycle</Link></Button></div>}
      />

      {books.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your cycles…</p>
      ) : cycles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
          <p className="font-serif text-2xl font-normal">No cycles yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Pick a book from your shelf and start its cycle when you are ready.</p>
          <Button className="mt-5" asChild><Link to="/">Go to My Books</Link></Button>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => {
            const items = cycles.filter((book) => groupOf(book) === section.key);
            if (items.length === 0) return null;
            const Icon = section.icon;
            return (
              <section key={section.key}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-teal/15 text-text-teal"><Icon className="size-5" /></span>
                  <div>
                    <h2 className="font-serif text-2xl font-normal">{section.title} <span className="text-muted-foreground">({items.length})</span></h2>
                    <p className="text-sm text-muted-foreground">{section.blurb}</p>
                  </div>
                </div>
                <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>{items.map((book) => view === "grid" ? <CycleCard key={book.id} book={book} /> : <CycleRow key={book.id} book={book} />)}</div>
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
