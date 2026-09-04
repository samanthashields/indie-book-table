import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookTree } from "@/lib/book-db";
import { collaboratorRoles, useCollaborators, useInviteCollaborator, useRemoveCollaborator, useUpdateCollaborator } from "@/lib/collaborators";

export const Route = createFileRoute("/_authenticated/books/$bookId/team")({
  head: () => ({ meta: [
    { title: "Collaborators — Book Cycles" },
    { name: "description", content: "Invite an editor, designer, illustrator or reader to help with one book cycle." },
    { property: "og:title", content: "Collaborators — Book Cycles" },
    { property: "og:description", content: "Invite an editor, designer, illustrator or reader to help with one book cycle." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TeamPage,
});

function TeamPage() {
  const { bookId } = Route.useParams();
  const book = useBookTree(bookId);
  const collaborators = useCollaborators(bookId);
  const invite = useInviteCollaborator(bookId);
  const updateCollaborator = useUpdateCollaborator(bookId);
  const removeCollaborator = useRemoveCollaborator(bookId);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>(collaboratorRoles[1]);

  const send = () => {
    if (!email.trim()) return;
    invite.mutate(
      { email, name, role },
      {
        onSuccess: () => { setEmail(""); setName(""); toast.success("Invitation sent"); },
        onError: () => toast.error("Couldn’t send that invitation"),
      },
    );
  };

  return (
    <AppShell coachContext="overview">
      <PageHeading
        title="Collaborators"
        description={`Invite people to help with ${book.data?.book.title ?? "this book"}. They see only this book cycle and the milestones assigned to them.`}
      />

      <section className="rounded-2xl border border-border bg-paper p-6 shadow-xs">
        <h2 className="font-serif text-2xl font-normal">Invite someone</h2>
        <p className="mt-2 text-sm text-muted-foreground">They’ll create their own account with this email address, and the invitation stays open for 14 days.</p>
        <form className="mt-5 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <label className="block text-sm font-semibold">Email address<Input className="mt-2" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="editor@example.com" /></label>
          <label className="block text-sm font-semibold">Name (optional)<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Priya" /></label>
          <label className="block text-sm font-semibold">Role
            <select className="mt-2 h-11 w-full rounded-xl border border-input bg-card px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value)}>
              {collaboratorRoles.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <Button type="submit" disabled={invite.isPending}><Mail />Send invitation</Button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-serif text-2xl font-normal">On this book</h2>
        {collaborators.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading collaborators…</p>
        ) : (collaborators.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <UserRound className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No one else is on this book yet. Working solo is the normal starting point.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {(collaborators.data ?? []).map((person) => (
              <li key={person.id} className="grid gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-xs sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="font-semibold">{person.name || person.email}</p>
                  <p className="truncate text-sm text-muted-foreground">{person.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill tone={person.status === "active" ? "good" : "warm"}>{person.status === "active" ? "Active" : "Invited"}</StatusPill>
                  <select
                    className="h-10 rounded-xl border border-input bg-paper px-3 text-sm"
                    value={person.role}
                    aria-label={`Role for ${person.email}`}
                    onChange={(event) => updateCollaborator.mutate({ id: person.id, patch: { role: event.target.value } }, { onSuccess: () => toast.success("Role updated") })}
                  >
                    {collaboratorRoles.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <Button variant="ghost" size="icon" aria-label={`Remove ${person.email}`} onClick={() => removeCollaborator.mutate(person.id, { onSuccess: () => toast.success("Access removed") })}><Trash2 /></Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
