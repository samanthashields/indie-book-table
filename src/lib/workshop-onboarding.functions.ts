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

const mediaKind = z.enum(["none", "image", "video"]);
const safePath = z.string().trim().max(300).refine(
  (value) => !value || (/^\/(?!\/)/.test(value) && !value.includes("..")),
  "Use a page path from this site",
);

const welcomeSchema = z.object({
  enabled: z.boolean(),
  heading: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(4000),
  primary_label: z.string().trim().min(1).max(80),
  secondary_label: z.string().trim().min(1).max(80),
  media_kind: mediaKind,
  media_value: z.string().trim().max(1000),
});

const stepSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(4000),
  media_kind: mediaKind,
  media_value: z.string().trim().max(1000),
  destination_label: z.string().trim().max(80),
  destination_path: safePath,
  position: z.number().int().min(0).max(1000),
  published: z.boolean(),
});

export const getAdminWorkshopOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: welcome, error: welcomeError } = await context.supabase
      .from("workshop_onboarding")
      .select("*")
      .single();
    if (welcomeError) throw new Error(welcomeError.message);
    const { data: steps, error: stepsError } = await context.supabase
      .from("workshop_tour_steps")
      .select("*")
      .order("position");
    if (stepsError) throw new Error(stepsError.message);
    return { welcome, steps: steps ?? [] };
  });

export const saveWorkshopWelcome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => welcomeSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("workshop_onboarding")
      .update(data)
      .eq("id", "00000000-0000-0000-0000-000000000001");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveWorkshopTourStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => stepSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("workshop_tour_steps").update(values).eq("id", id).select("*").single()
      : context.supabase.from("workshop_tour_steps").insert(values).select("*").single();
    const { data: step, error } = await query;
    if (error) throw new Error(error.message);
    return step;
  });

export const deleteWorkshopTourStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("workshop_tour_steps").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderWorkshopTourSteps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ ids: z.array(z.string().uuid()).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const results = await Promise.all(
      data.ids.map((id, position) =>
        context.supabase.from("workshop_tour_steps").update({ position }).eq("id", id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) throw new Error(failed.error.message);
    return { ok: true };
  });

/** Signs a private onboarding media path for any signed-in author. */
export const signOnboardingMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().trim().min(1).max(1000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("onboarding-media")
      .createSignedUrl(data.path, 60 * 60);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });