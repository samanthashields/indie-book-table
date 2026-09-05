import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  head: () => ({ meta: [
    { title: "Activity log — Book Cycles admin" },
    { name: "description", content: "Everything happening across book cycles, newest first." },
    { property: "og:title", content: "Activity log — Book Cycles admin" },
    { property: "og:description", content: "Everything happening across book cycles, newest first." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminActivity,
});

function AdminActivity() {
  const activity = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity").select("id, text, actor_name, created_at, book_id").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (activity.isLoading) return <p className="text-sm text-muted-foreground">Loading the log…</p>;
  const rows = activity.data ?? [];
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nothing has happened yet.</p>;

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-xs">
          <p>{row.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </li>
      ))}
    </ul>
  );
}
