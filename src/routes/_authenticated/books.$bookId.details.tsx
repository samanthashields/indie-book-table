import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BookDetailsBody } from "@/components/book-details-body";

export const Route = createFileRoute("/_authenticated/books/$bookId/details")({ head: () => ({ meta: [
  { title: "Book Details — The Indie Book Table" }, { name: "description", content: "Edit the publishing, audience, format, and distribution details for your book." }, { property: "og:title", content: "Book Details — The Indie Book Table" }, { property: "og:description", content: "Edit the publishing, audience, format, and distribution details for your book." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: BookDetails });

function BookDetails() {
  const { bookId } = Route.useParams();
  return (
    <AppShell>
      <BookDetailsBody bookId={bookId} />
    </AppShell>
  );
}
