import { cn } from "@/lib/utils";

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warm" | "danger" }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tone === "good" && "border-primary/20 bg-primary/10 text-primary", tone === "warm" && "border-chart-4/30 bg-chart-4/15 text-foreground", tone === "danger" && "border-destructive/25 bg-destructive/10 text-destructive", tone === "neutral" && "border-border bg-secondary text-secondary-foreground")}>{children}</span>;
}