import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { TeamBody } from "@/components/team-body";

export const Route = createFileRoute("/_authenticated/books/$bookId/team")({
  head: () => ({ meta: [
    { title: "Collaborators — The Indie Book Table" },
    { name: "description", content: "Invite an editor, designer, illustrator or reader to help with one book cycle." },
    { property: "og:title", content: "Collaborators — The Indie Book Table" },
    { property: "og:description", content: "Invite an editor, designer, illustrator or reader to help with one book cycle." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TeamPage,
});

function TeamPage() {
  const { bookId } = Route.useParams();
  return (
    <AppShell coachContext="overview">
      <TeamBody bookId={bookId} />
    </AppShell>
  );
}
