import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, LayoutTemplate, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [
    { title: "Admin dashboard — Book Cycles" },
    { name: "description", content: "Sign-ups, active book cycles, published books and template usage across Book Cycles." },
    { property: "og:title", content: "Admin dashboard — Book Cycles" },
    { property: "og:description", content: "Sign-ups, active book cycles, published books and template usage across Book Cycles." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminDashboard,
});

function useStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [people, books, published, templates] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("books").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("books").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("books").select("template_id"),
      ]);
      const usage = new Map<string, number>();
      for (const row of (templates.data ?? []) as { template_id: string | null }[]) {
        if (row.template_id) usage.set(row.template_id, (usage.get(row.template_id) ?? 0) + 1);
      }
      const { data: templateRows } = await supabase.from("templates").select("id, title");
      const named = (templateRows ?? []).map((template) => ({ title: template.title, count: usage.get(template.id) ?? 0 })).sort((a, b) => b.count - a.count);
      return { people: people.count ?? 0, active: books.count ?? 0, published: published.count ?? 0, usage: named };
    },
  });
}

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: typeof Users; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <span className={`grid size-10 place-items-center rounded-xl ${tint}`}><Icon className="size-5" /></span>
      <p className="mt-4 font-serif text-4xl font-normal">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function AdminDashboard() {
  const stats = useStats();
  if (stats.isLoading || !stats.data) return <p className="text-sm text-muted-foreground">Loading the numbers…</p>;
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Accounts" value={stats.data.people} icon={Users} tint="bg-inkblue/12 text-inkblue" />
        <Stat label="Active book cycles" value={stats.data.active} icon={BookOpen} tint="bg-teal/20 text-primary" />
        <Stat label="Books published" value={stats.data.published} icon={CheckCircle2} tint="bg-leaf/25 text-foreground" />
        <Stat label="Global templates" value={stats.data.usage.length} icon={LayoutTemplate} tint="bg-amber/25 text-foreground" />
      </div>
      <section className="rounded-2xl border border-border bg-paper p-6">
        <h2 className="font-serif text-2xl font-normal">Template usage</h2>
        {stats.data.usage.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No templates yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {stats.data.usage.map((row) => (
              <li key={row.title} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm shadow-xs">
                <span className="font-semibold">{row.title}</span>
                <span className="text-muted-foreground">{row.count} book cycle{row.count === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
