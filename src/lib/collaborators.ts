import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notifications";

export const collaboratorRoles = [
  "Co-author",
  "Developmental editor",
  "Copyeditor",
  "Proofreader",
  "Cover designer",
  "Formatter",
  "Illustrator",
  "Marketing help",
  "Beta or ARC reader",
  "Human coach",
] as const;

export type Collaborator = {
  id: string;
  book_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: string;
  status: string;
  invited_at: string;
  expires_at: string;
  accepted_at: string | null;
};

export function useCollaborators(bookId: string) {
  return useQuery({
    queryKey: ["collaborators", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("collaborators").select("*").eq("book_id", bookId).order("invited_at");
      if (error) throw error;
      return (data ?? []) as Collaborator[];
    },
  });
}

export function useInviteCollaborator(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; name: string; role: string }) => {
      const email = input.email.trim().toLowerCase();
      const { error } = await supabase.from("collaborators").insert({
        book_id: bookId,
        email,
        name: input.name.trim() || null,
        role: input.role,
        status: "invited",
      });
      if (error) throw error;
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("activity").insert({
        book_id: bookId,
        actor_user_id: userData.user?.id ?? null,
        text: `Invited ${email} as ${input.role.toLowerCase()}.`,
      });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["collaborators", bookId] }),
  });
}

export function useUpdateCollaborator(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { role?: string; status?: string } }) => {
      const { error } = await supabase.from("collaborators").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["collaborators", bookId] }),
  });
}

export function useRemoveCollaborator(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collaborators").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["collaborators", bookId] }),
  });
}

/** Accepts any open invitations that match the signed-in email address. */
export async function claimInvitations() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) return 0;
  const { data, error } = await supabase
    .from("collaborators")
    .update({ user_id: user.id, status: "active", accepted_at: new Date().toISOString() })
    .eq("email", user.email.toLowerCase())
    .eq("status", "invited")
    .select("id, book_id, role");
  if (error) return 0;
  const claimed = data ?? [];
  for (const row of claimed) {
    const { data: book } = await supabase.from("books").select("author_id, title").eq("id", row.book_id).maybeSingle();
    if (book?.author_id) {
      await notify({
        userId: book.author_id,
        bookId: row.book_id,
        kind: "collaborator-joined",
        title: `${user.email} joined ${book.title}`,
        body: `They accepted your invitation as ${String(row.role).toLowerCase()}.`,
      });
    }
  }
  return claimed.length;
}

