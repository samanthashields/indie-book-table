import { cn } from "@/lib/utils";

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warm" | "danger" }) {
  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", tone === "good" && "border-chart-3/30 bg-chart-3/15 text-foreground", tone === "warm" && "border-chart-1/35 bg-chart-1/20 text-foreground", tone === "danger" && "border-destructive/25 bg-destructive/10 text-destructive", tone === "neutral" && "border-border/80 bg-secondary text-secondary-foreground")}>{children}</span>;
}