import { useEffect, useRef, useState, type ReactNode } from "react";

const TURN_MS = 700;

/**
 * Renders one flyer page at a time. On navigation the outgoing sheet rotates
 * away around its left edge in 3D, revealing the next page underneath.
 */
export function PageTurner({
  index,
  renderPage,
}: {
  index: number;
  renderPage: (pageIndex: number) => ReactNode;
}) {
  const [displayed, setDisplayed] = useState(index);
  const [turn, setTurn] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (index === displayed) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayed(index);
      setTurn(null);
      return;
    }

    setTurn({ from: displayed, dir: index > displayed ? 1 : -1 });
    setDisplayed(index);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTurn(null), TURN_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, displayed]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const forward = turn?.dir === 1;
  const basePage = turn ? (forward ? displayed : turn.from) : displayed;
  const turningPage = turn ? (forward ? turn.from : displayed) : null;

  return (
    <div className="flyer-stage relative">
      <div>{renderPage(basePage)}</div>

      {turn && turningPage !== null && (
        <div
          aria-hidden="true"
          className={`flyer-sheet absolute inset-0 ${forward ? "turn-forward" : "turn-back"}`}
        >
          <div className="relative h-full">
            {renderPage(turningPage)}
            <div
              className={`pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-r from-cocoa/5 via-cocoa/25 to-cocoa/60 ${
                forward ? "turn-shade-forward" : "turn-shade-back"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
