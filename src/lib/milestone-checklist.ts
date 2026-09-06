import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { PenReference } from "@/components/pen/pen-references";

export type ChecklistItem = {
  id: string;
  milestone_id: string;
  book_id: string;
  label: string;
  done: boolean;
  position: number;
  ref_kind: string | null;
  ref_book_id: string | null;
  ref_milestone_id: string | null;
  ref_slug: string | null;
  ref_label: string | null;
};

const FIELDS =
  "id, milestone_id, book_id, label, done, position, ref_kind, ref_book_id, ref_milestone_id, ref_slug, ref_label";

/** Turns a stored row's reference columns back into a linkable reference. */
export function itemReference(item: ChecklistItem): PenReference | null {
  const label = item.ref_label?.trim();
  if (!label) return null;
  if (item.ref_kind === "milestone" && item.ref_book_id && item.ref_milestone_id) {
    return { kind: "milestone", bookId: item.ref_book_id, milestoneId: item.ref_milestone_id, label };
  }
  if (item.ref_kind === "book" && item.ref_book_id) {
    return { kind: "book", bookId: item.ref_book_id, label };
  }
  if (item.ref_kind === "article" && item.ref_slug) {
    return { kind: "article", slug: item.ref_slug, label };
  }
  return null;
}

function referenceColumns(reference: PenReference | null | undefined) {
  if (!reference) return { ref_kind: null, ref_book_id: null, ref_milestone_id: null, ref_slug: null, ref_label: null };
  return {
    ref_kind: reference.kind,
    ref_book_id: reference.kind === "article" ? null : reference.bookId,
    ref_milestone_id: reference.kind === "milestone" ? reference.milestoneId : null,
    ref_slug: reference.kind === "article" ? reference.slug : null,
    ref_label: reference.label,
  };
}

export function useMilestoneChecklist(milestoneId: string | undefined) {
  return useQuery({
    queryKey: ["milestone-checklist", milestoneId],
    enabled: Boolean(milestoneId),
    queryFn: async (): Promise<ChecklistItem[]> => {
      const { data, error } = await supabase
        .from("milestone_checklist_items")
        .select(FIELDS)
        .eq("milestone_id", milestoneId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChecklistItem[];
    },
  });
}

export type NewChecklistItem = { label: string; reference?: PenReference | null };

/** Appends one or many items to a milestone's checklist. */
export function useAddChecklistItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { milestoneId: string; bookId: string; items: NewChecklistItem[] }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;

      const { data: existing } = await supabase
        .from("milestone_checklist_items")
        .select("position")
        .eq("milestone_id", input.milestoneId)
        .order("position", { ascending: false })
        .limit(1);
      const start = (existing?.[0]?.position ?? -1) + 1;

      const rows = input.items
        .filter((item) => item.label.trim())
        .map((item, index) => ({
          milestone_id: input.milestoneId,
          book_id: input.bookId,
          label: item.label.trim(),
          position: start + index,
          created_by: userId,
          ...referenceColumns(item.reference ?? null),
        }));
      if (rows.length === 0) return 0;
      const { error } = await supabase.from("milestone_checklist_items").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: ["milestone-checklist", input.milestoneId] });
    },
  });
}

export function useUpdateChecklistItem(milestoneId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; label?: string; done?: boolean; position?: number }) => {
      const patch: { label?: string; done?: boolean; position?: number } = {};
      if (input.label !== undefined) patch.label = input.label.trim();
      if (input.done !== undefined) patch.done = input.done;
      if (input.position !== undefined) patch.position = input.position;
      const { error } = await supabase.from("milestone_checklist_items").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["milestone-checklist", milestoneId] }),
  });
}

export function useDeleteChecklistItem(milestoneId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milestone_checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["milestone-checklist", milestoneId] }),
  });
}

/** Writes a whole new order after a drag. */
export function useReorderChecklist(milestoneId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id, index) =>
          supabase.from("milestone_checklist_items").update({ position: index }).eq("id", id),
        ),
      );
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["milestone-checklist", milestoneId] }),
  });
}
