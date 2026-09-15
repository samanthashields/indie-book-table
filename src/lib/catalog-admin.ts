import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StoredFlyerBlock } from "./catalog-types";

export type AdminSubmission = {
  id: string;
  title: string;
  pen_name: string | null;
  genre: string | null;
  target_audience: string;
  hook: string | null;
  explicit_content: boolean;
  cover_image_url: string | null;
  tags: string[];
  status: string;
  removal_reason: string | null;
  times_featured_count: number;
  submitted_at: string;
  catalog_authors: { id: string; name: string; email: string } | null;
};

export type AdminIssue = {
  id: string;
  display_label: string;
  issue_month: string;
  status: string;
  published_at: string | null;
};

export type AdminSelection = {
  id: string;
  category: string;
  is_spotlight: boolean;
  spotlight_blurb: string | null;
  order_index: number;
  catalog_book_id: string;
  catalog_books: { id: string; title: string; cover_image_url: string | null; catalog_authors: { name: string } | null } | null;
};

export type AdminQuota = { id: string; category: string; quota: number };

export function useAdminSubmissions() {
  return useQuery({
    queryKey: ["catalog-admin", "submissions"],
    queryFn: async (): Promise<AdminSubmission[]> => {
      const { data, error } = await supabase
        .from("catalog_books")
        .select(
          "id, title, pen_name, genre, target_audience, hook, explicit_content, cover_image_url, tags, status, removal_reason, times_featured_count, submitted_at, catalog_authors ( id, name )",
        )
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as AdminSubmission[];
      // Email is column-restricted; admins read it through the guarded function.
      const authorIds = [...new Set(rows.map((row) => row.catalog_authors?.id).filter((id): id is string => Boolean(id)))];
      const emails = new Map<string, string>();
      await Promise.all(
        authorIds.map(async (authorId) => {
          const { data: email } = await supabase.rpc("catalog_author_email", { _author_id: authorId });
          if (email) emails.set(authorId, email);
        }),
      );
      return rows.map((row) =>
        row.catalog_authors
          ? { ...row, catalog_authors: { ...row.catalog_authors, email: emails.get(row.catalog_authors.id) ?? "" } }
          : row,
      );
    },
  });
}

export async function setSubmissionStatus(bookId: string, status: string, removalReason?: string | null) {
  const { error } = await supabase
    .from("catalog_books")
    .update({ status: status as never, removal_reason: removalReason ?? null })
    .eq("id", bookId);
  if (error) throw error;
}

export function useAdminIssues() {
  return useQuery({
    queryKey: ["catalog-admin", "issues"],
    queryFn: async (): Promise<AdminIssue[]> => {
      const { data, error } = await supabase
        .from("catalog_issues")
        .select("id, display_label, issue_month, status, published_at")
        .order("issue_month", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminIssue[];
    },
  });
}

export function useIssueDetail(issueId: string | undefined) {
  return useQuery({
    queryKey: ["catalog-admin", "issue", issueId],
    enabled: Boolean(issueId),
    queryFn: async () => {
      const [selections, quotas, theme] = await Promise.all([
        supabase
          .from("catalog_issue_selections")
          .select(
            "id, category, is_spotlight, spotlight_blurb, order_index, catalog_book_id, catalog_books ( id, title, cover_image_url, catalog_authors ( name ) )",
          )
          .eq("issue_id", issueId!)
          .order("order_index", { ascending: true }),
        supabase.from("catalog_issue_quotas").select("id, category, quota").eq("issue_id", issueId!),
        supabase
          .from("catalog_issue_themes")
          .select("cover_headline, cover_tagline, cover_image_url, preset, border_pattern")
          .eq("issue_id", issueId!)
          .maybeSingle(),
      ]);
      if (selections.error) throw selections.error;
      if (quotas.error) throw quotas.error;
      if (theme.error) throw theme.error;
      return {
        selections: (selections.data ?? []) as unknown as AdminSelection[],
        quotas: (quotas.data ?? []) as AdminQuota[],
        theme: theme.data,
      };
    },
  });
}

export async function createIssue(input: { issue_month: string; display_label: string }) {
  const { data, error } = await supabase
    .from("catalog_issues")
    .insert({ issue_month: input.issue_month, display_label: input.display_label, status: "draft" as const })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function setIssueStatus(issueId: string, status: "draft" | "published") {
  const { error } = await supabase
    .from("catalog_issues")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", issueId);
  if (error) throw error;
}

export async function saveIssueTheme(
  issueId: string,
  values: { cover_headline: string | null; cover_tagline: string | null },
) {
  const { error } = await supabase
    .from("catalog_issue_themes")
    .upsert({ issue_id: issueId, ...values }, { onConflict: "issue_id" });
  if (error) throw error;
}

export async function saveQuota(issueId: string, category: string, quota: number) {
  const { error } = await supabase
    .from("catalog_issue_quotas")
    .upsert({ issue_id: issueId, category, quota }, { onConflict: "issue_id,category" });
  if (error) throw error;
}

export async function addSelection(issueId: string, bookId: string, category: string, orderIndex: number) {
  const { error } = await supabase.from("catalog_issue_selections").insert({
    issue_id: issueId,
    catalog_book_id: bookId,
    category,
    order_index: orderIndex,
  });
  if (error) throw error;
}

export async function updateSelection(
  selectionId: string,
  patch: { category?: string; is_spotlight?: boolean; spotlight_blurb?: string | null; order_index?: number },
) {
  const { error } = await supabase.from("catalog_issue_selections").update(patch).eq("id", selectionId);
  if (error) throw error;
}

export async function removeSelection(selectionId: string) {
  const { error } = await supabase.from("catalog_issue_selections").delete().eq("id", selectionId);
  if (error) throw error;
}

export function useSiteCopy() {
  return useQuery({
    queryKey: ["catalog-admin", "site-copy"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_site_content").select("key, value").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function saveSiteCopy(key: string, value: string) {
  const { error } = await supabase.from("catalog_site_content").upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

/** Saved flyer layout blocks for one issue (the admin block builder). */
export function useIssueBlocks(issueId: string | undefined) {
  return useQuery({
    queryKey: ["catalog-admin", "issue-blocks", issueId],
    enabled: Boolean(issueId),
    queryFn: async (): Promise<StoredFlyerBlock[]> => {
      const { data, error } = await supabase
        .from("catalog_issue_blocks")
        .select("id, kind, position, config")
        .eq("issue_id", issueId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as StoredFlyerBlock[];
    },
  });
}

/** Replaces an issue's layout with the given ordered blocks. */
export async function saveIssueBlocks(issueId: string, blocks: StoredFlyerBlock[]) {
  const { error: clearError } = await supabase
    .from("catalog_issue_blocks")
    .delete()
    .eq("issue_id", issueId);
  if (clearError) throw clearError;
  if (blocks.length === 0) return;
  const { error } = await supabase.from("catalog_issue_blocks").insert(
    blocks.map((block, index) => ({
      issue_id: issueId,
      kind: block.kind,
      position: index,
      config: block.config as never,
    })),
  );
  if (error) throw error;
}
