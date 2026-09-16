import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Mail, Search } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { inviteAdmin, listPeople, sendPersonReset, setPersonAdmin, setPersonPassword, updatePerson } from "@/lib/admin-people.functions";

export const Route = createFileRoute("/_authenticated/admin/people")({
  head: () => ({ meta: [
    { title: "People — Author's Workshop admin" },
    { name: "description", content: "Find an account, edit its details, change its plan, reset its password or suspend it." },
    { property: "og:title", content: "People — Author's Workshop admin" },
    { property: "og:description", content: "Find an account, edit its details, change its plan, reset its password or suspend it." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPeople,
});

type Person = {
  id: string;
  user_id: string;
  display_name: string | null;
  pen_name: string | null;
  email: string;
  plan: string;
  suspended: boolean;
  created_at: string;
  roles: string[];
};

function usePeople() {
  return useQuery({
    queryKey: ["admin-people"],
    queryFn: async () => (await listPeople()) as Person[],
  });
}

function PersonCard({ person, onSaved }: { person: Person; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    display_name: person.display_name ?? "",
    pen_name: person.pen_name ?? "",
    email: person.email,
  });
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await work();
      toast.success(message);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn’t work");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-border bg-card px-5 py-4 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-semibold">{person.display_name || "No name yet"}</p>
          <p className="truncate text-sm text-muted-foreground">
            {person.email || "no email"} · {person.roles.length > 0 ? person.roles.join(", ") : "no role"} · joined{" "}
            {new Date(person.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <StatusPill tone={person.suspended ? "danger" : "good"}>{person.suspended ? "Suspended" : "Active"}</StatusPill>
        <select
          className="h-10 rounded-xl border border-input bg-paper px-3 text-sm"
          value={person.plan}
          aria-label={`Plan for ${person.display_name ?? "account"}`}
          disabled={busy}
          onChange={(event) => void run(() => updatePerson({ data: { userId: person.user_id, plan: event.target.value } }), "Plan updated")}
        >
          <option value="free">Free plan</option>
          <option value="paid">Paid plan</option>
        </select>
        <Button variant={person.suspended ? "default" : "outline"} disabled={busy} onClick={() => void run(() => updatePerson({ data: { userId: person.user_id, suspended: !person.suspended } }), "Account updated")}>
          {person.suspended ? "Restore" : "Suspend"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Edit"}</Button>
      </div>

      {open && (
        <div className="mt-5 grid gap-5 border-t border-border/70 pt-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold">Account details</p>
            <Input aria-label="Display name" placeholder="Display name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            <Input aria-label="Pen name" placeholder="Pen name" value={form.pen_name} onChange={(e) => setForm({ ...form, pen_name: e.target.value })} />
            <Input aria-label="Email address" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(
                  () => updatePerson({ data: {
                    userId: person.user_id,
                    display_name: form.display_name.trim() || null,
                    pen_name: form.pen_name.trim() || null,
                    ...(form.email.trim() && form.email.trim() !== person.email ? { email: form.email.trim() } : {}),
                  } }),
                  "Details saved",
                )
              }
            >
              Save details
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Password</p>
            <div className="flex flex-wrap items-center gap-3">
              <Input aria-label="New password" type="password" className="max-w-56" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button
                size="sm"
                variant="outline"
                disabled={busy || password.length < 8}
                onClick={() => void run(async () => { await setPersonPassword({ data: { userId: person.user_id, password } }); setPassword(""); }, "Password set")}
              >
                <KeyRound className="size-4" />Set password
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy || !person.email}
              onClick={() => void run(() => sendPersonReset({ data: { email: person.email, redirectTo: `${window.location.origin}/reset-password` } }), "Reset email sent")}
            >
              <Mail className="size-4" />Email a reset link
            </Button>
            <p className="text-xs text-muted-foreground">Setting a password signs the person in with it straight away. A reset link lets them choose their own.</p>
          </div>
        </div>
      )}
    </li>
  );
}

function AdminPeople() {
  const people = usePeople();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-people"] });

  const rows = (people.data ?? []).filter((person) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [person.display_name, person.pen_name, person.email, person.roles.join(" ")]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  return (
    <div className="space-y-6">
      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, email or role" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search people" />
      </label>
      {people.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading accounts…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No accounts match that search.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((person) => <PersonCard key={person.id} person={person} onSaved={refresh} />)}
        </ul>
      )}
    </div>
  );
}
