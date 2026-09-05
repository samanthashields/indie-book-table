import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { useCatalogCoverUrl } from "@/lib/catalog-covers";
import { useMySubmissions, type SubmissionRow } from "@/lib/catalog-submit";
import { SUBMISSION_STATUS_LABELS } from "@/lib/submission-schema";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({
    meta: [
      { title: "My submissions — Book Cycles" },
      { name: "description", content: "Track the books you've sent to The Table and see which issues picked them up." },
      { property: "og:title", content: "My submissions — Book Cycles" },
      { property: "og:description", content: "Track the books you've sent to The Table and see which issues picked them up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmissionsPage,
});

const TONE: Record<string, "good" | "warm" | "neutral"> = {
  added_to_database: "good",
  under_review: "warm",
  submitted: "neutral",
  removed: "warm",
};

function SubmissionCard({ book }: { book: SubmissionRow }) {
  const cover = useCatalogCoverUrl(book.cover_image_url);
  const published = book.catalog_issue_selections.filter((s) => s.catalog_issues?.status === "published");

  return (
    <article className="flex gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs">
      {cover.data ? (
        <img src={cover.data} alt={`Cover of ${book.title}`} className="aspect-[2/3] w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
      ) : (
        <span className="grid aspect-[2/3] w-24 shrink-0 place-items-center rounded-xl bg-teal/15 p-2 text-center font-serif text-sm text-cocoa">{book.title}</span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={TONE[book.status] ?? "neutral"}>{SUBMISSION_STATUS_LABELS[book.status] ?? book.status}</StatusPill>
          {book.catalog_issue_selections.some((s) => s.is_spotlight) && <StatusPill tone="warm">Spotlight</StatusPill>}
        </div>
        <h2 className="mt-2 font-serif text-2xl font-normal">{book.title}</h2>
        {book.hook && <p className="mt-1 text-sm leading-6 text-muted-foreground">{book.hook}</p>}
        {book.removal_reason && <p className="mt-2 text-sm text-destructive">{book.removal_reason}</p>}
        <p className="mt-3 text-sm text-muted-foreground">
          {published.length > 0
            ? `Featured in ${published.map((s) => s.catalog_issues?.display_label).join(", ")}`
            : "Not in an issue yet — the editors will let you know."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/submit" search={{ edit: book.id }}><Pencil />Edit details</Link>
          </Button>
          {published.length > 0 && (
            <Button variant="ghost" asChild>
              <Link to="/table/books/$bookId" params={{ bookId: book.id }}>View at The Table</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function SubmissionsPage() {
  const { data: books = [], isLoading } = useMySubmissions();

  return (
    <AppShell>
      <PageHeading
        title="My submissions"
        description="Books you've sent to The Table, and where each one stands."
        action={<Button asChild><Link to="/submit"><Plus />Submit a book</Link></Button>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your submissions…</p>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
          <h2 className="font-serif text-2xl font-normal">Nothing sent yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">When your book is out in the world, submit it and the editors will consider it for an upcoming issue of The Table.</p>
          <Button className="mt-5" asChild><Link to="/submit">Submit your first book</Link></Button>
        </div>
      ) : (
        <div className="space-y-5">
          {books.map((book) => <SubmissionCard key={book.id} book={book} />)}
        </div>
      )}
    </AppShell>
  );
}
