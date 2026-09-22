import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  addSelection,
  createIssue,
  removeSelection,
  saveIssueTheme,
  saveQuota,
  setIssueStatus,
  updateSelection,
  useAdminIssues,
  useAdminSubmissions,
  useIssueDetail,
} from "@/lib/catalog-admin";
import { IssueBlockBuilder } from "@/components/admin/issue-block-builder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/issues")({ component: AdminIssues });

const monthLabel = (value: string) =>
  new Date(`${value.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

function AdminIssues() {
  const queryClient = useQueryClient();
  const issues = useAdminIssues();
  const submissions = useAdminSubmissions();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const activeId = selectedId ?? issues.data?.[0]?.id;
  const detail = useIssueDetail(activeId);

  const [newMonth, setNewMonth] = useState("");
  const [headline, setHeadline] = useState<string | null>(null);
  const [tagline, setTagline] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [addTo, setAddTo] = useState<Record<string, string>>({});

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["catalog-admin"] });
  const issue = issues.data?.find((item) => item.id === activeId);
  const theme = detail.data?.theme;
  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const quota of detail.data?.quotas ?? []) names.add(quota.category);
    for (const selection of detail.data?.selections ?? []) names.add(selection.category);
    return [...names].sort();
  }, [detail.data]);

  const eligible = (submissions.data ?? []).filter((book) => book.status === "added_to_database");

  const run = async (work: () => Promise<unknown>, message: string) => {
    try {
      await work();
      toast.success(message);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn’t save");
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">New issue</p>
          <Input type="month" className="mt-3" value={newMonth} onChange={(e) => setNewMonth(e.target.value)} aria-label="Issue month" />
          <Button
            className="mt-3 w-full"
            disabled={!newMonth}
            onClick={() =>
              void run(async () => {
                const month = `${newMonth}-01`;
                const id = await createIssue({ issue_month: month, display_label: monthLabel(month) });
                setSelectedId(id);
                setNewMonth("");
              }, "Issue created")
            }
          >
            Create issue
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="block text-sm font-semibold">
            Jump to an issue
            <select
              className="mt-2 h-9 w-full rounded-xl border border-input bg-paper px-3 text-sm"
              value={activeId ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {(issues.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.display_label} — {item.status === "published" ? "Published" : "Draft"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <nav className="space-y-2">
          {(issues.data ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors",
                item.id === activeId ? "bg-inverse text-on-inverse" : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item.display_label}
              <span className="mt-1 block text-xs font-normal opacity-80">{item.status === "published" ? "Published" : "Draft"}</span>
            </button>
          ))}
        </nav>
      </aside>

      {!issue ? (
        <p className="text-sm text-muted-foreground">Create an issue to start curating.</p>
      ) : (
        <div className="space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <h2 className="font-heading text-3xl font-normal">{issue.display_label}</h2>
              <StatusPill tone={issue.status === "published" ? "good" : "warm"}>{issue.status === "published" ? "Published" : "Draft"}</StatusPill>
            </div>
            <Button asChild variant="outline">
              <Link
                to="/table/$issueId"
                params={{ issueId: issue.id }}
                search={{ preview: true }}
                target="_blank"
                rel="noreferrer"
              >
                Preview as a reader
              </Link>
            </Button>
            <Button
              variant={issue.status === "published" ? "outline" : "default"}
              onClick={() =>
                void run(
                  () => setIssueStatus(issue.id, issue.status === "published" ? "draft" : "published"),
                  issue.status === "published" ? "Issue moved back to draft" : "Issue published",
                )
              }
            >
              {issue.status === "published" ? "Unpublish" : "Publish issue"}
            </Button>
          </header>

          <Tabs defaultValue="setup" className="space-y-6">
            <TabsList>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-5">

            <h3 className="font-heading text-2xl font-normal">Cover words</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Headline
                <Input className="mt-2" value={headline ?? theme?.cover_headline ?? ""} onChange={(e) => setHeadline(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Tagline
                <Textarea className="mt-2" rows={2} value={tagline ?? theme?.cover_tagline ?? ""} onChange={(e) => setTagline(e.target.value)} />
              </label>
            </div>
            <Button
              className="mt-4"
              onClick={() =>
                void run(
                  () =>
                    saveIssueTheme(issue.id, {
                      cover_headline: headline ?? theme?.cover_headline ?? null,
                      cover_tagline: tagline ?? theme?.cover_tagline ?? null,
                    }),
                  "Cover words saved",
                )
              }
            >
              Save cover words
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading text-2xl font-normal">Sections</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <Input className="max-w-64" placeholder="Add a section, e.g. Cosy Fantasy" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <Button
                variant="outline"
                disabled={!newCategory.trim()}
                onClick={() =>
                  void run(async () => {
                    await saveQuota(issue.id, newCategory.trim(), 6);
                    setNewCategory("");
                  }, "Section added")
                }
              >
                Add section
              </Button>
            </div>

            <div className="mt-6 space-y-8">
              {categories.length === 0 && <p className="text-sm text-muted-foreground">No sections yet.</p>}
              {categories.map((category) => {
                const quota = detail.data?.quotas.find((item) => item.category === category);
                const picks = (detail.data?.selections ?? []).filter((item) => item.category === category);
                return (
                  <div key={category}>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-heading text-xl">{category}</h4>
                      <StatusPill tone={quota && picks.length > quota.quota ? "danger" : "neutral"}>
                        {picks.length}/{quota?.quota ?? "–"} slots
                      </StatusPill>
                      <Input
                        type="number"
                        min={0}
                        className="h-9 w-24"
                        aria-label={`Slots for ${category}`}
                        defaultValue={quota?.quota ?? 6}
                        onBlur={(e) => void run(() => saveQuota(issue.id, category, Number(e.target.value)), "Slots updated")}
                      />
                    </div>

                    <ul className="mt-3 space-y-2">
                      {picks.map((pick) => (
                        <li key={pick.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-paper px-4 py-3">
                          <span className="min-w-0 flex-1 text-sm">
                            <span className="font-semibold">{pick.catalog_books?.title}</span>
                            <span className="text-muted-foreground"> — {pick.catalog_books?.catalog_authors?.name}</span>
                          </span>
                          <Button
                            size="sm"
                            variant={pick.is_spotlight ? "default" : "outline"}
                            onClick={() => void run(() => updateSelection(pick.id, { is_spotlight: !pick.is_spotlight }), "Spotlight updated")}
                          >
                            <Star className="size-4" />{pick.is_spotlight ? "Spotlight" : "Make spotlight"}
                          </Button>
                          <Button size="icon" variant="ghost" aria-label={`Remove ${pick.catalog_books?.title}`} onClick={() => void run(() => removeSelection(pick.id), "Removed from the issue")}>
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <select
                        aria-label={`Add a book to ${category}`}
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                        value={addTo[category] ?? ""}
                        onChange={(e) => setAddTo((current) => ({ ...current, [category]: e.target.value }))}
                      >
                        <option value="">Choose a book…</option>
                        {eligible
                          .filter((book) => !picks.some((pick) => pick.catalog_book_id === book.id))
                          .map((book) => (
                            <option key={book.id} value={book.id}>{book.title} — {book.catalog_authors?.name}</option>
                          ))}
                      </select>
                      <Button
                        variant="outline"
                        disabled={!addTo[category]}
                        onClick={() =>
                          void run(async () => {
                            await addSelection(issue.id, addTo[category]!, category, picks.length);
                            setAddTo((current) => ({ ...current, [category]: "" }));
                          }, "Book added to the issue")
                        }
                      >
                        Add to {category}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </TabsContent>

            <TabsContent value="layout">
              <div className="relative left-1/2 w-[calc(100vw-2.5rem)] -translate-x-1/2 md:w-[calc(100vw-4rem)]">
                <IssueBlockBuilder issueId={issue.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

      )}
    </section>
  );
}
