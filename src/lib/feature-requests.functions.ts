import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting for review",
  considering: "Under consideration",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  not_planned: "Not planned",
};

type UpdateInput = {
  requestId: string;
  status: string;
  /** A new public reply to add to the idea's timeline. Empty means "no new reply". */
  reply: string | null;
  priority: string;
  approved: boolean;
};

const PRIORITIES = new Set(["nice_to_have", "would_help", "blocking"]);

/**
 * Admin-only: approve a request, move its status, post a public reply to its
 * timeline, and tell the author plus everyone who voted for it. Email is
 * skipped cleanly when no sender domain is set up yet; the bell notification
 * always goes out.
 */
export const updateFeatureRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateInput) => {
    if (!input?.requestId) throw new Error("Missing request");
    if (!STATUS_LABELS[input.status]) throw new Error("Unknown status");
    if (!PRIORITIES.has(input.priority)) throw new Error("Unknown priority");
    if (input.reply && input.reply.length > 4000) throw new Error("Reply is too long");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: before, error: readError } = await supabaseAdmin
      .from("feature_requests")
      .select("id, title, status, public_note, approved, submitted_by")
      .eq("id", data.requestId)
      .maybeSingle();
    if (readError) throw readError;
    if (!before) throw new Error("Request not found");

    const reply = data.reply?.trim() || null;

    const { error: updateError } = await supabaseAdmin
      .from("feature_requests")
      .update({
        status: data.status,
        priority: data.priority,
        approved: data.approved,
        ...(reply ? { public_note: reply } : {}),
      })
      .eq("id", data.requestId);
    if (updateError) throw updateError;

    const statusChanged = before.status !== data.status;
    if (!statusChanged && !reply) return { ok: true, notified: 0 };

    // Every stage change or new reply becomes a permanent timeline entry.
    await supabaseAdmin.from("feature_request_updates").insert({
      request_id: data.requestId,
      author_user_id: context.userId,
      status: data.status,
      body: reply,
    });

    const { data: voteRows } = await supabaseAdmin
      .from("feature_request_votes")
      .select("user_id")
      .eq("request_id", data.requestId);

    const recipients = [...new Set([before.submitted_by, ...(voteRows ?? []).map((row) => row.user_id)])];
    const label = STATUS_LABELS[data.status] ?? data.status;
    const title = statusChanged
      ? `“${before.title}” is now ${label}`
      : `New update on “${before.title}”`;
    const body = reply;
    const link = `/help/requests/${data.requestId}`;

    if (recipients.length > 0) {
      await supabaseAdmin.from("notifications").insert(
        recipients.map((userId) => ({
          user_id: userId,
          kind: "feature_request",
          title,
          body,
          link,
        })),
      );
    }

    await sendStatusEmails(supabaseAdmin, recipients, {
      requestId: data.requestId,
      requestTitle: before.title,
      statusLabel: label,
      publicNote: reply,
      link,
    });

    return { ok: true, notified: recipients.length };
  });

async function sendStatusEmails(
  admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  recipients: string[],
  update: {
    requestId: string;
    requestTitle: string;
    statusLabel: string;
    publicNote: string | null;
    link: string;
  },
) {
  if (!process.env["LOVABLE_API_KEY"] || recipients.length === 0) return;

  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, feature_email_opt_out")
    .in("user_id", recipients);
  const optedOut = new Set((profiles ?? []).filter((row) => row.feature_email_opt_out).map((row) => row.user_id));

  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const siteUrl = process.env["SITE_URL"] ?? "";

  for (const userId of recipients) {
    if (optedOut.has(userId)) continue;
    const { data: userRow } = await admin.auth.admin.getUserById(userId);
    const email = userRow?.user?.email;
    if (!email) continue;
    try {
      await sendTemplateEmail("feature-request-update", email, {
        templateData: {
          siteName: "Author's Workshop",
          requestTitle: update.requestTitle,
          statusLabel: update.statusLabel,
          publicNote: update.publicNote,
          requestUrl: `${siteUrl}${update.link}`,
        },
        idempotencyKey: `feature-request-${update.requestId}-${update.statusLabel}-${userId}`,
      });
    } catch {
      // Delivery problems must never block the status change.
    }
  }
}
