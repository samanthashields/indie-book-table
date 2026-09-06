import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, CalendarDays, CircleAlert, Clock3, Lightbulb, MoreVertical, Plus, Send, Sparkles, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBooks, useDeleteBook, type BookSummary } from "@/lib/book-db";
import { useMySubmissions } from "@/lib/catalog-submit";
import { SUBMISSION_STATUS_LABELS } from "@/lib/submission-schema";

type BookSubmission = { id: string; status: string };

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [
    { title: "My Books — Book Cycles" },
    { name: "description", content: "Keep every book idea in one place and start a publishing cycle when you're ready." },
    { property: "og:title", content: "My Books — Book Cycles" },
    { property: "og:description", content: "Keep every book idea in one place and start a publishing cycle when you're ready." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function BookMenu({ book, onDelete }: { book: BookSummary; onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${book.title}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}><MoreVertical /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {book.hasCycle ? (
          <DropdownMenuItem asChild><Link to="/books/$bookId" params={{ bookId: book.id }}><Sparkles />Open the book cycle</Link></DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild><Link to="/books/new" search={{ book: book.id }}><Sparkles />Create book cycle</Link></DropdownMenuItem>
        )}
        <DropdownMenuItem asChild><Link to="/books/$bookId/details" params={{ bookId: book.id }}><SquarePen />Edit book details</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/submit" search={{ bookId: book.id }}><Send />Submit to The Table</Link></DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(book.id)}><Trash2 />Delete this book</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BookRow({ book, onDelete }: { book: BookSummary; onDelete: (id: string) => void }) {
  const to = book.hasCycle ? "/books/$bookId" : "/books/$bookId/details";
  return (
    <div className="group grid gap-5 rounded-2xl border border-border bg-card px-5 py-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[88px_1fr_auto_auto] sm:items-center">
      <Link to={to} params={{ bookId: book.id }} className="contents">
        <BookCover src={book.coverUrl} title={book.title} className="w-20 shrink-0" fallbackClassName="text-3xl" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-normal group-hover:text-primary">{book.title}</h3>
            {book.hasCycle ? <StatusPill tone={book.progress > 60 ? "warm" : "good"}>{book.status}</StatusPill> : <StatusPill tone="warm">Idea</StatusPill>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{book.genre}, by {book.author}</p>
          {book.hasCycle ? (
            <>
              <div className="mt-4 flex max-w-xl items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div>
              <p className="mt-3 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Saved for later. Start a cycle whenever this one is ready.</p>
          )}
        </div>
        <div className="text-left sm:text-right"><p className="text-xs text-muted-foreground">Target publication</p><p className="mt-1 text-sm font-semibold">{book.target}</p></div>
      </Link>
      <BookMenu book={book} onDelete={onDelete} />
    </div>
  );
}

function Index() {
  const { data: books = [], isLoading } = useBooks();
  const deleteBook = useDeleteBook();
  const navigate = useNavigate();
  const mine = books.filter((book) => book.isMine);
  const cycles = mine.filter((book) => book.hasCycle);
  const ideas = mine.filter((book) => !book.hasCycle);
  const pending = cycles.filter((book) => book.nextAction !== "All milestones complete").length;

  const remove = (id: string) => {
    if (!window.confirm("Delete this book and everything in it? This can’t be undone.")) return;
    deleteBook.mutate(id, {
      onSuccess: () => toast.success("Book deleted"),
      onError: () => toast.error("Couldn’t delete that book"),
    });
  };

  return (
    <AppShell>
      <PageHeading
        title="My Books"
        description="Every book you’re thinking about, writing, or launching — all in one shelf."
        action={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void navigate({ to: "/books/add" })}><Plus />Add a book</Button>
            <Button asChild><Link to="/books/new"><Sparkles />Start a book cycle</Link></Button>
          </div>
        }
      />
      <section className="mb-10 grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:grid-cols-3" aria-label="Publishing priorities">
        <div className="rounded-xl bg-destructive/8 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4 text-destructive" />Book ideas</div><p className="mt-1 text-2xl font-semibold">{ideas.length}</p></div>
        <div className="rounded-xl bg-accent/20 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4" />Active cycles</div><p className="mt-1 text-2xl font-semibold">{cycles.length}</p></div>
        <div className="rounded-xl bg-chart-3/15 px-4 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-primary" />Pending action</div><p className="mt-1 text-2xl font-semibold">{pending}</p></div>
      </section>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your books…</p>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
          <BookOpen className="mx-auto mb-4 size-8 text-primary" />
          <h3 className="font-serif text-2xl font-normal">Your first book starts here</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Save an idea now and come back to it, or start a full book cycle from a template, from scratch, or with your Book Coach.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => void navigate({ to: "/books/add" })}><Plus />Add a book</Button>
            <Button asChild><Link to="/books/new"><Sparkles />Start a book cycle</Link></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-baseline justify-between"><h2 className="font-serif text-2xl font-semibold">In a book cycle</h2><span className="text-sm text-muted-foreground">{cycles.length} books</span></div>
            {cycles.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-paper p-6 text-sm text-muted-foreground">No cycles running yet. Open a book below and choose “Create book cycle” when you’re ready.</p>
            ) : (
              <div className="space-y-3">{cycles.map((book) => <BookRow key={book.id} book={book} onDelete={remove} />)}</div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-baseline justify-between"><h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Lightbulb className="size-5 text-amber" />Ideas and drafts</h2><span className="text-sm text-muted-foreground">{ideas.length} books</span></div>
            {ideas.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-paper p-6 text-sm text-muted-foreground">Nothing waiting in the wings. Add a book to keep an idea safe until it’s ready.</p>
            ) : (
              <div className="space-y-3">{ideas.map((book) => <BookRow key={book.id} book={book} onDelete={remove} />)}</div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
