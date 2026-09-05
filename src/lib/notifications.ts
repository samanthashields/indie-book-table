import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  book_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export async function notify(input: { userId: string; bookId?: string | null; kind: string; title: string; body?: string; link?: string }) {
  await supabase.from("notifications").insert({
    user_id: input.userId,
    book_id: input.bookId ?? null,
    kind: input.kind,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
