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
}: {
  children: ReactNode;
  groundClass?: string | null;
  accent?: FlyerColor | null;
  pattern?: BorderPattern;
  backgroundImage?: string | null;
}) {
  const ground = groundClass ?? "bg-background";

  return (
    <div
      className={`${patternClass(pattern)} relative flex min-h-[min(78rem,calc(100vh-9rem))] overflow-hidden border-4 border-cocoa p-[0.7rem] shadow-[var(--shadow-page)]`}
    >
      <div className={`paper-grain relative flex-1 border-[3px] border-cocoa ${ground}`}>
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
        <div className="relative px-4 py-6 sm:px-8 sm:py-9">{children}</div>
      </div>
    </div>
  );
}
