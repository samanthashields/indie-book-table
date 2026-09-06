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
  publicNote: string | null;
  approved: boolean;
};

/**
 * Admin-only: approve a request, move its status, and tell the author plus
 * everyone who voted for it. Email is skipped cleanly when no sender domain
 * is set up yet; the bell notification always goes out.
 */
export const updateFeatureRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateInput) => {
    if (!input?.requestId) throw new Error("Missing request");
    if (!STATUS_LABELS[input.status]) throw new Error("Unknown status");
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

    const { error: updateError } = await supabaseAdmin
      .from("feature_requests")
      .update({ status: data.status, public_note: data.publicNote, approved: data.approved })
      .eq("id", data.requestId);
    if (updateError) throw updateError;

    const statusChanged = before.status !== data.status;
    const noteChanged = (before.public_note ?? "") !== (data.publicNote ?? "");
    if (!statusChanged && !noteChanged) return { ok: true, notified: 0 };

    const { data: voteRows } = await supabaseAdmin
      .from("feature_request_votes")
      .select("user_id")
      .eq("request_id", data.requestId);

    const recipients = [...new Set([before.submitted_by, ...(voteRows ?? []).map((row) => row.user_id)])];
    const label = STATUS_LABELS[data.status] ?? data.status;
    const title = `“${before.title}” is now ${label}`;
    const body = data.publicNote ?? null;
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

    await sendStatusEmails(supabaseAdmin, recipients, title, body, link);

    return { ok: true, notified: recipients.length };
  });

async function sendStatusEmails(
  admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  recipients: string[],
  title: string,
  note: string | null,
  link: string,
) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  if (!apiKey || !from || recipients.length === 0) return;

  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, feature_email_opt_out")
    .in("user_id", recipients);
  const optedOut = new Set((profiles ?? []).filter((row) => row.feature_email_opt_out).map((row) => row.user_id));

  const { sendLovableEmail } = await import("@lovable.dev/email-js");
  const siteUrl = process.env["SITE_URL"] ?? "";

  for (const userId of recipients) {
    if (optedOut.has(userId)) continue;
    const { data: userRow } = await admin.auth.admin.getUserById(userId);
    const email = userRow?.user?.email;
    if (!email) continue;
    const url = `${siteUrl}${link}`;
    try {
      await sendLovableEmail(
        {
          to: email,
          from,
          subject: title,
          text: `${title}\n\n${note ?? ""}\n\n${url}`.trim(),
          html: `<p>${escapeHtml(title)}</p>${note ? `<p>${escapeHtml(note)}</p>` : ""}<p><a href="${url}">See the request</a></p>`,
          purpose: "feature-request-update",
        },
        { apiKey },
      );
    } catch {
      // Delivery problems must never block the status change.
    }
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    char === "&" ? "&amp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === '"' ? "&quot;" : "&#39;",
  );
}
