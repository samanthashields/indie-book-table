import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookRow } from "@/lib/book-db";

export const SETUP_TASKS_LABEL = "Set Up Recommended Tasks (optional)";

type SetupTaskDef = { key: string; label: string; description: string; bookField?: keyof BookRow };

/**
 * The recommended Setup Task catalog — author-owned, optional, never blocking. Each optionally names
 * the Book Details field it's about, so the checklist can show whether that field is actually filled
 * in — but the value itself always lives on `books`, never duplicated here. This table tracks
 * completion only. Fiction gets the fuller list; every other template shares the shorter one.
 */
const SHARED_SETUP_TASKS: SetupTaskDef[] = [
  { key: "publishing_path", label: "Choose publishing path", description: "Self-publishing, hybrid, or small press — this shapes which milestones apply later.", bookField: "publishing_path" },
  { key: "audience_genre", label: "Define audience and genre", description: "Who is this book for, and what shelf does it sit on?", bookField: "genre" },
  { key: "comparable_titles", label: "Gather comparable titles", description: "A few books like yours — useful for positioning, cover direction, and format decisions.", bookField: "comparables" },
  { key: "budget", label: "Set a budget", description: "A rough number is enough — it drives the do-it-yourself vs. hire recommendations later.", bookField: "budget" },
  { key: "launch_ambition", label: "Decide launch ambition", description: "How big a launch are you planning — a quiet release, or a full campaign?" },
];

const FICTION_SETUP_TASKS: SetupTaskDef[] = [
  { key: "daily_writing_time", label: "Schedule daily writing time", description: "Set aside a specific block of time each day—even if it is just 15 or 30 minutes—and treat it as a non-negotiable appointment." },
  { key: "word_count_goals", label: "Set realistic word count goals", description: "Start small with achievable targets like three sentences or 500 words a day rather than burning out on massive quotas." },
  { key: "design_workspace", label: "Design your workspace", description: "Choose a comfortable, dedicated spot—whether a corner of the couch, a desk, or a local library—that puts you in the mindset to work." },
  { key: "sensory_environment", label: "Tune your sensory environment", description: "Figure out if you work best in total silence, with white noise, or listening to instrumental music, and prep your environment before you start." },
  { key: "read_in_genre", label: "Read widely in your genre", description: "Read books similar to what you want to write to understand pacing, conventions, and reader expectations, alongside classics that push your boundaries." },
  { key: "analyze_reading", label: "Analyze what you read", description: "Ask questions of the texts you finish to see how authors build characters, handle conflicts, and construct effective sentences." },
  { key: "write_first_edit_later", label: "Write first, edit later", description: "Turn off your inner critic during the initial draft phase and just get words onto the page before worrying about polish." },
  { key: "writers_group", label: "Join a writer’s group", description: "Connect with other writers in your community or virtually to share feedback, build accountability, and connect with other creators" },
  { key: "protect_creative_energy", label: "Protect your creative energy", description: "Focus entirely on finishing the current project or building the daily habit rather than obsessing over publishing timelines or marketing too early." },
  { key: "audience_genre", label: "Define audience and genre", description: "Name who the book is for, and what genre shelf it will sit on.", bookField: "genre" },
  { key: "publishing_path", label: "Choose a publishing path", description: "Start thinking about if you plan to self-publish, use a hybrid approach, or use a small press — this shapes which milestones apply later.", bookField: "publishing_path" },
  { key: "comparable_titles", label: "Gather comparable titles", description: "Find a handful of recently published books similar to yours — useful for cover direction, positioning, and format decisions later.", bookField: "comparables" },
  { key: "launch_ambition", label: "Decide launch ambition", description: "Get a rough sense of how big a launch you're planning — a quiet release among friends and family, or a fuller campaign with reviewers, press, and paid promotion." },
  { key: "budget", label: "Determine your budget", description: "Determine the budget you are working with, even a rough number is enough. This will drive the do-it-yourself vs. hire recommendations later.", bookField: "budget" },
  { key: "tentative_pub_date", label: "Set a ‘tentative’ publication date", description: "Set a rough estimated date that will guide you towards when you would like to have the book go live.", bookField: "target_publication_date" },
];

/** Tasks from before the recommended-list change stay on existing books, so lookups still know their Book Details field. */
const LEGACY_SETUP_TASKS: SetupTaskDef[] = [
  { key: "trim_size", label: "Select trim size / manuscript template", description: "The print template Production will format the interior to later.", bookField: "trim_size" },
];

export const setupTaskDefsFor = (templateTitle: string | null | undefined): SetupTaskDef[] =>
  templateTitle && /fiction/i.test(templateTitle) && !/non-?fiction/i.test(templateTitle) ? FICTION_SETUP_TASKS : SHARED_SETUP_TASKS;

export const findSetupTaskDef = (key: string): SetupTaskDef | undefined =>
  [...FICTION_SETUP_TASKS, ...SHARED_SETUP_TASKS, ...LEGACY_SETUP_TASKS].find((def) => def.key === key);

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

/** Fetches this book's setup tasks, creating the recommended list for its template on first visit if none exist yet. */
export function useSetupTasks(bookId: string) {
  return useQuery({
    queryKey: ["setup-tasks", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("book_setup_tasks").select("*").eq("book_id", bookId).order("position");
      if (error) throw error;
      if (data && data.length > 0) return data as SetupTask[];

      const { data: book } = await supabase.from("books").select("template_id").eq("id", bookId).maybeSingle();
      const { data: template } = book?.template_id
        ? await supabase.from("templates").select("title").eq("id", book.template_id).maybeSingle()
        : { data: null };

      const { data: created, error: insertError } = await supabase
        .from("book_setup_tasks")
        .insert(setupTaskDefsFor(template?.title).map((task, position) => ({ book_id: bookId, key: task.key, label: task.label, description: task.description, position })))
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
