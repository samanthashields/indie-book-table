import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check, Pencil, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BookGridCard } from "@/components/book-grid-card";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { ViewSwitcher, useCollectionView, type CollectionView } from "@/components/view-switcher";
import { useCatalogCoverUrl } from "@/lib/catalog-covers";
import { useMySubmissions, type SubmissionRow } from "@/lib/catalog-submit";
import { SUBMISSION_STATUS_LABELS } from "@/lib/submission-schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({
    meta: [
      { title: "My submissions — The Indie Book Table" },
      { name: "description", content: "Track the books you've sent to The Table and see which issues picked them up." },
      { property: "og:title", content: "My submissions — The Indie Book Table" },
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

const STEPS = ["Submitted", "Under review", "In the database", "Featured in an issue"] as const;

function currentStep(book: SubmissionRow, hasPublished: boolean) {
  if (hasPublished) return 3;
  if (book.status === "added_to_database") return 2;
  if (book.status === "under_review") return 1;
  return 0;
}

function Timeline({ step, className }: { step: number; className?: string | undefined }) {
  return (
    <ol className={cn("mt-4 flex flex-wrap items-center gap-x-2 gap-y-2", className)} aria-label="Submission progress">
      {STEPS.map((label, index) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
              index < step && "bg-teal/15 text-link",
              index === step && "bg-primary text-primary-foreground",
              index > step && "bg-muted text-muted-foreground",
            )}
          >
            {index < step && <Check className="size-3" />}
            {label}
          </span>
          {index < STEPS.length - 1 && <span className="h-px w-4 bg-border" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

const submittedOn = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function SubmissionCard({ book, view }: { book: SubmissionRow; view: CollectionView }) {
  const cover = useCatalogCoverUrl(book.cover_image_url);
  const published = book.catalog_issue_selections.filter((s) => s.catalog_issues?.status === "published");
  const upcoming = book.catalog_issue_selections.filter((s) => s.catalog_issues?.status !== "published");
  const step = currentStep(book, published.length > 0);
  const grid = view === "grid";

  const coverImage = cover.data ? (
    <img src={cover.data} alt={`Cover of ${book.title}`} className="aspect-[2/3] w-full rounded-lg object-cover shadow-sm" loading="lazy" />
  ) : (
    <span className="grid aspect-[2/3] w-full place-items-center rounded-lg bg-teal/15 p-2 text-center font-heading text-sm text-cocoa shadow-sm">{book.title}</span>
  );

  const pills = (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill tone={TONE[book.status] ?? "neutral"}>{SUBMISSION_STATUS_LABELS[book.status] ?? book.status}</StatusPill>
      {book.catalog_issue_selections.some((s) => s.is_spotlight) && <StatusPill tone="warm">Spotlight</StatusPill>}
    </div>
  );
  const notes = (
    <>
      {book.hook && <p className="mt-1 text-sm leading-6 text-muted-foreground">{book.hook}</p>}
      <p className="mt-2 text-xs text-muted-foreground">Sent on {submittedOn(book.submitted_at)}</p>
      {book.removal_reason && <p className="mt-2 text-sm text-destructive">{book.removal_reason}</p>}
    </>
  );
  const progress = (
    <>
      {book.status !== "removed" && <Timeline step={step} className={grid ? undefined : "lg:mt-0"} />}
      <p className="mt-3 text-sm text-muted-foreground">
        {published.length > 0
          ? `Featured in ${published.map((s) => s.catalog_issues?.display_label).join(", ")}`
          : upcoming.length > 0
            ? `Picked for an upcoming issue — ${upcoming.map((s) => s.catalog_issues?.display_label).filter(Boolean).join(", ")}`
            : "Not in an issue yet — the editors will let you know."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link to="/submit" search={{ edit: book.id }}><Pencil />Edit details</Link>
        </Button>
        {book.book_cycle_id && (
          <Button variant="ghost" asChild>
            <Link to="/books/$bookId/details" params={{ bookId: book.book_cycle_id }}><BookOpen />Open in My Books</Link>
          </Button>
        )}
        {published.length > 0 && (
          <Button variant="ghost" asChild>
            <Link to="/table/books/$bookId" params={{ bookId: book.id }}>View at The Table</Link>
          </Button>
        )}
      </div>
    </>
  );

  if (grid) {
    return (
      <BookGridCard size="sm" cover={coverImage} title={book.title}>
        <div className="mt-2">{pills}</div>
        {notes}
        {progress}
      </BookGridCard>
    );
  }

  return (
    <article className="flex gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="w-24 shrink-0">{coverImage}</div>
      <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-10">
        <div>
          {pills}
          <h2 className="mt-2 font-heading text-2xl font-normal">{book.title}</h2>
          {notes}
        </div>
        <div className="lg:pt-1">{progress}</div>
      </div>
    </article>
  );
}

function SubmissionsPage() {
  const { data: books = [], isLoading } = useMySubmissions();
  const [view, setView] = useCollectionView();

  return (
    <AppShell>
      <PageHeading
        title="My submissions"
        description="Books you've sent to The Table, and where each one stands."
        action={<div className="flex flex-wrap items-center gap-3"><ViewSwitcher view={view} onChange={setView} label="Choose how submissions are shown" /><Button asChild><Link to="/submit"><Plus />Submit a book</Link></Button></div>}
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your submissions…</p>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper p-10 text-center">
          <h2 className="font-heading text-2xl font-normal">Nothing sent yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">When your book is out in the world, submit it and the editors will consider it for an upcoming issue of The Table.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/submit">Submit your first book</Link></Button>
            <Button variant="outline" asChild><Link to="/"><BookOpen />Pick a book from My Books</Link></Button>
          </div>
        </div>
      ) : (
        <div className={view === "grid" ? "grid gap-5 lg:grid-cols-2" : "space-y-5"}>
          {books.map((book) => <SubmissionCard key={book.id} book={book} view={view} />)}
        </div>
      )}
    </AppShell>
  );
}
