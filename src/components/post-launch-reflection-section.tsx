import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReflectionBody } from "@/components/reflection-body";
import { useCurrentUser } from "@/lib/use-current-user";
import { cn } from "@/lib/utils";

const storageKey = (userId: string) => `ibt:post-launch-reflection-open:${userId}`;

function readOpen(userId: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(userId)) !== "0";
  } catch {
    return true;
  }
}

/** Whether the reflection panel's own body is expanded. Remembered per signed-in author. */
function useReflectionOpen(userId: string) {
  const [open, setOpen] = useState(() => readOpen(userId));
  const choose = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey(userId), next ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice still applies until the page is closed.
    }
  };
  return [open, choose] as const;
}

/**
 * Shown on the book overview once the author starts (or has finished) ending the cycle, in place
 * of the setup-tasks panel and the phase timeline. Its own show/hide only collapses this panel's
 * body — it doesn't bring the phases or setup tasks back.
 */
export function PostLaunchReflectionSection({ bookId, authorId }: { bookId: string; authorId: string }) {
  const user = useCurrentUser();
  const userId = user.data?.id;
  const [open, choose] = useReflectionOpen(userId ?? "anon");
  if (!userId || userId !== authorId) return null;

  return (
    <section id="tour-post-launch-reflection" className="mb-10 rounded-2xl border border-border bg-card shadow-xs" aria-labelledby="post-launch-reflection-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="min-w-0">
          <h2 id="post-launch-reflection-heading" className="font-heading text-2xl font-normal">Post-launch reflection</h2>
          <p className="mt-1 text-sm text-muted-foreground">Close out the cycle and reflect on how it went.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => choose(!open)} aria-expanded={open} aria-controls="post-launch-reflection-body">
          {open ? "Hide" : "Show"}
          <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <div id="post-launch-reflection-body" className="border-t border-border/70 px-6 pb-6 pt-4">
          <ReflectionBody bookId={bookId} compact />
        </div>
      )}
    </section>
  );
}
