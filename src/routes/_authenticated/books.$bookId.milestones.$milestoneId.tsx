import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MilestoneBody } from "@/components/milestone-body";
import { bookById, milestoneById } from "@/lib/book-data";

export const Route = createFileRoute("/_authenticated/books/$bookId/milestones/$milestoneId")({
  head: () => ({ meta: [
    { title: "Milestone — Book Cycles" }, { name: "description", content: "Complete a book milestone and its single linked requirement." },
    { property: "og:title", content: "Milestone — Book Cycles" }, { property: "og:description", content: "Complete a book milestone and its single linked requirement." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: MilestoneDetail,
});

function MilestoneDetail() {
  const { bookId, milestoneId } = Route.useParams();
  const book = bookById(bookId);
  const milestone = milestoneById(milestoneId);
  return (
    <AppShell coachContext="milestone">
      <nav className="mb-6 text-sm text-muted-foreground"><Link to="/books/$bookId" params={{ bookId }} className="hover:text-primary">{book.title}</Link> / {milestone.phase}</nav>
      <MilestoneBody milestone={milestone} phaseName={milestone.phase} />
    </AppShell>
  );
}
