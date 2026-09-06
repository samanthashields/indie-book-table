import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { MarkdownText } from "@/components/markdown-text";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { useReleaseNotes } from "@/lib/help-db";

export const Route = createFileRoute("/_authenticated/help/releases")({
  component: ReleaseNotesPage,
  head: () => ({
    meta: [
      { title: "Release notes · Author’s Workshop" },
      { name: "description", content: "Everything new in the Author’s Workshop, newest first." },
      { property: "og:title", content: "Release notes · Author’s Workshop" },
      { property: "og:description", content: "Everything new in the Author’s Workshop, newest first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ReleaseNotesPage() {
  const releases = useReleaseNotes();
  const notes = (releases.data ?? []).filter((note) => note.status === "published");

  return (
    <AppShell>
      <PageHeading title="Release notes" description="What changed in the workshop, newest first." backLabel="Help Center" />
      <ol className="max-w-3xl space-y-4">
        {releases.isLoading && <li className="text-sm text-muted-foreground">Loading release notes…</li>}
        {notes.map((note) => (
          <li key={note.id} className={`rounded-2xl border-2 p-6 ${note.highlight ? "border-sun/60 bg-sun/10" : "border-border bg-card"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {note.label && <StatusPill tone="good">{note.label}</StatusPill>}
              <span className="text-xs text-muted-foreground">{new Date(note.released_on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-normal">{note.title}</h2>
            <div className="mt-3"><MarkdownText text={note.body} /></div>
          </li>
        ))}
        {!releases.isLoading && notes.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No release notes yet.</li>
        )}
      </ol>
    </AppShell>
  );
}
