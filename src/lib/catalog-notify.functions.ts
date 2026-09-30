import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  added_to_database: "Added to the database",
  removed: "Removed",
};

type StatusChangeInput = { bookId: string; status: string };

/**
 * Admin-only: tell a book's author their submission moved to a new status,
 * by email and in-app notification. Called right after setSubmissionStatus
 * resolves — never blocks the status change itself if delivery fails.
 */
export const notifySubmissionStatusChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: StatusChangeInput) => {
    if (!input?.bookId) throw new Error("Missing book");
    if (!STATUS_LABELS[input.status]) throw new Error("Unknown status");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: book, error } = await supabaseAdmin
      .from("catalog_books")
      .select("id, title, catalog_authors ( user_id, email )")
      .eq("id", data.bookId)
      .maybeSingle();
    if (error) throw error;
    if (!book) throw new Error("Submission not found");

    const author = book.catalog_authors as { user_id: string | null; email: string } | null;
    const label = STATUS_LABELS[data.status] ?? data.status;
    const link = "/submissions";
    const title = `“${book.title}” is now ${label}`;

    if (author?.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: author.user_id,
        kind: "catalog_submission",
        title,
        body: null,
        link,
      });
    }

    if (author?.email && process.env["LOVABLE_API_KEY"]) {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const siteUrl = process.env["SITE_URL"] ?? "";
      try {
        await sendTemplateEmail("submission-status-update", author.email, {
          templateData: {
            siteName: "The Indie Table",
            bookTitle: book.title,
            statusLabel: label,
            submissionUrl: `${siteUrl}${link}`,
          },
          idempotencyKey: `catalog-submission-${data.bookId}-${data.status}`,
        });
      } catch {
        // Delivery problems must never block the status change.
      }
    }

    return { ok: true };
  });

/**
 * Any signed-in author, for their own just-submitted book: tell every admin a
 * new submission is waiting for review, by email and in-app notification.
 */
export const notifyNewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bookId: string }) => {
    if (!input?.bookId) throw new Error("Missing book");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: book, error } = await supabaseAdmin
      .from("catalog_books")
      .select("id, title, catalog_authors ( user_id )")
      .eq("id", data.bookId)
      .maybeSingle();
    if (error) throw error;
    if (!book) throw new Error("Submission not found");

    const author = book.catalog_authors as { user_id: string | null } | null;
    if (author?.user_id !== context.userId) throw new Error("Forbidden");

    const { data: adminRoles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = [...new Set((adminRoles ?? []).map((row) => row.user_id))];
    if (adminIds.length === 0) return { ok: true, notified: 0 };

    const title = `New submission: “${book.title}”`;
    const link = "/admin/submissions";

    await supabaseAdmin.from("notifications").insert(
      adminIds.map((userId) => ({ user_id: userId, kind: "catalog_submission_new", title, body: null, link })),
    );

    if (process.env["LOVABLE_API_KEY"]) {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      const siteUrl = process.env["SITE_URL"] ?? "";
      for (const userId of adminIds) {
        const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(userId);
        const email = userRow?.user?.email;
        if (!email) continue;
        try {
          await sendTemplateEmail("new-submission-alert", email, {
            templateData: { siteName: "The Indie Table", bookTitle: book.title, reviewUrl: `${siteUrl}${link}` },
            idempotencyKey: `catalog-new-submission-${data.bookId}-${userId}`,
          });
        } catch {
          // Delivery problems must never block the submission.
        }
      }
    }

    return { ok: true, notified: adminIds.length };
  });
