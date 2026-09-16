import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export interface Subscriber {
  id: string;
  email: string;
  catalog_opt_in: boolean;
  blog_opt_in: boolean;
  subscribed_at: string;
}

/** Everyone on the community list — admin only. */
export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("catalog_subscribers")
      .select("id, email, catalog_opt_in, blog_opt_in, subscribed_at")
      .order("subscribed_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);
    return (data ?? []) as Subscriber[];
  });

/** Removes one signup from the list. */
export const deleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("catalog_subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getWelcomeEmail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { loadWelcomeEmailSettings } = await import("./welcome-email.server");
    return await loadWelcomeEmailSettings();
  });

const welcomeSchema = z.object({
  enabled: z.boolean(),
  subject: z.string().trim().min(1, "Add a subject line").max(200),
  headline: z.string().trim().min(1, "Add a headline").max(200),
  body: z.string().trim().min(1, "Add a message").max(5000),
  ctaLabel: z.string().trim().max(60),
  ctaUrl: z.string().trim().max(500),
});

export const saveWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => welcomeSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { saveWelcomeEmailSettings } = await import("./welcome-email.server");
    await saveWelcomeEmailSettings(data);
    return { ok: true };
  });

/** Sends the current draft to the signed-in admin's own address. */
export const sendWelcomeEmailTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => welcomeSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = user?.user?.email;
    if (!email) throw new Error("Your account has no email address");
    const { sendWelcomeEmail } = await import("./welcome-email.server");
    const result = await sendWelcomeEmail(email, {
      settings: data,
      ignoreEnabled: true,
      idempotencyKey: `welcome-test-${context.userId}-${Date.now()}`,
    });
    if (!result.sent) throw new Error(result.reason ?? "The test email didn't send");
    return { ok: true, email };
  });
