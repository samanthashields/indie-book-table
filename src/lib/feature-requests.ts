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

export type FeaturePriority = "nice_to_have" | "would_help" | "blocking";

export const FEATURE_PRIORITY_LABELS: Record<FeaturePriority, string> = {
  nice_to_have: "Nice to have",
  would_help: "Would really help",
  blocking: "Blocking my work",
};

export const FEATURE_PRIORITY_ORDER: FeaturePriority[] = ["nice_to_have", "would_help", "blocking"];

/** What an author can expect to happen next, per stage. */
export const FEATURE_NEXT_STEPS: Record<FeatureRequestStatus, string> = {
  waiting: "We read every idea and post a first reply here once it has been reviewed.",
  considering: "We're weighing this up against everything else authors have asked for. Votes help.",
  planned: "It's on the build list. We'll post here again the moment work starts.",
  in_progress: "Being built now. The next update here will be the release note.",
  shipped: "This one is live. If it doesn't work the way you hoped, send us a support message.",
  not_planned: "We're not taking this one forward for now. The note above explains why.",
};

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
  priority: FeaturePriority;
  links: string[];
  attachments: FeatureAttachment[];
  status: FeatureRequestStatus;
  public_note: string | null;
  approved: boolean;
  vote_count: number;
  merged_into: string | null;
  created_at: string;
  updated_at: string;
};

export type FeatureAttachment = { path: string; name: string };

export type FeatureRequestUpdate = {
  id: string;
  request_id: string;
  author_user_id: string | null;
  status: FeatureRequestStatus;
  body: string | null;
  created_at: string;
};

export type FeatureRequestDraft = {
  title: string;
  body: string;
  area: string | null;
  priority: FeaturePriority;
  links: string[];
  attachments: FeatureAttachment[];
};

const FIELDS =
  "id, submitted_by, title, body, area, priority, links, attachments, status, public_note, approved, vote_count, merged_into, created_at, updated_at";

const ATTACHMENT_BUCKET = "feature-request-files";

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
    mutationFn: async (input: FeatureRequestDraft) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in first");
      const { data, error } = await supabase
        .from("feature_requests")
        .insert({
          submitted_by: auth.user.id,
          title: input.title,
          body: input.body,
          area: input.area,
          priority: input.priority,
          links: input.links,
          attachments: input.attachments,
        })
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
    mutationFn: async (input: FeatureRequestDraft & { id: string }) => {
      const { error } = await supabase
        .from("feature_requests")
        .update({
          title: input.title,
          body: input.body,
          area: input.area,
          priority: input.priority,
          links: input.links,
          attachments: input.attachments,
        })
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

/** The public history of an idea: submitted, then every reply we posted. */
export function useFeatureRequestUpdates(requestId: string) {
  return useQuery({
    queryKey: ["feature-request-updates", requestId],
    queryFn: async (): Promise<FeatureRequestUpdate[]> => {
      const { data, error } = await supabase
        .from("feature_request_updates")
        .select("id, request_id, author_user_id, status, body, created_at")
        .eq("request_id", requestId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as FeatureRequestUpdate[];
    },
  });
}

export const MAX_FEATURE_ATTACHMENTS = 5;

/** Uploads a screenshot into the signed-in author's own folder. */
export async function uploadFeatureAttachment(file: File): Promise<FeatureAttachment> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sign in first");
  if (!file.type.startsWith("image/")) throw new Error("Only images can be attached");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${auth.user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return { path, name: file.name };
}

/** Short-lived preview links for a set of attachments. */
export function useFeatureAttachmentUrls(attachments: FeatureAttachment[]) {
  const key = attachments.map((item) => item.path).join(",");
  return useQuery({
    queryKey: ["feature-attachment-urls", key],
    enabled: attachments.length > 0,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .createSignedUrls(attachments.map((item) => item.path), 60 * 30);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        if (row.path && row.signedUrl) map[row.path] = row.signedUrl;
      });
      return map;
    },
  });
}
