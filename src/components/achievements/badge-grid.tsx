import { Award, Lock } from "lucide-react";

import type { Badge } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <section aria-label="Your milestones">
      <h2 className="font-serif text-2xl font-semibold">Milestones</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 shadow-xs",
              badge.earned ? "border-primary/30 bg-card" : "border-dashed border-border bg-paper opacity-70",
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", badge.earned ? "bg-primary/12 text-link" : "bg-muted text-muted-foreground")}>
              {badge.earned ? <Award className="size-5" /> : <Lock className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{badge.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{badge.earned ? "Earned" : badge.hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
