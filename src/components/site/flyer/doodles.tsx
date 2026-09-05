/** Hand-drawn margin doodles scattered between listings. Decorative only. */
const DOODLES = ["✦", "❤", "★", "!", "✿", "➷", "✷", "♪"] as const;

export function Doodles({ seed = 0 }: { seed?: number }) {
  const picks = [0, 1, 2].map((i) => DOODLES[(seed * 3 + i * 2) % DOODLES.length]!);
  const spots = [
    "left-[6%] top-[8%] rotate-[-12deg]",
    "right-[8%] top-[42%] rotate-[10deg]",
    "left-[38%] bottom-[6%] rotate-[6deg]",
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      {picks.map((glyph, i) => (
        <span key={i} className={`absolute font-serif text-2xl text-cocoa/25 sm:text-3xl ${spots[i]}`}>
          {glyph}
        </span>
      ))}
    </div>
  );
}
