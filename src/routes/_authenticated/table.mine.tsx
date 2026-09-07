import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AuthorTable } from "@/components/achievements/author-table";
import { BadgeGrid } from "@/components/achievements/badge-grid";
import { PageHeading } from "@/components/page-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { readSeenBadges, useAchievements, writeSeenBadges, type BadgeId } from "@/lib/achievements";

export const Route = createFileRoute("/_authenticated/table/mine")({
  head: () => ({ meta: [
    { title: "My Table — Author's Workshop" },
    { name: "description", content: "See every book you've finished and published laid out on your own author's table." },
    { property: "og:title", content: "My Table — Author's Workshop" },
    { property: "og:description", content: "See every book you've finished and published laid out on your own author's table." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: MyTable,
});

function MyTable() {
  const { isLoading, publishedBooks, publishedCount, cyclesCompleted, publishedThisYear, badges } = useAchievements();

  useEffect(() => {
    if (isLoading) return;
    const seen = readSeenBadges();
    const earned = badges.filter((badge) => badge.earned).map((badge) => badge.id as BadgeId);
    const fresh = earned.filter((id) => !seen.includes(id));
    if (seen.length === 0) {
      writeSeenBadges(earned);
      return;
    }
    if (fresh.length === 0) return;
    for (const id of fresh) {
      const badge = badges.find((entry) => entry.id === id);
      if (badge) toast.success(`Milestone earned: ${badge.name}`);
    }
    writeSeenBadges([...seen, ...fresh]);
  }, [isLoading, badges]);

  return (
    <AppShell>
      <PageHeading
        title="My Table"
        description="A seat at the indie book author's table — every book you've published sits here."
        back={false}
      />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-10">
          <AuthorTable books={publishedBooks} />

          <section className="grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:grid-cols-3" aria-label="Your totals">
            <div className="rounded-xl bg-primary/5 px-4 py-4"><p className="text-sm font-semibold">Books published</p><p className="mt-1 text-2xl font-semibold">{publishedCount}</p></div>
            <div className="rounded-xl bg-primary/5 px-4 py-4"><p className="text-sm font-semibold">Cycles completed</p><p className="mt-1 text-2xl font-semibold">{cyclesCompleted}</p></div>
            <div className="rounded-xl bg-primary/5 px-4 py-4"><p className="text-sm font-semibold">Published this year</p><p className="mt-1 text-2xl font-semibold">{publishedThisYear}</p></div>
          </section>

          <BadgeGrid badges={badges} />
        </div>
      )}
    </AppShell>
  );
}
