import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type PenSection = "overview" | "books" | "cycle" | "milestone" | "submissions" | "create";

export type PenQuickAction = { label: string; prompt: string; hidden: boolean };

export const PEN_SECTIONS: { key: PenSection; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "books", label: "My Books" },
  { key: "cycle", label: "Book cycle" },
  { key: "milestone", label: "Milestone" },
  { key: "submissions", label: "Submissions" },
  { key: "create", label: "New book" },
];

const NEXT: Record<PenSection, string> = {
  overview:
    "Looking at my shelf, my open milestones and their due dates, what is the single next thing I should do? Say why.",
  books: "Across the books on my shelf, what is the single next step I should take, and on which book?",
  cycle:
    "For the book cycle I'm looking at, what should I do next? Use my current phase, my open milestones and their due dates, and tell me if I'm behind.",
  milestone:
    "For the milestone I'm looking at, what should I do next to finish it, and how does its due date look?",
  submissions:
    "Based on my published books and submissions to The Table, what should I do next to get a book in front of readers?",
  create: "Given what I've told you about this new book, what should I decide or do next?",
};

const WHERE: Record<PenSection, string> = {
  overview: "Where in Author's Workshop do I do that? Point me to the exact page and link it.",
  books: "Where in Author's Workshop do I do that for this book? Point me to the exact page and link it.",
  cycle: "Which page of this book cycle do I work in for that? Link me to the milestone or the cycle page.",
  milestone: "Where exactly do I record my work on this milestone? Link me to it.",
  submissions: "Where do I submit or update a book for The Table? Link me to the page.",
  create: "Where do I set this up in Author's Workshop? Link me to the page.",
};

const ARTICLE_PROMPT =
  "Which Help Center article fits what we've been talking about? Recommend one by title and tell me what I'll get from it.";

/** The buttons every author starts with, before they customise anything. */
export const PEN_DEFAULT_ACTIONS: Record<PenSection, PenQuickAction[]> = Object.fromEntries(
  PEN_SECTIONS.map(({ key }) => [
    key,
    [
      { label: "What should I do next?", prompt: NEXT[key], hidden: false },
      { label: "Show me a help article", prompt: ARTICLE_PROMPT, hidden: false },
      { label: "Where do I do this?", prompt: WHERE[key], hidden: false },
    ],
  ]),
) as Record<PenSection, PenQuickAction[]>;

export function isPenSection(value: string | undefined): value is PenSection {
  return Boolean(value && value in PEN_DEFAULT_ACTIONS);
}

export function penSectionKey(section: string | undefined): PenSection {
  return isPenSection(section) ? section : "overview";
}

/** The author's saved buttons for one area, falling back to the built-in set. */
export function usePenQuickActions(section: string | undefined) {
  const key = penSectionKey(section);
  return useQuery({
    queryKey: ["pen", "quick-actions", key],
    queryFn: async (): Promise<PenQuickAction[]> => {
      const { data, error } = await supabase
        .from("pen_quick_actions")
        .select("label, prompt, hidden, position")
        .eq("section", key)
        .order("position", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return PEN_DEFAULT_ACTIONS[key];
      return data.map((row) => ({ label: row.label, prompt: row.prompt, hidden: row.hidden }));
    },
    staleTime: 60_000,
  });
}

/** Replaces the whole set for one area, so order is always explicit. */
export function useSavePenQuickActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { section: PenSection; actions: PenQuickAction[] }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Please sign in first.");

      const { error: clearError } = await supabase
        .from("pen_quick_actions")
        .delete()
        .eq("user_id", userId)
        .eq("section", input.section);
      if (clearError) throw clearError;

      const rows = input.actions
        .filter((action) => action.label.trim() && action.prompt.trim())
        .map((action, index) => ({
          user_id: userId,
          section: input.section,
          label: action.label.trim(),
          prompt: action.prompt.trim(),
          hidden: action.hidden,
          position: index,
        }));
      if (rows.length > 0) {
        const { error } = await supabase.from("pen_quick_actions").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: ["pen", "quick-actions", input.section] });
    },
  });
}

/** Clears an area back to the built-in buttons. */
export function useResetPenQuickActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (section: PenSection) => {
      const { error } = await supabase.from("pen_quick_actions").delete().eq("section", section);
      if (error) throw error;
    },
    onSuccess: (_result, section) => {
      void queryClient.invalidateQueries({ queryKey: ["pen", "quick-actions", section] });
    },
  });
}
