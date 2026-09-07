import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ChallengeProgress = {
  id: string;
  title: string;
  blurb: string | null;
  challengeMonth: string;
  metric: string;
  target: number;
  decorationKey: string;
  count: number;
  completed: boolean;
  completedAt: string | null;
  justCompleted: boolean;
};

const monthRange = (month: string) => {
  const start = new Date(`${month}T00:00:00Z`);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  return { start, end };
};

const within = (iso: string | null, start: Date, end: Date) => {
  if (!iso) return false;
  const at = new Date(iso);
  return at >= start && at < end;
};

/** Counts real progress on the server so a completion can never be faked from the browser. */
export const syncChallenges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ChallengeProgress[]> => {
    const { supabase, userId } = context;

    const { data: challengeRows, error } = await supabase
      .from("challenges")
      .select("id, title, blurb, challenge_month, metric, target, decoration_key")
      .eq("active", true)
      .order("challenge_month", { ascending: false });
    if (error) throw error;
    const challenges = challengeRows ?? [];
    if (challenges.length === 0) return [];

    const { data: doneRows } = await supabase
      .from("challenge_completions")
      .select("challenge_id, completed_at")
      .eq("user_id", userId);
    const doneAt = new Map<string, string>();
    for (const row of doneRows ?? []) doneAt.set(row.challenge_id, row.completed_at);

    const needs = new Set(challenges.map((row) => row.metric));

    const books = needs.has("cycles_completed") || needs.has("books_published")
      ? (await supabase.from("books").select("id, status, shelf_status, updated_at").eq("author_id", userId)).data ?? []
      : [];

    const milestones = needs.has("milestones_completed")
      ? (await supabase.from("milestones").select("id, status, updated_at, books!inner(author_id)").eq("books.author_id", userId).eq("status", "Complete")).data ?? []
      : [];

    let selections: { created_at: string }[] = [];
    if (needs.has("books_featured")) {
      const { data: mine } = await supabase.from("catalog_books").select("id, catalog_authors!inner(user_id)").eq("catalog_authors.user_id", userId);
      const ids = (mine ?? []).map((row) => row.id);
      if (ids.length > 0) {
        const { data } = await supabase.from("catalog_issue_selections").select("created_at").in("catalog_book_id", ids);
        selections = data ?? [];
      }
    }

    const results: ChallengeProgress[] = [];
    const fresh: { user_id: string; challenge_id: string; decoration_key: string }[] = [];

    for (const row of challenges) {
      const { start, end } = monthRange(row.challenge_month);
      let count = 0;
      if (row.metric === "cycles_completed") count = books.filter((b) => b.status === "complete" && within(b.updated_at, start, end)).length;
      if (row.metric === "books_published") count = books.filter((b) => b.shelf_status === "published" && within(b.updated_at, start, end)).length;
      if (row.metric === "milestones_completed") count = milestones.filter((m) => within(m.updated_at, start, end)).length;
      if (row.metric === "books_featured") count = selections.filter((s) => within(s.created_at, start, end)).length;

      const already = doneAt.get(row.id) ?? null;
      const reached = count >= row.target;
      if (reached && !already) fresh.push({ user_id: userId, challenge_id: row.id, decoration_key: row.decoration_key });

      results.push({
        id: row.id,
        title: row.title,
        blurb: row.blurb,
        challengeMonth: row.challenge_month,
        metric: row.metric,
        target: row.target,
        decorationKey: row.decoration_key,
        count,
        completed: reached || Boolean(already),
        completedAt: already,
        justCompleted: reached && !already,
      });
    }

    if (fresh.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("challenge_completions").upsert(fresh, { onConflict: "user_id,challenge_id", ignoreDuplicates: true });
    }

    return results;
  });
