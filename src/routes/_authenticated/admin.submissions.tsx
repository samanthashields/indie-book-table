import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalogCoverUrl } from "@/lib/catalog-covers";
import {
  addSelection,
  setSubmissionStatus,
  useAdminIssues,
  useAdminSubmissions,
  useIssueDetail,
  type AdminSubmission,
} from "@/lib/catalog-admin";
import { SUBMISSION_STATUS_LABELS } from "@/lib/submission-schema";
import { AUDIENCE_LABELS } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/submissions")({ component: AdminSubmissions });

const FILTERS = [
  { key: "submitted", label: "New" },
  { key: "under_review", label: "Under review" },
  { key: "added_to_database", label: "In the database" },
  { key: "removed", label: "Removed" },
  { key: "all", label: "Everything" },
] as const;

/** Turns an under-review submission into an issue selection in one step. */
function FeaturePicker({ book, onChanged }: { book: AdminSubmission; onChanged: () => void }) {
  const issues = useAdminIssues();
  const [issueId, setIssueId] = useState<string | undefined>(undefined);
  const activeId = issueId ?? issues.data?.[0]?.id;
  const detail = useIssueDetail(activeId);
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = [
    ...new Set([
      ...(detail.data?.quotas ?? []).map((quota) => quota.category),
      ...(detail.data?.selections ?? []).map((selection) => selection.category),
    ]),
  ].sort();

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0]!);
  }, [categories, category]);

  const feature = async () => {
    if (!activeId || !category.trim()) {
      toast.error("Pick an issue and a section first");
      return;
    }
    setBusy(true);
    try {
      await setSubmissionStatus(book.id, "added_to_database");
      await addSelection(activeId, book.id, category.trim(), (detail.data?.selections ?? []).length);
      toast.success(`Added to ${issues.data?.find((issue) => issue.id === activeId)?.display_label ?? "the issue"}`);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t add that to the issue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-paper px-4 py-3">
      <select
        className="h-9 rounded-xl border border-input bg-card px-3 text-sm"
        value={activeId ?? ""}
        aria-label="Issue"
        onChange={(event) => setIssueId(event.target.value)}
      >
        {(issues.data ?? []).map((issue) => (
          <option key={issue.id} value={issue.id}>{issue.display_label}{issue.status === "published" ? " (published)" : ""}</option>
        ))}
      </select>
      <Input
        className="h-9 max-w-48"
        list={`sections-${book.id}`}
        placeholder="Section"
        aria-label="Section"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      />
      <datalist id={`sections-${book.id}`}>
        {categories.map((name) => <option key={name} value={name} />)}
      </datalist>
      <Button size="sm" disabled={busy || !activeId} onClick={() => void feature()}>Select to feature in issue</Button>
    </div>
  );
}

function Row({ book, onChanged }: { book: AdminSubmission; onChanged: () => void }) {
  const cover = useCatalogCoverUrl(book.cover_image_url);
  const [reason, setReason] = useState(book.removal_reason ?? "");
  const [busy, setBusy] = useState(false);

  const act = async (status: string, removalReason?: string | null) => {
    setBusy(true);
    try {
      await setSubmissionStatus(book.id, status, removalReason);
      toast.success("Submission updated");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t update that");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="flex gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs">
      {cover.data ? (
        <img src={cover.data} alt={`Cover of ${book.title}`} className="aspect-[2/3] w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
      ) : (
        <span className="grid aspect-[2/3] w-20 shrink-0 place-items-center rounded-xl bg-teal/15 text-center font-heading text-cocoa">{book.title.charAt(0)}</span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={book.status === "added_to_database" ? "good" : book.status === "removed" ? "danger" : "warm"}>
            {SUBMISSION_STATUS_LABELS[book.status] ?? book.status}
          </StatusPill>
          <StatusPill>{AUDIENCE_LABELS[book.target_audience] ?? book.target_audience}</StatusPill>
          {book.explicit_content && <StatusPill tone="danger">Explicit</StatusPill>}
          {book.times_featured_count > 0 && <StatusPill>Featured {book.times_featured_count}×</StatusPill>}
        </div>
        <h2 className="mt-2 font-heading text-2xl font-normal">{book.title}</h2>
        <p className="text-sm text-muted-foreground">
          {book.pen_name || book.catalog_authors?.name} · {book.catalog_authors?.email} · {book.genre || "No genre given"}
        </p>
        {book.hook && <p className="mt-2 text-sm leading-6">{book.hook}</p>}

        {book.status === "under_review" ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm" disabled={busy} onClick={() => void act("added_to_database")}>
                Add to the database
              </Button>
              <span className="text-xs text-muted-foreground">
                Or pick an issue below — that adds it to the database too.
              </span>
            </div>
            <FeaturePicker book={book} onChanged={onChanged} />
          </>
        ) : book.status === "submitted" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm" disabled={busy} onClick={() => void act("under_review")}>Start review</Button>
          </div>
        ) : book.status === "added_to_database" ? (
          <FeaturePicker book={book} onChanged={onChanged} />
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {book.status !== "submitted" && book.status !== "under_review" && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void act("under_review")}>Send back to review</Button>
          )}
          <Input className="h-9 max-w-56" placeholder="Reason (if removing)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act("removed", reason || null)}>Remove</Button>
        </div>
      </div>
    </article>
  );
}

function AdminSubmissions() {
  const { data: books = [], isLoading } = useAdminSubmissions();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("submitted");
  const shown = filter === "all" ? books : books.filter((book) => book.status === filter);
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["catalog-admin"] });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === item.key ? "bg-inverse text-on-inverse" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label} ({item.key === "all" ? books.length : books.filter((book) => book.status === item.key).length})
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading submissions…</p>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">Nothing here right now.</p>
      ) : (
        <div className="space-y-5">{shown.map((book) => <Row key={book.id} book={book} onChanged={refresh} />)}</div>
      )}
    </section>
  );
}
