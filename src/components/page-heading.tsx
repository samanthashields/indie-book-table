import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function BackButton({ label = "Back", className }: { label?: string; className?: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
        else void router.navigate({ to: "/" });
      }}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Button>
  );
}

export function PageHeading({
  title,
  description,
  action,
  back = true,
  backLabel,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: boolean;
  backLabel?: string;
}) {
  return (
    <div className="mb-7 border-b border-border/70 pb-6 md:mb-9 md:pb-7">
      {back && <BackButton className="-ml-2 mb-3 text-muted-foreground" {...(backLabel ? { label: backLabel } : {})} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-normal leading-tight sm:text-4xl md:text-5xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="min-w-0 shrink-0 [&_button]:w-auto [&>a]:w-auto">{action}</div>}
      </div>
    </div>
  );
}
