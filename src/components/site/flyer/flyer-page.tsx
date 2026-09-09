import type { ReactNode } from "react";

import {
  accentBarClass,
  patternClass,
  posterGroundClass,
  type BorderPattern,
  type FlyerColor,
} from "@/lib/flyer-theme";

/**
 * One page of the fair flyer, printed like a glossy poster: a full-bleed
 * colour block inside a thick rounded frame, with a slanted masthead bar.
 */
export function FlyerPage({
  children,
  groundClass,
  accent,
  pattern = "hearts",
  backgroundImage,
  runningHead,
  folio,
  corner,
}: {
  children: ReactNode;
  groundClass?: string | null;
  accent?: FlyerColor | null;
  pattern?: BorderPattern;
  backgroundImage?: string | null;
  runningHead?: string;
  folio?: string;
  corner?: ReactNode;
}) {
  const ground = accent ? posterGroundClass(accent) : (groundClass ?? "bg-background");

  return (
    <div
      className={`${patternClass(pattern)} poster-frame poster-gloss relative flex min-h-[min(78rem,calc(100vh-9rem))] overflow-hidden bg-cocoa p-[0.55rem]`}
    >
      <div className="poster-frame relative flex-1 overflow-hidden bg-paper">
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${ground}`} />

        {backgroundImage && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14]"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${ground} opacity-40`} />
          </>
        )}

        {runningHead && (
          <div className="relative overflow-hidden">
            <div
              className={`poster-slant -mx-6 -mt-4 flex items-center justify-between px-10 pb-2.5 pt-7 ${accent ? accentBarClass(accent) : "bg-amber"}`}
            >
              <span className="poster-unslant truncate text-[0.68rem] font-black uppercase tracking-[0.3em] text-cocoa">
                {runningHead}
              </span>
              <span
                aria-hidden="true"
                className="poster-unslant hidden text-[0.68rem] font-black uppercase tracking-[0.3em] text-cocoa/80 sm:inline"
              >
                The Indie Book Table
              </span>
            </div>
          </div>
        )}

        <div className="relative px-4 py-7 sm:px-9 sm:py-10">{children}</div>

        {folio && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-cocoa px-3 py-1 text-[0.58rem] font-black uppercase tracking-[0.24em] text-paper">
            {folio}
          </span>
        )}

        {corner}
      </div>
    </div>
  );
}
