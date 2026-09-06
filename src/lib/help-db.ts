import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HelpCategory = { id: string; slug: string; name: string; description: string | null; position: number };

export type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category_id: string | null;
  body: string;
  cover_image_url: string | null;
  status: "draft" | "published";
  related_ids: string[];
  position: number;
  published_at: string | null;
  updated_at: string;
};

export type ReleaseNote = {
  id: string;
  title: string;
  label: string | null;
  body: string;
  highlight: boolean;
  status: "draft" | "published";
  released_on: string;
};

export type TicketStatus = "new" | "open" | "waiting" | "resolved";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting on author",
  resolved: "Resolved",
};

export type SupportTicket = { id: string; user_id: string; subject: string; status: TicketStatus; feature_request_id: string | null; created_at: string; updated_at: string };
export type SupportMessage = { id: string; ticket_id: string; sender_user_id: string; from_admin: boolean; body: string; attachment_path: string | null; created_at: string };

const ARTICLE_FIELDS = "id, slug, title, summary, category_id, body, cover_image_url, status, related_ids, position, published_at, updated_at";

export function useHelpCategories() {
  return useQuery({
    queryKey: ["help", "categories"],
    queryFn: async (): Promise<HelpCategory[]> => {
      const { data, error } = await supabase.from("help_categories").select("id, slug, name, description, position").order("position");
      if (error) throw error;
      return (data ?? []) as HelpCategory[];
    },
  });
}

/** Every article the signed-in reader may see. Admins also get drafts (RLS decides). */
export function useHelpArticles() {
  return useQuery({
    queryKey: ["help", "articles"],
    queryFn: async (): Promise<HelpArticle[]> => {
      const { data, error } = await supabase.from("help_articles").select(ARTICLE_FIELDS).order("position").order("title");
      if (error) throw error;
      return (data ?? []) as HelpArticle[];
    },
  });
}

export function useReleaseNotes() {
  return useQuery({
    queryKey: ["help", "releases"],
    queryFn: async (): Promise<ReleaseNote[]> => {
      const { data, error } = await supabase
        .from("release_notes")
        .select("id, title, label, body, highlight, status, released_on")
        .order("released_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReleaseNote[];
    },
  });
}

export function useSaveHelpCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; slug: string; name: string; description: string | null; position: number }) => {
      const { id, ...values } = input;
      const query = id ? supabase.from("help_categories").update(values).eq("id", id) : supabase.from("help_categories").insert(values);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useDeleteHelpCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("help_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useSaveHelpArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<HelpArticle> & { slug: string; title: string }) => {
      const { id, ...values } = input;
      const query = id ? supabase.from("help_articles").update(values).eq("id", id) : supabase.from("help_articles").insert(values);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useDeleteHelpArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("help_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useSaveReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ReleaseNote> & { title: string }) => {
      const { id, ...values } = input;
      const query = id ? supabase.from("release_notes").update(values).eq("id", id) : supabase.from("release_notes").insert(values);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useDeleteReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("release_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

/** Tickets the signed-in person may read: their own, or all of them for an admin. */
export function useSupportTickets() {
  return useQuery({
    queryKey: ["help", "tickets"],
    queryFn: async (): Promise<SupportTicket[]> => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("id, user_id, subject, status, feature_request_id, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });
}

export function useTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: ["help", "ticket-messages", ticketId],
    enabled: Boolean(ticketId),
    queryFn: async (): Promise<SupportMessage[]> => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("id, ticket_id, sender_user_id, from_admin, body, attachment_path, created_at")
        .eq("ticket_id", ticketId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as SupportMessage[];
    },
  });
}

export function useOpenTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; body: string; attachment_path?: string | null; featureRequestId?: string | null }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Sign in again to contact support.");
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({ user_id: userId, subject: input.subject, status: "new", feature_request_id: input.featureRequestId ?? null })
        .select("id")
        .single();
      if (error) throw error;
      const { error: messageError } = await supabase.from("support_messages").insert({
        ticket_id: data.id,
        sender_user_id: userId,
        from_admin: false,
        body: input.body,
        attachment_path: input.attachment_path ?? null,
      });
      if (messageError) throw messageError;
      return data.id;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { ticketId: string; body: string; fromAdmin: boolean; status?: TicketStatus; notifyUserId?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Sign in again to reply.");
      const { error } = await supabase.from("support_messages").insert({
        ticket_id: input.ticketId,
        sender_user_id: userId,
        from_admin: input.fromAdmin,
        body: input.body,
      });
      if (error) throw error;
      const status = input.status ?? (input.fromAdmin ? "waiting" : "open");
      await supabase.from("support_tickets").update({ status }).eq("id", input.ticketId);
      if (input.fromAdmin && input.notifyUserId) {
        await supabase.from("notifications").insert({
          user_id: input.notifyUserId,
          kind: "support",
          title: "Support replied to your message",
          body: input.body.slice(0, 160),
          link: "/help/support",
        });
      }
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

/** Point a support request at the idea that tracks it (admin or the ticket owner). */
export function useSetTicketFeatureRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { ticketId: string; featureRequestId: string | null }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ feature_request_id: input.featureRequestId })
        .eq("id", input.ticketId);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export function useSetTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { ticketId: string; status: TicketStatus }) => {
      const { error } = await supabase.from("support_tickets").update({ status: input.status }).eq("id", input.ticketId);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["help"] }),
  });
}

export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
