import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type WorkshopWelcome = Database["public"]["Tables"]["workshop_onboarding"]["Row"];
export type WorkshopTourStep = Database["public"]["Tables"]["workshop_tour_steps"]["Row"];
export type WorkshopOnboardingState = Database["public"]["Tables"]["workshop_onboarding_state"]["Row"];

export const onboardingQueryKey = ["workshop-onboarding"] as const;

export function useWorkshopOnboarding() {
  return useQuery({
    queryKey: onboardingQueryKey,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const [welcomeResult, stepsResult, stateResult] = await Promise.all([
        supabase.from("workshop_onboarding").select("*").maybeSingle(),
        supabase.from("workshop_tour_steps").select("*").eq("published", true).order("position"),
        supabase.from("workshop_onboarding_state").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (welcomeResult.error) throw welcomeResult.error;
      if (stepsResult.error) throw stepsResult.error;
      if (stateResult.error) throw stateResult.error;
      return {
        userId: user.id,
        welcome: welcomeResult.data as WorkshopWelcome | null,
        steps: (stepsResult.data ?? []) as WorkshopTourStep[],
        state: stateResult.data as WorkshopOnboardingState | null,
      };
    },
    staleTime: 60_000,
  });
}

export function useSaveWorkshopOnboardingState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<WorkshopOnboardingState, "user_id" | "updated_at">>) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Sign in again to save your preference");
      const { error } = await supabase.from("workshop_onboarding_state").upsert(
        { user_id: user.id, ...patch },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingQueryKey }),
  });
}

export async function uploadOnboardingMedia(file: File) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
  const path = `${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("onboarding-media").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function resolveOnboardingMedia(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path;
  const { signOnboardingMedia } = await import("@/lib/workshop-onboarding.functions");
  const { url } = await signOnboardingMedia({ data: { path } });
  return url;
}