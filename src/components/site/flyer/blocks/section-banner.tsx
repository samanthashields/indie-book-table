import type { FlyerColor } from "@/lib/flyer-theme";
import { categoryRibbonColor, panelClass } from "@/lib/flyer-theme";
import { cn } from "@/lib/utils";

/**
 * Section opener: a bold rectangular banner in the section's accent colour.
 * Colour is deterministic per category so a section keeps its identity
 * across issues.
 */
export function SectionBanner({
  category,
  count,
  accent,
}: {
  category: string;
  count?: number;
  accent?: FlyerColor;
  shape?: string;
}) {
  const color = accent ?? categoryRibbonColor(category);

  return (
    <div className={cn("rounded-2xl border-2 border-ink px-6 py-5 sm:px-9 sm:py-6", panelClass(color))}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-heading text-[1.9rem] font-black uppercase leading-none tracking-[0.02em] sm:text-5xl">
          {category}
        </h2>
        {typeof count === "number" && (
          <span className="rounded-md border-2 border-ink bg-card px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-foreground">
            {count} {count === 1 ? "title" : "titles"}
          </span>
        )}
      </div>
    </div>
  );
}
