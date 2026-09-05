import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SubmissionForm } from "@/components/submit/submission-form";
import { supabase } from "@/integrations/supabase/client";
import {
  submitCatalogBook,
  updateCatalogSubmission,
  useMyCatalogAuthor,
  useSubmission,
} from "@/lib/catalog-submit";
import { emptySubmission, type SubmissionValues } from "@/lib/submission-schema";
import { useCurrentUser } from "@/lib/use-current-user";

type Search = { bookId?: string; edit?: string };

export const Route = createFileRoute("/_authenticated/submit")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["bookId"] === "string" ? { bookId: search["bookId"] } : {}),
    ...(typeof search["edit"] === "string" ? { edit: search["edit"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Submit your book to The Table — Book Cycles" },
      { name: "description", content: "Send your finished book to the editors for a spot in an upcoming issue of The Table." },
      { property: "og:title", content: "Submit your book to The Table" },
      { property: "og:description", content: "Send your finished book to the editors for a spot in an upcoming issue of The Table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmitPage,
});

const AUDIENCES = ["adult", "new_adult", "young_adult", "middle_grade", "picture_book"] as const;
type Audience = (typeof AUDIENCES)[number];
const asAudience = (value: string | null): Audience =>
  AUDIENCES.includes((value ?? "") as Audience) ? ((value ?? "adult") as Audience) : "adult";

function useCyclePrefill(bookId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "cycle-prefill", bookId],
    enabled: Boolean(bookId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, subtitle, pen_name, genre, audience")
        .eq("id", bookId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function SubmitPage() {
  const { bookId, edit } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const author = useMyCatalogAuthor();
  const existing = useSubmission(edit);
  const prefill = useCyclePrefill(bookId);
  const [saving, setSaving] = useState(false);

  const loading =
    user.isLoading || author.isLoading || (edit && existing.isLoading) || (bookId && prefill.isLoading);

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Getting your details…</p>
      </AppShell>
    );
  }

  const userId = user.data?.id;
  if (!userId) return <AppShell><p className="text-sm text-muted-foreground">Sign in to submit a book.</p></AppShell>;

  const row = existing.data;
  const cycle = prefill.data;

  const initial: SubmissionValues = {
    ...emptySubmission,
    author_name: author.data?.name ?? user.data?.profile?.display_name ?? "",
    author_email: author.data?.email ?? user.data?.email ?? "",
    instagram_handle: author.data?.instagram_handle ?? "",
    website: author.data?.website ?? "",
    bio: author.data?.bio ?? "",
    ...(row
      ? {
          title: row.title,
          pen_name: row.pen_name ?? "",
          genre: row.genre ?? "",
          target_audience: asAudience(row.target_audience),
          hook: row.hook ?? "",
          explicit_content: row.explicit_content,
          editors: row.editors ?? "",
          illustrators: row.illustrators ?? "",
          cover_designer: row.cover_designer ?? "",
          ai_writing_contribution: (row.ai_writing_contribution as SubmissionValues["ai_writing_contribution"]) ?? "none",
          ai_art_contribution: (row.ai_art_contribution as SubmissionValues["ai_art_contribution"]) ?? "none",
          cover_image_url: row.cover_image_url,
          ebook_price: row.ebook_price != null ? String(row.ebook_price) : "",
          print_price: row.print_price != null ? String(row.print_price) : "",
          purchase_links: row.catalog_purchase_links.map((link) => ({
            platform_label: link.platform_label,
            url: link.url,
          })),
          awards_reviews_text: row.awards_reviews_text ?? "",
          tags: row.tags ?? [],
        }
      : cycle
        ? {
            title: cycle.title,
            pen_name: cycle.pen_name ?? "",
            genre: cycle.genre ?? "",
            target_audience: asAudience(cycle.audience),
            hook: cycle.subtitle ?? "",
          }
        : {}),
  };

  const handleSubmit = async (values: SubmissionValues) => {
    setSaving(true);
    try {
      if (edit) {
        await updateCatalogSubmission(userId, edit, values);
        toast.success("Submission updated");
      } else {
        await submitCatalogBook(userId, values, { bookCycleId: bookId ?? null });
        toast.success("Your book is with the editors");
      }
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void navigate({ to: "/submissions" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t send that just yet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeading
        title={edit ? "Edit your submission" : "Submit your book to The Table"}
        description="Six short steps. The editors read everything and pick books for each monthly issue."
      />
      <SubmissionForm
        userId={userId}
        initial={initial}
        submitting={saving}
        submitLabel={edit ? "Save changes" : "Send to the editors"}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </AppShell>
  );
}
