import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  user_id: string;
  display_name: string | null;
  pen_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  plan: string;
  view_preference: "list" | "grid" | null;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from("profiles").select("user_id, display_name, pen_name, avatar_url, bio, plan, view_preference").eq("user_id", user.id).maybeSingle();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return {
        id: user.id,
        email: user.email ?? "",
        profile: (profile ?? null) as Profile | null,
        roles: (roles ?? []).map((row) => row.role as string),
      };
    },
    staleTime: 60_000,
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
