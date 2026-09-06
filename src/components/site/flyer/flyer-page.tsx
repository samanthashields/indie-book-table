import type { ReactNode } from "react";

import {
  accentBarClass,
  patternClass,
  type BorderPattern,
  type FlyerColor,
} from "@/lib/flyer-theme";

/** One printed sheet of the flip-book: border motif, stock, accent rule. */
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
  const ground = groundClass ?? "bg-background";

  return (
    <div
      className={`${patternClass(pattern)} relative flex min-h-[min(78rem,calc(100vh-9rem))] overflow-hidden border-4 border-cocoa p-[0.7rem] shadow-[var(--shadow-page)]`}
    >
      <div className={`paper-grain relative flex-1 overflow-hidden border-[3px] border-cocoa ${ground}`}>
        {backgroundImage && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.09]"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${ground} opacity-40`} />
          </>
        )}
        {accent && (
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[6px] ${accentBarClass(accent)}`} />
        )}
        {/* staple edge */}
        <span aria-hidden="true" className="absolute left-1.5 top-[18%] h-7 w-[5px] bg-cocoa/60" />
        <span aria-hidden="true" className="absolute bottom-[18%] left-1.5 h-7 w-[5px] bg-cocoa/60" />

        {runningHead && (
          <div className="relative flex items-center justify-between border-b border-cocoa/25 px-4 pb-2 pt-4 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-cocoa/65 sm:px-8">
            <span className="truncate">{runningHead}</span>
            <span aria-hidden="true" className="hidden sm:inline">The Indie Table</span>
          </div>
        )}

        <div className="relative px-4 py-6 sm:px-8 sm:py-9">{children}</div>

        {folio && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cocoa/55">
            {folio}
          </span>
        )}

        {corner}
      </div>
    </div>
  );
}
