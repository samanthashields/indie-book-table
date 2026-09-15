import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ResourceKind = "file" | "link" | "manuscript_link";

export const RESOURCE_KINDS: ResourceKind[] = ["file", "link", "manuscript_link"];

export const resourceKindLabel: Record<ResourceKind, string> = {
  file: "File",
  link: "Link",
  manuscript_link: "Manuscript link",
};

export type Resource = {
  id: string;
  book_id: string;
  /** null = a book-level resource, not tied to any one milestone. */
  milestone_id: string | null;
  kind: ResourceKind;
  label: string;
  /** An external URL, or a private storage path (resolved via useFileUrl) for kind "file". */
  url: string | null;
  created_at: string;
};

/** Every resource for a book — milestone-scoped and book-level. Callers filter by milestone_id as needed. */
export function useResources(bookId: string) {
  return useQuery({
    queryKey: ["resources", bookId],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").eq("book_id", bookId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });
}

export function useAddResource(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { kind: ResourceKind; label: string; url?: string | null; milestoneId?: string | null }) => {
      const { error } = await supabase.from("resources").insert({
        book_id: bookId,
        milestone_id: input.milestoneId ?? null,
        kind: input.kind,
        label: input.label,
        url: input.url ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["resources", bookId] }),
  });
}

export function useDeleteResource(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["resources", bookId] }),
  });
}
