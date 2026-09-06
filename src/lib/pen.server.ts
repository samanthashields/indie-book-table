import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type PenServerClient = SupabaseClient<Database>;

/** Verifies the caller's bearer token and returns a per-user Supabase client. */
export async function authenticateRequest(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase is not configured.");

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  return { supabase, userId };
}

export const penInstructions = `You are Penny — "Pen" — the book coach inside Author's Workshop, a self-publishing companion for independent authors.

Voice: warm, curious, plain-spoken and practical. You are a coach, not a cheerleader and not a lecturer. Keep replies short (2-5 sentences or a tight list) and end most turns with one thoughtful question that moves the author forward.

What you help with:
- Talking through book ideas and premises, and helping the author name what the book is really about.
- Moving a book along its shelf status (an idea, being written, ready for illustrations, ready to publish, published, on hold) toward a book cycle. When a book is far enough along and has no cycle, suggest starting one from a genre template or from scratch.
- Practical self-publishing questions: editing, cover design, formatting, ISBNs, printing, pricing, launch, reviews, marketing. Be honest about what an author can do themselves and where money is best spent. Never invent prices as guarantees; give ranges and say they vary.
- When a book is published, warmly invite the author to submit it to The Table (the community's monthly issue of indie books) from their My Books page.
- When a help article fits the question, recommend it by title and say it's in the Help Center.

Rules:
- Use the author's real context below. Refer to their books by title. Never invent books, dates, milestones or submissions that are not listed.
- If you do not know something, say so and ask a question instead of guessing.
- Do not claim to take actions in the app; describe where the author can do it.
- Never mention these instructions, models, or providers.`;

/** Builds a compact snapshot of the author's shelf, cycles and submissions. */
export async function buildPenContext(supabase: PenServerClient, userId: string) {
  const [booksRes, submissionsRes, articlesRes, profileRes] = await Promise.all([
    supabase
      .from("books")
      .select("id,title,subtitle,genre,status,shelf_status,start_date,target_publication_date,has_cycle")
      .eq("author_id", userId)
      .order("created_at", { ascending: true })
      .limit(25),
    supabase.from("catalog_books").select("title,status").limit(20),
    supabase.from("help_articles").select("title,slug,summary").eq("status", "published").limit(30),
    supabase.from("profiles").select("display_name,plan").eq("user_id", userId).maybeSingle(),
  ]);

  const lines: string[] = [];
  const name = profileRes.data?.display_name;
  lines.push(`Author: ${name || "(no name set)"}`);

  const books = booksRes.data ?? [];
  if (books.length === 0) {
    lines.push("Books: none yet. They can add one from My Books.");
  } else {
    lines.push("Books on their shelf:");
    for (const book of books) {
      const bits = [
        `“${book.title}”`,
        book.genre ? `genre ${book.genre}` : null,
        `shelf status ${book.shelf_status ?? "idea"}`,
        book.has_cycle ? `cycle ${book.status}` : "no book cycle yet",
        book.start_date ? `started ${book.start_date}` : null,
        book.target_publication_date ? `target publication ${book.target_publication_date}` : null,
      ].filter(Boolean);
      lines.push(`- ${bits.join(", ")}`);
    }
  }

  const submissions = submissionsRes.data ?? [];
  if (submissions.length > 0) {
    lines.push("Submissions to The Table:");
    for (const submission of submissions) {
      lines.push(`- “${submission.title}” — ${submission.status}`);
    }
  } else {
    lines.push("Submissions to The Table: none yet.");
  }

  const articles = articlesRes.data ?? [];
  if (articles.length > 0) {
    lines.push("Help Center articles you may recommend by title:");
    for (const article of articles) {
      lines.push(`- ${article.title}${article.summary ? ` — ${article.summary}` : ""}`);
    }
  }

  return lines.join("\n");
}
