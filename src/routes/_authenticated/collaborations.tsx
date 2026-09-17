import { Link, createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BookCover } from "@/components/book-cover";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Progress } from "@/components/ui/progress";
import { ViewSwitcher, useCollectionView } from "@/components/view-switcher";
import { useBooks } from "@/lib/book-db";

export const Route = createFileRoute("/_authenticated/collaborations")({
  head: () => ({ meta: [
    { title: "Collaborations — Book Cycles" },
    { name: "description", content: "Books other authors have invited you to help with, all in one place." },
    { property: "og:title", content: "Collaborations — Book Cycles" },
    { property: "og:description", content: "Books other authors have invited you to help with, all in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Collaborations,
});

function Collaborations() {
  const { data: books = [], isLoading } = useBooks();
  const [view, setView] = useCollectionView("collaborations-view");
  const shared = books.filter((book) => !book.isMine);

  return (
    <AppShell>
      <PageHeading title="Collaborations" description="Books other authors have shared with you. You see only the cycles you were invited to." action={<ViewSwitcher view={view} onChange={setView} label="Choose how collaborations are shown" />} />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading shared books…</p>
      ) : shared.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
          <Users className="mx-auto mb-4 size-8 text-primary" />
          <h3 className="font-serif text-2xl font-normal">Nothing shared with you yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">When an author invites you to edit, illustrate, design or read for their book, it will appear here.</p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
          {shared.map((book) => (
            <Link key={book.id} to="/books/$bookId" params={{ bookId: book.id }} className={view === "grid" ? "group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md" : "group grid gap-5 rounded-2xl border border-border bg-card px-5 py-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[88px_1fr_auto] sm:items-center"}>
              <BookCover src={book.coverUrl} title={book.title} className={view === "grid" ? "w-full" : "w-20 shrink-0"} fallbackClassName="text-3xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-2xl font-normal group-hover:text-primary">{book.title}</h3>
                  <StatusPill tone="good">Shared with you</StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{book.genre}, by {book.author}</p>
                <div className="mt-4 flex max-w-xl items-center gap-3"><Progress value={book.progress} className="h-1.5" /><span className="text-xs font-semibold">{book.progress}%</span></div>
                <p className="mt-3 text-sm"><span className="text-muted-foreground">Next:</span> {book.nextAction}</p>
              </div>
              <div className={view === "grid" ? "mt-auto pt-4 text-left" : "text-left sm:text-right"}><p className="text-xs text-muted-foreground">Target publication</p><p className="mt-1 text-sm font-semibold">{book.target}</p></div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
