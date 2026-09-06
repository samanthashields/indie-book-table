import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/journal/")({ component: AdminJournal });

type Post = { id: string; title: string; status: string; published_at: string | null };

function usePosts() {
  return useQuery({
    queryKey: ["catalog-admin", "posts"],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase
        .from("catalog_posts")
        .select("id, title, status, published_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });
}

function AdminJournal() {
  const posts = usePosts();

  return (
    <section className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-normal">All posts</h2>
          <p className="text-sm text-muted-foreground">Everything written for the Journal, newest first.</p>
        </div>
        <Button asChild>
          <Link to="/admin/journal/$postId" params={{ postId: "new" }}><Plus />Add new post</Link>
        </Button>
      </div>

      <ul className="space-y-2">
        {posts.isLoading && <li className="text-sm text-muted-foreground">Loading posts…</li>}
        {(posts.data ?? []).map((post) => (
          <li key={post.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
            <span className="min-w-0 flex-1 text-sm font-semibold">{post.title}</span>
            {post.published_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            <StatusPill tone={post.status === "published" ? "good" : "warm"}>{post.status === "published" ? "Published" : "Draft"}</StatusPill>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/journal/$postId" params={{ postId: post.id }}>Edit</Link>
            </Button>
          </li>
        ))}
        {!posts.isLoading && (posts.data ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted-foreground">No posts yet. Add the first one.</li>
        )}
      </ul>
    </section>
  );
}
