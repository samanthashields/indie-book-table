import { cn } from "@/lib/utils";

/** Circular progress indicator. Colour comes from the surrounding text colour. */
export function ProgressRing({ value, label, size = 56, className }: { value: number; label?: string; size?: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={label ?? `${clamped}% complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute text-[0.7rem] font-semibold text-foreground">{clamped}%</span>
    </span>
  );
}
