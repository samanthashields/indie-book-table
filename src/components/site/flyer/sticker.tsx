import { tagSpec } from "@/lib/flyer-tags";
import { cn } from "@/lib/utils";

/**
 * Ribbon-style tags on the corner of a cover, matching the catalog card's
 * badge treatment: a small rotated rectangle rather than a circular sticker.
 */
export function CoverStickers({
  tags,
  max = 2,
  className,
}: {
  tags: string[];
  max?: number;
  className?: string;
}) {
  const specs = tags
    .map(tagSpec)
    .filter((spec) => spec !== null)
    .slice(0, max);
  if (specs.length === 0) return null;

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute -left-2 top-3 z-10 flex flex-col gap-2", className)}
    >
      {specs.map((spec, index) => (
        <span
          key={spec.value}
          title={spec.label}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border-2 border-ink px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] leading-none shadow-sm",
            spec.chip,
            index % 2 === 0 ? "-rotate-3" : "rotate-2",
          )}
        >
          {spec.icon}
          <span className="sr-only">{spec.label}</span>
        </span>
      ))}
    </span>
  );
}
