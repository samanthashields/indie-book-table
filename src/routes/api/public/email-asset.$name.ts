import { createFileRoute } from "@tanstack/react-router";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Serves an image used inside emails. Email clients need a plain public URL. */
export const Route = createFileRoute("/api/public/email-asset/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
        if (!/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(name) || name.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: file, error } = await supabaseAdmin.storage.from("email-assets").download(name);
        if (error || !file) return new Response("Not found", { status: 404 });

        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        return new Response(await file.arrayBuffer(), {
          headers: {
            "content-type": TYPES[ext] ?? "application/octet-stream",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
