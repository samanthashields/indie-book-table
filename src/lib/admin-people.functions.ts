import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

/** Profiles joined with their sign-in email — admin only. */
export const listPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles, error }, { data: roles }, { data: users }] = await Promise.all([
      context.supabase.from("profiles").select("id, user_id, display_name, pen_name, plan, suspended, created_at").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (error) throw new Error(error.message);
    const emails = new Map<string, string>();
    for (const user of users?.users ?? []) emails.set(user.id, user.email ?? "");
    const byUser = new Map<string, string[]>();
    for (const row of (roles ?? []) as { user_id: string; role: string }[]) {
      byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), row.role]);
    }
    return ((profiles ?? []) as any[]).map((profile) => ({
      ...profile,
      email: emails.get(profile.user_id) ?? "",
      roles: byUser.get(profile.user_id) ?? [],
    }));
  });

/** Edits a person's name, pen name, plan, suspension and sign-in email. */
export const updatePerson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    userId: string;
    display_name?: string | null;
    pen_name?: string | null;
    plan?: string;
    suspended?: boolean;
    email?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    if (data.display_name !== undefined) patch["display_name"] = data.display_name;
    if (data.pen_name !== undefined) patch["pen_name"] = data.pen_name;
    if (data.plan !== undefined) patch["plan"] = data.plan;
    if (data.suspended !== undefined) patch["suspended"] = data.suspended;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin.from("profiles").update(patch).eq("user_id", data.userId);
      if (error) throw new Error(error.message);
    }
    if (data.email) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { email: data.email });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Sets a new password for an account, chosen by the admin. */
export const setPersonPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    if (input.password.length < 8) throw new Error("Use at least 8 characters");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Emails the account a password reset link. */
export const sendPersonReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; redirectTo: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, { redirectTo: data.redirectTo });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
