import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const COVER_BUCKET = "catalog-covers";

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");

export async function uploadCatalogCover(userId: string, file: File) {
  const path = `${userId}/${Date.now()}-${slug(file.name)}`;
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function signCatalogCover(path: string, seconds = 60 * 60) {
  const { data, error } = await supabase.storage.from(COVER_BUCKET).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}

/** Resolves a stored cover value that may be a full URL or a private storage path. */
export function useCatalogCoverUrl(value: string | null | undefined) {
  return useQuery({
    queryKey: ["catalog-cover", value],
    enabled: Boolean(value),
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!value) return null;
      if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
      return signCatalogCover(value);
    },
  });
}
