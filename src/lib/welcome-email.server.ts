/** Server-only helpers for the community list welcome email. */

export interface WelcomeEmailSettings {
  enabled: boolean;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** File name inside the email-assets bucket, or "" for no logo. */
  logoFile: string;
}

export const WELCOME_DEFAULTS: WelcomeEmailSettings = {
  enabled: true,
  subject: "You're on the list — The Indie Book Table",
  headline: "You're on the list",
  body:
    "Thanks for joining the community list for The Indie Book Table.\n\nWe're building a home for indie authors — a place to plan a book, publish it, and get it in front of readers. You'll be among the first to hear when we open the doors.",
  ctaLabel: "",
  ctaUrl: "",
  logoFile: "default-logo.png",
};

/** Emails need an absolute, publicly reachable image URL. */
export const EMAIL_ASSET_BASE = "https://indiebooktable.com/api/public/email-asset";

export function emailAssetUrl(file: string | null | undefined) {
  if (!file) return null;
  if (/^https?:\/\//.test(file)) return file;
  return `${EMAIL_ASSET_BASE}/${file}`;
}

const KEYS = {
  enabled: "welcome_email_enabled",
  subject: "welcome_email_subject",
  headline: "welcome_email_headline",
  body: "welcome_email_body",
  ctaLabel: "welcome_email_cta_label",
  ctaUrl: "welcome_email_cta_url",
  logoFile: "welcome_email_logo_file",
} as const;

export async function loadWelcomeEmailSettings(): Promise<WelcomeEmailSettings> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("catalog_site_content")
    .select("key, value")
    .in("key", Object.values(KEYS));
  if (error) throw new Error(error.message);
  const stored = new Map((data ?? []).map((row) => [row.key, row.value]));
  const read = (key: string, fallback: string) => {
    const value = stored.get(key);
    return value === undefined || value === null ? fallback : value;
  };
  return {
    enabled: read(KEYS.enabled, WELCOME_DEFAULTS.enabled ? "true" : "false") === "true",
    subject: read(KEYS.subject, WELCOME_DEFAULTS.subject),
    headline: read(KEYS.headline, WELCOME_DEFAULTS.headline),
    body: read(KEYS.body, WELCOME_DEFAULTS.body),
    ctaLabel: read(KEYS.ctaLabel, WELCOME_DEFAULTS.ctaLabel),
    ctaUrl: read(KEYS.ctaUrl, WELCOME_DEFAULTS.ctaUrl),
  };
}

export async function saveWelcomeEmailSettings(settings: WelcomeEmailSettings) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = [
    { key: KEYS.enabled, value: settings.enabled ? "true" : "false" },
    { key: KEYS.subject, value: settings.subject },
    { key: KEYS.headline, value: settings.headline },
    { key: KEYS.body, value: settings.body },
    { key: KEYS.ctaLabel, value: settings.ctaLabel },
    { key: KEYS.ctaUrl, value: settings.ctaUrl },
  ].map((row) => ({ ...row, updated_at: new Date().toISOString() }));
  const { error } = await supabaseAdmin
    .from("catalog_site_content")
    .upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

/** Sends the welcome email for one recipient. Never throws — signup must not fail on email. */
export async function sendWelcomeEmail(
  to: string,
  options?: { settings?: WelcomeEmailSettings; ignoreEnabled?: boolean; idempotencyKey?: string },
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const settings = options?.settings ?? (await loadWelcomeEmailSettings());
    if (!settings.enabled && !options?.ignoreEnabled) return { sent: false, reason: "disabled" };
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const result = await sendTemplateEmail("community-welcome", to, {
      templateData: {
        subject: settings.subject,
        headline: settings.headline,
        body: settings.body,
        ctaLabel: settings.ctaLabel || null,
        ctaUrl: settings.ctaUrl || null,
      },
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    });
    return { sent: result.sent, ...(result.sent ? {} : { reason: result.reason }) };
  } catch (error) {
    console.error("[welcome-email] send failed", error);
    return { sent: false, reason: error instanceof Error ? error.message : "send failed" };
  }
}
