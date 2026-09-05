import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type {
  CatalogBook,
  CatalogIssue,
  IssueSummary,
  JournalPost,
  JournalPostSummary,
} from "./catalog-types";

/** Publishable-key client for public catalog reads; RLS applies as `anon`. */
export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type SelectionRow = {
  category: string;
  is_spotlight: boolean;
  spotlight_blurb: string | null;
  order_index: number;
  catalog_books: {
    id: string;
    title: string;
    pen_name: string | null;
    hook: string | null;
    genre: string | null;
    target_audience: string;
    ebook_price: number | null;
    print_price: number | null;
    cover_image_url: string | null;
    times_featured_count: number;
    awards_reviews_text: string | null;
    explicit_content: boolean;
    editors: string | null;
    illustrators: string | null;
    cover_designer: string | null;
    tags: string[];
    catalog_authors: { id: string; name: string } | null;
    catalog_purchase_links: { id: string; platform_label: string; url: string }[] | null;
  } | null;
};

const BOOK_SELECT = `
  id, title, pen_name, hook, genre, target_audience, ebook_price, print_price,
  cover_image_url, times_featured_count, awards_reviews_text, explicit_content,
  editors, illustrators, cover_designer, tags,
  catalog_authors!inner ( id, name ),
  catalog_purchase_links ( id, platform_label, url )
`;

function toBook(
  row: NonNullable<SelectionRow["catalog_books"]>,
  extra: { is_spotlight: boolean; spotlight_blurb: string | null },
): CatalogBook {
  return {
    id: row.id,
    title: row.title,
    pen_name: row.pen_name,
    author_id: row.catalog_authors?.id ?? "",
    author_name: row.pen_name ?? row.catalog_authors?.name ?? "Unknown author",
    hook: row.hook,
    genre: row.genre,
    target_audience: row.target_audience,
    ebook_price: row.ebook_price,
    print_price: row.print_price,
    cover_image_url: row.cover_image_url,
    times_featured_count: row.times_featured_count,
    awards_reviews_text: row.awards_reviews_text,
    explicit_content: row.explicit_content,
    editors: row.editors,
    illustrators: row.illustrators,
    cover_designer: row.cover_designer,
    is_spotlight: extra.is_spotlight,
    spotlight_blurb: extra.spotlight_blurb,
    tags: row.tags ?? [],
    purchase_links: row.catalog_purchase_links ?? [],
  };
}

/** Loads one published issue (the newest when no id is given) with its grouped books. */
export async function loadIssueCatalog(issueId?: string): Promise<CatalogIssue> {
  const supabase = createPublicClient();

  let query = supabase
    .from("catalog_issues")
    .select("id, display_label, issue_month, catalog_issue_themes ( cover_headline, cover_tagline, cover_image_url )")
    .eq("status", "published");

  query = issueId
    ? query.eq("id", issueId)
    : query.order("issue_month", { ascending: false }).limit(1);

  const { data: issue, error: issueError } = await query.maybeSingle();
  if (issueError) throw new Error(issueError.message);
  if (!issue) return { issue: null, categories: [] };

  const theme = Array.isArray(issue.catalog_issue_themes)
    ? issue.catalog_issue_themes[0]
    : issue.catalog_issue_themes;

  const { data: selections, error } = await supabase
    .from("catalog_issue_selections")
    .select(
      `category, is_spotlight, spotlight_blurb, order_index, catalog_books!inner ( ${BOOK_SELECT} )`,
    )
    .eq("issue_id", issue.id)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);

  const grouped = new Map<string, CatalogBook[]>();
  for (const selection of (selections ?? []) as unknown as SelectionRow[]) {
    if (!selection.catalog_books) continue;
    const list = grouped.get(selection.category) ?? [];
    list.push(
      toBook(selection.catalog_books, {
        is_spotlight: selection.is_spotlight,
        spotlight_blurb: selection.spotlight_blurb,
      }),
    );
    grouped.set(selection.category, list);
  }

  return {
    issue: {
      id: issue.id,
      display_label: issue.display_label,
      issue_month: issue.issue_month,
      cover_headline: theme?.cover_headline ?? null,
      cover_tagline: theme?.cover_tagline ?? null,
      cover_image_url: theme?.cover_image_url ?? null,
    },
    categories: [...grouped.entries()].map(([category, books]) => ({ category, books })),
  };
}

export async function loadPublishedIssues(): Promise<IssueSummary[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_issues")
    .select("id, display_label, issue_month, published_at, catalog_issue_selections ( id )")
    .eq("status", "published")
    .order("issue_month", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((issue) => ({
    id: issue.id,
    display_label: issue.display_label,
    issue_month: issue.issue_month,
    published_at: issue.published_at,
    book_count: issue.catalog_issue_selections?.length ?? 0,
  }));
}

export async function loadCatalogBook(bookId: string): Promise<CatalogBook | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_books")
    .select(BOOK_SELECT)
    .eq("id", bookId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return toBook(data as unknown as NonNullable<SelectionRow["catalog_books"]>, {
    is_spotlight: false,
    spotlight_blurb: null,
  });
}

export async function loadAuthorShelf(authorId: string) {
  const supabase = createPublicClient();
  const { data: author, error: authorError } = await supabase
    .from("catalog_authors")
    .select("id, name, instagram_handle, website, bio")
    .eq("id", authorId)
    .maybeSingle();
  if (authorError) throw new Error(authorError.message);
  if (!author) return null;

  const { data: books, error } = await supabase
    .from("catalog_books")
    .select(BOOK_SELECT)
    .eq("catalog_author_id", authorId);
  if (error) throw new Error(error.message);

  return {
    author,
    books: (books ?? []).map((row) =>
      toBook(row as unknown as NonNullable<SelectionRow["catalog_books"]>, {
        is_spotlight: false,
        spotlight_blurb: null,
      }),
    ),
  };
}

export async function loadPublishedPosts(): Promise<JournalPostSummary[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadPublishedPost(slug: string): Promise<JournalPost | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at, body")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function loadSiteCopy(): Promise<Record<string, string>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("catalog_site_content").select("key, value");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}

export async function upsertSubscriber(input: {
  email: string;
  catalog: boolean;
  blog: boolean;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = input.email.trim().toLowerCase();
  const { error } = await supabaseAdmin
    .from("catalog_subscribers")
    .upsert(
      { email, catalog_opt_in: input.catalog, blog_opt_in: input.blog },
      { onConflict: "email" },
    );
  if (error) throw new Error(error.message);
}
