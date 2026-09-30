import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Admin-only bucket for an issue's alternative "just a PDF" flyer. */
export const ISSUE_PDF_BUCKET = "catalog-issue-pdfs";

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");

export async function uploadIssuePdf(issueId: string, file: File) {
  const path = `${issueId}/${Date.now()}-${slug(file.name)}`;
  const { error } = await supabase.storage.from(ISSUE_PDF_BUCKET).upload(path, file, { upsert: false, contentType: "application/pdf" });
  if (error) throw error;
  return path;
}

export async function removeIssuePdf(path: string) {
  const { error } = await supabase.storage.from(ISSUE_PDF_BUCKET).remove([path]);
  if (error) throw error;
}

export async function signIssuePdf(path: string, seconds = 60 * 60) {
  const { data, error } = await supabase.storage.from(ISSUE_PDF_BUCKET).createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl;
}

/** Resolves a stored PDF path for the admin preview. Only admins can sign it (RLS-gated). */
export function useSignedIssuePdf(value: string | null | undefined) {
  return useQuery({
    queryKey: ["catalog-issue-pdf", value],
    enabled: Boolean(value),
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!value) return null;
      if (/^https?:\/\//.test(value)) return value;
      return signIssuePdf(value);
    },
  });
}
