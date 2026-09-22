import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SHARE_BUCKET = "table-shares";

export type TableShare = { slug: string; authorName: string | null; bookCount: number; updatedAt: string };

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "author";

const decodeDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** Stores the author's table picture and returns the public link for it. */
export const saveTableShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { image: string; authorName: string; bookCount: number }) => {
    if (!input.image.startsWith("data:image/png;base64,")) throw new Error("Expected a PNG picture");
    return input;
  })
  .handler(async ({ data, context }): Promise<TableShare> => {
    const { supabase, userId } = context;
    const path = `${userId}/table.png`;
    const bytes = decodeDataUrl(data.image);

    const { error: uploadError } = await supabase.storage
      .from(SHARE_BUCKET)
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const { data: existing } = await supabase.from("table_shares").select("slug").eq("user_id", userId).maybeSingle();
    const slug = existing?.slug ?? `${slugify(data.authorName)}-${userId.slice(0, 6)}`;

    const { error } = await supabase
      .from("table_shares")
      .upsert(
        { user_id: userId, slug, image_path: path, author_name: data.authorName, book_count: data.bookCount },
        { onConflict: "user_id" },
      );
    if (error) throw error;

    return { slug, authorName: data.authorName, bookCount: data.bookCount, updatedAt: new Date().toISOString() };
  });

export const removeTableShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.storage.from(SHARE_BUCKET).remove([`${userId}/table.png`]);
    const { error } = await supabase.from("table_shares").delete().eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

/** Public lookup used by the shared page; reads one row by slug through the private channel. */
export const getTableShare = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 64) }))
  .handler(async ({ data }): Promise<TableShare | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("table_shares")
      .select("slug, author_name, book_count, updated_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return null;
    return { slug: row.slug, authorName: row.author_name, bookCount: row.book_count, updatedAt: row.updated_at };
  });
