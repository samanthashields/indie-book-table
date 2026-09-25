import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const POST_LAUNCH_TASKS_LABEL = "Post Launch Recommended Tasks (optional)";

/** Same list for every genre template. Optional and non-blocking; tracks completion only. */
export const POST_LAUNCH_TASK_GROUPS: { group: string; tasks: { key: string; label: string }[] }[] = [
  { group: "Connect In-Person and Locally", tasks: [
    { key: "schedule_author_events", label: "Schedule author events" },
    { key: "host_local_events", label: "Host local events" },
    { key: "participate_in_markets", label: "Participate in markets" },
  ] },
  { group: "Gather and Leverage Reviews", tasks: [
    { key: "collect_reviews", label: "Continue collecting customer reviews" },
    { key: "highlight_testimonials", label: "Highlight testimonials" },
  ] },
  { group: "Run Strategic Promotions and Advertisement", tasks: [
    { key: "discount_ebook", label: "Discount your ebook" },
    { key: "promo_sites", label: "Use promo sites" },
    { key: "targeted_ads", label: "Run targeted ads" },
    { key: "repurpose_content_promo", label: "Repurpose your content" },
  ] },
  { group: "Pitch Podcasts and Media", tasks: [
    { key: "guest_interviews", label: "Do guest interviews" },
    { key: "repurpose_content_media", label: "Repurpose content" },
  ] },
  { group: "Nurture Your Community", tasks: [
    { key: "regular_newsletters", label: "Send regular newsletters" },
    { key: "engage_social_media", label: "Engage on social media" },
    { key: "support_other_authors", label: "Support other authors" },
  ] },
  { group: "Engage on Social Media and Communities", tasks: [
    { key: "behind_the_scenes", label: "Share behind-the-scenes content" },
    { key: "goodreads_profile", label: "Set up a Goodreads profile" },
  ] },
  { group: "Focus on the Next Project", tasks: [
    { key: "begin_next_book", label: "Begin your next book" },
  ] },
];

export type PostLaunchTask = {
  id: string;
  book_id: string;
  key: string;
  label: string;
  group_label: string;
  status: string;
  position: number;
  completed_at: string | null;
};

/** Fetches this book's post-launch tasks, creating the recommended list on first visit if none exist yet. */
export function usePostLaunchTasks(bookId: string) {
  return useQuery({
    queryKey: ["post-launch-tasks", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("book_post_launch_tasks").select("*").eq("book_id", bookId).order("position");
      if (error) throw error;
      if (data && data.length > 0) return data as PostLaunchTask[];

      const rows = POST_LAUNCH_TASK_GROUPS.flatMap((entry) => entry.tasks.map((task) => ({ ...task, group_label: entry.group }))).map((task, position) => ({ book_id: bookId, ...task, position }));
      const { data: created, error: insertError } = await supabase.from("book_post_launch_tasks").insert(rows).select("*");
      if (insertError) throw insertError;
      return ((created ?? []) as PostLaunchTask[]).sort((a, b) => a.position - b.position);
    },
  });
}

export function useUpdatePostLaunchTask(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, complete }: { id: string; complete: boolean }) => {
      const { error } = await supabase
        .from("book_post_launch_tasks")
        .update({ status: complete ? "complete" : "pending", completed_at: complete ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["post-launch-tasks", bookId] }),
  });
}
