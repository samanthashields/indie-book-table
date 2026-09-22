import type { ReactNode } from "react";

import { accentBarClass, posterGroundClass, type FlyerColor } from "@/lib/flyer-theme";

/**
 * One page of the fair flyer, in the flatter catalog style: a plain colour
 * background, a bold rectangular running-head band, and a page-number tag —
 * no printed-poster border or slanted masthead.
 */
export function FlyerPage({
  children,
  groundClass,
  accent,
  runningHead,
  folio,
  corner,
}: {
  children: ReactNode;
  groundClass?: string | null;
  accent?: FlyerColor | null;
  pattern?: string;
  backgroundImage?: string | null;
  runningHead?: string;
  folio?: string;
  corner?: ReactNode;
}) {
  const ground = accent ? posterGroundClass(accent) : (groundClass ?? "bg-background");

  return (
    <div
      className={`light relative flex min-h-[min(78rem,calc(100vh-9rem))] flex-col overflow-hidden rounded-2xl border-2 border-ink ${ground}`}
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

      <div className="relative flex-1 px-4 py-7 sm:px-9 sm:py-10">{children}</div>

      {folio && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border-2 border-ink bg-card px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink">
          {folio}
        </span>
      )}

      {corner}
    </div>
  );
}
