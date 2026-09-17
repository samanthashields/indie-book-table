import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_VISIBLE = 5;

export function MilestoneDisclosure<T>({
  items,
  renderItem,
  className,
  expandOnGrowth = false,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  expandOnGrowth?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const previousCount = useRef(items.length);

  useEffect(() => {
    if (expandOnGrowth && items.length > previousCount.current && items.length > DEFAULT_VISIBLE) setExpanded(true);
    previousCount.current = items.length;
  }, [expandOnGrowth, items.length]);

  const hiddenCount = Math.max(0, items.length - DEFAULT_VISIBLE);
  const shown = expanded ? items : items.slice(0, DEFAULT_VISIBLE);

  return (
    <>
      <ul className={className}>{shown.map(renderItem)}</ul>
      {hiddenCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
          {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
        </Button>
      )}
    </>
  );
}