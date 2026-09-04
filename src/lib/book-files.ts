import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BOOK_BUCKET = "book-files";

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");

/** Uploads a file into the private book store and returns its storage path. */
export async function uploadBookFile(bookId: string, folder: string, file: File) {
  const path = `${bookId}/${folder}/${Date.now()}-${slug(file.name)}`;
  const { error } = await supabase.storage.from(BOOK_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function removeBookFile(path: string) {
  const { error } = await supabase.storage.from(BOOK_BUCKET).remove([path]);
  if (error) throw error;
}

export async function signBookFile(path: string, seconds = 60 * 60) {
  const { data, error } = await supabase.storage.from(BOOK_BUCKET).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}

/** Resolves a stored value that may be a public URL or a private storage path. */
export function useFileUrl(value: string | null | undefined) {
  return useQuery({
    queryKey: ["file-url", value],
    enabled: Boolean(value),
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!value) return null;
      if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
      return signBookFile(value);
    },
  });
}
