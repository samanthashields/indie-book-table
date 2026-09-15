import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SubmissionValues } from "@/lib/submission-schema";

export type CatalogAuthorRow = {
  id: string;
  name: string;
  email: string;
  instagram_handle: string | null;
  website: string | null;
  bio: string | null;
};

export type SubmissionRow = {
  id: string;
  title: string;
  pen_name: string | null;
  genre: string | null;
  target_audience: string;
  hook: string | null;
  explicit_content: boolean;
  editors: string | null;
  illustrators: string | null;
  cover_designer: string | null;
  ai_writing_contribution: string;
  ai_art_contribution: string;
  ebook_price: number | null;
  print_price: number | null;
  cover_image_url: string | null;
  awards_reviews_text: string | null;
  tags: string[];
  status: string;
  removal_reason: string | null;
  book_cycle_id: string | null;
  submitted_at: string;
  catalog_purchase_links: { id: string; platform_label: string; url: string }[];
  catalog_issue_selections: {
    id: string;
    category: string;
    is_spotlight: boolean;
    catalog_issues: { id: string; display_label: string; status: string } | null;
  }[];
};

const SUBMISSION_SELECT = `
  id, title, pen_name, genre, target_audience, hook, explicit_content, editors, illustrators,
  cover_designer, ai_writing_contribution, ai_art_contribution, ebook_price, print_price,
  cover_image_url, awards_reviews_text, tags, status, removal_reason, book_cycle_id, submitted_at,
  catalog_purchase_links ( id, platform_label, url ),
  catalog_issue_selections ( id, category, is_spotlight, catalog_issues ( id, display_label, status ) )
`;

export function useMyCatalogAuthor() {
  return useQuery({
    queryKey: ["catalog", "my-author"],
    queryFn: async (): Promise<CatalogAuthorRow | null> => {
      const { data, error } = await supabase
        .from("catalog_authors")
        .select("id, name, instagram_handle, website, bio")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      // Email is column-restricted; owners/admins read it through the guarded function.
      const { data: email } = await supabase.rpc("catalog_author_email", { _author_id: data.id });
      return { ...data, email: email ?? "" };
    },
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ["catalog", "my-submissions"],
    queryFn: async (): Promise<SubmissionRow[]> => {
      const { data, error } = await supabase
        .from("catalog_books")
        .select(SUBMISSION_SELECT)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SubmissionRow[];
    },
  });
}

export function useSubmission(bookId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "submission", bookId],
    enabled: Boolean(bookId),
    queryFn: async (): Promise<SubmissionRow | null> => {
      const { data, error } = await supabase
        .from("catalog_books")
        .select(SUBMISSION_SELECT)
        .eq("id", bookId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as SubmissionRow | null;
    },
  });
}

const price = (value: string) => (value.trim() ? Number(value) : null);
const orNull = (value: string) => (value.trim() ? value.trim() : null);

/** Creates or updates the author's public catalog profile and returns its id. */
export async function ensureCatalogAuthor(userId: string, values: SubmissionValues) {
  const patch = {
    name: values.author_name.trim(),
    email: values.author_email.trim(),
    instagram_handle: orNull(values.instagram_handle),
    website: orNull(values.website),
    bio: orNull(values.bio),
  };

  const { data: existing } = await supabase.from("catalog_authors").select("id").maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from("catalog_authors").update(patch).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("catalog_authors")
    .insert({ ...patch, user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

function bookPayload(values: SubmissionValues) {
  return {
    title: values.title.trim(),
    pen_name: orNull(values.pen_name),
    genre: orNull(values.genre),
    target_audience: values.target_audience,
    hook: values.hook.trim(),
    explicit_content: values.explicit_content,
    editors: orNull(values.editors),
    illustrators: orNull(values.illustrators),
    cover_designer: orNull(values.cover_designer),
    ai_writing_contribution: values.ai_writing_contribution,
    ai_art_contribution: values.ai_art_contribution,
    ebook_price: price(values.ebook_price ?? ""),
    print_price: price(values.print_price ?? ""),
    cover_image_url: values.cover_image_url,
    awards_reviews_text: orNull(values.awards_reviews_text),
    tags: values.tags,
  };
}

async function replaceLinks(bookId: string, values: SubmissionValues) {
  await supabase.from("catalog_purchase_links").delete().eq("catalog_book_id", bookId);
  if (values.purchase_links.length === 0) return;
  const { error } = await supabase.from("catalog_purchase_links").insert(
    values.purchase_links.map((link) => ({
      catalog_book_id: bookId,
      platform_label: link.platform_label.trim(),
      url: link.url.trim(),
    })),
  );
  if (error) throw error;
}

export async function submitCatalogBook(
  userId: string,
  values: SubmissionValues,
  options: { bookCycleId?: string | null } = {},
) {
  const authorId = await ensureCatalogAuthor(userId, values);
  const { data, error } = await supabase
    .from("catalog_books")
    .insert({
      ...bookPayload(values),
      catalog_author_id: authorId,
      book_cycle_id: options.bookCycleId ?? null,
      status: "submitted" as const,
    })
    .select("id")
    .single();
  if (error) throw error;
  await replaceLinks(data.id, values);
  return data.id;
}

export async function updateCatalogSubmission(
  userId: string,
  bookId: string,
  values: SubmissionValues,
) {
  await ensureCatalogAuthor(userId, values);
  const { error } = await supabase.from("catalog_books").update(bookPayload(values)).eq("id", bookId);
  if (error) throw error;
  await replaceLinks(bookId, values);
  return bookId;
}
