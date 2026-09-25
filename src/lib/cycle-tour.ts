import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type CycleTourStep = { key: string; title: string; body: string; position: number; enabled: boolean };

/** Which part of the cycle page each step points at. The steps themselves are fixed; the words are editable in Admin. */
export const CYCLE_TOUR_TARGETS: Record<string, string> = {
  header: "tour-header",
  progress: "tour-progress",
  setup_tasks: "tour-setup-tasks",
  phases: "tour-phases",
  post_launch: "tour-post-launch",
};

export const CYCLE_TOUR_DEFAULTS: CycleTourStep[] = [
  { key: "welcome", position: 0, enabled: true, title: "Welcome to your Book Cycle", body: "This is your plan for taking a book from idea to published, one phase and milestone at a time. Pen will show you around." },
  { key: "header", position: 1, enabled: true, title: "Your book’s toolbox", body: "Book details, collaborators, and resources live up here, along with your recommended tasks and the option to end your cycle when you’re done." },
  { key: "progress", position: 2, enabled: true, title: "Progress at a glance", body: "See how far along you are, your target publication date, and the next thing to work on." },
  { key: "setup_tasks", position: 3, enabled: true, title: "Set up recommended tasks", body: "Optional decisions and habits worth settling early, like your budget and publishing path. Nothing here blocks your cycle." },
  { key: "phases", position: 4, enabled: true, title: "Your publishing path", body: "Six phases take you from private manuscript to published book. Open a phase to see its milestones, then click a milestone to add notes, files, and steps." },
  { key: "post_launch", position: 5, enabled: true, title: "After launch", body: "An optional checklist for keeping your book growing once it’s out in the world. Check items off in any order." },
];

export const cycleTourQueryKey = ["cycle-tour-steps"] as const;

/** Edited copy from the database, layered over the built-in defaults so the tour still works if the table is empty. */
export function useCycleTourSteps({ includeDisabled = false }: { includeDisabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...cycleTourQueryKey, includeDisabled],
    queryFn: async (): Promise<CycleTourStep[]> => {
      const { data } = await supabase.from("cycle_tour_steps").select("*");
      const rows = new Map((data ?? []).map((row) => [row.key, row]));
      return CYCLE_TOUR_DEFAULTS.map((fallback) => {
        const row = rows.get(fallback.key);
        return row ? { key: row.key, title: row.title, body: row.body, position: row.position, enabled: row.enabled } : fallback;
      })
        .filter((step) => includeDisabled || step.enabled)
        .sort((a, b) => a.position - b.position);
    },
    staleTime: 60_000,
  });
}
