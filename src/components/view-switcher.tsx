import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CollectionView = "list" | "grid";

export function useCollectionView(storageKey: string, initial: CollectionView = "list") {
  const [view, setView] = useState<CollectionView>(initial);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "list" || saved === "grid") setView(saved);
  }, [storageKey]);

  const chooseView = (next: CollectionView) => {
    setView(next);
    window.localStorage.setItem(storageKey, next);
  };

  return [view, chooseView] as const;
}

export function ViewSwitcher({ view, onChange, label = "Choose how items are shown" }: {
  view: CollectionView;
  onChange: (view: CollectionView) => void;
  label?: string;
}) {
  const options = [
    { value: "list" as const, label: "List", icon: List },
    { value: "grid" as const, label: "Grid", icon: LayoutGrid },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid shrink-0 grid-cols-2 rounded-lg border border-border bg-card p-1 shadow-xs" role="group" aria-label={label}>
        {options.map(({ value, label: optionLabel, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`${optionLabel} view`}
                aria-pressed={view === value}
                onClick={() => onChange(value)}
                className={cn(
                  "h-9 min-w-9 rounded-md px-2 sm:min-w-[5.25rem] sm:px-3",
                  view === value ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{optionLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">{optionLabel} view</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}