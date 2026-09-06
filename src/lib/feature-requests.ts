import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FeatureRequestStatus =
  | "waiting"
  | "considering"
  | "planned"
  | "in_progress"
  | "shipped"
  | "not_planned";

export const FEATURE_STATUS_LABELS: Record<FeatureRequestStatus, string> = {
  waiting: "Waiting for review",
  considering: "Under consideration",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  not_planned: "Not planned",
};

export const FEATURE_STATUS_ORDER: FeatureRequestStatus[] = [
  "waiting",
  "considering",
  "planned",
  "in_progress",
  "shipped",
  "not_planned",
];

export const FEATURE_AREAS = [
  "Book cycles",
  "Milestones",
  "Templates",
  "Collaboration",
  "The Table",
  "Pen (AI coach)",
  "Help Center",
  "Something else",
];

export type FeatureRequest = {
  id: string;
  submitted_by: string;
  title: string;
  body: string;
  area: string | null;
  status: FeatureRequestStatus;
  public_note: string | null;
  approved: boolean;
  vote_count: number;
  merged_into: string | null;
  created_at: string;
  updated_at: string;
};

const FIELDS =
  "id, submitted_by, title, body, area, status, public_note, approved, vote_count, merged_into, created_at, updated_at";

/** Everything the signed-in reader may see: approved requests plus their own. */
export function useFeatureRequests() {
  return useQuery({
    queryKey: ["feature-requests"],
    queryFn: async (): Promise<FeatureRequest[]> => {
      const { data, error } = await supabase
        .from("feature_requests")
        .select(FIELDS)
        .order("vote_count", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FeatureRequest[];
    },
  });
}

export function useFeatureRequest(id: string) {
  return useQuery({
    queryKey: ["feature-requests", id],
    queryFn: async (): Promise<FeatureRequest | null> => {
      const { data, error } = await supabase.from("feature_requests").select(FIELDS).eq("id", id).maybeSingle();
      if (error) throw error;
      return (data ?? null) as FeatureRequest | null;
    },
  });
}

/** Ids of the requests the signed-in author has already voted for. */
export function useMyFeatureVotes() {
  return useQuery({
    queryKey: ["feature-request-votes"],
    queryFn: async (): Promise<string[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data, error } = await supabase.from("feature_request_votes").select("request_id").eq("user_id", auth.user.id);
      if (error) throw error;
      return (data ?? []).map((row) => row.request_id);
    },
  });
}

export function useSubmitFeatureRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string; area: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in first");
      const { data, error } = await supabase
        .from("feature_requests")
        .insert({ submitted_by: auth.user.id, title: input.title, body: input.body, area: input.area })
        .select(FIELDS)
        .single();
      if (error) throw error;
      return data as FeatureRequest;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["feature-requests"] }),
  });
}

export function useUpdateMyFeatureRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title: string; body: string; area: string | null }) => {
      const { error } = await supabase
        .from("feature_requests")
        .update({ title: input.title, body: input.body, area: input.area })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["feature-requests"] }),
  });
}

export function useWithdrawFeatureRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feature_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["feature-requests"] }),
  });
}

export function useToggleFeatureVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { requestId: string; voted: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in first");
      if (input.voted) {
        const { error } = await supabase
          .from("feature_request_votes")
          .delete()
          .eq("request_id", input.requestId)
          .eq("user_id", auth.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("feature_request_votes")
          .insert({ request_id: input.requestId, user_id: auth.user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["feature-request-votes"] });
    },
  });
}

export function useFeatureEmailPreference() {
  return useQuery({
    queryKey: ["feature-email-preference"],
    queryFn: async (): Promise<boolean> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data } = await supabase
        .from("profiles")
        .select("feature_email_opt_out")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      return !(data?.feature_email_opt_out ?? false);
    },
  });
}

export function useSetFeatureEmailPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wantsEmail: boolean) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ feature_email_opt_out: !wantsEmail })
        .eq("user_id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["feature-email-preference"] }),
  });
}
