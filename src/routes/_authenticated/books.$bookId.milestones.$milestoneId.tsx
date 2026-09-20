import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MilestoneBody } from "@/components/milestone-body";
import { useBookTree } from "@/lib/book-db";

export const Route = createFileRoute("/_authenticated/books/$bookId/milestones/$milestoneId")({
  head: () => ({ meta: [
    { title: "Milestone — Book Cycles" }, { name: "description", content: "Complete a book milestone and its single linked requirement." },
    { property: "og:title", content: "Milestone — Book Cycles" }, { property: "og:description", content: "Complete a book milestone and its single linked requirement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: MilestoneDetail,
});

function MilestoneDetail() {
  const { bookId, milestoneId } = Route.useParams();
  const { data, isLoading } = useBookTree(bookId);
  if (isLoading) return <AppShell coachContext="milestone"><p className="text-sm text-muted-foreground">Loading milestone…</p></AppShell>;
  const found = data?.phases.flatMap((phase) => phase.milestones.map((milestone) => ({ milestone, phaseName: phase.name }))).find((entry) => entry.milestone.id === milestoneId);
  if (!data || !found) return <AppShell coachContext="milestone"><p className="text-sm text-muted-foreground">This milestone isn’t available.</p></AppShell>;
  return (
    <AppShell coachContext="milestone">
      <nav className="mb-6 text-sm text-muted-foreground"><Link to="/books/$bookId" params={{ bookId }} className="hover:text-link">{data.book.title}</Link> / {found.phaseName}</nav>
      <MilestoneBody bookId={bookId} milestone={found.milestone} phaseName={found.phaseName} />
    </AppShell>
  );
}
