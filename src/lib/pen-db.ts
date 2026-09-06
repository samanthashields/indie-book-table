import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type PenThread = {
  id: string;
  title: string;
  book_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PenMessageRow = {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function usePenThreads() {
  return useQuery({
    queryKey: ["pen", "threads"],
    queryFn: async (): Promise<PenThread[]> => {
      const { data, error } = await supabase
        .from("pen_threads")
        .select("id,title,book_id,created_at,updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PenThread[];
    },
  });
}

export function usePenMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: ["pen", "messages", threadId],
    enabled: Boolean(threadId),
    queryFn: async (): Promise<PenMessageRow[]> => {
      const { data, error } = await supabase
        .from("pen_messages")
        .select("id,thread_id,role,content,created_at")
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PenMessageRow[];
    },
  });
}

export function useCreatePenThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; bookId?: string | null }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Please sign in first.");
      const { data, error } = await supabase
        .from("pen_threads")
        .insert({
          user_id: userId,
          title: input.title?.trim() || "New conversation",
          book_id: input.bookId ?? null,
        })
        .select("id,title,book_id,created_at,updated_at")
        .single();
      if (error) throw error;
      return data as PenThread;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["pen", "threads"] }),
  });
}

export function useRenamePenThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; title: string }) => {
      const { error } = await supabase
        .from("pen_threads")
        .update({ title: input.title.trim() || "New conversation" })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["pen", "threads"] }),
  });
}

export function useDeletePenThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pen_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["pen", "threads"] }),
  });
}

/** Bearer token for the Pen streaming route (server functions can't stream). */
export async function penAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Names a thread from the author's first message. */
export function titleFromFirstMessage(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New conversation";
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}
