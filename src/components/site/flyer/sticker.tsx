import { tagSpec } from "@/lib/flyer-tags";
import { cn } from "@/lib/utils";

/**
 * Illustrated badges that sit on the corner of a cover, like stickers on a
 * school flyer: slightly rotated, soft shadow, icon only. The legend on the
 * cover page explains what each one means.
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
            "inline-flex size-8 items-center justify-center rounded-full border-2 border-cocoa text-[0.95rem] leading-none shadow-[2px_3px_0_0_var(--cocoa)]",
            spec.chip,
            index % 2 === 0 ? "-rotate-[7deg]" : "rotate-[6deg]",
          )}
        >
          {spec.icon}
          <span className="sr-only">{spec.label}</span>
        </span>
      ))}
    </span>
  );
}
