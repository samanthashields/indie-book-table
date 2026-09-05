import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/people")({
  head: () => ({ meta: [
    { title: "People — Book Cycles admin" },
    { name: "description", content: "Find an account, change its plan, suspend it or restore it." },
    { property: "og:title", content: "People — Book Cycles admin" },
    { property: "og:description", content: "Find an account, change its plan, suspend it or restore it." },
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
  plan: string;
  suspended: boolean;
  created_at: string;
  roles: string[];
};

function usePeople() {
  return useQuery({
    queryKey: ["admin-people"],
    queryFn: async (): Promise<Person[]> => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, user_id, display_name, pen_name, plan, suspended, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (error) throw error;
      const byUser = new Map<string, string[]>();
      for (const row of (roles ?? []) as { user_id: string; role: string }[]) {
        byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), row.role]);
      }
      return ((profiles ?? []) as Omit<Person, "roles">[]).map((profile) => ({ ...profile, roles: byUser.get(profile.user_id) ?? [] }));
    },
  });
}

function AdminPeople() {
  const people = usePeople();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { plan?: string; suspended?: boolean } }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["admin-people"] }); toast.success("Account updated"); },
    onError: () => toast.error("Couldn’t update that account"),
  });

  const rows = (people.data ?? []).filter((person) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [person.display_name, person.pen_name, person.roles.join(" ")].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
  });

  return (
    <div className="space-y-6">
      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or role" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search people" />
      </label>
      {people.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading accounts…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No accounts match that search.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((person) => (
            <li key={person.id} className="grid gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div className="min-w-0">
                <p className="font-semibold">{person.display_name || "No name yet"}</p>
                <p className="text-sm text-muted-foreground">{person.roles.length > 0 ? person.roles.join(", ") : "no role"} · joined {new Date(person.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <StatusPill tone={person.suspended ? "danger" : "good"}>{person.suspended ? "Suspended" : "Active"}</StatusPill>
              <select
                className="h-10 rounded-xl border border-input bg-paper px-3 text-sm"
                value={person.plan}
                aria-label={`Plan for ${person.display_name ?? "account"}`}
                onChange={(event) => update.mutate({ id: person.id, patch: { plan: event.target.value } })}
              >
                <option value="free">Free plan</option>
                <option value="paid">Paid plan</option>
              </select>
              <Button variant={person.suspended ? "default" : "outline"} onClick={() => update.mutate({ id: person.id, patch: { suspended: !person.suspended } })}>
                {person.suspended ? "Restore" : "Suspend"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
