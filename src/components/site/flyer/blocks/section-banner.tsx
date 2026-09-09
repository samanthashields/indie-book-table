import {
  bannerShapeClass,
  categoryBannerShape,
  categoryRibbonColor,
  panelClass,
} from "@/lib/flyer-theme";
import { cn } from "@/lib/utils";

/**
 * Section opener: a shaped banner in the section's accent colour. Shape and
 * colour are deterministic per category so a section keeps its identity
 * across issues.
 */
export function SectionBanner({ category, count }: { category: string; count?: number }) {
  const shape = categoryBannerShape(category);

  return (
    <div
      className={cn(
        "relative px-6 py-5 sm:px-9 sm:py-6",
        panelClass(categoryRibbonColor(category)),
        bannerShapeClass(shape),
        shape === "torn" && "py-7 sm:py-9",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-serif text-[1.9rem] font-black uppercase leading-none tracking-[0.02em] sm:text-5xl">
          {category}
        </h2>
        {typeof count === "number" && (
          <span className="rounded-full border-2 border-cocoa bg-card px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-cocoa">
            {count} {count === 1 ? "title" : "titles"}
          </span>
        )}
      </div>
    </div>
  );
}
