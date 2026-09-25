import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type SeedFlag = "setupTasksSeeded" | "postLaunchTasksSeeded";

/** Whether this checklist was already created for the book, so removing every task doesn't bring the defaults back. */
export async function readSeedState(bookId: string, flag: SeedFlag) {
  const { data } = await supabase.from("books").select("template_id, metadata").eq("id", bookId).maybeSingle();
  const meta = (data?.metadata ?? {}) as Record<string, Json>;
  return { seeded: meta[flag] === true, templateId: data?.template_id ?? null, meta };
}

export async function markSeeded(bookId: string, flag: SeedFlag) {
  const { meta } = await readSeedState(bookId, flag);
  if (meta[flag] === true) return;
  await supabase.from("books").update({ metadata: { ...meta, [flag]: true } }).eq("id", bookId);
}
