import type { ReactNode } from "react";

import { accentBarClass, posterGroundClass, type FlyerColor } from "@/lib/flyer-theme";

/**
 * One section of the single-scroll issue page, in the flatter catalog style: a
 * plain colour background and a bold rectangular running-head band — no
 * printed-poster border, slanted masthead, or page-turn chrome. Sections size
 * to their own content instead of each filling a screen.
 */
export function FlyerPage({
  children,
  groundClass,
  accent,
  runningHead,
  id,
}: {
  children: ReactNode;
  groundClass?: string | null;
  accent?: FlyerColor | null;
  pattern?: string;
  backgroundImage?: string | null;
  runningHead?: string;
  id?: string;
}) {
  const ground = accent ? posterGroundClass(accent) : (groundClass ?? "bg-background");

  return (
    <div
      id={id}
      className={`light relative overflow-hidden rounded-2xl border-2 border-ink scroll-mt-6 ${ground}`}
    >
      {runningHead && (
        <div
          className={`flex items-center justify-between border-b-2 border-ink px-6 py-3 ${accent ? accentBarClass(accent) : "bg-amber"}`}
        >
          <span className="truncate text-xs font-bold uppercase tracking-[0.2em] text-ink">
            {runningHead}
          </span>
          <span
            aria-hidden="true"
            className="hidden text-xs font-bold uppercase tracking-[0.2em] text-ink/70 sm:inline"
          >
            The Indie Book Table
          </span>
        </div>
      )}

      <div className="relative px-4 py-7 sm:px-9 sm:py-10">{children}</div>
    </div>
  );
}
