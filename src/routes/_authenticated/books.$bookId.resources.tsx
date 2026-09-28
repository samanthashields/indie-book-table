import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ResourcesBody } from "@/components/resources-body";

export const Route = createFileRoute("/_authenticated/books/$bookId/resources")({
  head: () => ({ meta: [
    { title: "Resources — The Indie Book Table" },
    { name: "description", content: "Every working file and reference link for this book, in one place." },
    { property: "og:title", content: "Resources — The Indie Book Table" },
    { property: "og:description", content: "Every working file and reference link for this book, in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { bookId } = Route.useParams();
  return (
    <AppShell>
      <ResourcesBody bookId={bookId} showBackLink />
    </AppShell>
  );
}
