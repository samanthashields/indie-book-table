import { Link, type LinkComponentProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * How wide the cover sits in the card. Structure, spacing, radius and type are
 * identical at every size; only the cover width changes.
 * - full: the cover fills the card (My Books)
 * - md: a mid-size cover (My Cycles, Collaborations)
 * - sm: a small cover for text-heavy cards (My Submissions)
 */
export type BookGridCardSize = "full" | "md" | "sm";

const coverWidth: Record<BookGridCardSize, string> = {
  full: "w-full",
  md: "w-28 sm:w-32",
  sm: "w-16 sm:w-20",
};

export function BookGridCard({
  cover,
  size = "md",
  title,
  subtitle,
  link,
  menu,
  children,
  className,
}: {
  /** A cover element that fills its width, e.g. `<BookCover className="w-full" />`. */
  cover: ReactNode;
  size?: BookGridCardSize;
  title: string;
  subtitle?: ReactNode;
  /** Makes the whole card a link. Anything interactive inside `children` should be `relative z-10`. */
  link?: LinkComponentProps;
  /** Floated over the top-right corner so it never takes width from the cover. */
  menu?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const heading = (
    <h3 className="line-clamp-2 font-serif text-xl font-normal group-hover:text-primary">{title}</h3>
  );

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-200",
        link && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <div className={coverWidth[size]}>{cover}</div>
      {menu && (
        <div className="absolute right-6 top-6 z-20 rounded-full bg-card/90 shadow-sm backdrop-blur-sm">
          {menu}
        </div>
      )}
      <div className="mt-4 min-w-0">
        {link ? (
          <Link
            {...link}
            className="rounded-sm after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {heading}
          </Link>
        ) : (
          heading
        )}
        {subtitle && <div className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
