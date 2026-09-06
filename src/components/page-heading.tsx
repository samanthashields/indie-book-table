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
    <div className="mb-9 border-b border-border/70 pb-7">
      {back && <BackButton className="-ml-2 mb-3 text-muted-foreground" {...(backLabel ? { label: backLabel } : {})} />}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-4xl font-normal leading-tight md:text-5xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </div>
  );
}
