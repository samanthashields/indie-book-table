import { createFileRoute } from "@tanstack/react-router";

/** Serves a shared table picture by its public link. */
export const Route = createFileRoute("/api/public/shelf-image/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("table_shares")
          .select("image_path")
          .eq("slug", params.slug)
          .maybeSingle();
        if (!row) return new Response("Not found", { status: 404 });

        const { data: file, error } = await supabaseAdmin.storage.from("table-shares").download(row.image_path);
        if (error || !file) return new Response("Not found", { status: 404 });

        return new Response(await file.arrayBuffer(), {
          headers: { "content-type": "image/png", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
