import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookRow } from "@/lib/book-db";

/**
 * The fixed Setup Task catalog (Functionality Spec §3.9) — author-owned, cycle-level decisions
 * completed before/around production work. Each optionally names the Book Details field it's
 * about, so the checklist can show whether that field is actually filled in — but the value
 * itself always lives on `books`, never duplicated here. This table tracks completion only.
 */
export const SETUP_TASK_DEFS: { key: string; label: string; description: string; bookField?: keyof BookRow }[] = [
  { key: "publishing_path", label: "Choose publishing path", description: "Self-publishing, hybrid, or small press — this shapes which milestones apply later.", bookField: "publishing_path" },
  { key: "audience_genre", label: "Define audience and genre", description: "Who is this book for, and what shelf does it sit on?", bookField: "genre" },
  { key: "comparable_titles", label: "Gather comparable titles", description: "A few books like yours — useful for positioning, cover direction, and format decisions.", bookField: "comparables" },
  { key: "budget", label: "Set a budget", description: "A rough number is enough — it drives the do-it-yourself vs. hire recommendations later.", bookField: "budget" },
  { key: "launch_ambition", label: "Decide launch ambition", description: "How big a launch are you planning — a quiet release, or a full campaign?" },
  { key: "trim_size", label: "Select trim size / manuscript template", description: "The print template Production will format the interior to later.", bookField: "trim_size" },
];

export type SetupTask = {
  id: string;
  book_id: string;
  key: string;
  label: string;
  description: string | null;
  status: string;
  position: number;
  completed_at: string | null;
};

/** Fetches this book's setup tasks, creating the fixed six on first visit if none exist yet. */
export function useSetupTasks(bookId: string) {
  return useQuery({
    queryKey: ["setup-tasks", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("book_setup_tasks").select("*").eq("book_id", bookId).order("position");
      if (error) throw error;
      if (data && data.length > 0) return data as SetupTask[];

      const { data: created, error: insertError } = await supabase
        .from("book_setup_tasks")
        .insert(SETUP_TASK_DEFS.map((task, position) => ({ book_id: bookId, key: task.key, label: task.label, description: task.description, position })))
        .select("*");
      if (insertError) throw insertError;
      return ((created ?? []) as SetupTask[]).sort((a, b) => a.position - b.position);
    },
  });
}

export function useUpdateSetupTask(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, complete }: { id: string; complete: boolean }) => {
      const { error } = await supabase
        .from("book_setup_tasks")
        .update({ status: complete ? "complete" : "pending", completed_at: complete ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["setup-tasks", bookId] }),
  });
}
