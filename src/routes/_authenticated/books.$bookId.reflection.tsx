import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { ReflectionBody } from "@/components/reflection-body";

export const Route = createFileRoute("/_authenticated/books/$bookId/reflection")({ head: () => ({ meta: [
  { title: "Post-Launch Reflection — The Indie Book Table" }, { name: "description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:title", content: "Post-Launch Reflection — The Indie Book Table" }, { property: "og:description", content: "Reflect on your book launch and decide what comes next." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Reflection });

function Reflection() {
  const { bookId } = Route.useParams();
  return (
    <AppShell>
      <PageHeading title="Post-Launch Reflection" description="Your answers stay with this book cycle." />
      <ReflectionBody bookId={bookId} />
    </AppShell>
  );
}
