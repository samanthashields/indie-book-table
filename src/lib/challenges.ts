import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { syncChallenges, type ChallengeProgress } from "@/lib/challenges.functions";
import type { DecorationKey } from "@/lib/decorations";

export type ChallengeMetric = "cycles_completed" | "books_published" | "milestones_completed" | "books_featured";

export const CHALLENGE_METRIC_LABELS: Record<ChallengeMetric, string> = {
  cycles_completed: "book cycles finished",
  books_published: "books published",
  milestones_completed: "steps completed",
  books_featured: "books featured at The Table",
};

export const CHALLENGE_METRICS = Object.keys(CHALLENGE_METRIC_LABELS) as ChallengeMetric[];

export type ChallengeRow = {
  id: string;
  title: string;
  blurb: string | null;
  challenge_month: string;
  metric: ChallengeMetric;
  target: number;
  decoration_key: DecorationKey;
  active: boolean;
};

export type { ChallengeProgress };

export const monthLabel = (month: string) =>
  new Date(`${month}T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

export const isCurrentMonth = (month: string) => month.slice(0, 7) === currentMonthValue().slice(0, 7);

/** Live progress for every active challenge, recounted on the server. */
export function useChallengeProgress() {
  const sync = useServerFn(syncChallenges);
  return useQuery({
    queryKey: ["challenges", "progress"],
    queryFn: () => sync({ data: undefined }) as Promise<ChallengeProgress[]>,
    staleTime: 30_000,
  });
}

/** Every challenge, for the admin editor. */
export function useAllChallenges() {
  return useQuery({
    queryKey: ["challenges", "all"],
    queryFn: async (): Promise<ChallengeRow[]> => {
      const { data, error } = await supabase.from("challenges").select("*").order("challenge_month", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChallengeRow[];
    },
  });
}

export function useSaveChallenge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<ChallengeRow> & { title: string; challenge_month: string; metric: ChallengeMetric; target: number; decoration_key: DecorationKey }) => {
      const payload = {
        title: row.title,
        blurb: row.blurb ?? null,
        challenge_month: row.challenge_month,
        metric: row.metric,
        target: row.target,
        decoration_key: row.decoration_key,
        active: row.active ?? true,
      };
      if (row.id) {
        const { error } = await supabase.from("challenges").update(payload).eq("id", row.id);
        if (error) throw error;
        return row.id;
      }
      const { data, error } = await supabase.from("challenges").insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

export function useDeleteChallenge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}
